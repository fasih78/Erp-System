const router = require('express').Router();

const productService= require('./product.service.js');




router.post('/',async(req,res)=>{


    const result = await productService.CreateProduct(req,res);
    return result
})


router.post('/cart',async(req,res)=>{


    const result = await productService.addToCart(req,res);
    return result
})

router.get('/',async(req,res)=>{
    const result = await productService.findProducts(req,res);
    return result
})
router.delete('/delete/item/:itemId',async(req,res)=>{

    const result = await productService.removeItemAndUpdateTotals(req,res);
    return result;
})


router.delete('/delete/carts',async(req,res)=>{

    const result = await productService.deleteCarts(req,res);
    return result;
})
router.delete('/delete/product',async(req,res)=>{

    const result = await productService.deleteProduct(req,res);
    return result;
})
module.exports= router
