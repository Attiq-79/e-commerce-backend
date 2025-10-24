const forgotPasswordTemplate = ({ name, otp }) => {
  return `
    <div>
      <p>Dear, ${name}</p>
      <p>You requested a password reset. Please use the following OTP code to reset your password:</p>
      <div><strong>${otp}</strong></div>
      <p>This OTP is valid for 1 hour.</p>
      <br><br>
      <p>Thanks,</p>
      <p>Binkeyit</p>
    </div>
  `;
};

export default forgotPasswordTemplate;
