// Form submissions go to our own API (server/index.mjs), which sends them via Brevo.
// The Brevo API key lives only on the server.

type FormType = 'demo' | 'partner';

const submitForm = async (formType: FormType, data: Record<string, string | undefined>) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, ...data }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

// Send demo form email
export const sendDemoFormEmail = (data: {
  name: string;
  email: string;
  company: string;
}) => submitForm('demo', data);

// Send partner form email
export const sendPartnerFormEmail = (data: {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message?: string;
}) => submitForm('partner', data);
