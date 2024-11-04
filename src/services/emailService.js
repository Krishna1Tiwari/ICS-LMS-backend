const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
    try {
        // Create a Nodemailer transporter (adjust settings to your provider)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your preferred email service (e.g., SMTP)
            auth: {
                user: process.env.EMAIL_USER, // sender's email from environment variable
                pass: process.env.EMAIL_PASS // email password
            }
        });

        // Set up the email options with an HTML template
        const mailOptions = {
            from: emailData.email, // sender's email
            to: process.env.EMAIL_USER, // recipient's email (your email from env variable)
            subject: emailData.subject,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #007BFF;">New Contact Message</h2>
                    <p><strong>From:</strong> ${emailData.name} (${emailData.email})</p>
                    <p><strong>Phone:</strong> ${emailData.phone}</p>
                    <hr />
                    <p><strong>Message:</strong></p>
                    <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007BFF;">
                        ${emailData.message}
                    </p>
                    <hr />
                    <p>This message was sent from your website contact form.</p>
                </div>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = { sendEmail };
