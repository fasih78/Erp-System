const router = require('express').Router();
const jwtAuth = require('../../../Middlewares/jwt_Auth')
const emailValidation = require('../../../Middlewares/email-validation');
const passwordValidation = require('../../../Middlewares/password-validation');

const UserService = require('./User.Service')
const UserAuth =require('../User_Security/User.Security')


router.post('/signup',
emailValidation,
passwordValidation,
async(req,res)=>{
const result= await UserService.userSignUp(req,res);

return result

})
router.post('/login',
async(req,res)=>{
const result= await UserService.logIn(req,res);
return result


})
router.post('/forgetpassword',
async(req,res)=>{
const result= await UserAuth.forgetPassword(req,res);
return result


})

router.post('/verifyotp',async(req,res)=>{
    const result= await UserAuth.verifyOTP(req,res);
    return result
})

router.post('/resetpassword',emailValidation,jwtAuth,async(req,res)=>{
    const result = await UserAuth.resetPassword(req,res);
    return result
})

router.put('/personalinfo/:id',emailValidation,async(req,res)=>{

    const result  =await UserService.updatePersonalInfo(req,res)
    return result
})

router.get('/getone/:id',async(req,res)=>{
    const result= await UserService.userFindOne(req,res)
    return result
})


module.exports =router;