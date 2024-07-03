const DepartmentModel = require('./department.model');





exports.createDepartment = async (req, res) => {
  try {
    const lastDepartment = await DepartmentModel.findOne().sort({ _id: -1 }).exec();
    const id = lastDepartment ? lastDepartment.id + 1 : 1;

    const department = await DepartmentModel.create({
      id: id,
      name: req?.body?.name
    });
await department.save();
    return res.status(201).send({ message: "Department created successfully!", success: true });
  } catch (err) {
  
    return res.status(500).send({ message: err.message, success: false });
  }
};


 exports.deleteDepartment = async(req,res)=>{

    try {
    
const departmentDelete  = await DepartmentModel.deleteOne({_id:req.params.id})

return res.status(200).send({message:"Department deleted successfully!" ,success:true})
} catch (err) {
    return res.status(500).send({message:err,success:false})

}

 }
exports.departmentFind = async(req,res)=>{


    try {
        const department =await DepartmentModel.find();
        return res.status(200).send({department:department,success:true})
    } catch (error) {
        return res.status(500).send({message:err,success:false})
    }
}


exports.departmentFindOne =async(req,res)=>{

    try {
        const department =await DepartmentModel.findOne({_id:req.params.id});
        return res.status(200).send({data:department,success:true})
    } catch (error) {
        return res.status(500).send({message:err,success:false})
    }
}
exports.departmentUpdate =async(req,res)=>{
 try {
    
    const {name}=req.body

    const department = await DepartmentModel.updateOne({_id:req.params.id},{
        $set:{
            name:name
        }
    })
    return res.status(200).send({message:"department updated successfully!",success:true})
 } catch (error) {
    return res.status(500).send({message:err,success:false})

 }


}
