const express = require ('express');
require('dotenv').config()
const PORT = process.env.PORT || 2000;
const app= require("./AppController");
const connectdb = require('./db')
 const fetchServerStatus = require('./monitor')

const server = 
(async () => {
  try {
    const { default: chalk } = await import('chalk');
    app.listen(PORT, () => {
      console.log(chalk.green(`\nServer is running on port: ${PORT}`));
    
     
    })
    
  } catch (error) {
    console.log(chalk.red.bold('Error: Server failed to start!'));
    console.error('Error importing chalk:', error);
  }
})();


// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
  (async () => {
    try {
      const { default: chalk } = await import('chalk');
    console.error("Unhandled Rejection at:",chalk.red.bold(promise), "reason:", chalk.red.bold(reason));
    // You can add additional error handling or graceful shutdown logic here
  } catch (error) {
    console.error('Error handling unhandled rejection:',chalk.red.bold(error));
  }
})();
});

// Graceful shutdown on SIGINT signal (Ctrl+C)
process.on("SIGINT", () => {
  console.log("\nShutting down gracefully...");
  server.close(() => {
    console.log("Server has closed.");
    process.exit(0);
  });
});

fetchServerStatus()

  connectdb();
  module.exports;
