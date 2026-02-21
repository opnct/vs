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
    const response = await emailjs.send(
      serviceId, 
      templateId, 
      {
        user_email: email,
        otp_code: otp,
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