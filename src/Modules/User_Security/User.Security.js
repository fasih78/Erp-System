const generateOTP = require('../../../Middlewares/otp-generate');
const UserModel = require ('../User_Auth/User.Model');
const nodemailer =require('nodemailer');
const session = require('express-session');
const bcrypt=  require('bcrypt');
require('dotenv').config();
const saltRounds = 10; 
const otpStorage = new Map();

const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  
  });



exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
   
        
        const userExist = await UserModel.findOne({ email:email });

        if (userExist) {
            const otp = await generateOTP(); 
            console.log(otp);
            const emailBody = `Dear ${userExist.username},\n\nTo proceed with your application, please use the following One-Time Password (OTP):\n\nYour OTP: ${otp}\n\nPlease enter this OTP on our website to continue the application process.\n\nThanks again for your inquiry!\n\nBest regards,\nFascom Limited`;
            setTimeout(function () {
                const info1 = transporter.sendMail({
                    from: "career@fascom.com", 
                    to: "career@fascom.com", 
                    subject: `Hello !  ${email}`,

                    text:

                        `Dear [${userExist.username}],
          
         
          
          To proceed with your application, please use the following One-Time Password (OTP):
          
          Your OTP: [${otp.toString()}]
          
          Please enter this OTP on our website to continue the application process.
          
          Thanks again for your inquiry!
          
          Best regards,
          Fascom Limited`

                });
            }, 10000);
            // setTimeout(async () => {
            //     try {
            //         await transporter.sendMail(useremail, 'Password Reset OTP', emailBody); // Assuming sendMail is a function to send emails
            //     } catch (error) {
            //         console.error('Error sending email:', error);
            //     }
            // }, 10000);

            const trimmedEmail = email.trim();
        //    const otpStorage = new Map();
            otpStorage.set(trimmedEmail, { otp, timestamp: Date.now() });

            res.status(200).send({ message: 'Success',success:true });
        } else {
            return res.status(404).send({ message: 'User not found',success:false });
        }
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        return { message: 'Internal server error' };
    }
};

// Initialize otpStorage outside the function

 exports.verifyOTP = (req, res) => {
    try {
        const { enteredOtp } = req.body;
        console.log(enteredOtp, "otp");

        const useremail = req.session.userEmail;

        console.log(otpStorage.has(useremail));

        if (otpStorage.has(useremail)) {
            const { otp, timestamp } = otpStorage.get(useremail);
           
            const validityPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
            const currentTime = Date.now();

            if (enteredOtp === otp && currentTime - timestamp <= validityPeriod) {
                return res.status(200).send({ message: 'OTP verified successfully', success: true });
            } else {
                return res.status(400).send({ message: 'Invalid OTP or OTP expired', success: false });
            }
        } else {
            return res.status(404).send({ message: 'No OTP data found', success: false });
        }
    } catch (err) {
        console.error('Error in verifyOTP:', err);
        return res.status(500).send({ error: err });
    }
};

// const resetPassword = async(req,res)=>{
//     const {useremail,password,newpassword}=req.body
//     const userExist = await UserModel.findOne({ useremail: useremail })

//       if (!userExist) {
//         return res.status(404).send({ message: 'User not found!', success: false });
//       }
//       const hash = userExist.password;
//       const passwordcompared = await bcrypt.compare(password, hash);

//       if (passwordcompared === false) {
        
//         return res.status(400).send({ message: 'Incorrect password', success: false });
//       }
//       if (newpassword !== password) {
//         const salt = bcrypt.genSaltSync(saltRounds);
//         const hash2 = bcrypt.hashSync(newpassword, salt);
//         const updatepassword = await UserModel.updateOne(
//           {
//             useremail: userExist.useremail
//           },

//           {
//             $set: {
//               password: hash2,

//             }
//           }
//         )
//       }
//       else {
//         return res.status(400).send({ message: 'you already used this password!', success: false });
//       }
//       return res.status(200).send({message:'Password Reset Sucessfully!',success:true})

//}
exports.resetPassword = async (req, res) => {
    const { email, password, newpassword } = req.body;
    const userExist = await UserModel.findOne({ email: email });

    if (!userExist) {
        return res.status(404).send({ message: 'User not found!', success: false });
    }

    const hash = userExist.password;
    const passwordcompared = await bcrypt.compare(password, hash);

    if (passwordcompared === false) {
        return res.status(400).send({ message: 'Incorrect password', success: false });
    }

    // Password policy check
    const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPolicyRegex.test(newpassword)) {
        return res.status(400).send({
            message: 'Password does not meet the complexity requirements{// Minimum length 8// Must have at least one uppercase letter // Must have at least one lowercase letter // Must have at least one digit // Must have at least one special character}',
            success: false
        });
    }

    if (newpassword === password) {
        return res.status(400).send({ message: 'You already used this password!', success: false });
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash2 = bcrypt.hashSync(newpassword, salt);
    const updatepassword = await UserModel.updateOne(
        { email: userExist.email },
        { $set: { password: hash2 } }
    );

    return res.status(200).send({ message: 'Password Reset Successfully!', success: true });
};





