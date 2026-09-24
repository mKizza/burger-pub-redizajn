const nodemailer = require("nodemailer");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        status: "fail",
        message: "Bitte füllen Sie alle Felder aus.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Burger Pub Website" <${process.env.EMAIL_USER}>`,
      to: "burgerpubmunchen@gmail.com",
      replyTo: email,
      subject: `Neue Nachricht von ${name}`,

      html: `
        <h2>Neue Nachricht über die Burger Pub Website</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>

        <p><strong>Nachricht:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "Nachricht erfolgreich gesendet.",
    });
  } catch (err) {
    console.error("EMAIL ERROR:", err);

    res.status(500).json({
      status: "error",
      message: "Nachricht konnte nicht gesendet werden.",
    });
  }
};
