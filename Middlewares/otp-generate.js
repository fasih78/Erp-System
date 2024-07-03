const crypto = require("crypto");


const  generateOTP=async ()=> {
    const otpBuffer = crypto.randomBytes(4); // Adjust the number of bytes as needed
    const otp = otpBuffer.readUIntBE(0, otpBuffer.length) % 1000000;

    return otp.toString().padStart(6, "0");
}
module.exports = generateOTP;

