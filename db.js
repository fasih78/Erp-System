const mongoose = require ('mongoose');
require('dotenv').config
const config = require ('./config/config.json')
//const environment = 'production';
 const environment = 'development';
const dbCredentials = config[environment];
  const connectdb = () => {
    (async () => {
      try {
        const { default: chalk } = await import('chalk');
        
        // Example usage of chalk
      
        
        console.log(chalk.bgYellowBright(`Server is running on ${environment} environment`));
      } catch (error) {
        console.error('Error importing chalk:', error);
      }
    })();
 
    mongoose.set("strictQuery", false);
    mongoose.set("debug", true);
    if (environment == 'development') { 
    mongoose
      .connect("mongodb+srv://" + dbCredentials.user + ":" + dbCredentials.password + dbCredentials.host + dbCredentials.database + "?retryWrites=true&w=majority", {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      })
      .then((res) => {
        console.log("Database Connected on port ", mongoose.connection.port);
      })
      .catch((err) => {
        console.log(err);
      });
    }else{
      mongoose
      .connect("mongodb+srv://" + dbCredentials.user + ":" + dbCredentials.password + dbCredentials.host + dbCredentials.database + "?retryWrites=true&w=majority", {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      })
      .then((res) => {
        console.log("Database Connected on port ", mongoose.connection.port);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  };

  module.exports = connectdb;
