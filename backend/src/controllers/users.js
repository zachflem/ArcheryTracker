const { User, ROLES } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire')
      .populate('clubs', 'name logo')
      .populate('homeClub', 'name logo')
      .populate('children', 'name email')
      .populate('parent', 'name email');

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Prevent role escalation - only Super User can create Admins
    if (req.body.role === ROLES.ADMIN && req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Only Super Users can create Admin accounts', 403));
    }

    // Prevent role escalation - only Super User can update Super User
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (user.role === ROLES.SUPER_USER && req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Only Super Users can modify Super User accounts', 403));
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent deletion of Super User accounts
    if (user.role === ROLES.SUPER_USER && req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Only Super Users can delete Super User accounts', 403));
    }

    // Check if the user has children accounts
    if (user.children && user.children.length > 0) {
      return next(new ErrorResponse('Cannot delete user with child accounts. Please delete or reassign child accounts first.', 400));
    }

    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually verify a user's account
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (user.verified) {
      return next(new ErrorResponse('User is already verified', 400));
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a child account
// @route   POST /api/users/child
// @access  Private
exports.createChildAccount = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Generate a random password for the child account
    const password = Math.random().toString(36).slice(-8);

    // Create the child user
    const childUser = await User.create({
      name,
      email,
      password,
      isChild: true,
      parent: req.user.id,
      role: ROLES.USER,
      verified: true // Child accounts are auto-verified
    });

    // Update parent user to include this child
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { children: childUser._id }
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: childUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Migrate child account to full account
// @route   PUT /api/users/child/:id/migrate
// @access  Private
exports.migrateChildAccount = async (req, res, next) => {
  try {
    const childUser = await User.findById(req.params.id);

    if (!childUser) {
      return next(new ErrorResponse(`Child user not found with id of ${req.params.id}`, 404));
    }

    // Check if requesting user is the parent
    if (childUser.parent.toString() !== req.user.id && req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Not authorized to migrate this child account', 403));
    }

    // Check if account is a child account
    if (!childUser.isChild) {
      return next(new ErrorResponse('This is not a child account', 400));
    }

    // Set new password provided by parent
    const { newPassword } = req.body;
    if (!newPassword) {
      return next(new ErrorResponse('Please provide a new password for the account', 400));
    }

    childUser.password = newPassword;
    childUser.isChild = false;
    childUser.parent = undefined;

    await childUser.save();

    // Remove child from parent's children array
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { children: childUser._id }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: childUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return next(new ErrorResponse('Please provide a role', 400));
    }

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return next(new ErrorResponse('Invalid role', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Check if trying to create a Super User
    if (role === ROLES.SUPER_USER) {
      return next(new ErrorResponse('Cannot create additional Super Users', 403));
    }

    // Only Super Users can create Admins
    if (role === ROLES.ADMIN && req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Only Super Users can create Admin accounts', 403));
    }

    // Cannot change role of a Super User
    if (user.role === ROLES.SUPER_USER && req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Cannot change role of a Super User', 403));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set user's home club
// @route   PUT /api/users/:id/homeclub
// @access  Private (own account or admin)
exports.setHomeClub = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Check if the requesting user is the account owner or an admin
    if (req.user.id !== req.params.id && 
        req.user.role !== ROLES.ADMIN && 
        req.user.role !== ROLES.SUPER_USER) {
      return next(new ErrorResponse('Not authorized to update this account', 403));
    }

    // Get the club ID from the request
    const { clubId } = req.body;
    
    // If clubId is null, this will clear the home club
    if (clubId !== null) {
      // Check if the club exists and user is a member
      const isMember = user.clubs.includes(clubId);
      
      if (!isMember) {
        return next(new ErrorResponse('User must be a member of the club to set it as home club', 400));
      }
    }
    
    // Update the home club
    user.homeClub = clubId || null;
    await user.save();
    
    // Populate the club details before sending response
    const updatedUser = await User.findById(req.params.id)
      .select('-verificationToken -verificationExpire -resetPasswordToken -resetPasswordExpire')
      .populate('clubs', 'name logo')
      .populate('homeClub', 'name logo');
      
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search users by name or email
// @route   GET /api/users/search
// @access  Private (all authenticated users)
exports.searchUsers = async (req, res, next) => {
  try {
    // Get search term from query params
    const { term } = req.query;
    
    if (!term) {
      return next(new ErrorResponse('Please provide a search term', 400));
    }
    
    // Search for users by name or email
    const users = await User.find({
      $or: [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } }
      ]
    }).select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationExpire');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};
