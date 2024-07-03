const { Model, default: mongoose } = require('mongoose');

const config = require('../../../../config/config');
require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const upload  = require ('../../../../Middlewares/multer.js')
// const credentials = require('')
const { ProductModel, CartModel } = require('./product.model');
const moment = require('moment');
const productModel = require('./product.model');

const cloudinaryConfig = config.cloudinary;

cloudinary.config({
    cloud_name: cloudinaryConfig.AUTH_CLOUD_NAME,
    api_key:cloudinaryConfig.AUTH_API_KEY,
    api_secret: cloudinaryConfig.AUTH_API_SECRET,
    secure: true,
  });



  const uploads = upload.single("file");

  exports.CreateProduct = async (req, res) => {
    try {

        const lastProduct = await ProductModel.findOne().sort({_id: -1}).exec();
        const id = lastProduct ? lastProduct.id + 1 : 1;

        uploads(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Error uploading image. Only supported image files are allowed.",
                    success: false
                });
            }

            if (!req.file) {
                return res.status(400).json({ message: "Please upload a file!" });
            }
            try {
                const data = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
                const cloudinaryUrl = data.secure_url;
                const publicIdRegex = /\/v\d+\/([^/]+)_(\w+)(?:\.\w+)?/;
                const matches = cloudinaryUrl.match(publicIdRegex);

                if (!matches || !matches[1] || !matches[2]) {
                    console.error("Public ID not found in the URL.");
                    return res.status(500).json({ message: "Error uploading image.", success: false });
                }
                const publicId = `${matches[1]}_${matches[2]}`;
                const colorsData = JSON.parse(req?.body?.colors);
                const sizeData = JSON.parse(req?.body?.sizes);

                let totalStockcolor = 0;
                colorsData.forEach(item => {
                    totalStockcolor += item.stock;
                });
                let totalStocksize = 0;
                sizeData.forEach(item => {
                    totalStocksize += item.stock;
                });
                




              
              
                
                const product = await ProductModel.create({
                    id: id,
                    name: req?.body?.name,
                    price: req?.body?.price,
                    sku_no: req?.body?.sku_no,
                    tax_rate: req?.body?.tax_rate,
                    discount: req?.body?.discount,
                    description:req?.body?.description,
                    stock_items: totalStocksize + totalStockcolor ,
                    cloudinary_url: data?.secure_url,
                    image_public_id: publicId,
                    filePath: req?.file?.path,
                    sizes: sizeData,
                    colors:colorsData
                    });
                    await product.save()
               

                res.status(201).json({
                    message: "Product created and product image uploaded successfully!",
                    success: true
                });
            } catch (uploadError) {
                console.error("Error uploading image to Cloudinary:", uploadError);
                res.status(500).json({ message: "Error uploading image! ", success: false });
            }
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product.", success: false });
    }
};

// exports.addToCart = async (req, res) => {
//     try {
//         // Find the product details by IDs
//         const productIds = req?.body?.productIds;
//         const products = await ProductModel.find({ _id: { $in: productIds } });

//         if (products.length > 0) {
//             let totalAmount = 0;
//             let totalTax = 0;
//             let totalDiscount = 0;

//             // Loop through each product
//             const items = products.map(product => {
//                 const productId = product?._id;
//                 const quantity = req?.body?.quantity
//                 const size = req?.body?.size;
//                 const taxRate = product?.tax_rate || 0; // Default to 0 if tax_rate is missing
//                 const price = product?.price || 0; 
//                 const discount =product?.discount;

//                 // Calculate subtotals and taxes for each product
//                 const subtotal = price * quantity;
//                 const taxAmount = price * taxRate * quantity / 100;
//                 const discountAmount = price * discount / 100;
//                 const total = subtotal + taxAmount;
                
              
//                 totalAmount += subtotal - discountAmount;
//                 totalTax += taxAmount ;
//                 totalDiscount += discountAmount;

//                 return {
//                     product: productId,
//                     quantity: quantity,
//                     tax_rate: taxRate,
//                     size:size,
//                     price: price,
//                     discount: product.discount || 0 // Default to 0 if discount is missing
//                 };
//             });

//             // Create and save the cart
//             const cart = await CartModel.create({
//                 user_id: req.session.userId,
//                 date: moment(Date.now()).format('YYYY-MM-DD'),
//                 items: items,
//                 tax_amount: totalTax,
//                 amount: totalAmount,
//                 total: totalAmount + totalTax,
//                 discount_amount:totalDiscount
//             });

//             for (const productId of productIds) {
//                 await ProductModel.updateOne(
//                     { _id: productId },
//                     { $inc: { stock_items: -1 } }
//                 );
//             }
       
//             return res.status(200).send({ message: 'Cart added successfully!', success: true });
//         } else {
//             // Respond with error message if products not found
//             return res.status(404).send({ message: 'Products not found!', success: false });
//         }
//     } catch (error) {
//         // Handle any errors that occur during the process
//         console.error("Error creating cart:", error);
//         return res.status(500).json({ message: "Error creating cart.", success: false });
//     }
// }

exports.addToCart = async (req, res) => {
    try {
        // Find the product details by IDs
        const productIds = req?.body?.productIds;
        const products = await ProductModel.find({ _id: { $in: productIds.map(prod => prod.productid) } });

        if (products.length > 0) {
            let totalAmount = 0;
            let totalTax = 0;
            let totalDiscount = 0;
            const items = [];
            const validationErrors = [];

            // Loop through each product
            products.forEach((product, index) => {
                const productId = product._id;
                const quantity = productIds[index]?.quantity;
                const selectedSizeName = productIds[index]?.size;
                const selectedColorName = productIds[index]?.color;
                const taxRate = product.tax_rate || 0;
                const price = product.price || 0;
                const discount = product.discount || 0;

           
                const selectedSize = product.sizes.find(size => size.size === selectedSizeName && size.stock > 0);
                const selectedColor = product.colors.find(color => color.colorName === selectedColorName && color.stock > 0);

                const validationErrors = [];

                if (!selectedSize) {
                    validationErrors.push(`Size ${selectedSizeName} not available or out of stock for product ${product.name}`);
                }
                
                if (!selectedColor) {
                    validationErrors.push(`Color ${selectedColorName} not available or out of stock for product ${product.name}`);
                }
                
                if (validationErrors.length > 0) {
                    console.log('Validation Errors:', validationErrors);
                } else {
                    console.log('Selected Size and Color are available and in stock.');
                }

                if (selectedSize && selectedColor) {
                    const subtotal = price * quantity;
                    const taxAmount = price * taxRate * quantity / 100;
                    const discountAmount = price * discount / 100;

                    totalAmount += subtotal + taxAmount;
                    totalTax += taxAmount;
                    totalDiscount += discountAmount;

                    items.push({
                        product: productId,
                        quantity: quantity,
                        tax_rate: taxRate,
                        size: selectedSizeName,
                        color: selectedColorName,
                        price: price,
                        discount: discount
                    });
                }
            });

            // Create and save the cart
            const cart = await CartModel.create({
                user_id: req.session.userId,
                date: moment(Date.now()).format('YYYY-MM-DD'),
                items: items,
                tax_amount: totalTax,
                amount: totalAmount,
                total: totalAmount - totalDiscount,
                discount_amount: totalDiscount
            });

            return res.status(200).send({ message: 'Cart added successfully!', success: true, cart });
        } else {
            // Respond with error message if products not found
            return res.status(404).send({ message: 'Products not found!', success: false });
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error("Error creating cart:", error);
        return res.status(500).json({ message: "Error creating cart.", success: false });
    }
};

exports.findProducts = async (req, res) => {
    try {
   
        const products = await ProductModel.find();


        return res.status(200).json({ products, success: true });

    } catch (error) {
        // Log the error
        console.error("Error in findProducts:", error);
        
        return res.status(500).json({ message: "Error finding products.", success: false });
    }
}



exports.findOneCart = async (req, res) => {
    try {
     
        if (!req.params.userid) {
            return res.status(400).json({ message: "User ID is required", success: false });
        }

    
        const cartFind = await CartModel.findOne({ user_id: req?.params?.userid });

        // Check if cart exists
        if (!cartFind) {
            return res.status(404).json({ message: "Cart not found", success: false });
        }

      
        return res.status(200).json({ cart: cartFind, success: true });

    } catch (error) {
       
        console.error("Error in findOneCart:", error);
        
   
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

exports.deleteCarts = async(req,res)=>{

    const cart  = await CartModel.deleteMany();
   return  res.status(200).send({message:'carts deleted succesfully!',success:true,cart})
}


exports.deleteProduct = async(req,res)=>{

    const cart  = await ProductModel.deleteMany();
   return  res.status(200).send({message:'products deleted succesfully!',success:true ,cart})
}








exports.removeItemAndUpdateTotals = async (req, res) => {
    try {
        const itemId = req.params.itemId;

        // Find the cart containing the item
        const cart = await CartModel.findOne({ "items._id": itemId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found", success: false });
        }

        // Find the index of the item to remove
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item not found in cart", success: false });
        }

        // Calculate totals for the removed item
        const removedItem = cart.items[itemIndex];
        const cal1 = removedItem.price * removedItem.tax_rate / 100;
        const cal2 = removedItem.price * removedItem.discount / 100;
console.log(cal1 , "tax")
console.log(cal2 , "discount")
console.log(removedItem.price , "price")
console.log( cal1 + cal2 + removedItem.price)
const temp=  removedItem.price - cal2

        cart.tax_amount -= cal1;
        cart.discount_amount -= cal2;
        cart.amount -= (removedItem.price + cal1);
        cart.total -= (cal1 + temp);

        // Remove the item from the items array
        cart.items.splice(itemIndex, 1);

        // Update the cart document
        await cart.save();

        res.status(200).json({ message: 'Item deleted successfully!', success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
