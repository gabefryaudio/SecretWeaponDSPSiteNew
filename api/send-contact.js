// Vercel Serverless Function for handling contact form submissions
import { Resend } from 'resend';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { firstName, lastName, email, company, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Initialize Resend with your API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend
    const emailData = await resend.emails.send({
      from: 'Secret Weapon DSP <onboarding@resend.dev>', // You'll need to verify your domain to use custom from address
      to: process.env.CONTACT_EMAIL || 'gabefry@gmail.com', // Your email address
      replyTo: email, // So you can reply directly to the sender
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #667eea; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 8px; font-size: 14px;">
            <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0 0 0;"><strong>IP Address:</strong> ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown'}</p>
          </div>
        </div>
      `,
      text: `New Contact Form Submission
      
Name: ${firstName} ${lastName}
Email: ${email}
Company: ${company || 'Not provided'}
Subject: ${subject}

Message:
${message}

Timestamp: ${new Date().toLocaleString()}
IP Address: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown'}`
    });

    console.log('Email sent successfully:', emailData);

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your message. We will get back to you soon!' 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ 
      error: 'Failed to send message. Please try again later.' 
    });
  }
}