const express = require ('express');
const mongoose = require ('mongoose');


const UserSchema = new mongoose.Schema({

id:{type:Number,default:0},
username:{type:String, required:true},
email:{type:String,required:true},
password:{type:String,required:true},
gender:{type:String},
address:{type:String},
phonenumber:{type: String,},
city:{type:String,required:true},
state:{type:String,required:true},
country:{type:String,required:true}


},{ timestamps: true })

const UserModel = mongoose.model('Users',UserSchema);
module.exports = UserModel