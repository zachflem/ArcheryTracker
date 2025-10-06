const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter configuration
  let transportConfig;
  
  // Different configuration based on service type
  if (process.env.EMAIL_SERVICE.toLowerCase() === 'smtp') {
    // SMTP configuration with custom host and port
    transportConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true', // Convert string to boolean
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    };
  } else {
    // Service-based configuration (Gmail, etc)
    transportConfig = {
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    };
  }

  // Create transporter with the appropriate configuration
  const transporter = nodemailer.createTransport(transportConfig);

  // Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendEmail;
