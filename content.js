//** Spring 2026
// This file contains the code to scrape text responses from ChatGPT, determine 
// users' coarse locations, and send the text content to background.js. To perform
// necessary functionality, this file is bundled with imported libraries into 
// dist/content.bundle.js (which is the file included in Manifest.json). If making 
// edits to this file, make sure to use the command below to bundle to see changes 
// in the chrome extension. */

//** Now bundling content.js. Use this command after installing npm: 
// npx esbuild content.js --bundle --outfile=dist/content.bundle.js --platform=browser --format=iife --external:chrome */


//import necessary libraries
import { sha256 } from 'js-sha256'; //hash code algorithm
import { point } from '@turf/helpers'; //spatial library
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'

let streamTimer;

// Keep track of which message elements we've already scraped (a set containing
    // message ids)
const getStoredIds = () => JSON.parse(localStorage.getItem('seenMessageIds') || '[]');
const seenMessages = new Set(getStoredIds());

// stores coarse location data of user as string (country, state, county)
let coarseLocation = "waiting for coarse location...";

//Load in countries, states, counties json files
// 1. get the internal URL
const countriesFileUrl = chrome.runtime.getURL('World_Countries_(Generalized)_2173680399808997149.geojson');
const statesFileUrl = chrome.runtime.getURL('us-states.json');
const paCountiesFileUrl = chrome.runtime.getURL('Pennsylvania_County_Boundaries.geojson');
// 2. Fetch and parse the JSON
var countriesGeoJson = null;
var statesGeoJson = null;
var paCountiesGeoJson = null;
//load spatial data
async function loadSpatialData() {
    const countriesResponse = await fetch(countriesFileUrl);
    countriesGeoJson = await countriesResponse.json();
    const statesResponse = await fetch(statesFileUrl);
    statesGeoJson = await statesResponse.json();
    const paCountiesResponse = await fetch(paCountiesFileUrl);
    paCountiesGeoJson = await paCountiesResponse.json();
    console.log("All spatial data loaded and ready.");
}
loadSpatialData();


// Function to find and store saved chats based on url changes
// (function() {
//     // track current/last url
//     let lastUrl = location.href;

//     // Setup the listener for URL change
//     const observer = new MutationObserver(() => {
//         const url = location.href;
//         if (url !== lastUrl) {
//             lastUrl = url;
//             console.log("URL Changed to:", url);
//             getExistingMessages();
//         }
//     });

//     // Start watching the html 'body' for any changes (which happens during navigation)
//     observer.observe(document.body, { subtree: true, childList: true });

//     //scan for existingMessages in the current html page (e.g. saved chats)
//     const getExistingMessages = () => {
//         //wait for page to load (5 seconds)
//         setTimeout(() => {
//             //last part (p tags) of a response
//             const existing_p_tags = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');
//             //a corner case
//             const existing_special_p_tags = document.querySelectorAll('p > span');
//             const all_existing_p_tags = [...existing_p_tags, ...existing_special_p_tags];

//             const isTyping = !!document.querySelector('button[aria-label="Stop generating"]');
//             if(!isTyping){
//                 all_existing_p_tags.forEach((p) => {
//                     console.log("Found existing p tag");
//                     //find the closest larger div class
//                     const existing_messageContainer = p.closest('.markdown');
//                     //create a message id for the response to store in seenMessages
//                     existing_message_id = getMessageId(existing_messageContainer);
//                     console.log("Created message id:" + existing_message_id);
//                     // re-read the latest data from localStorage right before checking
//                     // (handles the case where another tab just saved something)
//                     const currentStorage = JSON.parse(localStorage.getItem('seenMessageIds') || '[]');
//                     if(existing_message_id && !seenMessages.has(existing_message_id) && !currentStorage.includes(existing_message_id)){
//                         console.log("existing message id: " + existing_message_id);
//                         //add the message id to seenMessages if not already seen and store in local storage
//                         seenMessages.add(existing_message_id);
//                         localStorage.setItem('seenMessageIds', JSON.stringify(Array.from(seenMessages)));

//                         const contents = existing_messageContainer.innerText;
//                         console.log("existing message: " + contents.substring(0,150));
//                         console.log("chrome =", chrome);
//                         console.log("chrome.runtime =", chrome?.runtime);
//                         console.log("chrome.runtime?.id =", chrome?.runtime?.id);
//                         // Send to background.js
//                         chrome.runtime.sendMessage({ 
//                             action: "COUNT_TOKENS", 
//                             text: contents ,
//                             location: location_data
//                         });
//                     }
//                 });
//             }
//         }, 5000);
//     };

//     // Run once on initial url load
//     if (document.readyState === 'complete') getExistingMessages();
//     else window.addEventListener('load', getExistingMessages); //wait for loading
// })();

//create an Id for a chat response 
// function getMessageId2(container) {
//     // 1. Normalize the string to a standard form (handles different emoji encodings)
//     // 2. Trim trailing/leading spaces
//     // 3. Replace all "runs" of whitespace/newlines with a single space
//     const cleanText = container.innerText
//         .normalize('NFC')
//         .trim()
//         .replace(/\s+/g, ' '); 

//     // choose first 150 chars for the id
//     // ignore the total length because it's inconsistent across URLs
//     if(cleanText.length < 150) return cleanText;
//     return cleanText.substring(0, 150);
// }

//create an Id for a chat response using SHA-256 hashing
function getMessageId(container) {
    //trims away empty space or extra newlines at the start and end of text
    const text = container.innerText.trim();

    //using SHA256 hashing
    if(text.length < 150){
        return sha256(text);
    }
    else{
        return sha256(text.substring(0,150));
    }
}

const observer = new MutationObserver((mutations, obs) => {
    // Look for the specific 'p' tag that signals the end of a response
    const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');        
        // Loop through all the tags (e.g. responses) found
    responseAnchors.forEach((p) => {
        if (p){
                // Navigate up to the main message container
            const messageContainer = p.closest('.markdown'); 

            if (messageContainer) {
                // 1. CLEAR the timer for THIS SPECIFIC message container only
                if (messageContainer._timer) clearTimeout(messageContainer._timer);

                // 2. SET a new timer on THIS SPECIFIC message container
                messageContainer._timer = setTimeout(async () => {
                    //wait for coarse location to be determined
                    while(coarseLocation == "waiting for coarse location..."){
                        await new Promise(resolve => setTimeout(resolve, 500)); 
                    };
                    // pause here until the "Stop generating" button is gone
                    while (!!document.querySelector('button[aria-label="Stop generating"]')) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 1s
                    }
                        // create a message id
                    const messageID = getMessageId(messageContainer);

                        // re-read the latest data from localStorage right before checking
                        // (handles the case where another tab just saved something)
                    const currentStorage = JSON.parse(localStorage.getItem('seenMessageIds') || '[]');

                        // Check if this response has been seen before
                    if(messageID && !seenMessages.has(messageID) && !currentStorage.includes(messageID)){
                            //store new messageID
                        seenMessages.add(messageID);
                        localStorage.setItem('seenMessageIds', JSON.stringify(Array.from(seenMessages)));
                            
                            // Capture the text
                        const contents = messageContainer.innerText;
                        console.log("Scraped Data:", contents);

                            // Send text content and location to background.js
                        chrome.runtime.sendMessage({ 
                            action: "COUNT_TOKENS", 
                            text: contents ,
                            location: coarseLocation
                        });
                    }
                    else{
                        const contents = messageContainer.innerText;
                        console.log("existing Data:", contents.substring(0,150));
                    }
                }, 5000);
            }
        }
    });
    // }
});

// Constantly observe webpage
observer.observe(document.body, {
  childList: true,
  subtree: true
});

//run when a user's location changes and update global coarseLocation variable
navigator.geolocation.watchPosition((position) => {
    //retrieve user's lat, long
    const lat = position.coords.latitude;
    const lng = position.coords.longitude; 
    
    const userCoords = [lng,lat];
    //get coarse location data (country, state, county)
    getLocation2(userCoords);
});

//get the coarse location data country, state, county (pa) -- using turf
async function getLocation2(userCoords) {
    // prevent crash: if data isn't loaded yet, exit early
    if (!countriesGeoJson || !statesGeoJson || !paCountiesGeoJson) {
        console.log("Spatial data still loading...");
        return;
    }
    const pt = point(userCoords); //  [Lng, Lat]

    //country level
    const foundCountry = countriesGeoJson.features.find(country => 
        booleanPointInPolygon(pt, country)
    );
    if (!foundCountry){
        console.log(`No country found for: ${userCoords}`);
        return ;
    }
    //update coarse location
    coarseLocation = foundCountry.properties["COUNTRY"];
    //if in USA
    if (foundCountry.properties["COUNTRY"] == "United States"){
        //State level
        const foundState = statesGeoJson.features.find(state => 
            booleanPointInPolygon(pt, state)
        );
        if(!foundState){
            console.log(`No state found for ${userCoords}`);
            return ;
        }
        //update coarseLocation
        coarseLocation += ", " + foundState.properties["name"];
        //if in PA
        if(foundState.properties["name"] == "Pennsylvania"){
            const foundPACounty = paCountiesGeoJson.features.find(county => 
                booleanPointInPolygon(pt, county)
            );
            if(!foundPACounty){
                console.log(`No county found for ${userCoords}`);
                return
            }
            coarseLocation += ", " + foundPACounty.properties["COUNTY_NAME"];
        }
    }
    console.log(`Coarse Location: ${coarseLocation}`);
}

//get the coarse location data - city, state, country
//trying async / wait methods but need to research this more (seems to be working)
async function getLocation(lat, lng) {
    try {
        //use BigDataCloud API for reverse geocoding, key = bdc_2e1988557119462480d5a30615f64b3d
        const response = await fetch(`https://api-bdc.net/data/reverse-geocode?latitude=${lat}&longitude=${lng}&localityLanguage=en&key=bdc_2e1988557119462480d5a30615f64b3d`);
        
        // pause again until the JSON is parsed
        const api_response = await response.json();

        //updated location_data with country, state, city
        location_data = api_response.countryName + ", " + api_response.principalSubdivision + ", " + api_response.city;
    } catch (error) {
        console.error("The API call failed:", error);
    }
}