import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email/email";
import {
  openAPI,
  oneTap,
  bearer,
  multiSession,
  admin,
  username,
} from "better-auth/plugins";
import {
  emailVerificationTemplate,
  orgInvitationTemplate,
  resetPasswordTemplate,
} from "./email/templates";
import { saasMeta } from "./appMeta/meta";
import { apiKey } from "better-auth/plugins"
import { organization } from "better-auth/plugins"


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  plugins: [
    openAPI({ disableDefaultReference: false }), // /api/auth/reference to view the Open API reference
    bearer(),
    admin({
      adminUserIds: [],
    }),
    multiSession(),
    apiKey({
      rateLimit: {
        enabled: true,
        timeWindow: 60 * 1000, // 1 minute
        maxRequests: 500,
      },
    }),
    organization({
      allowUserToCreateOrganization: async (user) => {
        if (user?.role === "admin") {
          return true
        } else {
          return false
        }

      },
      async sendInvitationEmail(data) {
        console.log(data.id)
        const inviteLink = `${process.env.WEB_APP_URL}/auth/accept-invitation?invitationId=${data.id}`
        await sendEmail({
          to: data.email,
          subject: `${saasMeta.name} | Invitation`,
          body: orgInvitationTemplate({
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink
          }),
        });
      },
    })
  ],
  // trustedOrigins: ["chrome-extension://dfgklfhblpboebbehcakgoimmagebohj"],
  advanced: {
    database: {
      generateId(options) {
        var chars = "0123456789abcdef";
        var randS = "";
        let length = 24

        while (length > 0) {
          randS += chars.charAt(Math.floor(Math.random() * chars.length));
          length--;
        }
        return randS;
      },
    }
  },
  user: {
    deleteUser: {
      enabled: true
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ user, url }: any) {
      await sendEmail({
        to: user.email,
        subject: `${saasMeta.name} | Reset Password`,
        body: resetPasswordTemplate({ resetUrl: url }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }: any) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

      await sendEmail({
        to: user.email,
        subject: `${saasMeta.name} | Confirm Your Account`,
        body: emailVerificationTemplate({ verificationUrl }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    },
  }
});

