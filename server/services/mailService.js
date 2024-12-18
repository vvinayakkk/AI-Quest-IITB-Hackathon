import nodemailer from 'nodemailer';
import { htmlToText } from 'nodemailer-html-to-text';
import dotenv from 'dotenv';
dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.APP_PASSWORD,
        },
      });

    // Add HTML to text conversion
    this.transporter.use('compile', htmlToText());
  }

  /**
   * Generate HTML email template
   * @param {Object} options - Email template options
   * @returns {string} Compiled HTML email
   */
  generateEmailTemplate(options) {
    const {
      userName = 'User',
      notificationType = 'New',
      message = 'You have a new notification',
      link = '#',
      logoUrl = '/path/to/default/logo.png'
    } = options;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notification</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .header img {
                max-width: 150px;
                max-height: 80px;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px;
                text-align: center;
            }
            .notification-type {
                font-weight: bold;
                color: #2575fc;
                text-transform: uppercase;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .message {
                color: #333;
                font-size: 16px;
                margin-bottom: 25px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: transform 0.2s;
            }
            .cta-button:hover {
                transform: scale(1.05);
            }
            .footer {
                background-color: #f4f4f4;
                color: #666;
                text-align: center;
                padding: 15px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="cid:logo" alt="App Logo">
                <h1>New Notification</h1>
            </div>
            <div class="content">
                <p>Hi ${userName},</p>
                
                <div class="notification-type">
                    ${notificationType} Notification
                </div>
                
                <div class="message">
                    ${message}
                </div>
                
                <a href="${link}" class="cta-button">View Notification</a>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} Your App Name. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Send a notification email
   * @param {Object} options - Email sending options
   */
  async sendNotificationEmail(options) {
    const {
      to,
      subject = 'New Notification',
      userName,
      notificationType,
      message,
      link,
      logoPath = '/path/to/default/logo.png'
    } = options;

    try {
      // Send email
      await this.transporter.sendMail({
        from: `"Your App Name" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html: this.generateEmailTemplate({
          userName,
          notificationType,
          message,
          link
        }),
        attachments: [
          {
            filename: 'logo.png',
            path: logoPath,
            cid: 'logo'
          }
        ]
      });

      console.log(`Notification email sent to ${to}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  /**
   * Enhance User model with email notification method
   * @param {Object} Users - Mongoose User model
   */
  enhanceUserModel(Users) {
    Users.methods.sendNotificationEmail = async function(notification) {
      if (!this.email) return;

      try {
        const emailService = new EmailService();
        await emailService.sendNotificationEmail({
          to: this.email,
          userName: this.fullName,
          notificationType: notification.type,
          message: notification.message,
          link: notification.link
        });
      } catch (error) {
        console.error('Failed to send notification email:', error);
      }
    };
  }
}

export default new EmailService();