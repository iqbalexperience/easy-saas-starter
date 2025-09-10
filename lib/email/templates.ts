import { saasMeta } from "../appMeta/meta";

export const emailVerificationTemplate = ({ verificationUrl }: any) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Account</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Inter', sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #f7fafc;
      }

      .container {
        background-color: #ffffff;
        padding: 32px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        width: 450px;
      }

      .logo {
        margin-bottom: 24px;
        display: flex; /* Use flexbox for alignment */
        justify-content: center; /* Center the logo horizontally */
      }

      .logo img {
        height: 30px;
        width: 30px;
      }

      .heading {
        font-size: 28px;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 16px;
      }

      .text {
        font-size: 16px;
        color: #4a5568;
        line-height: 1.5;
        margin-bottom: 24px;
        text-align: center; /* Center the text */
      }

      .button {
        background-color: #2563eb;
        color: #ffffff;
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 18px;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        width: 100%;
        max-width: 320px; /* Added a max-width to the button */
        margin: 0 auto; /* Center the button */
      }

      .button:hover {
        background-color: #1e40af;
      }
       /* Add this style to create the underline */
      .heading::after {
        content: ""; /* Empty content, the line is created by borders */
        display: block; /* Make it a block element to take up space */
        width: 60px; /* Width of the underline */
        height: 2px; /* Thickness of the underline */
        background-color: #e2e8f0; /* Color of the underline */
        margin: 8px auto 0 auto; /* Center the line and add space below */
      }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="${process.env.WEB_APP_URL + saasMeta.logo}" alt="${saasMeta.name}">
        </div>
        <h1 class="heading">Confirm your account</h1>
        <p class="text">Please click the button below to confirm your email address and finish setting up your account.</p>
        <a href="${verificationUrl}" class="button">Confirm</a>
    </div>
</body>
</html>
`;
};

export const resetPasswordTemplate = ({ resetUrl }: any) => {
    return `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f7fafc; width: 100%;">
    <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); text-align: center; width: 450px;">
        <div style="margin-bottom: 24px; display: flex; justify-content: center;">
            <img src="${process.env.WEB_APP_URL + saasMeta.logo}" alt="${saasMeta.name}" style="height: 30px; width: 30px;">
        </div>
        <h1 style="font-size: 28px; font-weight: 600; color: #1a202c; margin-bottom: 16px; position: relative;">
            Reset your password
            <span style="display: block; width: 100%; height: 2px; background-color: #e2e8f0; margin: 8px auto 0 auto;"></span>
        </h1>
        <p style="font-size: 16px; color: #4a5568; line-height: 1.5; margin-bottom: 24px; text-align: center;">
            Please click the button below to reset your password.
        </p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border: none; border-radius: 6px; font-size: 18px; cursor: pointer; display: inline-block; text-decoration: none; width: 100%; max-width: 320px; margin: 0 auto;">
            Reset Password
        </a>
    </div>
</body>
</html>


  `;
};


export const orgInvitationTemplate = ({ invitedByUsername, invitedByEmail, teamName, inviteLink }: any) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Join!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';">
    <center style="width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                    <td style="padding: 30px 0; text-align: center; background-color: #ffffff;">
                        <img src="${process.env.WEB_APP_URL + saasMeta.logo}" alt="${saasMeta.name}" style="height: 40px; width: 40px; display: inline-block; vertical-align: middle; margin-right: 10px;">
                        <span style="font-size: 24px; font-weight: 700; color: #333333; vertical-align: middle;">${saasMeta.name}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0 40px 40px 40px; text-align: center;">
                        <h1 style="font-size: 28px; color: #1a202c; margin-bottom: 20px; line-height: 1.3;">You're Invited to Join <strong style="color: #2563eb;">${teamName}</strong>!</h1>
                        <p style="font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
                            Hello, you've been invited by <strong style="color: #333;">${invitedByUsername}</strong> (${invitedByEmail}) to join the <strong style="color: #333;">${teamName}</strong> organization on <strong style="color: #333;">${saasMeta.name}</strong>.
                            <br><br>
                            Click the button below to accept your invitation and get started on your journey with us.
                        </p>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td align="center" style="padding-bottom: 20px;">
                                    <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 6px; font-size: 18px; text-decoration: none; display: inline-block; font-weight: 600;">
                                        Accept Invitation
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <p style="font-size: 14px; color: #718096; margin-top: 30px; line-height: 1.5;">
                            If you have any questions, feel free to reply to this email or visit our help center.
                            <br>
                            Thanks,<br>
                            The ${saasMeta.name} Team
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px 40px; text-align: center; font-size: 12px; color: #a0aec0; background-color: #f7fafc; border-top: 1px solid #edf2f7;">
                        &copy; 2025 ${saasMeta.name}. All rights reserved.
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>`}