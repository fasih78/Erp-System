const mongoose = require('mongoose');


const sizeSchema = new mongoose.Schema({
    size: { type: String,  },
    stock: { type: Number,  }
  });
  const colorSchema = new mongoose.Schema   ({
    colorName: { type: String,  },
    stock: { type: Number,  }
  });



const productSchema = new mongoose.Schema({
    id: { type: Number, default: 0 },
    sku_no: { type: String, default: null },
    name: { type: String },
    description:{type:String},
    price: { type: Number, default: 0 },
    stock_items: { type: Number },
    tax_rate: { type: Number },
    discount: { type: Number },
    cloudinary_url: {type:String},
    filePath: {type:String},
    image_public_id:{type:String},
    colors:{type:Array} , 
    sizes:{type: Array}
    
},{timestamps:true});

const cartSchema = new mongoose.Schema({
    user_id: { type:  mongoose.Schema.Types.ObjectId, ref: 'User' },
    date:{type:Date},
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number },
        tax_rate: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        size:{type:String},
        color:{type:String},
        price: { type: Number, default: 0 }
    }],
    tax_amount:{ type: Number, default: 0 },
    order_confirm:{type:Boolean,default:false},
    amount:{type:Number,default:0},
    total: { type: Number, default: 0 },
    discount_amount:{type:Number,default:0}
},{timestamps:true});




const ProductModel = mongoose.model('Product', productSchema);
const CartModel = mongoose.model('Cart', cartSchema);

module.exports = {
    ProductModel: ProductModel,
    CartModel: CartModel
};

