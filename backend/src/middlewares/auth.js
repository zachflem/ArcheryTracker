const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const { User, ROLES } = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Verify user's account is verified
exports.requireVerified = async (req, res, next) => {
  // Skip verification check for Super User and Admin
  if (
    req.user.role === ROLES.SUPER_USER ||
    req.user.role === ROLES.ADMIN
  ) {
    return next();
  }

  if (!req.user.verified) {
    return next(
      new ErrorResponse(
        'Account needs to be verified to access this resource',
        403
      )
    );
  }

  next();
};

// Check if user is a parent of the requested child user
exports.isParentOf = async (req, res, next) => {
  try {
    // Get the child user id from the request parameters
    const childId = req.params.childId || req.params.id;

    // Find the child user
    const childUser = await User.findById(childId);

    // Check if child user exists
    if (!childUser) {
      return next(new ErrorResponse('Child user not found', 404));
    }

    // Check if the requesting user is the parent
    if (
      childUser.isChild &&
      childUser.parent &&
      childUser.parent.toString() === req.user._id.toString()
    ) {
      // Add the child user to the request object
      req.childUser = childUser;
      return next();
    }

    // If user is admin or super user, allow access
    if (
      req.user.role === ROLES.SUPER_USER ||
      req.user.role === ROLES.ADMIN
    ) {
      req.childUser = childUser;
      return next();
    }

    return next(
      new ErrorResponse('Not authorized to access this child account', 403)
    );
  } catch (err) {
    return next(err);
  }
};

// Check if user is a member of the club
exports.isClubMember = async (req, res, next) => {
  try {
    // Try to find club by name first
    const Club = require('../models/Club');
    let club;

    if (req.params.name) {
      club = await Club.findOne({ name: req.params.name });
      
      // If not found by name, try by ID for backward compatibility
      if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
        club = await Club.findById(req.params.name);
      }
    } else if (req.params.clubId || req.params.id) {
      const clubId = req.params.clubId || req.params.id;
      club = await Club.findById(clubId);
    }

    if (!club) {
      return next(
        new ErrorResponse('Club not found', 404)
      );
    }

    // Check if the user is a member of this club
    const isMember = club.members.some(member => 
      member._id === req.user.id || member === req.user.id || member.toString() === req.user.id
    );

    // Check if the user is an admin of this club
    const isClubAdmin = club.admins.some(admin => 
      admin._id === req.user.id || admin === req.user.id || admin.toString() === req.user.id
    );

    // Check if the user has higher privileges (admin or super_user)
    const isSystemAdmin = 
      req.user.role === ROLES.SUPER_USER ||
      req.user.role === ROLES.ADMIN;

    // Set flags in the request object for the controller to use
    req.isClubAdmin = isClubAdmin || isSystemAdmin;
    req.isClubMember = isMember;
    req.club = club;

    // If user is system admin, allow access to any club
    if (isSystemAdmin) {
      return next();
    }

    // If not a member and not a system admin, deny access
    if (!isMember && !isSystemAdmin) {
      return next(
        new ErrorResponse('Not authorized to access this club resource', 403)
      );
    }

    next();
  } catch (err) {
    return next(err);
  }
};

// Check if user is an admin of the club
exports.isClubAdmin = async (req, res, next) => {
  try {
    // Try to find club by name first
    const Club = require('../models/Club');
    let club;

    if (req.params.name) {
      club = await Club.findOne({ name: req.params.name });
      
      // If not found by name, try by ID for backward compatibility
      if (!club && req.params.name.match(/^[0-9a-fA-F]{24}$/)) {
        club = await Club.findById(req.params.name);
      }
    } else if (req.params.clubId || req.params.id) {
      const clubId = req.params.clubId || req.params.id;
      club = await Club.findById(clubId);
    }

    if (!club) {
      return next(
        new ErrorResponse('Club not found', 404)
      );
    }

    // Check if the user is an admin of this club
    const isClubAdmin = club.admins.some(admin => 
      admin._id === req.user.id || admin === req.user.id || admin.toString() === req.user.id
    );

    // Check if the user has higher privileges (admin or super_user)
    const isSystemAdmin = 
      req.user.role === ROLES.SUPER_USER ||
      req.user.role === ROLES.ADMIN;

    // Set a flag in the request object for the controller to use
    req.isClubAdmin = isClubAdmin || isSystemAdmin;
    req.club = club;

    // If user is a club admin or has higher privileges, allow access
    if (isClubAdmin || isSystemAdmin) {
      return next();
    }

    // Otherwise deny access
    return next(
      new ErrorResponse('Not authorized to perform this action. Club admin role required.', 403)
    );
  } catch (err) {
    return next(err);
  }
};
