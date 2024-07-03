const express = require('express');
const router = express.Router();

const service = require('./employee.service');
const emailValidation = require('../../../../Middlewares/email-validation');


router.post('/create',emailValidation ,async(req,res)=>{


    const result = await service.createEmployee(req,res);
  
    return result;
})


router.get('/',async(req,res)=>{


    const result = await service.employeeFind(req,res);
    return result;
})

router.put('/update/:id',async(req,res)=>{
    const result = await service.employeeupdate(req,res);
    return result;
})
router.get('/getone/:id',async(req,res)=>{
    const result = await service.employeeFindOne(req,res);
    return result;
})

router.delete('/delete/:id',async(req,res)=>{


    const result = await service.employeeDelete(req,res);
    return result;
})










module.exports = router;