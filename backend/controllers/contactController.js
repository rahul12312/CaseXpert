const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");

exports.submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Save to Database
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    // Attempt to send email
    try {
      const smtpUser = process.env.SMTP_EMAIL || process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: smtpUser,
          to: "casexpert.support@gmail.com",
          replyTo: email,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Contact email sent successfully");
      } else {
        console.warn("SMTP credentials not configured. Contact message saved to DB only.");
      }
    } catch (emailError) {
      console.error("Error sending contact email:", emailError.message);
      // We don't fail the request here, because it was saved to DB successfully
    }

    res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    res.status(500).json({ success: false, message: "Server error submitting message" });
  }
};
