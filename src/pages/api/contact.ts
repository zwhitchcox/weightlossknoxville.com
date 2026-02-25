import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const { firstName, lastName, email, phone, location, interest, referral, message } = data;

    // Basic validation
    if (!firstName || !lastName || !email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Please fill in all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'Server configuration error. Please call us directly.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const resend = new Resend(apiKey);

    const locationLabel = location === 'bearden' ? 'Bearden (Knoxville)' : location === 'farragut' ? 'Farragut' : 'Not specified';

    const interestLabels: Record<string, string> = {
      tirzepatide: 'Tirzepatide (Mounjaro/Zepbound)',
      semaglutide: 'Semaglutide (Wegovy/Ozempic)',
      botox: 'Botox / Dysport / Jeuveau',
      filler: 'Dermal Fillers',
      laser: 'Laser Treatments',
      microneedling: 'Microneedling',
      'chemical-peel': 'Chemical Peels',
      other: 'Other',
    };
    const interestLabel = interest ? (interestLabels[interest] || interest) : 'Not specified';

    const referralLabels: Record<string, string> = {
      google: 'Google Search',
      referral: 'Friend/Family Referral',
      doctor: 'Doctor Referral',
      social: 'Social Media',
      other: 'Other',
    };
    const referralLabel = referral ? (referralLabels[referral] || referral) : 'Not specified';

    const { error } = await resend.emails.send({
      from: 'Weight Loss Knox <noreply@weightlossknoxville.com>',
      to: 'sarah@hitchcoxaesthetics.com',
      subject: `New Consultation Request from ${firstName} ${lastName}`,
      html: `
        <h2>New Consultation Request</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Phone</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><a href="tel:${phone}">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Preferred Location</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${locationLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Interested In</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${interestLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Referral Source</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${referralLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">Message</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${message || 'No message provided'}</td>
          </tr>
        </table>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send your request. Please try again or call us directly.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Your consultation request has been sent. We will contact you within one business day.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again or call us directly.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
