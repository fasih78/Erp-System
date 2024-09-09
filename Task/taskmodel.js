
const mongoose = require ('mongoose');


const taskSchema = new mongoose.Schema({
id:{type:Number,default:0},
task_id:{type:Number,  default:0 , unique:true},
title:{type:String},
task_date:{type:String},
description:{type:String},
status:{type:String,default:'pending'},
priority:{type:String},
due_date:{type:Date},
seen:{type:Boolean, default:false},
submit_date:{type:Date, default:null},
assigned_from:[{
  user_name:{type:String},
  user_id:{type:mongoose.Schema.Types.ObjectId , ref:'User'},
}],
assigned_to:[{
    user_id:{type:mongoose.Schema.Types.ObjectId , ref:'User'},
    user_name:{type:String},
    email:{type:String}
}],
isDeleted:{type:Boolean,default:false},
submit:{type:Boolean,default:false},
recurrence_pattern:{type:String,default:null},
 assign_time:{type:String },
 
 expire:{type:Boolean,default:false}


},{ timestamps: true })


const taskcompleteSchema = new mongoose.Schema({
id:{type:Number, default:0},
cloudinary_url:{type:String},
submit_date:{type:Date},
isDeleted:{type:Boolean,default:false},
file_public_id:{type:String},
file_path:{type:String},

task_id:{type:mongoose.Schema.Types.ObjectId,ref:'Task'},
user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User'}

})



const TaskModel = mongoose.model('TaskManager',taskSchema)
const TaskCompleteModel = mongoose.model('CompleteTask', taskcompleteSchema)

module.exports={
    TaskModel:TaskModel,
  TaskCompleteModel:  TaskCompleteModel
}