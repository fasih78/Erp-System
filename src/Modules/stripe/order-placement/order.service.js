const express = require ('express')
require('dotenv').config();
const moment = require('moment');
const { isEmpty } = require('validator');
const { CartModel } = require('../product/product.model');
const OrderModel = require('./order.model');
const {ProductModel} = require('../product/product.model');
const UserModel = require('../../User_Auth/User.Model');
const { exchangeRates }= require('exchange-rates-api');
const axios = require ('axios');
const { callbackPromise } = require('nodemailer/lib/shared');
const stripe = require("stripe")(process.env.STRIPE_SCEREAT_KEY);
const {getGeolocationData} = require('../../../../location-func/ip-loc')
const {getClientIpAddress} = require('../../../../location-func/ip-loc')




exports.orderPlace = async (req, res) => {
    try {
        const { order_id, order_date, cus_id, shipping_info, shipping_method, shipping_cost, order_items, payment_method, card_no } = req.body;

        // Fetch cart items
        const carts = await CartModel.find({ _id: { $in: order_items } });
        let totalamount = 0;
        carts.forEach(cart => {
            totalamount += cart.total;
        });

        // Format shipping information
        const formattedShippingInfo = shipping_info.map(shipping => ({
            ship_id: shipping.ship_id,
            recipient_name: shipping.recipient_name,
            address: shipping.address,
            city: shipping.city,
            state: shipping.state,
            country: shipping.country,
            postal_code: shipping.postal_code,
            contact_number: shipping.contact_number,
        }));

        const customerInfo = await UserModel.findOne({ _id: cus_id });

        // Create Stripe customer
        const stripeCustomer = await stripe.customers.create({
            description: "Customer for orders",
            name: customerInfo.username,
            email: customerInfo.email,
            phone: customerInfo.phonenumber,
            address: {
                line1: customerInfo.address,
                city: customerInfo.city,
                state: customerInfo.state,
                country: customerInfo.country,
            },
        });
        const stripePaymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                token: 'tok_visa', // Example test token for a Visa card
            },
        });
        const exchangeRateApiUrl = `https://api.exchangerate-api.com/v4/latest/USD`; 
        const response = await axios.get(exchangeRateApiUrl);
        const exchangeRates = response.data.rates;
        // Check if PKR is available in rates
        if (!exchangeRates.hasOwnProperty('PKR')) {
            throw new Error('Exchange rate for PKR not available.');
        }

        const exchangeRate = exchangeRates.PKR;


        // Convert total amount from PKR to USD
        const amountInUSD = totalamount / exchangeRate;
        const stripeChargeAmount = Math.ceil(amountInUSD * 100);

        
        if (isNaN(amountInUSD) || amountInUSD <= 0) {
            throw new Error('Invalid amount after conversion.');
        }
        
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeChargeAmount,
            currency: 'usd',
            payment_method: stripePaymentMethod.id,
            description: `Order ID: ${order_id}`,
            customer: stripeCustomer.id,
        });

        const responses = await axios.get('https://api.ipify.org?format=json');
        const ipAddress = responses.data.ip;
        const apiKey = process.env.apiKey; 
        
        getGeolocationData(ipAddress,apiKey)
      
        // Create order in database
        const order = await OrderModel.create({
            order_id: order_id,
            order_date: moment(order_date).format('YYYY-MM-DD'),
            cus_id: cus_id,
            shipping_info: formattedShippingInfo,
            shipping_method: shipping_method,
            shipping_cost: shipping_cost,
            order_items: order_items,
            // ipAddress:ipAddress,
            total: totalamount
        });

        // Update product stock and confirm cart items
        for (let i = 0; i < carts.length; i++) {
            const cartItems = carts[i].items;
            const productIds = cartItems.map(item => item.product.toString());

            const products = await ProductModel.find({ _id: { $in: productIds } });

            for (let j = 0; j < products.length; j++) {
                const product = products[j];
                const colors = product.colors;
                const sizes = product.sizes;

                for (let k = 0; k < cartItems.length; k++) {
                    const cartItem = cartItems[k];
                    const { color, size } = cartItem;

                    const colorIndex = colors.findIndex(c => c.colorName === color);
                    const sizeIndex = sizes.findIndex(s => s.size === size);

                    if (colorIndex !== -1 && sizeIndex !== -1) {
                        const updatedTotalStockItems = product.stock_items - 1;
                        const update = {
                            $set: {
                                [`colors.${colorIndex}.stock`]: product.colors[colorIndex].stock - 1,
                                [`sizes.${sizeIndex}.stock`]: product.sizes[sizeIndex].stock - 1,
                                stock_items: updatedTotalStockItems
                            }
                        };

                        const updatedProduct = await ProductModel.findOneAndUpdate(
                            { _id: product._id },
                            update,
                            { new: true }
                        );
                    }
                }
            }
        }

        // Confirm cart items
        const orderupdate = await CartModel.updateOne({ _id: order_items },
            { $set: { order_confirm: true } }
        );

        // Confirm payment intent
        const paymentIntentConfirmation = await stripe.paymentIntents.confirm(
            paymentIntent.id,
            { return_url: 'https://example.com/payment_success' }
        );
       


        res.status(201).json({ message: 'Order placed successfully!', success: true, order ,paymentIntentConfirmation });
    } catch (error) {
        // Handle errors
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order.", error: error.message });
    }
};


exports.orderDelete = async(req,res)=>{


    const deleteall = await OrderModel.deleteMany();
    
    return res.status(200).send({message:'order deleted successfully!',success:true ,deleteall})
}



exports.orderRefund = async(req,res)=>{
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(req?.params?.paymentIntentId);
        const refund = await stripe.refunds.create({
          payment_intent: req?.params?.paymentIntentId,
          amount: paymentIntent.amount 
        });
        return res.status(200).send({message:`Refund Sucessfully! : ${refund}`,success:true })
        return refund;
      } catch (error) {
        console.error("Error creating refund:", error);
        res.status(500).json({ error: error.message });
        throw error;
      }

}


