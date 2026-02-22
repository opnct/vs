import emailjs from '@emailjs/browser';

export const sendOTP = async (email, otp) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // STRICTLY NO SIMULATION: Enforce that keys must be present for production routing
  if (!serviceId || !templateId || !publicKey) {
    throw new Error("CRITICAL: EmailJS API keys are missing in the environment variables.");
  }

  try {
    // REAL LOGIC: Dispatch actual email via EmailJS network request
    // We pass multiple variable variations to prevent 422 template mismatch errors.
    const response = await emailjs.send(
      serviceId, 
      templateId, 
      {
        user_email: email, // Matches {{user_email}} if you set it up manually
        otp_code: otp,     // Matches {{otp_code}} if you set it up manually
        to_email: email,   // Standard EmailJS fallback for {{to_email}}
        message: otp       // Standard EmailJS fallback for {{message}}
      }, 
      publicKey
    );

    // Validate network transaction integrity
    if (response.status !== 200) {
      throw new Error(`EmailJS responded with anomalous status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('EmailJS Execution Error:', error);
    throw new Error('Failed to dispatch secure access code. Please verify your EmailJS configuration and network status.');
  }
};