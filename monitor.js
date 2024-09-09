// monitor.js
const cron = require('node-cron');
const axios = require('axios');

const SERVER_URL = 'http://localhost:2000/status'; // Replace with your server's URL
const INTERVAL_MS = 10000; // Interval in milliseconds (e.g., check every 5 seconds)


function fetchServerStatus() {
    
  axios.get(SERVER_URL)
    .then(response => {
      const serverStatus = response.data.status;
      console.log(`Server Status: ${serverStatus}`);
      
    })
    .catch(error => {
      console.error('Error fetching server status:', error.message);
    });
}




// Emit the event every 5 minutes

function fetchnotifyuser(){
  axios.post('http://localhost:2000/task/notify-user')
  .then(response => {
    const serverStatus = response.data.status;
    console.log(`Server Status: ${serverStatus}`);
    
  })
  .catch(error => {
    console.error('Error fetching server status:', error.message);
  });
}
cron.schedule('0 17 * * *', () => {
  console.log('Running the scheduled API call...');
  fetchnotifyuser();
});


 setInterval(fetchServerStatus, INTERVAL_MS)


module.exports = fetchServerStatus;
