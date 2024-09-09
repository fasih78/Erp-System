const express = require('express');
const app = express(); 
const bodyParser = require("body-parser");
const User_Auth = require('./src/Modules/User_Auth/User.Route')
const morgan = require("morgan");
const cors = require("cors");
const session = require('express-session')
const rateLimitMiddleware = require('./Middlewares/http-request-limit')
const passport = require("passport");
const googleroutes = require('./src/Modules/Google_Auth/google.Route')
const departmentroutes =require('../Erp-System/src/Modules/HR/departments/department.Route')
const employeeroutes = require('../Erp-System/src/Modules/HR/employees/employee.Route')
const productroutes= require('../Erp-System/src/Modules/stripe/product/product.Route')
const orderroutes = require ('../Erp-System/src/Modules/stripe/order-placement/order.Route.js')
const taskroutes = require ('../Erp-System/Task/taskroutes.js');
const upload = require('./Middlewares/multer.js');
const event = require ('../Erp-System/src/Modules/Event-emitter/EventRoutes.js')

require('dotenv').config()



app.use(session({
    secret: process.env.SECRET_KEY, 
    resave: false,
    saveUninitialized: true
  }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimitMiddleware)
app.use(upload.single("file"));




app.use('/user',User_Auth)
app.use('/',googleroutes)
app.use('/department',departmentroutes)
app.use('/employee',employeeroutes)
app.use('/product',productroutes)
app.use('/order',orderroutes)
app.use('/task',taskroutes)
app.use('/event',event)

/////////////////////////// check server  server status is down or up  ///////////////////////////
function checkExternalServiceStatus() {
  
  return Math.random() < 0.8; // Simulate 80% availability
}
app.get('/status', (req, res) => {
  // Check the status of external service(s)
  const isServiceUp = checkExternalServiceStatus();

  if (isServiceUp) {
    res.json({ status: 'up' });
  } else {
    res.json({ status: 'down' });
  }
});






///////////////////////////  server status is down or up ///////////////////////////


module.exports = app;