# Project Setup Instructions

This document outlines the steps to install and run this project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** (Version >= 18) Check your Node.js version with `node -v`.
- **pnpm:** (Version >= 8) If you don't have pnpm, install it using npm: `npm install -g pnpm`
- **Prisma CLI:** Generally installed with `pnpm install`, but if you encounter issues, refer to the Prisma documentation.
- **Better Auth CLI:** Generally installed with `@better-auth/cli`, but if you encounter issues, refer to the Better Auth documentation.
- **Database:** (e.g., PostgreSQL, MySQL, SQLite) Ensure you have a database installed and running, and that you have the connection URL available.

## Installation and Setup

Follow these steps to get the project up and running:

1.  **Clone the repository:**

    ```bash
    git clone <your_repository_url>
    cd <your_project_directory>
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Generate Prisma Client:**

    ```bash
    npx prisma generate
    ```

4.  **Apply database migrations:**

    ```bash
    npx prisma db push
    ```

    \*This command updates your database schema to the latest version defined in your Prisma schema file. It's crucial for setting up the database.\*

5.  **Generate Better Auth files:**

    ```bash
    npx @better-auth/cli generate
    ```

6.  **Start the development server:**

    ```bash
    pnpm run dev
    ```

    This command typically starts the application in development mode, and you can access it in your browser (usually at `http://localhost:3000`).

## Configuration

- **Environment Variables:** The `.env` file is crucial for storing sensitive information like database URLs, API keys, and other configuration values. Create a `.env` file in the root of your project and add the following environment variables:

  ```
  DATABASE_URL=
  BETTER_AUTH_SECRET=
  BETTER_AUTH_URL=http://localhost:3000
  EMAIL_VERIFICATION_CALLBACK_URL="/"

  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  MICROSOFT_CLIENT_ID=
  MICROSOFT_CLIENT_SECRET=
  APPLE_CLIENT_ID=
  APPLE_CLIENT_SECRET=
  APPLE_APP_BUNDLE_IDENTIFIER=

  S3_UPLOAD_KEY=
  S3_UPLOAD_SECRET=
  S3_UPLOAD_BUCKET=
  S3_UPLOAD_REGION=

  SENDGRID_API_KEY=
  EMAIL_FROM=


  WEB_APP_URL=http://localhost:3000
  ```

  - **DATABASE_URL:** The connection string for your database. Example: `"postgresql://user:password@host:port/database"` or `"file:./dev.db"`.
  - **BETTER_AUTH_SECRET:** Secret key used by Better Auth for secure session management.
  - **BETTER_AUTH_URL:** The URL where Better Auth is hosted.
  - **EMAIL_VERIFICATION_CALLBACK_URL:** The URL to redirect the user after email verification.
  - **GOOGLE_CLIENT_ID:** Client ID for Google authentication.
  - **GOOGLE_CLIENT_SECRET:** Client Secret for Google authentication.
  - **MICROSOFT_CLIENT_ID:** Client ID for Microsoft authentication.
  - **MICROSOFT_CLIENT_SECRET:** Client Secret for Microsoft authentication.
  - **APPLE_CLIENT_ID:** Client ID for Apple authentication.
  - **APPLE_CLIENT_SECRET:** Client Secret for Apple authentication.
  - **APPLE_APP_BUNDLE_IDENTIFIER:** Apple App Bundle Identifier.
  - **S3_UPLOAD_KEY:** Key for accessing your S3 storage.
  - **S3_UPLOAD_SECRET:** Secret for accessing your S3 storage.
  - **S3_UPLOAD_BUCKET:** Name of your S3 bucket.
  - **S3_UPLOAD_REGION:** Region of your S3 bucket.
  - **SENDGRID_API_KEY:** API key for SendGrid.
  - **EMAIL_FROM:** Email address used as the sender for application emails.
  - **WEB_APP_URL:** The base URL of your web application.

  Do _not_ commit the `.env` file to your version control system.

## Troubleshooting

- **Prisma Issues:** If you encounter errors with Prisma, ensure that your database is running, the `DATABASE_URL` is correct, and your Prisma schema (`schema.prisma`) is properly configured. You may need to consult the Prisma documentation for specific error messages.
- **Better Auth Issues:** If you have problems with Better Auth, refer to the Better Auth documentation for troubleshooting steps and configuration options.
- **Dependency Issues:** If you have trouble with `pnpm install`, make sure you have the correct version of Node.js and pnpm installed. Try deleting the `node_modules` directory and `pnpm-lock.yaml` file, and then running `pnpm install` again.
- **Port Issues:** If `pnpm run dev` fails because the port is already in use, you can either stop the process using that port or try changing the port the application runs on (check your framework's documentation for how to configure the port).

## Important Notes

- **Version Control:** Make sure to add your `node_modules` directory and `.env` file to your `.gitignore` file to prevent them from being committed to your repository.
