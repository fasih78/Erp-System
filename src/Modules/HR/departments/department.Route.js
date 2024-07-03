const express = require('express');
const router = express.Router();
// const {createDepartment,departmentFind,deleteDepartment,departmentUpdate,departmentFindOne} = require('./department.service');


const service = require('./department.service')



router.post('/create',async(req,res)=>{


    const result = await service.createDepartment(req,res);
  
    return result;
})


router.delete('/delete/:id',async(req,res)=>{


    const result = await service.deleteDepartment(req,res);
    return result;
})

router.get('/',async(req,res)=>{


    const result = await service.departmentFind(req,res);
    return result;
})

router.put('/update/:id',async(req,res)=>{
    const result = await service.departmentUpdate(req,res);
    return result;
})
router.get('/getone/:id',async(req,res)=>{
    const result = await service.departmentFindOne(req,res);
    return result;
})
module.exports = router;