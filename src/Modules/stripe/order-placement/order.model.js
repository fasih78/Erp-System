const mongoose = require('mongoose');




const orderSchema = new mongoose.Schema({
    order_id: { type: String },
    order_date: { type: Date },
    cus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     shipping_info: {type:Array} ,  //     ship_id: { type: String },
    payment_method:{type:String},
    card_no:{type:String},
    shipping_method: { type: String },
    shipping_cost: { type: Number },
    order_items: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' }, // Assuming Cart model
    // product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    total: { type: Number },
    ipAddress:{type:String}
});

const OrderModel  =  mongoose.model('ORDER',orderSchema);
module.exports=OrderModel