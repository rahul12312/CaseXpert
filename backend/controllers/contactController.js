const ContactMessage = require("../models/ContactMessage");

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

    // Attempt to send email (non-blocking)
    try {
      const sendGridApiKey = process.env.SENDGRID_API_KEY;
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_EMAIL || "casexpert.support@gmail.com";

      if (sendGridApiKey) {
        // Use SendGrid (works on Render — uses HTTPS, not SMTP)
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(sendGridApiKey);

        const msg = {
          to: "casexpert.support@gmail.com",
          from: fromEmail,
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

        // Fire and forget — don't await so the API responds instantly
        sgMail.send(msg)
          .then(() => console.log("✅ Contact email sent via SendGrid"))
          .catch((err) => console.error("❌ SendGrid email failed:", err.message));
      } else {
        console.warn("SendGrid API key not configured. Contact message saved to DB only.");
      }
    } catch (emailError) {
      console.error("Error sending contact email:", emailError.message);
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
