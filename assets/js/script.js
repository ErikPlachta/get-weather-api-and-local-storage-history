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

//-- Location awareness from ISP
import {get_PublicIP } from './location.js';

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
// TODO: 03/31/2022 #EP | GET NEW API Key and Make it a env var
const apiKey = "d5291050dfed6abda18c09f0e663326d";


/*----------------------------------------------------------------------------*/
//-- START --> SEARCH

//-- When searching and input contains text
$( "#cityname_Search_Btn").click(function(){
    
    
    // get EU saerch value
    let cityname_Searched = document.getElementById("cityName_Search_Input").value;
    
    // if EU typed anything, attempt to get the forecast
    if(cityname_Searched != ''){  
        //-- get forcast
        _get_Forecast_City(cityname_Searched)
            .then(results => {
                _get_Search_History()
                //-- clear input
                document.getElementById("cityName_Search_Input").value= "";
                // Clear out containers holding current weather
            })
            
            document.getElementById("city").innerHTML = "";
            document.getElementById("days").innerHTML = "";
            window.scrollTo(0, 0);
        }
});

$( "#clear_SearchHistory_Btn").click(function(){
    localStorage.removeItem(database_Name);
    window.scrollTo(0, 0);
    document.getElementById("searchHistory_Results").innerHTML = ''; //-- remove all c
});


//-- END --> SEARCH

/*----------------------------------------------------------------------------*/
//-- FORECAST    
    
//-- Access the open weather map API by city name        
const _get_Forecast_LatLon = async (lat,lon) => {
    
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    const response = (async () => {
        
        // https://openweathermap.org/api/one-call-api
        const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}`
            +'&exclude=hourly,minutely,current'
            +'&units=imperial'
            +'&appid=' +apiKey,
            { method: 'GET'}
        );
        //-- once get a response, convert to JSON and update page
        const json = await res.json()
            .then(response =>{
                // console.log("Got results: ",json);
                _build_Forecast(response);
            })  
      })();
      return response;
};

function _build_Forecast(response){
    //-- Builds forecast 

    //--------------------------------------------------------------------------
    //-- Start building daily forecast

    //-- Get days section from HTML
    let days_Section = document.getElementById("days");
    //-- store daily JSON
    const days = response.daily;
    //-- To count number of days
    let numberDays = 1;
    //-- Itterate through days and build content for the next few days forecast
    for (let day in days){
        //-- store first day results for content building
        let day_JSON = days[day];
        //--- If the current day, grab the UVI
        if (numberDays == 1) {
            document.getElementById("uvi").innerText = day_JSON.uvi + " uvi";
            

            if(day_JSON.uvi < 1 ){
                document.getElementById("uvi").style.backgroundColor="green";
            }
            else if(day_JSON.uvi < 2 ){
                document.getElementById("uvi").style.backgroundColor="yellow";
            }
            else if(day_JSON.uvi < 3 ){
                document.getElementById("uvi").style.backgroundColor="orange";
            }
            else if(day_JSON.uvi < 4 ){
                document.getElementById("uvi").style.backgroundColor="orange";
            }
            else if(day_JSON.uvi < 5 ){
                document.getElementById("uvi").style.backgroundColor="tomato";
            }
            else if(day_JSON.uvi > 5 ){
                console.log("AHH!")
                document.getElementById("uvi").style.backgroundColor="red";
            }
            
        };

        //-- If day 1 - 5, build content
        if (numberDays < 6){
        
            //-- Make DIV to hold each day
            var div = document.createElement("div");

            // set the div class as day for css
            div.setAttribute("class","day");

            //-- convert date time unicode to str
            var weekday = new Date(day_JSON.dt * 1000)
                .toLocaleDateString(
                    'en-us',
                    { 
                        // day: 'numeric',
                        weekday: 'long'
                    }
                );
            //-- build the day
            div.innerHTML = 
                
                '<h4 class="date">' + weekday + '</h4>'
                +'<img class="weathericon" src="https://openweathermap.org/img/w/'
                    + day_JSON.weather[0].icon 
                    + '.png">'
                + '<span class="temp">' + day_JSON.temp.day + '??</span>'
                + '<span class="humidity">' + day_JSON.humidity + '%</span>'
                + '<span clss="windspeed">' + day_JSON.wind_speed + ' mph</span>';
                
            
            //-- add day to page
            days_Section.appendChild(div);
        }

        //-- increment to know when to stop building
        numberDays ++;
    };
    //-- END --> looping through days
    return null;
}

/*----------------------------------------------------------------------------*/
//-- CITY

const _get_Forecast_City = async (cityName) => {
    
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    const response = (async () => {
        
        // const res = await fetch('http://api.openweathermap.org/data/2.5/forecast?q='
        
        const res = await fetch('https://api.openweathermap.org/data/2.5/weather?q='
            + cityName
            +'&appid=' +apiKey
            +'&units=imperial',
            { method: 'GET'}
        );
            
        const json = await res.json();
        // console.log("Got results: ",json);
        
        //-- If successful response, update content
        if(json.cod == 200){
            //-- Build current data for city
            _build_Current(json);
            //-- Build forecast and update search History
            _get_Forecast_LatLon(json.coord.lat,json.coord.lon)
            //-- Show forecast section if was hidden
            document.getElementById("forecast_Section").style.display = "flex";
            //-- Update Search History

        }
        //-- If failed response for some reason, return error message
        else {
            
            //-- Hide forecase section if was display visible
            // document.getElementById("forecast_Section").innerHTML = "Test";
           
            //-- Update Banner with Error message
            document.getElementById("banner").innerHTML = "<B>ERROR</B>: " + json.message + " : <code>" +cityName +"</code>";
            
            //-- Banner Error Alert. Starts Fade in 1s
            document.getElementById("banner").style.opacity = "1";
            setTimeout(function() {
                // document.getElementById("banner").style.display = "none";
                fade(document.getElementById("banner"));
            }, 1000);
            
        }
      })();
      return response;
};

function fade(element) {
    document.getElementById("banner").style.opacity = "1";
    //-- Get elements current opacity
    var op = element.style.opacity;  // initial opacity
    
    //-- Fade Opacity in increments. (var so can clear timer once done)
    var timer = setInterval(function () {
        
        //-- Set Opacity to the value of OP
        element.style.opacity = op;
        
        //-- Setting Opacity with calculation to make smooth transition
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        
        //-- Once to 0.1, stop interval and set opacity to zero
        if (op <= 0.1){
            clearInterval(timer);
            element.style.opacity = '0';
        }
        //-- Reduce opacity by 0.1
        op -= op * 0.1;
    }, 100);
    
};


function _build_Current(response){
    // console.log(response);
    //--------------------------------------------------------------------------
    //-- Start building city header

    let city_JSON = response;

    //-- Get days section from HTML
    let city_Section = document.getElementById("city");

    var city_Div = document.createElement("div");

    // set the div class as day for css
    city_Div.setAttribute("class","city");

    var city_Day = new Date(city_JSON.dt * 1000)
    .toLocaleDateString(
        'en-us',
        { 
            weekday: 'long',
            // day: 'numeric'
        }
    );

    city_Div.innerHTML = 
        '<h1>'+city_JSON.name+'</h1>'
        +'<h3 class="date">' + city_Day + '</h3>'
        +'<img class="weathericon" alt="' + city_JSON.weather[0].description
        +'" src="https://openweathermap.org/img/w/' + city_JSON.weather[0].icon + '.png">'
        + '<span class="temp">' + city_JSON.main.temp + '?? F</span>'
        + '<span class="humidity">' + city_JSON.main.humidity + '%</span>'
        + '<span class="windspeed">' + city_JSON.wind.speed + ' mph</span>'
        + '<span class="uvi" id="uvi"></span>';

    // -- add day to page
    city_Section.appendChild(city_Div);

      //-- Add to local storage
    const search_Entry = {
        // Where it's to be stored
        userdata: {
            // Data stored
            searched: {
                [datetime_12()] : {
                    cityname: city_JSON.name,
                    icon: city_JSON.weather[0].icon,
                    temp: city_JSON.main.temp
                }
            },
        },
    };
    set_Database(search_Entry);
};


//-- Sets history conatiner with cities
function _set_Search_History(searchHistory){

    let searchHistoryHolder = "";

    for(let dateTime in searchHistory) {
        let cityName = searchHistory[dateTime].cityname;
        let icon = searchHistory[dateTime].icon;
        let temp = searchHistory[dateTime].temp;
        // console.log(cityName,icon,temp)
        //-- Update current history with new search
        searchHistoryHolder = searchHistoryHolder 
        + "<div class='search-history-element'>"
            + `<span class='cityname'>`
                +`${cityName}`
            +`</span>` //-- city-name searched
            + `<span class='icon-temp'>`
                +`<img class="weathericon" src='https://openweathermap.org/img/w/${icon}.png' />` //-- icon from API
                +`${temp}??`
            +`</span>` //-- temp in F
            +`<span class="date-time">${dateTime}</span>` //-- date time
        +`</div>`
        
    }

    //-- update page
    document.getElementById("searchHistory_Results").innerHTML = searchHistoryHolder;

    //-- add event listener to the city-name specifically
    $( ".search-history-element .cityname" ).click(function(event){
        // console.log(event.target.innerText)
        let cityname_Searched = event.target.innerText;
        _get_Forecast_City(cityname_Searched)
            .then(results => {
                _get_Search_History()
                //-- clear input
                document.getElementById("cityName_Search_Input").value= "";
                // Clear out containers holding current weather
            });
            
        document.getElementById("city").innerHTML = "";
        document.getElementById("days").innerHTML = "";
        window.scrollTo(0, 0);
    });
};

//-- Extract search history from the database and then update page content with city-name
async function _get_Search_History(){
    //-- Get Database
    let database_Current = get_Database();
    //-- Get Search History
    let searchHistory = await database_Current.userdata['searched']
    if(searchHistory){       
        _set_Search_History(searchHistory);
    }
};

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
    
    //-- TODO:: 04/01/2022 #EP || DELETE console.log
    // console.log("set_Database(search_Entry): ", entry)
    
    // Used to merge existing and new database changes, then written to Local Storage
    let database_New = {userdata:{}, settings:{}};//, api:{} };
    
    // Used to hold current database values if they exist
    let userdata_Current = {};
    let settings_Current = {};
    // let api_Current = {};
    
    //-- LOCAL VAR --> END
    //--------------------------------
    // DATABASE INTEGRITY --> START
    
    // Getting local storage database to add to new OBJ to re-write to storage once verified
    let database_Current = get_Database(); 

    // console.log("database_Current: ", database_Current)

    // If a Database in Local Storage already exists, verify & collect keys + content
        //-- NOTE: If not true, it's a new database.
    if (database_Current != null) {
        
        // If user already defined in local storage, grab it.
        if (database_Current.userdata != null) {
            // Merge current database.userdata to new placeholder
            userdata_Current = database_Current.userdata;
            // update last login time to now
            userdata_Current.login_Last = datetime_12();
        }
        
        // If settings already defined in local storage, grab it.
        if (database_Current.settings != null) {
            settings_Current = database_Current.settings;
        }

         // If API already defined in local storage, grab it.
        //  if (database_Current.api != null) {
        //     api_Current = database_Current.api;
        // }
    }
    // Database not yet built so set some default values
    else {    
        // First login for the user, so update value.
        userdata_Current['login_First'] = datetime_12();   
    }

    // DATABASE INTEGRITY -> END // 
    //--------------------------------//
    //-- ENTRY INTO NEW DATABASESTATE  OBJ HOLDER -> START //

    //-- If user action to update database or if _Load_Database() ran.
    if(entry != undefined){
        // console.log(`line 460: entry ${JSON.stringify(entry)}`)
        
        //-- If entry provides userdata values
        if(entry.userdata != null){
            
            // Build userdata results
            for (var key in entry.userdata){
                
                // console.log(`// key - entry.userdata[key]:${key} - ${JSON.stringify(entry.userdata[key])}`)
                let key_Holder = entry.userdata[key];

                // IF userdata key not yet defined in database, add it.
                if(userdata_Current[key] == undefined){                
                    
                    //-- if it's the first time logging in, ever
                    if(key === 'login_First'){
                        //-- set the first login value - to be merged below
                        entry.login_First = datetime_12();
                        
                        // console.log("entry.login_First value: ",entry[key]);
                        // console.log("userdata_Current.login_First value: ",userdata_Current[key]);
                    }
                    else {
                        // console.log("value : ",userdata_Current[key])
                        // userdata_Current[key] = entry.userdata[key];
                    }
                    // console.log("//-- userdata_Current[key]  == undefined; Need to set as entry value of key: ",key)
                }
                else {
                    // console.log("//-- userdata_Current[key]: ",key)
                }
            };
            
            // console.log("userdata_Current", userdata_Current)
            /* FOR EACH SEARCH RESULT IN SEARCH HISTORY

            */
            
            //TODO:: 04/01/2022 #EP || DELETE THIS ONCE DONE TESTING. Commented out for now because happening on 539
            //-- If/when a new search is requseted, prints it.
            // for(let city in entry.userdata.searched){
            //     //TODO:: 01/07/2021 #EP || Build this out to actually update
            //     console.log(`city:`, entry.userdata.searched[city]);
            // }
            
            /* FOR EACH DATE IN TIMELINE

                Itterate through userdata.timeline dates, update the database.
                Used when page runs, so if new date on load new timeline entry
            */
            // for(let date in entry.userdata.timeline){
            //     //add entry value to what will be written to local storage
            //     // userdata_Current.timeline[date] = entry.userdata.timeline[date];
                
            //     // if first login for the day
            //     if(userdata_Current.timeline[date].login_First == null){
            //         // Set current date and time
            //         userdata_Current.timeline[date].login_First = datetime_12();
            //     }
            // }
        };

        //-- If entry provides setting values
        if (entry.settings != null){
            // Merge settings_Current together from curent and entry
            settings_Current = Object.assign({},settings_Current, entry.settings);            
        } 


        //--If a saerch request is made
        if(entry.userdata.searched){
            
            //-- if first time a search is happening, create a obj for it
            if(!userdata_Current.searched){     userdata_Current['searched']={}; }
            
            //-- for each search request, merge with userdata_Current. ( should always just be one atm )
            for(let searchedCity in entry.userdata.searched){
                userdata_Current.searched[searchedCity] = entry.userdata.searched[searchedCity]
            }
        }
        
    }; 

    //-- END --> ENTRY INTEGRITY
    //--------------------------------//
    /* START -> MERGING DATA
        
        Itterates current database, combines into new to prepare to push new state into local storage
    */ 
    
    //-- USERDATA: DICTIONARY IN LOCAL STORAGE --//
    
    //-- Grab current userdata Keys and sub-keys, combine into new obj, 
    Object.keys(userdata_Current).forEach((key) => { 
        database_New.userdata[key] = (userdata_Current[key]);
    });
    
    //-- SETTINGS: DICTIOANRY OBJ IN LOCAL STORAGE --//

    //-- Grab curent setting keys, merge to new OBJ to hold. 
        //-- ( This is a single-layer OBJ so no need to dig deeper )
    Object.keys(settings_Current).forEach((key) => {
        // Add key to dictionary
        database_New.settings[key] = settings_Current[key];
    });

    // END -> MERGING DATA
    //--------------------------------//
    /* START -> UPDATING EXISTING STATE
        
        Overwrites current local storage state with a newly updated copy
    */ 

    //-- Overwriting existing with new
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
            searched: {},

            //-- first login ever
            login_First: null,
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
    };
    //-- end of database_Default
    
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
            searched: {},
            
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
            openweather: {

            }
        }
    };

    // console.log("function _set_DemoData() demo_Database: ",demo_Database) //TODO:: 12/08/2021 #EP || Delete console.log once done testing

    //Auto builds database overwriting current
    localStorage.setItem("purrfect-friend",JSON.stringify(demo_Database));

    return null;
};

//-- TESTING --> END
/*----------------------------------------------------------------------------*/
//-- RUNNING --> START

const _set_Location = async function(){
    
    const PublicIP = await get_PublicIP()
    .then(response => {
        
        // console.log(response)
        return (response);
    })
}


function run(){
    
    //-- TESTING
    let testing = false;
    
    if (testing != true){
        /* 1. Load the database */
        _load_Database();
        // _set_Location();
    }
    else {
        console.log("//-- RUNNING TEST")    
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};


run();

//-- RUNNING --> END
/*----------------------------------------------------------------------------*/
//-- ANIMATIONS --> START

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      document.getElementById('header').className = 'slideDown';
      document.getElementById('searchHistory_Section').className = 'slideDown';
      _get_Search_History();
      $("#cityName_Search_Input").trigger('focus');
      // $("#cityName_Search_Input").focus();
    }, 100);
}, false);


//-- Browser focus to typing

//-- ANIMATIONS --> END
/*----------------------------------------------------------------------------*/