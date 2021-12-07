/*
    Author(s): Erik Plachta
    Date: 12/07/2021
    Purpose: Script for website
*/


// https://home.openweathermap.org/api_keys
const apiKey ="d5291050dfed6abda18c09f0e663326d";



/*----------------------------------------------------------------------------*/
//-- RUNNING PROGRAM

function run(){
    
    //-- TESTING

    let cityName = 'Charlotte';
    let forecast = _get_City(cityName);
    console.log("Testing: ",forecast);
    
    

};

/*----------------------------------------------------------------------------*/
//-- GETTING DATA

function _get_City(cityName) {
    //-- Access the open weather map API by city name
    
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    fetch('http://api.openweathermap.org/data/2.5/forecast?q='+cityName+'&appid='+apiKey+'&cnt=5',
            { method: 'GET'}
    ).then(function(response) {
        return response.json();
    }).then(function(json){

    });
        
        
        // // request was successful
        //     if (response.ok) {
        //         response.json().then(function(data) {
        //         console.log(data);
        //         forecast = response;
        //         });
        //     } 
        //     // general error
        //     else {
        //         console.log('ERROR: '+response.status+', Data Not Found for',cityName,'.');
        //         // results = 'ERROR:',response.status,'. Data Not Found for ',cityName,'.';
        //         forecast = response;
        //     }
        // })
        // // try catch error
        // .catch(function(error) {
        //     console.log('ERROR: '+response.status,error)
        //     // forecast = 'ERROR: '+response.status,error;
        // });
};


/*----------------------------------------------------------------------------*/
//-- BUILD RESULTS

function _set_Results(response){
    //-- Get's results from _get_City(cityName), builds content

    //
}



/*----------------------------------------------------------------------------*/
//-- DATABASE MANAGEMENT



/*----------------------------------------------------------------------------*/
//-- RUNNING 

run();