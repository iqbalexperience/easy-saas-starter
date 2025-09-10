import sgMail from "@sendgrid/mail";

export async function sendEmail({ to, subject, body }: any) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not defined in env");
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not defined in env");
  }
  // console.log(process.env.SENDGRID_API_KEY);

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const mailOptions = {
    // from: "Workengine Support <app@workengine.ai>",
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html: body,
  };
  const status = await new Promise(async (resolve, reject) => {
    try {
      // const res = await resend.emails.send(mailOptions);
      const res = await sgMail.send(mailOptions);
      // console.log({ mailRes: res });
      resolve(res);
    } catch (error) {
      reject(error);
    }
  });

  return status;
}
