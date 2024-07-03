const axios = require('axios');

exports.getClientIpAddress=async()=> {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        const ipAddress = response.data.ip;
   
        return ipAddress;
    } catch (error) {
        console.error('Error fetching client IP address:', error.message);
        return null;
    }
}


exports.getGeolocationData=async(ipAddress, apiKey)=> {
    try {
        console.log(apiKey , ipAddress);
        const ipinfoUrl = `https://apiip.net/api/check?ip=${ipAddress}&accessKey=${apiKey}`;
        const response = await axios.get(ipinfoUrl);
return response
    } catch (error) {
        console.error('Error fetching geolocation data:', error.message);
        return null;
    }
}
