const { Long } = require('mongodb');
const mongoose = require('mongoose');
const DepartmentModel = require('../departments/department.model');


const employeeSchema=new mongoose.Schema({
    id:{type:Number,default:0},
    empid:{type:Number,default:null},
    name:{type:String,required:true},
    email:{type:String,required:true},
    Job_post:{type:String,default:null},
    gender:{type:String},
    dateofbirth:{type:Date,default:null},
    phonenumber:{type:String},
    department: { type: mongoose.Schema.ObjectId,ref:DepartmentModel },
    JoiningDate:{type:Date,default:null},
    cnic_no:{type:String ,default:null,required:true},
    country:{type:String},
    city:{type:String},
    isDeleted:{type:Boolean,default:false},
    state:{type:String}
},{ timestamps: true })
const EmployeeModel = mongoose.model('EMPLOYEE',employeeSchema);

module.exports = EmployeeModel