const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const isOtpValid = (user, otp) => {
  return user.otp === otp && user.otpExpiry > new Date();
};

module.exports = { generateOtp, isOtpValid }; 