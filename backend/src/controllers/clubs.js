const Club = require('../models/Club');
const User = require('../models/User').User;
const Course = require('../models/Course');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const { ROLES } = require('../models/User');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('../middlewares/async');

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
exports.getClubs = async (req, res, next) => {
  try {
    let query;

    // If not admin, only show approved clubs
    if (req.user && (req.user.role === ROLES.SUPER_USER || req.user.role === ROLES.ADMIN)) {
      query = Club.find();
    } else {
      query = Club.find({ approved: true });
    }

    // Execute query
    const clubs = await query;

    res.status(200).json({
      success: true,
      count: clubs.length,
      data: clubs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single club
// @route   GET /api/clubs/:name
// @access  Public
exports.getClub = async (req, res, next) => {
  try {
    // First try to find by name
    let club = await Club.findOne({ name: req.params.name })
      .populate('admins', 'name email')
      .populate('members', 'name email')
      .populate('courses', 'name description scoringSystem')
      .populate('events', 'name description startDate endDate status');

    // If not found by name, try by ID for backward compatibility
    if (!club) {
      // Check if the param is a valid MongoDB ObjectId
      if (req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
        club = await Club.findById(req.params.name)
          .populate('admins', 'name email')
          .populate('members', 'name email')
          .populate('courses', 'name description scoringSystem')
          .populate('events', 'name description startDate endDate status');
      }
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Check if club is approved or user is admin
    if (!club.approved && (!req.user || (req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN))) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private
exports.createClub = async (req, res, next) => {
  try {
    // Add user to the body
    req.body.createdBy = req.user.id;

    // Create club
    const club = await Club.create(req.body);

    // Add user as club admin
    club.admins.push(req.user.id);
    club.members.push(req.user.id);
    await club.save();

    // Add club to user's clubs
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { clubs: club._id }
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:name
// @access  Private
exports.updateClub = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Make sure user is club admin or system admin
    if (
      !club.admins.includes(req.user.id) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this club`, 403)
      );
    }

    // Only system admins can update approval status
    if (
      req.body.approved !== undefined &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to change approval status`, 403)
      );
    }

    club = await Club.findByIdAndUpdate(club._id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:name
// @access  Private
exports.deleteClub = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Make sure user is club admin or system admin
    if (
      !club.admins.includes(req.user.id) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to delete this club`, 403)
      );
    }

    await club.remove();

    // Remove club from all users who were members
    await User.updateMany(
      { clubs: club._id },
      { $pull: { clubs: club._id } }
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload club logo
// @route   PUT /api/clubs/:name/logo
// @access  Private
exports.uploadClubLogo = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Make sure user is club admin or system admin
    if (
      !club.admins.includes(req.user.id) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this club`, 403)
      );
    }

    if (!req.files || !req.files.logo) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.logo;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD || 1000000) {
      return next(
        new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD || 1000000} bytes`, 400)
      );
    }

    // Create custom filename
    file.name = `logo_${club._id}${path.parse(file.name).ext}`;

    // Move file to upload directory
    file.mv(`${process.env.IMAGES_DIR}/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      // If club already has a logo, delete it
      if (club.logo) {
        try {
          fs.unlinkSync(`${process.env.IMAGES_DIR}/${club.logo}`);
        } catch (err) {
          console.error('Failed to delete old logo:', err);
        }
      }

      await Club.findByIdAndUpdate(club._id, { logo: file.name });

      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve a club
// @route   PUT /api/clubs/:name/approve
// @access  Private/Admin
exports.approveClub = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    if (club.approved) {
      return next(new ErrorResponse('Club is already approved', 400));
    }

    club.approved = true;
    await club.save();

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add member to club
// @route   PUT /api/clubs/:name/members
// @access  Private
exports.addMember = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Check if club is approved
    if (!club.approved) {
      return next(new ErrorResponse('Club is not approved yet', 400));
    }

    // Get the user to add
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse(`User with email ${req.body.email} not found`, 404));
    }

    // Check if already a member
    if (club.members.includes(user._id)) {
      return next(new ErrorResponse('User is already a member of this club', 400));
    }

    // Check if user account is verified (unless admin is adding them)
    if (
      !user.verified &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN
    ) {
      return next(new ErrorResponse('User account must be verified to join a club', 400));
    }

    // Add user to club members
    club.members.push(user._id);
    await club.save();

    // Add club to user's clubs
    await User.findByIdAndUpdate(
      user._id,
      {
        $push: { clubs: club._id }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove member from club
// @route   DELETE /api/clubs/:name/members/:userId
// @access  Private
exports.removeMember = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Make sure user is club admin or system admin or removing themselves
    if (
      !club.admins.includes(req.user.id) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN &&
      req.user.id !== req.params.userId
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to remove members from this club`, 403)
      );
    }

    // Check if user is a member
    if (!club.members.includes(req.params.userId)) {
      return next(new ErrorResponse('User is not a member of this club', 400));
    }

    // If removing a club admin, make sure requester is system admin or the user themselves
    if (
      club.admins.includes(req.params.userId) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN &&
      req.user.id !== req.params.userId
    ) {
      return next(
        new ErrorResponse('Only system admins can remove club admins', 403)
      );
    }

    // Remove from members
    club.members.pull(req.params.userId);

    // If user is also an admin, remove from admins
    if (club.admins.includes(req.params.userId)) {
      club.admins.pull(req.params.userId);
    }

    await club.save();

    // Remove club from user's clubs
    await User.findByIdAndUpdate(
      req.params.userId,
      {
        $pull: { clubs: club._id }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add admin to club
// @route   PUT /api/clubs/:name/admins
// @access  Private
exports.addAdmin = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Make sure user is club admin or system admin
    if (
      !club.admins.includes(req.user.id) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to add admins to this club`, 403)
      );
    }

    // Get the user to add as admin
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse(`User with email ${req.body.email} not found`, 404));
    }

    // Check if already an admin
    if (club.admins.includes(user._id)) {
      return next(new ErrorResponse('User is already an admin of this club', 400));
    }

    // Check if user account is verified
    if (!user.verified) {
      return next(new ErrorResponse('User account must be verified to become a club admin', 400));
    }

    // Make sure user is a member of the club
    if (!club.members.includes(user._id)) {
      // Add to members first
      club.members.push(user._id);
      
      // Add club to user's clubs
      await User.findByIdAndUpdate(
        user._id,
        {
          $push: { clubs: club._id }
        },
        { new: true }
      );
    }

    // Add user to club admins
    club.admins.push(user._id);
    await club.save();

    // Update user role to club admin if they're not already a higher role
    if (user.role === ROLES.USER) {
      user.role = ROLES.CLUB_ADMIN;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove admin from club
// @route   DELETE /api/clubs/:name/admins/:userId
// @access  Private
exports.removeAdmin = async (req, res, next) => {
  try {
    // Try to find club by name first
    let club = await Club.findOne({ name: req.params.name });
    
    // If not found by name, try by ID for backward compatibility
    if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
      club = await Club.findById(req.params.name);
    }

    if (!club) {
      return next(new ErrorResponse(`Club not found with name: ${req.params.name}`, 404));
    }

    // Make sure user is club admin or system admin or removing themselves
    if (
      !club.admins.includes(req.user.id) &&
      req.user.role !== ROLES.SUPER_USER &&
      req.user.role !== ROLES.ADMIN &&
      req.user.id !== req.params.userId
    ) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to remove admins from this club`, 403)
      );
    }

    // Check if user is an admin
    if (!club.admins.includes(req.params.userId)) {
      return next(new ErrorResponse('User is not an admin of this club', 400));
    }

    // Don't allow removing the last admin
    if (club.admins.length === 1 && club.admins[0].toString() === req.params.userId) {
      return next(new ErrorResponse('Cannot remove the last admin from the club', 400));
    }

    // Remove from admins
    club.admins.pull(req.params.userId);
    await club.save();

    // Check if user is still an admin for any club
    const user = await User.findById(req.params.userId);
    const adminForOtherClubs = await Club.exists({ 
      admins: req.params.userId,
      _id: { $ne: club._id }
    });

    // If no longer an admin for any club, revert to normal user
    if (!adminForOtherClubs && user.role === ROLES.CLUB_ADMIN) {
      user.role = ROLES.USER;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (err) {
    next(err);
  }
};

// =================== Course Management ===================

// @desc    Get club courses
// @route   GET /api/clubs/:name/courses
// @access  Private
exports.getClubCourses = asyncHandler(async (req, res, next) => {
  // Club is already fetched and available in req.club from the isClubMember middleware
  const club = req.club;

  const courses = await Course.find({ club: club._id, active: true });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get single club course
// @route   GET /api/clubs/:name/courses/:courseId
// @access  Private
exports.getClubCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    club: req.club._id,
    active: true
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course for a club
// @route   POST /api/clubs/:name/courses
// @access  Private (Club Admin)
exports.createClubCourse = asyncHandler(async (req, res, next) => {
  // Set club and user IDs in the request body
  req.body.club = req.club._id;
  req.body.createdBy = req.user.id;

  // Create course
  const course = await Course.create(req.body);

  // Add course to club's courses
  await Club.findByIdAndUpdate(
    req.club._id,
    {
      $push: { courses: course._id }
    },
    { new: true }
  );

  // Generate QR code for the course
  const qrCodeData = {
    type: 'course',
    courseId: course._id,
    clubId: course.club,
    name: course.name,
    scoringSystem: course.scoringSystem
  };

  const qrCodeFileName = `course_${course._id}.png`;
  const qrCodeDir = process.env.QRCODES_DIR || 'uploads/qrcodes';
  const qrCodePath = path.join(qrCodeDir, qrCodeFileName);

  // Ensure directory exists
  if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir, { recursive: true });
  }

  // Generate and save QR code
  const QRCode = require('qrcode');
  await QRCode.toFile(qrCodePath, JSON.stringify(qrCodeData), {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300
  });

  // Update course with QR code path
  course.qrCode = qrCodeFileName;
  await course.save();

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update club course
// @route   PUT /api/clubs/:name/courses/:courseId
// @access  Private (Club Admin)
exports.updateClubCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findOne({
    _id: req.params.courseId,
    club: req.club._id
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete club course
// @route   DELETE /api/clubs/:name/courses/:courseId
// @access  Private (Club Admin)
exports.deleteClubCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    club: req.club._id
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
    );
  }

  // Set course to inactive instead of deleting
  course.active = false;
  await course.save();

  // Remove course from club's courses
  await Club.findByIdAndUpdate(
    req.club._id,
    {
      $pull: { courses: course._id }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// =================== Event Management ===================

// @desc    Get club events
// @route   GET /api/clubs/:name/events
// @access  Private
exports.getClubEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find({ club: req.club._id })
    .populate('courses', 'name description')
    .sort({ startDate: -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get single club event
// @route   GET /api/clubs/:name/events/:eventId
// @access  Private
exports.getClubEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    club: req.club._id
  })
  .populate('courses', 'name description')
  .populate('participants.user', 'name email');

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Create new event for a club
// @route   POST /api/clubs/:name/events
// @access  Private (Club Admin)
exports.createClubEvent = asyncHandler(async (req, res, next) => {
  // Set club and user IDs in the request body
  req.body.club = req.club._id;
  req.body.createdBy = req.user.id;
  
  // Add the creator as an organizer
  if (!req.body.organizers) {
    req.body.organizers = [];
  }
  if (!req.body.organizers.includes(req.user.id)) {
    req.body.organizers.push(req.user.id);
  }

  // Create event
  const event = await Event.create(req.body);

  // Add event to club's events
  await Club.findByIdAndUpdate(
    req.club._id,
    {
      $push: { events: event._id }
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update club event
// @route   PUT /api/clubs/:name/events/:eventId
// @access  Private (Club Admin)
exports.updateClubEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findOne({
    _id: req.params.eventId,
    club: req.club._id
  });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404)
    );
  }

  event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete club event
// @route   DELETE /api/clubs/:name/events/:eventId
// @access  Private (Club Admin)
exports.deleteClubEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    club: req.club._id
  });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404)
    );
  }

  await event.deleteOne();

  // Remove event from club's events
  await Club.findByIdAndUpdate(
    req.club._id,
    {
      $pull: { events: event._id }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add participant to club event
// @route   POST /api/clubs/:name/events/:eventId/participants
// @access  Private (Club Admin)
exports.addEventParticipant = asyncHandler(async (req, res, next) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    club: req.club._id
  });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404)
    );
  }

  // Get the user to add
  const { email } = req.body;
  if (!email) {
    return next(new ErrorResponse('Please provide a user email', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse(`User with email ${email} not found`, 404));
  }

  // Check if user is already a participant
  const isParticipant = event.participants.some(
    participant => participant.user.toString() === user._id.toString()
  );
  
  if (isParticipant) {
    return next(
      new ErrorResponse(`User is already a participant in this event`, 400)
    );
  }

  // Add the user to the participants array
  event.participants.push({ user: user._id });
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Remove participant from club event
// @route   DELETE /api/clubs/:name/events/:eventId/participants/:userId
// @access  Private (Club Admin)
exports.removeEventParticipant = asyncHandler(async (req, res, next) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    club: req.club._id
  });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404)
    );
  }

  // Check if user is a participant
  const isParticipant = event.participants.some(
    participant => participant.user.toString() === req.params.userId
  );
  
  if (!isParticipant) {
    return next(
      new ErrorResponse(`User is not a participant in this event`, 400)
    );
  }

  // Remove the user from the participants array
  event.participants = event.participants.filter(
    participant => participant.user.toString() !== req.params.userId
  );
  
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});
