import nodemailer from 'nodemailer';
import { htmlToText } from 'nodemailer-html-to-text';
import path from 'path';
import fs from 'fs';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Create email templates directory if it doesn't exist
const templatesDir = path.join(process.cwd(), 'server', 'templates', 'email');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Create email templates
const createEmailTemplates = () => {
  const templates = {
    welcome: path.join(templatesDir, 'welcome.html'),
    notification: path.join(templatesDir, 'notification.html'),
    passwordReset: path.join(templatesDir, 'password-reset.html'),
    emailVerification: path.join(templatesDir, 'email-verification.html'),
  };

  // Create template files if they don't exist
  Object.entries(templates).forEach(([name, filepath]) => {
    if (!fs.existsSync(filepath)) {
      const template = getDefaultTemplate(name);
      fs.writeFileSync(filepath, template);
    }
  });

  return templates;
};

// Get default template content
const getDefaultTemplate = (templateName) => {
  const templates = {
    welcome: `
      <h1>Welcome to Q&A Platform!</h1>
      <p>Hello {{userName}},</p>
      <p>Thank you for joining our community. We're excited to have you on board!</p>
      <p>Get started by:</p>
      <ul>
        <li>Completing your profile</li>
        <li>Asking your first question</li>
        <li>Exploring existing discussions</li>
      </ul>
      <p>Best regards,<br>The Q&A Platform Team</p>
    `,
    notification: `
      <h1>New Notification</h1>
      <p>Hello {{userName}},</p>
      <p>{{message}}</p>
      <p><a href="{{link}}">Click here to view</a></p>
      <p>Best regards,<br>The Q&A Platform Team</p>
    `,
    passwordReset: `
      <h1>Password Reset Request</h1>
      <p>Hello {{userName}},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <p><a href="{{resetLink}}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The Q&A Platform Team</p>
    `,
    emailVerification: `
      <h1>Verify Your Email</h1>
      <p>Hello {{userName}},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="{{verificationLink}}">Verify Email</a></p>
      <p>Best regards,<br>The Q&A Platform Team</p>
    `,
  };

  return templates[templateName] || '';
};

// Create email templates
const emailTemplates = createEmailTemplates();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
});

// Add html to text converter
transporter.use('compile', htmlToText());

// Send email
export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    // Read template file
    const templatePath = emailTemplates[template];
    if (!templatePath) {
      throw new Error(`Email template '${template}' not found`);
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Replace template variables
    Object.entries(data).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Send email
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });

    logger.info('Email sent:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Q&A Platform',
    template: 'welcome',
    data: {
      userName: user.firstName,
    },
  });
};

// Send notification email
export const sendNotificationEmail = async ({ to, userName, notificationType, message, link }) => {
  return sendEmail({
    to,
    subject: `New ${notificationType} Notification`,
    template: 'notification',
    data: {
      userName,
      message,
      link,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    template: 'passwordReset',
    data: {
      userName: user.firstName,
      resetLink,
    },
  });
};

// Send email verification email
export const sendEmailVerificationEmail = async (user, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email',
    template: 'emailVerification',
    data: {
      userName: user.firstName,
      verificationLink,
    },
  });
}; 