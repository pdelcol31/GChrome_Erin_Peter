//** Spring 2026
// This file contains the code to scrape text responses from ChatGPT, determine 
// users' coarse locations, and send the text content to background.js. To perform
// necessary functionality, this file is bundled with imported libraries into 
// dist/content.bundle.js (which is the file included in Manifest.json). If making 
// edits to this file, make sure to use the command below to bundle in order to see 
// changes in the chrome extension. */

//** Use this command after installing npm: 
// npx esbuild content.js --bundle --outfile=dist/content.bundle.js --platform=browser --format=iife --external:chrome */


//import necessary libraries
import { sha256 } from 'js-sha256'; //hash code algorithm
import { point } from '@turf/helpers'; //spatial library
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon' //spatial library

// Keep track of which message elements we've already scraped (a set containing
    // message ids)
let seenIds = []; // Your "sticky note"

// Fetch once at the very beginning
chrome.storage.local.get({ seenMessageIds: [] }).then(result => {
    seenIds = result.seenMessageIds;

    // Constantly observe webpage
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

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
// 3. load spatial data
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

//create an Id for a chat response using SHA-256 hashing
function getMessageId(container) {
    //trims away empty space or extra newlines at the start and end of text
    const text = container.innerText.trim();

    //using SHA256 hashing
    if(text.length < 175){
        return sha256(text);
    }
    else{
        return sha256(text.substring(0,175));
    }
}

// main scraping function
const observer = new MutationObserver((mutations, obs) => {
    // Look for the specific 'p' tag that signals the end of a response
    const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');   
    // Loop through all the tags (e.g. responses) found
    responseAnchors.forEach((p) => {
        if (p){
            // Navigate up to the main message container
            const messageContainer = p.closest('.markdown'); 

            if (messageContainer && !messageContainer.dataset.isProcessing) {
                // clean the timer for this specific message container
                if (messageContainer._timer) clearTimeout(messageContainer._timer);

                // set a new timer on this specific message container
                messageContainer._timer = setTimeout(async () => {
                    // mark message container as processing
                    messageContainer.dataset.isProcessing = "true";
                    //wait for coarse location to load
                    while(coarseLocation == "waiting for coarse location..."){
                        await new Promise(resolve => setTimeout(resolve, 500)); 
                    };
                    // pause here until the "Stop generating" button is gone
                    while (!!document.querySelector('button[aria-label="Stop generating"]')) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Check every 1s
                    }
                    // create a message id
                    const messageID = getMessageId(messageContainer);

                    // Check if this response has been seen before
                    if(messageID && !seenIds.includes(messageID)){
                        // update the local variable so the NEXT observer run sees it
                        seenIds.push(messageID);
                        // save to permanent storage in the background
                        chrome.storage.local.set({ seenMessageIds: seenIds });
                            
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
                    else{ // if response already seen
                        const contents = messageContainer.innerText;
                        console.log("existing Data:", contents.substring(0,175));
                    }
                }, 5000);
            }
        }
    });
});

//run when a user's location changes and update global coarseLocation variable
navigator.geolocation.watchPosition((position) => {
    //retrieve user's lat, long
    const lat = position.coords.latitude;
    const lng = position.coords.longitude; 
    
    const userCoords = [lng,lat];
    //get and set coarse location data (country, state, county)
    getLocation2(userCoords);
});

//get the coarse location data country, state, county (pa) -- using turf and set 
// courseLocation
async function getLocation2(userCoords) {
    // prevent crash: if data isn't loaded yet, exit early
    if (!countriesGeoJson || !statesGeoJson || !paCountiesGeoJson) {
        console.log("Spatial data still loading...");
        return;
    }
    const pt = point(userCoords); //  userCoords = [Lng, Lat]

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
    //if in USA, find state 
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
        //if in PA, find county
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