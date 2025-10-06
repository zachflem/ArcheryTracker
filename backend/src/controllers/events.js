const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Event = require('../models/Event');
const User = require('../models/User');
const Club = require('../models/Club');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find().populate({
    path: 'club',
    select: 'name location'
  }).populate({
    path: 'courses',
    select: 'name description'
  });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate({
      path: 'club',
      select: 'name location'
    })
    .populate({
      path: 'courses',
      select: 'name description'
    })
    .populate({
      path: 'participants',
      select: 'name email'
    });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Get events for a specific club
// @route   GET /api/events/club/:clubId
// @access  Private
exports.getEventsByClub = asyncHandler(async (req, res, next) => {
  const { clubId } = req.params;

  // Check if club exists
  const club = await Club.findById(clubId);
  if (!club) {
    return next(
      new ErrorResponse(`Club not found with id of ${clubId}`, 404)
    );
  }

  const events = await Event.find({ club: clubId })
    .populate({
      path: 'courses',
      select: 'name description'
    })
    .populate({
      path: 'participants',
      select: 'name email'
    });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Club Admin, Admin, Super User)
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Check if club exists for club admins
  if (req.user.role === 'club_admin') {
    // Club admins can only create events for their clubs
    const club = await Club.findById(req.body.club);
    if (!club) {
      return next(
        new ErrorResponse(`Club not found with id of ${req.body.club}`, 404)
      );
    }

    // Check if user is admin of this club
    const isClubAdmin = club.admins.includes(req.user.id);
    if (!isClubAdmin) {
      return next(
        new ErrorResponse(`You are not authorized to create events for this club`, 403)
      );
    }
  }

  // Add user ID to request body
  req.body.createdBy = req.user.id;

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Club Admin, Admin, Super User)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Check ownership for club admins
  if (req.user.role === 'club_admin') {
    const club = await Club.findById(event.club);
    
    // Check if user is admin of this club
    const isClubAdmin = club.admins.includes(req.user.id);
    if (!isClubAdmin) {
      return next(
        new ErrorResponse(`You are not authorized to update this event`, 403)
      );
    }
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Club Admin, Admin, Super User)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Check ownership for club admins
  if (req.user.role === 'club_admin') {
    const club = await Club.findById(event.club);
    
    // Check if user is admin of this club
    const isClubAdmin = club.admins.includes(req.user.id);
    if (!isClubAdmin) {
      return next(
        new ErrorResponse(`You are not authorized to delete this event`, 403)
      );
    }
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add participant to event
// @route   POST /api/events/:id/participants
// @access  Private (Club Admin, Admin, Super User)
exports.addParticipantToEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Check ownership for club admins
  if (req.user.role === 'club_admin') {
    const club = await Club.findById(event.club);
    
    // Check if user is admin of this club
    const isClubAdmin = club.admins.includes(req.user.id);
    if (!isClubAdmin) {
      return next(
        new ErrorResponse(`You are not authorized to manage participants for this event`, 403)
      );
    }
  }

  // Get the user to add
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorResponse('Please provide a user ID', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${userId}`, 404));
  }

  // Check if user is already a participant
  if (event.participants.includes(userId)) {
    return next(
      new ErrorResponse(`User is already a participant in this event`, 400)
    );
  }

  // Add the user to the participants array
  event.participants.push(userId);
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Remove participant from event
// @route   DELETE /api/events/:id/participants/:userId
// @access  Private (Club Admin, Admin, Super User)
exports.removeParticipantFromEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Check ownership for club admins
  if (req.user.role === 'club_admin') {
    const club = await Club.findById(event.club);
    
    // Check if user is admin of this club
    const isClubAdmin = club.admins.includes(req.user.id);
    if (!isClubAdmin) {
      return next(
        new ErrorResponse(`You are not authorized to manage participants for this event`, 403)
      );
    }
  }

  // Get the user to remove
  const { userId } = req.params;
  
  // Check if user is a participant
  if (!event.participants.includes(userId)) {
    return next(
      new ErrorResponse(`User is not a participant in this event`, 400)
    );
  }

  // Remove the user from the participants array
  event.participants = event.participants.filter(
    participant => participant.toString() !== userId
  );
  
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});
