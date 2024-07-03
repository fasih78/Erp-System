const router = require('express').Router();

const orderService = require ('./order.service');



router.post('/',async(req,res)=>{

const result = await orderService.orderPlace(req,res)
return result

})




router.delete('/',async(req,res)=>{

    const result = await orderService.orderDelete(req,res)
    return result
    
    })




module.exports = router