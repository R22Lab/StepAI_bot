# StepAI_bot

This is a Telegram Mini App with a registration form that integrates with Telegram's design guidelines and authentication system.

## Features

- Integration with Telegram Mini App SDK
- Responsive design that adapts to Telegram's theme colors
- Form validation using React Hook Form and Zod
- Secure authentication using Telegram's initData
- Registration data stored in Google Sheets
- Proper error handling and user feedback

## Components

- `RegistrationForm.tsx`: Main registration form component with all required fields
- API route `/api/registration`: Handles form submission and Google Sheets integration
- Dynamic imports to avoid SSR issues
- Telegram MainButton integration

## Setup

1. Install dependencies: `npm install`
2. Set environment variables:
   - `BOT_TOKEN`: Your Telegram bot token
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account email
   - `GOOGLE_PRIVATE_KEY`: Google service account private key
   - `GOOGLE_SHEET_ID`: Google Sheet ID for storing registrations
3. Run the development server: `npm run dev`

## Fields

- Full Name (required)
- Email (required)
- Phone (optional)
- AI Experience Level (beginner/profi/expert)
- Personal Data Consent (required)
- Marketing Consent (optional)

## Technical Details

- Uses Next.js App Router
- React Hook Form for form management
- Tailwind CSS for styling
- Telegram SDK for theme adaptation and UI components
- Zod for form validation