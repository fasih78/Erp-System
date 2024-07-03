const express = require('express');
const EmployeeModel = require('./employee.Model')
const moment = require('moment');
const { default: mongoose } = require('mongoose');

exports.createEmployee = async(req,res)=>{

try {
    
    const lastEmployee = await EmployeeModel.findOne().sort({ _id: -1 }).exec();
    const id = lastEmployee ? lastEmployee.id + 1 : 1;

    const employee= await EmployeeModel.create({

        id:id,
        empid:req?.body?.empid,
        name:req?.body?.name,
        email:req?.body?.email,
        gender:req?.body?.gender,
        dateofbirth:moment(req?.body?.dateofbirth).format('YYYY-MM-DD'),
        phonenumber:req?.body?.phonenumber,
        department:req?.body?.department,
        JoiningDate:moment(req?.body?.JoiningDate).format('YYYY-MM-DD'),    
        cnic_no:req?.body?.cnic_no,
        country:req?.body?.country,
        city:req?.body?.city,
        state:req?.body?.state,
        Job_post:req?.body?.jobpost,
    })
    await employee.save();
    return res.status(201).send({ message: "Employee created successfully!", success: true });

} catch (error) {
    
    return res.status(500).send({ message: err.message, success: false });
}

}

exports.employeeFind = async(req,res)=>{
try {
    
const employee= await EmployeeModel.aggregate([

{
    $lookup:{
        from:'departments',
        localField:"department",
        foreignField:"_id",
        as:'department'
        
    }
}
])
return res.status(200).send({data:employee , success:true})
} catch (error) {
    
    return res.status(500).send({ message: err.message, success: false });
}

}

exports.employeeFindOne= async(req,res)=>{

try {
    
const employee = await EmployeeModel.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.params.id),
            isDeleted:false
        }
    },
    {
        $lookup:{
            from:'departments',
            localField:"department",
            foreignField:"_id",
            as:'department'
            
        }
    }


]) 
return res.status(200).send({data:employee , success:true})
} catch (err) {
    
    return res.status(500).send({ message: err.message, success: false });
}

}

exports.employeeDelete= async(req,res)=>{
    try {
        const empdelete = await EmployeeModel.updateOne({_id:req.params.id},{
            $set:{
                isDeleted:true
            }
        })
        if (!empdelete) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.status(200).send({message:"employee deleted successfully!" , success:true})
    } catch (error) {
            
    return res.status(500).send({ message: err.message, success: false });
    }
}
exports.employeeupdate = async(req,res)=>{

try {
    const lastEmployee = await EmployeeModel.findOne().sort({ _id: -1 }).exec();
    const id = lastEmployee ? lastEmployee.id + 1 : 1

    const updateResult = await EmployeeModel.updateOne({_id:req.params.id},{
        $set:{
 id:id,
        empid:req?.body?.empid,
        name:req?.body?.name,
        email:req?.body?.email,
        gender:req?.body?.gender,
        dateofbirth:moment(req?.body?.dateofbirth).format('YYYY-MM-DD'),
        phonenumber:req?.body?.phonenumber,
        department:req?.body?.department,
        JoiningDate:moment(req?.body?.JoiningDate).format('YYYY-MM-DD'),    
        cnic_no:req?.body?.cnic_no,
        country:req?.body?.country,
        city:req?.body?.city,
        state:req?.body?.state
        }
    })
    if (updateResult.acknowledged > 0) {
        return res.status(200).json({ message: "Employee updated successfully!", success: true });
      }  else {
        return res.status(200).json({ message: "No changes were made.", success: true });
      }

} catch (error) {
    console.error("Error updating personal info:", error);
    return res.status(500).send({ message: err.message, success: false });

}





}