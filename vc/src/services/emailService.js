import emailjs from '@emailjs/browser';

export const sendOTP = async (email, otp) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS keys missing. OTP printed to console for testing:", otp);
    return true; // Bypass for testing if keys aren't set
  }

  try {
    await emailjs.send(serviceId, templateId, {
      user_email: email,
      otp_code: otp,
    }, publicKey);
    return true;
  } catch (error) {
    console.error('EmailJS Error:', error);
    throw new Error('Failed to send verification code. Check your EmailJS configuration.');
  }
};
