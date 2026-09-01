import nodemailer from 'nodemailer';

async function main() {
  const user = 'zadoyhoma@gmail.com';
  const pass = 'gmafkibcdugjglpr';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  const info = await transporter.sendMail({
    from: `"ARIT E-ROOMs" <${user}>`,
    to: '663170010124@rmu.ac.th',
    subject: '🔔 ทดสอบระบบแจ้งเตือน ARIT E-ROOMs',
    text: 'เทสหน่อย นี่คือการทดสอบ การยิง อีเมล ไม่ต้องตกใจเป็นเพียงการทดสอบ\n\nจาก: ระบบ ARIT E-ROOMs'
  });

  console.log('✅ Email sent successfully! Message ID: ' + info.messageId);
}

main().catch(console.error);
