/*
    Author(s): Erik Plachta
    Date: 12/07/2021
    Purpose: Script for website
*/


// https://home.openweathermap.org/api_keys
const apiKey ="d5291050dfed6abda18c09f0e663326d";


// api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}

/*----------------------------------------------------------------------------*/
//-- GETTING DATA

function _get_City(cityName) {
    let forecast = fetch('http://api.openweathermap.org/data/2.5/forecast?q='+cityName+'&appid='+apiKey+'&cnt=5')
                    .then(function(response) {
                     // request was successful
                        if (response.ok) {
                            response.json().then(function(data) {
                            console.log(data);
                            });
                        } 
                        // general error
                        else {
                            consoel.log('Error: Data Not Found');
                        }
                    })
                    // try catch error
                    .catch(function(error) {
                        console.log("Unable to connect to URL")
                    });
    return forecast;
};



/*----------------------------------------------------------------------------*/
//-- DATABASE MANAGEMENT



/*----------------------------------------------------------------------------*/
//-- TESTING

let cityName = 'Charlotte';
console.log(_get_City(cityName));