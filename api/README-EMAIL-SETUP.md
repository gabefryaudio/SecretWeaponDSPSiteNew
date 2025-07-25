# Email Setup for Contact Form

The contact form is now configured to work with Vercel's serverless functions. To actually send emails, you need to:

## 1. Choose an Email Service

### Option A: Resend (Recommended for Vercel)
1. Sign up at https://resend.com
2. Get your API key
3. Add domain verification
4. Install: `npm install resend`

### Option B: SendGrid
1. Sign up at https://sendgrid.com
2. Get your API key
3. Verify your sender email
4. Install: `npm install @sendgrid/mail`

### Option C: Gmail SMTP (Simple but limited)
1. Enable 2FA on your Gmail account
2. Generate an app-specific password
3. Install: `npm install nodemailer`

## 2. Set Environment Variables in Vercel

Go to your Vercel project settings > Environment Variables and add:

For Resend:
- `RESEND_API_KEY`: Your Resend API key
- `CONTACT_EMAIL`: Where to receive messages (your email)

For SendGrid:
- `SENDGRID_API_KEY`: Your SendGrid API key
- `CONTACT_EMAIL`: Where to receive messages

For Gmail:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your app-specific password
- `CONTACT_EMAIL`: Where to receive messages

## 3. Update the API Function

Uncomment the appropriate section in `/api/send-contact.js` based on your chosen service.

## 4. Deploy to Vercel

```bash
vercel --prod
```

## Testing Locally

To test locally with Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This will run the serverless functions locally on `http://localhost:3000`.

## Current Status

Right now, the function will:
- Validate the form data
- Log submissions to Vercel's function logs
- Return success to the frontend

But it won't actually send emails until you configure one of the email services above.