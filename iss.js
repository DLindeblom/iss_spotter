const request = require("request");


/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) {
      return callback(error);
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);

  });
};


const fetchCoordsByIP = function(ip, callback) {
  request(`https://api.ipbase.com/v2/info?apikey=JqTmJv9NdJXNJ4VbvrJ0pIZCRuDY5Kqi8xExnYWu&language=en&ip=${ip}`, (error, response, body) => {

    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const coords = {
      latitude: JSON.parse(body).data.location.latitude,
      longitude: JSON.parse(body).data.location.longitude
    };

    callback(null, coords);

  });

};

/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coords, callback) {
  request(`https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {

    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const passes = JSON.parse(body).response;
    callback(null, passes);

  });
};

const nextISSTimesForMyLocation = function(callback) {

  fetchMyIP((error, ip) => {
    if (error) {
      callback(error);
      return;
    }

    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        callback(error);
        return;
      }

      fetchISSFlyOverTimes(coords, (error, nextPasses) => {
        if (error) {
          callback(error);
          return;
        }

        callback(null, nextPasses);

      });
    });
  });
};


// module.exports = { fetchMyIP };
// module.exports = { fetchCoordsByIP };
// module.exports = { fetchISSFlyOverTimes };
module.exports = { nextISSTimesForMyLocation }; 