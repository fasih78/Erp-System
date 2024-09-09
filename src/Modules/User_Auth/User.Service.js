const UserModel=  require('./User.Model');
const nodemailer =require('nodemailer');
const bcrypt=  require('bcrypt');
const JWT = require('jsonwebtoken');
const validator =require ('validator')
require('dotenv').config();
const session =require('express-session')
const  EventEmitter = require ('events');

const myEmitter = new EventEmitter();


const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  
  });




 exports.userSignUp = async(req,res)=>{


  const { username, email, password, gender, address, phonenumber,city, state, country } = req.body;
  
 
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(404).send({ message: "User already exists!" ,success:false });
  }

  const saltRounds = 10; 
  const hashedPassword = await bcrypt.hash(password, saltRounds);


  const lastUser = await UserModel.findOne().sort({ _id: -1 }).exec();
  const id = lastUser ? lastUser.id + 1 : 1;

  const newUser = await UserModel.create({
    id,
    username,
    email,
    password: hashedPassword,
    phonenumber,
    gender,
    address,
    city,
    state,
    country
  });

  console.log("User created:", newUser);
  return res.status(201).send({data:newUser,success:true});

}
exports.logIn = async(req,res)=>{


        const{email,password}=req.body  
     
   
        const userExist = await UserModel.findOne({ email: email })
        if (userExist) {
          req.session.userEmail = userExist?.email;
          req.session.userId = userExist?._id;
          req.session.username = userExist?.username;
          console.log(req.session.userEmail   ,   req.session.userId);
          const hash = userExist.password;
          const passwordCompared = await bcrypt.compare(password, hash)
  
          if (passwordCompared) {
            const findpassword = await UserModel.findOne({
              password: passwordCompared,
            }).exec();
  
          
            email_sending();
  
            const token = JWT.sign({ email: email }, process.env.SECRET_KEY, {
              expiresIn: "50m",
            })
             res.status(200).send({ message:'Log Inn!', token: token, email: email })
  
  
  
            function email_sending() {
              setTimeout(function () {
                const info1 = transporter.sendMail({
                  from: "career@fascom.com", // sender address
                  to: "career@fascom.com", // list of receivers
                  subject: `Hello !  ${email}`, // Subject line
                  text: `Welcome to Fascom Limited
                                  Thank you for interest in empolyment at Fascom Limited. if your qualifiaction
                                  match our needs , we will contact you to learn more about your fit in this position
                                  
                                  Thanks again for your inquiry!
                                  
                                  - Fascom Limited
                                  ,
                                  `,
                });
              }, 10000);
            }
          }
          else {
            
            return res.status(400).send({message:"Incorrect Password!", success:false})
          }
        } else {
         
          return res.status(400).send({message:"Invalid email!",success:false})
        }
}


exports.updatePersonalInfo = async (req, res) => {
    try {
        const lastUser = await UserModel.findOne().sort({ _id: -1 }).exec();
        const userId = lastUser ? lastUser.id + 1 : 1;

        const updateResult = await UserModel.updateOne({ _id: req.params.id }, {
            $set: {
                id: userId,
                name: req?.body?.name,
                email: req?.body?.email,
                phonenumber: req?.body?.phonenumber,
                password: req?.body?.password,
                gender: req?.body?.phonenumber, 
                address: req?.body?.address
            }
        });

if (updateResult.acknowledged > 0) {
  return res.status(200).json({ message: "Personal info updated successfully!", success: true });
}  else {
  return res.status(200).json({ message: "No changes were made.", success: true });
}

    } catch (error) {
        console.error("Error updating personal info:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};
exports.userFindOne = async (req, res) => {
  try {
      const user = await UserModel.findOne({ _id: req.params.id });
      
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      return res.status(200).json({ success: true, data: user });
  } catch (error) {
      console.error("Error finding user:", error);
      return res.status(500).json({ success: false, message: "Internal server error." });
  }
};