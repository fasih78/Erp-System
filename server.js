const express = require ('express');
const app = express();
require('dotenv').config()

const connectdb = require('./db')
        
app.listen(process.env.PORT,()=>{

    console.log("Server is running on port: " + process.env.PORT);
})
 // Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // You can add additional error handling or graceful shutdown logic here
  });
  
  process.on("SIGINT", () => {
    console.log("Shutting down gracefully...");
    server.close(() => {
      console.log("Server has closed.");
      process.exit(0);
    });
  });

  connectdb();
  module.exports;
