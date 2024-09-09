const express = require('express')
const router = express.Router();

const taskservice = require('./taskservice.js');
const upload = require('../Middlewares/multer');
// const { notifyUser } = require('./taskservice.js')


router.post('/create', async (req, res) => {

    const result = await taskservice.taskCreate(req, res)
    return result

})


router.get('/getone/:id', async (req, res) => {

    const result = await taskservice.taskseen(req, res)

    return result

})

router.post('/complete', async (req, res) => {
    console.log(req.body)
    const result = await taskservice.taskcomplete(req, res)
    return result

})
router.post('/notify-user', async (req, res) => {
   
        console.log(req.body);

        await taskservice.notifyUser(req, res);
   
});
router.delete('/deleteone/:task_id',async(req,res)=>{

    const result = await taskservice.deleteone(req,res);
    return result
})

module.exports = router