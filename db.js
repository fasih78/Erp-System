const mongoose = require ('mongoose');
require('dotenv').config


const connectdb = () => {
  mongoose.set("strictQuery", false);
  mongoose.set("debug", true);
  mongoose
    .connect(process.env.DB_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })
    .then((res) => {
      console.log("Database Connected on port ", mongoose.connection.port);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectdb;
