import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { validate } from '@telegram-apps/init-data-node';
import { z } from 'zod';

// Define Zod schema for input validation
const registrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Experience level must be one of: beginner, intermediate, advanced, expert' })
  }),
  consentPd: z.boolean().refine(value => value === true, {
    message: 'Consent to personal data processing is required'
  }),
  consentMarketing: z.boolean()
});

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();

    // Extract initData from either header or body
    const initData = request.headers.get('Authorization')?.replace('Bearer ', '') || body.initData;

    if (!initData) {
      return new Response(
        JSON.stringify({ error: 'Authorization data is required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate Telegram init data
    let validatedData;
    try {
      validatedData = validate(initData, process.env.BOT_TOKEN!);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid Telegram init data' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract user ID from validated data
    const telegramUserId = validatedData.user?.id;
    if (!telegramUserId) {
      return new Response(
        JSON.stringify({ error: 'Unable to extract user ID from Telegram data' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate input data
    let parsedData;
    try {
      parsedData = registrationSchema.parse(body);
    } catch (error) {
      const zodError = error as z.ZodError;
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: zodError.errors.map(e => e.message).join(', ') 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Check for duplicate registration
    const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    const range = 'Registrations!A:A'; // telegram_user_id column
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const existingUserIds = response.data.values?.map(row => row[0]) || [];
    
    if (existingUserIds.includes(telegramUserId.toString())) {
      return new Response(
        JSON.stringify({ error: 'User already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data to be added
    const newRow = [
      telegramUserId.toString(),
      new Date().toISOString(), // ISO date
      parsedData.fullName,
      parsedData.email,
      parsedData.phone,
      parsedData.experienceLevel,
      parsedData.consentPd ? new Date().toISOString() : '', // consent_pd_timestamp
      parsedData.consentMarketing
    ];

    // Add the new row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Registrations',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow],
      },
    });

    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}