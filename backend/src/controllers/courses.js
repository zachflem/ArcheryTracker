const Course = require('../models/Course');
const Club = require('../models/Club');
const ErrorResponse = require('../utils/errorResponse');
const { ROLES } = require('../models/User');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    let query;

    // If clubId is provided, get courses for that club
    if (req.query.club) {
      // Check if the club exists and is approved
      const club = await Club.findById(req.query.club);
      
      if (!club) {
        return next(new ErrorResponse(`Club not found with id of ${req.query.club}`, 404));
      }
      
      // If club is not approved and user is not admin, don't show courses
      if (!club.approved && (!req.user || (req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN))) {
        return next(new ErrorResponse(`Club not found with id of ${req.query.club}`, 404));
      }
      
      query = Course.find({ club: req.query.club, active: true }).populate('club', 'name');
    } else {
      // Get all active courses
      query = Course.find({ active: true }).populate('club', 'name');
    }

    // Sort by name if requested
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort('name');
    }

    const courses = await query;

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('club', 'name location');

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if the club is approved
    const club = await Club.findById(course.club);
    
    if (!club.approved && (!req.user || (req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN))) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private
exports.createCourse = async (req, res, next) => {
  try {
    // Add user to the body
    req.body.createdBy = req.user.id;

    // Check if club exists
    const club = await Club.findById(req.body.club);
    
    if (!club) {
      return next(new ErrorResponse(`Club not found with id of ${req.body.club}`, 404));
    }
    
    // Check if user is admin of the club
    if (!club.admins.includes(req.user.id) && req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to add courses to this club`, 403));
    }

    // Create course
    const course = await Course.create(req.body);

    // Add course to club's courses
    await Club.findByIdAndUpdate(
      req.body.club,
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
    const qrCodePath = path.join(process.env.QRCODES_DIR, qrCodeFileName);

    // Generate and save QR code
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
  } catch (err) {
    next(err);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if user is admin of the club that owns the course
    const club = await Club.findById(course.club);
    
    if (!club.admins.includes(req.user.id) && req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to update this course`, 403));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if user is admin of the club that owns the course
    const club = await Club.findById(course.club);
    
    if (!club.admins.includes(req.user.id) && req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to delete this course`, 403));
    }

    // Instead of hard deleting, set course to inactive
    course.active = false;
    await course.save();

    // Remove course from club's courses
    await Club.findByIdAndUpdate(
      course.club,
      {
        $pull: { courses: course._id }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get course QR code
// @route   GET /api/courses/:id/qrcode
// @access  Public
exports.getCourseQRCode = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if the club is approved
    const club = await Club.findById(course.club);
    
    if (!club.approved && (!req.user || (req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN))) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    if (!course.qrCode) {
      return next(new ErrorResponse(`QR code not found for this course`, 404));
    }

    const qrCodePath = path.join(process.env.QRCODES_DIR, course.qrCode);

    // Check if file exists
    if (!fs.existsSync(qrCodePath)) {
      return next(new ErrorResponse(`QR code file not found`, 404));
    }

    res.sendFile(qrCodePath);
  } catch (err) {
    next(err);
  }
};

// @desc    Regenerate course QR code
// @route   PUT /api/courses/:id/qrcode
// @access  Private
exports.regenerateQRCode = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if user is admin of the club that owns the course
    const club = await Club.findById(course.club);
    
    if (!club.admins.includes(req.user.id) && req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to update this course`, 403));
    }

    // Generate QR code data
    const qrCodeData = {
      type: 'course',
      courseId: course._id,
      clubId: course.club,
      name: course.name,
      scoringSystem: course.scoringSystem
    };

    const qrCodeFileName = `course_${course._id}_${Date.now()}.png`;
    const qrCodePath = path.join(process.env.QRCODES_DIR, qrCodeFileName);

    // Generate and save QR code
    await QRCode.toFile(qrCodePath, JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });

    // If course already has a QR code, delete the old file
    if (course.qrCode) {
      try {
        fs.unlinkSync(path.join(process.env.QRCODES_DIR, course.qrCode));
      } catch (err) {
        console.error('Failed to delete old QR code:', err);
      }
    }

    // Update course with new QR code path
    course.qrCode = qrCodeFileName;
    await course.save();

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeFileName
      }
    });
  } catch (err) {
    next(err);
  }
};
