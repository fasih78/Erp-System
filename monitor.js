// monitor.js

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

// Periodically fetch server status
setInterval(fetchServerStatus, INTERVAL_MS);

// Export the fetchServerStatus function
module.exports = fetchServerStatus;
