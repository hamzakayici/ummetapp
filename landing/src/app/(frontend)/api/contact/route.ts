import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Ad, e-posta ve mesaj zorunludur." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Ümmet App" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO,
      replyTo: email,
      subject: `[Ümmet] ${subject || "İletişim Formu"} — ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#1B4332;margin-bottom:20px;">Yeni İletişim Mesajı</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;width:100px;">Ad Soyad:</td><td style="padding:8px 0;color:#333;">${name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;">E-posta:</td><td style="padding:8px 0;color:#333;">${email}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Konu:</td><td style="padding:8px 0;color:#333;">${subject || "Belirtilmedi"}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
          <div style="padding:12px;background:#fff;border-radius:8px;border:1px solid #eee;">
            <p style="color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:20px;">Bu mesaj Ümmet uygulaması iletişim formundan gönderilmiştir.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "E-posta gönderilemedi." }, { status: 500 });
  }
}
