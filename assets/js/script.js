
/*
    Author(s): Erik Plachta
    Date: 12/07/2021
    Purpose: Script for website
*/


/*----------------------------------------------------------------------------*/
//-- DATABASE MANAGEMENT

//--    Custom JS for Purrfect Friend
//--    Author(s): Erik Plachta, 
//--    Date_Created: 12/07/2021 


/* -------------------------------------------------------------------------- */
//-- GLOBALS -> START


// For local storage DB
var database_Name = "weather";

// Total Hours in Day
var hours_Day = 24;

// Moment JS date
const today = function() {return moment().format("dddd, MMMM Do YYYY")};

// hour in 24 hour format - hour | minute | second | miliseconds | am-pm
const time_24 = function() { return moment().format("HH:mm:ss:ms a")};

// hour in 12 hour format - hour | minute | second | miliseconds | am-pm
const time_12 = function() { return moment().format("hh:mm:ss:ms a")};

//date & time for database logging down to the milisecond
const datetime_12 = function() { return moment().format("YYYYMMDD hh:mm:ss:ms a")};

//-- event specific globals
var user_FirstLogin = false;




// https://home.openweathermap.org/api_keys
const apiKey ="d5291050dfed6abda18c09f0e663326d";


/*----------------------------------------------------------------------------*/
//-- GETTING DATA



const _get_Forecast_City_5Days = async (cityName) => {
    
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    const response = (async () => {
        let cityName = 'Charlotte';
        const res = await fetch('http://api.openweathermap.org/data/2.5/forecast?q='
            + cityName
            +'&appid=' +apiKey
            +'&cnt=5',
            { method: 'GET'}
        );
            
        const json = await res.json();
        console.log("Got results: ",json);
        _set_Results(json)
      })();
      return response;
};


    
    
//-- Access the open weather map API by city name        
const _get_Forecast_City = async (cityName) => {
    
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    const response = (async () => {
        // let cityName = 'Charlotte';
        // const res = await fetch('http://api.openweathermap.org/data/2.5/forecast?q='+ cityName +'&appid=' +apiKey +'&cnt=5',{ method: 'GET'});
        // https://openweathermap.org/api/one-call-api
        const res = await fetch('http://api.openweathermap.org/data/2.5/onecall?lat=35.2271&lon=-80.8431'
            +'&exclude=hourly,minutely'
            +'&appid=' +apiKey
            +'&cnt=5',
            { method: 'GET'}
        );
        const json = await res.json();
        console.log("Got results: ",json);
        _set_Results(json)
      })();
      return response;
};


/*----------------------------------------------------------------------------*/
//-- BUILDING RESULTS

function _set_Results(response){
    //-- Get's results from _get_City(cityName), builds content

    console.log("//-- START --> function _set_Results(response)")
    console.log(response)
    console.log(response.daily)
    
    

    //build reasponse container
    // Object.keys(JSON.parse(response)).forEach((key) => {    
    //     console.log(key);
    //  });

    //-- Get days section
    let days_Section = document.getElementById("days");

    
    const days = response.daily;

    for (day in days){
        
        let day_JSON = days[day];
        
        //-- Make DIV to hole day
        var div = document.createElement("div");

        // set the div class as day for css
        div.setAttribute("class","day");
        // Make animals ID the div element ID
        
        div.setAttribute("id", day_JSON.dt);



        var dayname = new Date(day_JSON.dt * 1000).toLocaleDateString('en-us', { weekday: 'long', day: 'numeric' });

        //-- build day
        div.innerHTML = 
            '<span class="date">' + dayname + '</span>'
            +'<img class="weathericon" src="http://openweathermap.org/img/w/' + day_JSON.weather[0].icon + '.png">'
            + '<span class="temp">' + day_JSON.temp.day + '</span>'
            + '<span clss="windspeed">' + day_JSON.wind_speed + '</span>'
            + '<span class="humidity">' + day_JSON.humidity + '</span>';
        
        days_Section.appendChild(div);
        
        
    }



        // build response header

        //build response days
    

    console.log("//-- END --> function _set_Results(response)")
    return null;
}

/*----------------------------------------------------------------------------*/
/*-- DATABASE MANAGEMENT --> START
    - Manages all database related functionality with three functions. 
    - Runs all three on start.


        get_Database()
            - Use to to get the current database in JSON format.
            - Public function used anytime needes.
            - returns JSON dict of database


        set_Database(entry)
            - Use set database values in Local Storage. Verify, merge, append,
                and updates.
            - Public function used anytime needed
            - returns null

        _load_Database()
            - Default database to ensure required content always exists
            - Private function ran by program
            - returns null
*/


function get_Database(){
    // Use to to get the current database in JSON format. Always returns dict.

    
    // Get Database from local storage, build into JSON dict
    let database_Current = JSON.parse(localStorage.getItem(database_Name));
    
    // console.log("function get_Database(): database_Current: ",database_Current);

    // If database exists
    if (database_Current != null) {
        
        // if userdata key doesn't exist, create it
        if (database_Current.userdata == null) {
            database_Current['userdata'] = {};
        };
        
        // if settings key doesn't exist, create it
        if (database_Current.settings == null) {
            database_Current['settings'] = {};
        };

        if (database_Current.api == null) {
            database_Current['api'] = {};
        };
    };
    
    // Return JSON dict
    return database_Current;
};


function set_Database(entry) {
    /* Use to set database values in Local Storage. Verify, merge, append, and
        updates. 
    */
    
    //--------------------------------
    //-- LOCAL VAR --> START

    // Used to merge existing and new database changes, then written to Local Storage
    let database_New = {userdata:{}, settings:{}, api:{} };
    
    // Used to hold current database values if they exist
    let userdata_Current = {};
    let settings_Current = {};
    let api_Current = {};
    
    //-- LOCAL VAR --> END
    //--------------------------------
    // DATABASE INTEGRITY --> START
    
    // Getting local storage database to add to new OBJ to re-write to storage once verified
    let database_Current = get_Database(); 

    // If a Database in Local Storage already exists, verify & collect keys + content
        //-- NOTE: If not true, it's a new database.
    if (database_Current != null) {
        
        // If user already defined in local storage, grab it.
        if (database_Current.userdata != null) {
            
            // Merge current database.userdata to new placeholder
            userdata_Current = database_Current.userdata;
            
            // update last login time
            userdata_Current.login_Last = datetime_12();
        }
        
        // If settings already defined in local storage, grab it.
        if (database_Current.settings != null) {
            settings_Current = database_Current.settings;
        }

         // If API already defined in local storage, grab it.
         if (database_Current.api != null) {
            api_Current = database_Current.api;
        }
    }
    
    // Database not yet built so set some default values
    else {
            
        // First login for the user, so update value.
        userdata_Current['login_First'] = datetime_12();   
    }

    // DATABASE INTEGRITY -> END // 
    //--------------------------------//
    //-- ENTRY INTEGRITY -> START //

    //-- TODO:: 12/08/2021 #EP || If the entry fits required params or not. ( a later thing )

    //-- If user action to update database or if _Load_Database() ran.
    if(entry != undefined){
        
        //-- If entry provides userdata values
        if(entry.userdata != null){
            
            // Build userdata results
            for (key in entry.userdata){
                
                // IF userdata key not yet defined in database, add it.
                if(userdata_Current[key] == undefined){                
                    userdata_Current[key] = entry.userdata[key];
                }
            };
            
            /* FOR EACH DATE IN TIMELINE

                Itterate through userdata.timeline dates, update the database.
                Used when page runs, so if new date on load new timeline entry
            */
            for(date in entry.userdata.timeline){
                //add entry value to what will be written to local storage
                userdata_Current.timeline[date] = entry.userdata.timeline[date];
                
                // if first login for the day
                if(userdata_Current.timeline[date].login_First == null){
                    // Set current date and time
                    userdata_Current.timeline[date].login_First = datetime_12();
                }
            }
        };

        //-- If entry provides setting values
        if (entry.settings != null){
            // Merge settings_Current together from curent and entry
            settings_Current = Object.assign({},settings_Current, entry.settings);            
        } 

        //--If entry provides api values
        if (entry.api != null){        
            // TODO:: 12/08/2021 #EP || Confirm if this is working once api data in
            
            // Merge settings_Current together from curent and entry
            api_Current = Object.assign({},api_Current, entry.api);
        } 
    }; 

    //-- END --> ENTRY INTEGRITY
    //--------------------------------//
    /* START -> MERGING DATA
        
        itterates current database and adds 
    */ 
    
    // Grab current userdata Keys and merge
    Object.keys(userdata_Current).forEach((key) => {    
        // Add keys to dictionary
        database_New.userdata[key] = (userdata_Current[key]);
    });
    
    // Grab curent setting keys and merge
    Object.keys(settings_Current).forEach((key) => {
        // Add key to dictionary
        database_New.settings[key] = settings_Current[key];
    });
    // Grab curent API values and merge
    Object.keys(api_Current).forEach((key) => {
        // Add key to dictionary
        database_New.api[key] = api_Current[key];
    });
    

    //-- END -> BUILDING DICTIONARY  
    
    //  console.log("function set_Database(entry): database_New ", database_New);

    // Updating Database
    localStorage.setItem(database_Name, JSON.stringify(database_New));

    return null;
};
//-- END -> set_Database(entry)


function _load_Database() {
    //-- Default database to ensure required content always exists
    

    let database_Default = {
        
        //-- USER SESSION DATA
        userdata: {
            
            //-- running log of dates user logged in
            timeline: {
                
                //build todays date into database
                [(moment().format("YYYYMMDD"))]: {
                    //-- first login of the day
                    login_First: null,
                    //-- last login of the day
                    login_Last: datetime_12(),
                     //-- record of search parameters
                    search_History: {},
                    //-- record of what was clicked on
                    view_History: {}
                },
            },
            //-- users saved list. Stores full payload
            saved: {},

            //-- first login ever
            login_First: null, //TODO:: 12/08/2021 #EP || Make only update once
            //-- last login ever.
            login_Last: datetime_12(),
        },
        
        //-- APP SETTINGS
        settings: {
           defaults: {
               timeZone: null, // TODO:: 12/08/2021 #EP || Set a Default Time Zone based on browser
           },
           // If user defines these settings_Current, will over-ride defaults
           user: {
             timeZone: null,
             zipCode: null,
             city: null
           },
        },
        
        //-- API SETTINGS
        api: {
            petfinder: {}
        }
    };
    //-- end of database_Default

    // console.log("function _load_Database() database_Default: ",database_Default) //TODO:: 12/08/2021 #EP || Delete console.log once done testing
    
    // Set Default Database 
    set_Database(database_Default);
    
    return null;
};

//-- DATABASE MANAGEMENT --> END
/* -------------------------------------------------------------------------- */
//-- TESTING --> START

function _set_DemoData(){
    //-- Overwrites current database with demo data to simplify testing.
    
    let demo_Database = {
            
        //-- USER SESSION DATA
        //-- USER SESSION DATA
        userdata: {
            
            //-- running log of dates user logged in
            timeline: {
                
                //build todays date into database
                [(moment().format("YYYYMMDD"))]: {
                    //-- first login of the day
                    login_First: null,
                    //-- last login of the day
                    login_Last: (moment().format("YYYYMMDD hh:mm:ss:ms a")),
                     //-- record of search parameters
                    search_History: {},
                    //-- record of what was clicked on
                    view_History: {}
                },
            },
            //-- users saved list. Stores full payload
            saved: {},
            
            //-- first login ever
            login_First: '20211208 17:12:64:126 pm', //TODO:: 12/08/2021 #EP || Make only update once
            //-- last login ever.
            login_Last:  (moment().format("YYYYMMDD hh:mm:ss:ms a")),
        },
        
        //-- APP SETTINGS
        settings: {
            defaults: {
                timeZone: null, // TODO:: 12/08/2021 #EP || Set a Default Time Zone based on browser
            },
            // If user defines these settings_Current, will over-ride defaults
            user: {
                timeZone: null,
                zipCode: null,
                city: null
            },
        },
        
        //-- API SETTINGS
        api: {
            petfinder: {

            }
        }
    };

    console.log("function _set_DemoData() demo_Database: ",demo_Database) //TODO:: 12/08/2021 #EP || Delete console.log once done testing

    //Auto builds database overwriting current
    localStorage.setItem("purrfect-friend",JSON.stringify(demo_Database));

    return null;
};

//-- TESTING --> END
/*----------------------------------------------------------------------------*/
//-- RUNNING --> START


function run(){
    
    //-- TESTING
    let testing = true;
    
    if (testing == false){
        /* 1. Load the database */
        _load_Database();

        /* 2. Update Page Setings */

        /* 3. Load APIs */

        /* 4. Build Page */
    }
    else {
        console.log("//-- RUNNING TEST")
        
        // _set_DemoData();
        
        let cityName = 'Charlotte';
        
        const response = _get_Forecast_City(cityName);

        // _get_Forecast_City_5Days(cityName);

        //wait 2 seconds then push results to dict
        // setTimeout(() => {  _set_Results(response); }, 2000);

        
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

run();


//-- RUNNING --> END
/*----------------------------------------------------------------------------*/
