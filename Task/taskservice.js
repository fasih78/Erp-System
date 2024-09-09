
const { default: mongoose, Mongoose } = require('mongoose');
const UserModel = require('../src/Modules/User_Auth/User.Model');
const nodemailer = require('nodemailer');
const moment = require('moment')
const momentTime = require('moment-timezone')
const cloudinary = require("cloudinary").v2;
const upload = require('../../Erp-System/Middlewares/multer')
const config = require('../config/config')
const { TaskCompleteModel, TaskModel } = require('./taskmodel')
require('dotenv').config();



const cloudinaryConfig = config.cloudinary;

cloudinary.config({
    cloud_name: cloudinaryConfig.AUTH_CLOUD_NAME,
    api_key: cloudinaryConfig.AUTH_API_KEY,
    api_secret: cloudinaryConfig.AUTH_API_SECRET,
    secure: true,
});


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});





exports.taskCreate = async (req, res) => {
    try {
        const { task_id, title, description, status, priority, due_date, assigned_to } = req.body
        const lastid = await TaskModel.findOne().sort({ _id: -1 }).exec()
        const id = lastid ? lastid.id + 1 : 1

        const userfind = await UserModel.findOne({ _id: assigned_to });



        const payload = await TaskModel.create({
            id: id,
            task_id: task_id,
            title: title,
            task_date: momentTime().tz("Asia/Karachi").format("YYYY-MM-DD HH:mm:ss"),
            description: description,
            status: status,
            priority: priority,
            due_date: new Date(due_date),
            assign_time: momentTime().tz("Asia/Karachi").format("HH:mm:ss"),
            assigned_to: [
                {
                    user_id: new mongoose.Types.ObjectId(assigned_to), // Example ObjectId
                    user_name: userfind.username,
                    email: userfind.email
                },

            ],
            assigned_from:[
                {
                    user_id: new mongoose.Types.ObjectId(req.session.user_id), // Example ObjectId
                    user_name: req.session.user_name,

                }
            ]

        })
        await payload.save()

        return res.status(201).send({ message: 'Task Saved Successfully!', success: true })



    } catch (error) {
        if (error.code === 11000) {
            console.error('Error: Duplicate key, this value must be unique.');
            return res.status(400).json({ message: "Error: Duplicate key, this task_id value must be unique.", success: false });
        } else {
              console.log(error);
              return res.status(500).json({ message: "Error creating task.",error:error, success: false });
   
          }
        // console.error("Error creating product:", error);
    }
}

exports.taskseen = async (req, res) => {
    try {

        const taskId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).send({ message: 'Invalid Task ID', success: false });
        }

        const task = await TaskModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(taskId) },
            { $set: { seen: true, status: ' In progress' } },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).send({ message: 'Task not found', success: false });
        }


        return res.status(200).send({ data: task, success: true });

    } catch (error) {

        console.error('Error updating task:', error);


        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};
exports.taskcomplete = async (req, res) => {
    try {

        const uploads = upload.single('file');

        const { task_id, user_id } = req.body;

        const lastIdEntry = await TaskCompleteModel.findOne().sort({ _id: -1 }).exec();
        const newId = lastIdEntry ? lastIdEntry.id + 1 : 1;


        const task = await TaskModel.findOne({ _id: task_id });
        const tasks = await TaskCompleteModel.findOne({task_id:task_id, user_id:user_id})


        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const submitDate = new Date();
        const dueDate = new Date(task.due_date);

        if (submitDate > dueDate) {
            return res.status(400).send({ message: "Task submission date has expired!" });
        }


        if (tasks) {

            return res.status(400).json({ message: 'You have already submitted this task.' });
        }


        uploads(req, res, async (err) => {
            if (!err) {
                console.error('Upload error:', err);
                return res.status(500).json({ message: 'Error uploading file. Only supported files are allowed.', success: false });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Please upload a file!' });
            }

            try {

                const result = await cloudinary.uploader.upload(req.file.path, { folder: 'faseh', resource_type: 'raw' });
                const cloudinaryUrl = result.secure_url;

                const publicIdRegex = /\/v\d+\/([^/]+\/[^.]+)(?:\.\w+)?$/;
                const matches = cloudinaryUrl.match(publicIdRegex);
                if (!matches || !matches[1]) {
                    console.error('Public ID not found in the URL.');
                    return res.status(500).json({ message: 'Error extracting public ID from the image URL.', success: false });
                }
                const publicId = matches[1];




                const taskComplete = await TaskCompleteModel.create({
                    id: newId,
                    task_id: task_id,
                    user_id: user_id,
                    cloudinary_url: cloudinaryUrl,
                    file_public_id: publicId,
                    file_path: req.file.path,
                    submit_date: moment().format('YYYY-MM-DD'),

                });

                await TaskModel.updateOne(
                    { _id: task_id },
                    {
                        $set: {
                            submit: true,
                            status: 'completed',
                            submit_date: moment().utc().format('YYYY-MM-DD'),

                        },
                    },
                    { new: true, runValidators: true }
                );
                await taskComplete.save()

                return res.status(200).json({ message: 'Task completed successfully.', success: true });
            } catch (uploadError) {
                console.error('Error processing file:', uploadError);
                return res.status(500).json({ message: 'Internal server error.', success: false });
            }
        });
    } catch (error) {
        console.error('Error in taskcomplete function:', error);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};












exports.notifyUser = async (req, res) => {
   try{

    const tasks = await TaskModel.find({ submit: false });

    if (tasks.length === 0) {
        return res.status(400).send({
            message: 'No tasks are pending!'
        });
    }

    let expiredTasks = [];
    let validTasks = [];
    const submitDate = new Date();

    for (let i = 0; i < tasks.length; i++) {
        const dueDate = new Date(tasks[i].due_date);
        if (submitDate > dueDate) {
            expiredTasks.push(tasks[i]);
        } else {
            validTasks.push(tasks[i]);
        }
    }

    if (expiredTasks.length > 0 && validTasks.length > 0) {
       
        for (let i = 0; i < expiredTasks.length; i++) {
            setTimeout(async()=> {
        const email =    await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: expiredTasks[i].assigned_to[0].email,
                subject: `Task Expiration Notice`,
                text: `Hello ${expiredTasks[i].assigned_to[0].user_name},
    
    This is a notification that the task titled ${expiredTasks[i].title} assigned to you has expired. Please review the task details and take the necessary actions.
    
    If you have any questions or need further assistance, feel free to reach out.
    
    expire date: ${expiredTasks[i].due_date}
    
    Best regards,
    [Fascom Limited/Artastic Denim Mills]`
            });
        }, 10000);
        }

        for (let i = 0; i < validTasks.length; i++) {


            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: validTasks[i].assigned_to[0].email,
                subject: `Task Expiration Reminder - 1 Day Left`,
                text: `Hello ${validTasks[i].assigned_to[0].user_name},
    
    This is a reminder that the task titled ${validTasks[i].title} is set to expire in just 1 day. Please make sure to complete any remaining actions before the deadline.
    
    If you need assistance or have any questions, please don’t hesitate to contact us.
    
    expire date: ${validTasks[i].due_date}
    
    Thank you for your prompt attention to this matter.
    
    Best regards,
    [Fascom Limited/Artastic Denim Mills]`
});
}
return res.status(201).send({
    message: 'Some tasks are overdue, and some tasks are still valid.',
    expiredTasks: expiredTasks,
    validTasks: validTasks
});

    } 
    else if (expiredTasks.length > 0) {


        for (let i = 0; i < expiredTasks.length; i++) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: expiredTasks[i].assigned_to[0].email,
                subject: `Task Expiration Notice`,
                text: `Hello ${expiredTasks[i].assigned_to[0].user_name},
    
    This is a notification that the task titled ${expiredTasks[i].title} assigned to you has expired. Please review the task details and take the necessary actions.
    
    If you have any questions or need further assistance, feel free to reach out.
    
    expire date: ${expiredTasks[i].due_date}
    
    Best regards,
    [Fascom Limited/Artastic Denim Mills]`
            });
        }

        return res.status(200).send({
            message: 'Task submission date has expired!',
            expiredTasks: expiredTasks
        });
    } else if (validTasks.length > 0) {

        for (let i = 0; i < validTasks.length; i++) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: validTasks[i].assigned_to[0].email,
                subject: `Task Expiration Reminder - 1 Day Left`,
                text: `Hello ${validTasks[i].assigned_to[0].user_name},
    
    This is a reminder that the task titled ${validTasks[i].title} is set to expire in just 1 day. Please make sure to complete any remaining actions before the deadline.
    
    If you need assistance or have any questions, please don’t hesitate to contact us.
    
    expire date: ${validTasks[i].due_date}
    
    Thank you for your prompt attention to this matter.
    
    Best regards,
    [Fascom Limited/Artastic Denim Mills]`
            });
        }



        return res.status(200).send({
            message: 'Notifications sent successfully.',
            validTasks: validTasks
        });
    } else {
        return res.status(400).send({
            message: 'No tasks found!'
        });
    }
   }catch(err){
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error', success: false });
   }
};

exports.deleteone = async(req,res)=>{

try {
    const deleteone = await TaskModel.updateOne({_id:req.params.task_id},{
        $set:{
            isDeleted:true
        }
    })
    return res.status(200).send({message:'task deleted sucessfully!',data:deleteone, success:true})

} catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error', success: false });
}




}