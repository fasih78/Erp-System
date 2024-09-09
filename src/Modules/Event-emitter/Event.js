const  EventEmitter = require ('events');


const emailEmitter = new EventEmitter();


// Listener for a successful user registration
// myEmitter.on('email-sending', (user) => {
//     console.log(`User registered successfully: ${user.name}`);
//   });
  
//   // Listener for registration errors
//   myEmitter.on('registrationError', (error) => {
//     console.error(`Registration failed: ${error.message}`);
//   });
  
//   function registerUser(name, email) {
//     // Simulate a registration process
//     if (name && email) {
//       const user = { name, email };
//       myEmitter.emit('userRegistered', user); // Emit the success event
//     } else {
//       const error = new Error('Invalid user data');
//       myEmitter.emit('registrationError', error); // Emit the error event
//     }
//   }





// exports.event = async(req,res)=>{

//     try {
        
//         registerUser(null, 'john@example.com');

//         // Attempt to register a user with missing data
        
//         // return  res.status(200).send({data:run})
//     } catch (error) {
//         registerUser(null, 'no-name@example.com');
//         res.status(500).json({ error: error.message });
//     }
//     }
module.exports = emailEmitter