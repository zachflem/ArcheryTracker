const { User } = require('../models/User');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// @desc    Generate QR code for user
// @route   POST /api/qrcodes/user
// @access  Private
exports.generateUserQRCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Create QR code data
    const qrCodeData = {
      type: 'user',
      userId: user._id,
      email: user.email,
      name: user.name
    };

    // Generate a unique filename
    const qrCodeFileName = `user_${user._id}_${Date.now()}.png`;
    const qrCodePath = path.join(process.env.QRCODES_DIR, qrCodeFileName);

    // Generate and save QR code
    await QRCode.toFile(qrCodePath, JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });

    // Delete old QR code if exists
    if (user.customQRCode) {
      try {
        fs.unlinkSync(path.join(process.env.QRCODES_DIR, user.customQRCode));
      } catch (err) {
        console.error('Failed to delete old QR code:', err);
      }
    }

    // Update user with new QR code
    user.customQRCode = qrCodeFileName;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        qrCodeFileName
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user QR code
// @route   GET /api/qrcodes/user
// @access  Private
exports.getUserQRCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.customQRCode) {
      // If user doesn't have a QR code yet, generate one
      return next(new ErrorResponse('QR code not found for this user', 404));
    }

    const qrCodePath = path.join(process.env.QRCODES_DIR, user.customQRCode);

    // Check if file exists
    if (!fs.existsSync(qrCodePath)) {
      return next(new ErrorResponse('QR code file not found', 404));
    }

    res.sendFile(qrCodePath);
  } catch (err) {
    next(err);
  }
};

// @desc    Get user QR code by ID
// @route   GET /api/qrcodes/user/:id
// @access  Private/Admin
exports.getUserQRCodeById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.customQRCode) {
      return next(new ErrorResponse('QR code not found for this user', 404));
    }

    const qrCodePath = path.join(process.env.QRCODES_DIR, user.customQRCode);

    // Check if file exists
    if (!fs.existsSync(qrCodePath)) {
      return next(new ErrorResponse('QR code file not found', 404));
    }

    res.sendFile(qrCodePath);
  } catch (err) {
    next(err);
  }
};

// @desc    Generate QR code for course
// @route   POST /api/qrcodes/course/:id
// @access  Private/Admin
exports.generateCourseQRCode = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
    }

    // Check if user is admin of the club that owns the course
    const club = await Club.findById(course.club);
    
    if (!club.admins.includes(req.user.id) && req.user.role !== ROLES.SUPER_USER && req.user.role !== ROLES.ADMIN) {
      return next(new ErrorResponse(`User not authorized to generate QR code for this course`, 403));
    }

    // Create QR code data
    const qrCodeData = {
      type: 'course',
      courseId: course._id,
      clubId: course.club,
      name: course.name,
      scoringSystem: course.scoringSystem
    };

    // Generate a unique filename
    const qrCodeFileName = `course_${course._id}_${Date.now()}.png`;
    const qrCodePath = path.join(process.env.QRCODES_DIR, qrCodeFileName);

    // Generate and save QR code
    await QRCode.toFile(qrCodePath, JSON.stringify(qrCodeData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });

    // Delete old QR code if exists
    if (course.qrCode) {
      try {
        fs.unlinkSync(path.join(process.env.QRCODES_DIR, course.qrCode));
      } catch (err) {
        console.error('Failed to delete old QR code:', err);
      }
    }

    // Update course with new QR code
    course.qrCode = qrCodeFileName;
    await course.save();

    res.status(200).json({
      success: true,
      data: {
        qrCodeFileName
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate QR code for ID card
// @route   GET /api/qrcodes/user/id-card
// @access  Private
exports.generateIDCard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Ensure user has a QR code
    if (!user.customQRCode) {
      // Generate a QR code if one doesn't exist
      const qrCodeData = {
        type: 'user',
        userId: user._id,
        email: user.email,
        name: user.name
      };

      const qrCodeFileName = `user_${user._id}_${Date.now()}.png`;
      const qrCodePath = path.join(process.env.QRCODES_DIR, qrCodeFileName);

      await QRCode.toFile(qrCodePath, JSON.stringify(qrCodeData), {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300
      });

      user.customQRCode = qrCodeFileName;
      await user.save();
    }

    // Create an HTML template for the ID card
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Archery ID Card - ${user.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .id-card {
          width: 3.375in;
          height: 2.125in;
          border: 1px solid #000;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          margin: 20px auto;
          background: #fff;
        }
        .header {
          background: #3498db;
          color: white;
          padding: 10px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
        }
        .content {
          padding: 10px;
          display: flex;
        }
        .info {
          flex: 1;
          padding-right: 10px;
        }
        .qrcode {
          flex: 1;
          text-align: center;
        }
        .qrcode img {
          max-width: 100%;
          height: auto;
        }
        .info h2 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }
        .info p {
          margin: 0 0 5px 0;
          font-size: 12px;
        }
        .footer {
          background: #f1f1f1;
          padding: 5px 10px;
          font-size: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="id-card">
        <div class="header">
          ArcheryTracker.io
        </div>
        <div class="content">
          <div class="info">
            <h2>${user.name}</h2>
            <p>ID: ${user._id}</p>
            <p>Member Since: ${new Date(user.createdAt).toLocaleDateString()}</p>
            <p>Role: ${user.role.replace('_', ' ').toUpperCase()}</p>
          </div>
          <div class="qrcode">
            <img src="/uploads/qrcodes/${user.customQRCode}" alt="QR Code">
          </div>
        </div>
        <div class="footer">
          This card is the property of ArcheryTracker.io. Scan QR code to add to rounds.
        </div>
      </div>
    </body>
    </html>
    `;

    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlTemplate);
  } catch (err) {
    next(err);
  }
};

// @desc    Scan QR code
// @route   POST /api/qrcodes/scan
// @access  Private
exports.scanQRCode = async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return next(new ErrorResponse('No QR code data provided', 400));
    }

    let data;
    try {
      data = JSON.parse(qrData);
    } catch (err) {
      return next(new ErrorResponse('Invalid QR code format', 400));
    }

    // Process based on QR code type
    if (data.type === 'user') {
      // Find the user
      const user = await User.findById(data.userId).select('-password');

      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      return res.status(200).json({
        success: true,
        type: 'user',
        data: {
          userId: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else if (data.type === 'course') {
      // Find the course
      const course = await Course.findById(data.courseId)
        .populate('club', 'name');

      if (!course) {
        return next(new ErrorResponse('Course not found', 404));
      }

      return res.status(200).json({
        success: true,
        type: 'course',
        data: {
          courseId: course._id,
          name: course.name,
          scoringSystem: course.scoringSystem,
          clubId: course.club._id,
          clubName: course.club.name
        }
      });
    } else {
      return next(new ErrorResponse('Unknown QR code type', 400));
    }
  } catch (err) {
    next(err);
  }
};
