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
let seenIds = new Set(); //[]; 
let seenImgs = new Set();

let watchId = null;

// Fetch once at the very beginning
chrome.storage.local.get({ seenMessageIds: [], seenImages: [] }).then(result => {
    seenIds = new Set(result.seenMessageIds);
    seenImgs = new Set(result.seenImages);

    // Constantly observe webpage
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// stores coarse location data of user as string (country, state, watershed id)
let coarseLocation = "waiting for coarse location...";
let _locationResolve;
const locationReady = new Promise((resolve) => { _locationResolve = resolve; });
let _locationResolved = false;

//Load in countries, states, watershed json files
// 1. get the internal URL
//https://hub.arcgis.com/datasets/esri::world-countries-generalized/about
const countriesFileUrl = chrome.runtime.getURL('World_Countries_(Generalized)_2173680399808997149.geojson');
//https://www.kaggle.com/datasets/pompelmo/usa-states-geojson?resource=download
const statesFileUrl = chrome.runtime.getURL('us-states.json');
// https://github.com/wri/Aqueduct40, https://www.wri.org/applications/aqueduct/water-risk-atlas/#/?advanced=false&basemap=hydro&indicator=w_awr_def_tot_cat&lat=30&lng=-80&mapMode=view&month=1&opacity=0.5&ponderation=DEF&predefined=false&projection=absolute&scenario=optimistic&scope=baseline&threshold&timeScale=annual&year=baseline&zoom=3 (edited by Erin)
const aqueductIdsFileUrl = chrome.runtime.getURL('CanUS_aqueduct_ids.geojson');
//https://simplemaps.com/gis/country/ca
const canadaProvincesFileUrl = chrome.runtime.getURL('canada_provinces.json');
// 2. Fetch and parse the JSON
var countriesGeoJson = null;
var statesGeoJson = null;
var aqueductIdsGeoJson = null;
var canadaProvincesJson = null;
// 3. load spatial data
let spatialDataReady;
async function loadSpatialData() {
    const countriesResponse = await fetch(countriesFileUrl);
    countriesGeoJson = await countriesResponse.json();
    const statesResponse = await fetch(statesFileUrl);
    statesGeoJson = await statesResponse.json();
    const aqueductIdsResponse = await fetch(aqueductIdsFileUrl);
    aqueductIdsGeoJson = await aqueductIdsResponse.json();
    const canadaProvincesResponse = await fetch(canadaProvincesFileUrl);
    canadaProvincesJson = await canadaProvincesResponse.json();
    console.log("All spatial data loaded and ready.");
}
spatialDataReady  = loadSpatialData();

//create an Id for a chat response using SHA-256 hashing
function getMessageId(container) {
    //trims away empty space or extra newlines at the start and end of text
    const text = container.innerText.trim();

    //using SHA256 hashing
    if(text.length < 250){
        return sha256(text);
    }
    else{
        return sha256(text.substring(0,250));
    }
}

function getMessageId_google(container){
    const text = container.innerText.trim();

    //using SHA256 hashing
    if(text.length < 250){
        return "google_ai_overview_" + sha256(text);
    }
    else{
        return "google_ai_overview_" + sha256(text.substring(0,250));
    }
}

// main scraping function
const observer = new MutationObserver((mutations) => {    
    // Look for the specific 'p' tag that signals the end of a response in ChatGPT
    const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');   
    // Loop through all the tags (e.g. responses) found
    responseAnchors.forEach((p) => {
        if (p){
            // Navigate up to the main message container
            const messageContainer = p.closest('.markdown'); 

            if (messageContainer && messageContainer.dataset.isProcessed === "true") {
            return;
            }

            if (messageContainer && !messageContainer._timer) {
                // set a new timer on this specific message container
                messageContainer._timer = setTimeout(async () => {
                    await locationReady; 
                    while (messageContainer.classList.contains('result-streaming') || 
                    messageContainer.closest('.result-streaming') ||
                    !!document.querySelector('.result-streaming') ||
                    !!document.querySelector('button[aria-label*="Stop"], button[aria-label*="stop"]')) { 
                        await new Promise(resolve => setTimeout(resolve, 1000)); 
                    }

                    // extra safety: dynamic wait to make sure text length hasn't changed in the last 500ms
                    let lastLength = 0;
                    let currentLength = messageContainer.innerText.length;
                    while (currentLength !== lastLength || currentLength === 0) {
                        lastLength = currentLength;
                        await new Promise(resolve => setTimeout(resolve, 500));
                        currentLength = messageContainer.innerText.length;
                    }

                    // create a message id
                    const messageID = getMessageId(messageContainer);

                    // instant synchronous duplicate check
                    if (!messageID || seenIds.has(messageID)) {
                        const contents = messageContainer.innerText;
                        console.log("existing Data:", contents.substring(0, 175));
                        messageContainer.dataset.isProcessed = "true";
                        cleanupTimer(messageContainer);
                        return;
                    }

                    // Add to local Set instantly before any async 'await' pauses execution
                    seenIds.add(messageID);
                    // mark message container as processing
                    messageContainer.dataset.isProcessed = "true";

                    // Update permanent storage atomically
                    chrome.storage.local.get({ seenMessageIds: [] }).then(result => {
                        const updatedArray = [...new Set([...result.seenMessageIds, messageID])];
                        chrome.storage.local.set({ seenMessageIds: updatedArray });
                    });

                    // Capture finalized text
                    const contents = messageContainer.innerText;
                    console.log("Scraped Data:", contents);

                    chrome.runtime.sendMessage({ 
                        action: "COUNT_TOKENS", 
                        text: contents ,
                        location: coarseLocation,
                        model: "gpt"
                    });

                    cleanupTimer(messageContainer);
                }, 5000);
            }
        }
    });
    // check for generated images in ChatGPT
    const imageAnchors = document.querySelectorAll('img[id^="_r_"]');
    imageAnchors.forEach((img) => {
        if(!img){return};
        img._timer = setTimeout(async () => {
            await locationReady; 
            while (!!document.querySelector('button[aria-label="Stop generating"]')) {
                await new Promise(resolve => setTimeout(resolve, 1000)); 
            }
            const imgWidth = img.width;
            const imgHeight = img.height;
            const urlObj = new URL(img.src);
            const fileId = urlObj.searchParams.get('id');

            if (!fileId || seenImgs.has(fileId)) {
                // console.log("existing Image:", fileId);
                return;
            }
            seenImgs.add(fileId);

            // Update permanent storage atomically
            chrome.storage.local.get({ seenImageIds: [] }).then(result => {
                const updatedArray = [...new Set([...result.seenImageIds, fileId])];
                chrome.storage.local.set({ seenImageIds: updatedArray });
            });
            // console.log("Scraped Image:", fileId);

            chrome.runtime.sendMessage({ 
                action: "COUNT_IMAGES", 
                height: imgHeight ,
                width: imgWidth,
                location: coarseLocation
            });
        }, 5000);
    });

    //Google AI Overview
    const overviewAnchor = document.getElementById('m-x-content');
    if(overviewAnchor){
        console.log("found overviewAnchor");
        if (overviewAnchor && !overviewAnchor._timer) {
            console.log("overviewanchor with timer");
            // set a new timer on this specific message container
            overviewAnchor._timer = setTimeout(async () => {
                await locationReady; 

                // clone the element 
                const clonedAnchor= overviewAnchor.cloneNode(true);
                console.log("cloned anchor");
                const targetsToRemove = [
                    'script', 
                    'style', 
                    'button',
                    '.YWpX0d',        // hidden AI error messages
                    '[role="button"]', // action buttons and menu options
                    'ul.aajpme',
                    '[data-container-id="rhs-col"]',
                    '[style="display:none"]',
                    '[class="AgWCw"]',
                    'div[class^="Fzsovc"]',
                    'div[class^="lbf4Ad"]',
                ];

                targetsToRemove.forEach(selector => {
                    clonedAnchor.querySelectorAll(selector).forEach(el => el.remove());
                });
                console.log("removed bad elements");

                //unique messageID for the generated response
                const messageID = getMessageId_google(clonedAnchor);

                if (!messageID || seenIds.has(messageID)) {
                    const existing_contents = clonedAnchor.innerText;
                    console.log("existing Data:", existing_contents);
                    return;
                }

                // Add to local Set instantly before any async 'await' pauses execution
                seenIds.add(messageID);
                // Update permanent storage atomically
                chrome.storage.local.get({ seenMessageIds: [] }).then(result => {
                    const updatedArray = [...new Set([...result.seenMessageIds, messageID])];
                    chrome.storage.local.set({ seenMessageIds: updatedArray });
                });
                const scraped_contents = clonedAnchor.innerText;
                console.log("Scraped Data:", scraped_contents);

                chrome.runtime.sendMessage({ 
                        action: "COUNT_TOKENS", 
                        text: scraped_contents ,
                        location: coarseLocation,
                        model: "google_overview"
                    });

                    cleanupTimer(overviewAnchor);
            }, 1000);
        };
    }

    //search for Google AI Mode (chatbot) responses
    const aiModeAnchor = document.querySelectorAll('div[class="Zkbeff"]');

    if(aiModeAnchor){aiModeAnchor.forEach((divAnchor) => {

        if (divAnchor && !divAnchor._timer) {
            // set a new timer on this specific message container
            divAnchor._timer = setTimeout(async () => {
                await locationReady; 

                // clone the element 
                const clonedAnchor= divAnchor.cloneNode(true);
                const targetsToRemove = [
                    'script', 
                    'style', 
                    'button',
                    '.YWpX0d',        // Hidden AI error messages
                    '[role="button"]', // Action buttons and menu options
                    'ul.aajpme',
                    '[data-container-id="rhs-col"]',
                    '[style="display:none"]',
                    '[class="AgWCw"]',
                    'div[class="DBd2Wb"]'
                ];
                targetsToRemove.forEach(selector => {
                    clonedAnchor.querySelectorAll(selector).forEach(el => el.remove());
                });

                const messageID = getMessageId_google(clonedAnchor);

                if (!messageID || seenIds.has(messageID)) {
                    const existing_contents = clonedAnchor.innerText;
                    console.log("existing AI Mode Data:", existing_contents);
                    return;
                }

                // Add to local Set instantly before any async 'await' pauses execution
                seenIds.add(messageID);
                // Update permanent storage atomically
                chrome.storage.local.get({ seenMessageIds: [] }).then(result => {
                    const updatedArray = [...new Set([...result.seenMessageIds, messageID])];
                    chrome.storage.local.set({ seenMessageIds: updatedArray });
                });
                const scraped_contents = clonedAnchor.innerText;
                console.log("Scraped AI Mode Data:", scraped_contents);
                chrome.runtime.sendMessage({ 
                        action: "COUNT_TOKENS", 
                        text: scraped_contents ,
                        location: coarseLocation,
                        model: "google_ai_mode"
                    });

                    cleanupTimer(divAnchor);
            }, 5000);
        };
    });}
});


function cleanupTimer(container) {
    if (container._timer) clearTimeout(container._timer);
    container._timer = null;
}

navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
  if (permissionStatus.state === 'denied') {
    console.log("The user explicitly denied location access.");
    setCoarseLocation("Global, ")
    // Guide your user to re-enable it manually
  } else if (permissionStatus.state === 'prompt') {
    console.log("The user hasn't chosen yet (it will prompt).");
    startGeolocation();
  } else if (permissionStatus.state === 'granted') {
    console.log("Location access is already granted.");
    startGeolocation();
  }

  // Handle the user changing their mind later (e.g. denies after prompt)
    permissionStatus.onchange = () => {
        if (permissionStatus.state === 'denied') {
            console.log("Permission revoked/denied.");
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            setCoarseLocation("Global, ");
        } else if (permissionStatus.state === 'granted' && watchId === null) {
            startGeolocation();
        }
    };
});

function setCoarseLocation(value) {
    coarseLocation = value;
    if (!_locationResolved && value !== "waiting for coarse location...") {
        _locationResolved = true;
        _locationResolve(value);
    }
}

function startGeolocation() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userCoords = [position.coords.longitude, position.coords.latitude];
            getLocation2(userCoords);
        },
        (err) => {
            console.log("Initial getCurrentPosition failed:", err);
            if (err.code === 1) { // PERMISSION_DENIED
                setCoarseLocation("Global, ");
            }
        },
        { maximumAge: 60000, timeout: 8000 }
    );

    navigator.geolocation.watchPosition(
        (position) => {
            const userCoords = [position.coords.longitude, position.coords.latitude];
            getLocation2(userCoords);
        },
        (err) => {
            console.log("watchPosition error:", err);
            if (err.code === 1) {
                setCoarseLocation("Global, ");
            }
        },
        { maximumAge: 60000, timeout: 8000 }
    );
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !_locationResolved) {
        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
            if (permissionStatus.state === 'denied') {
                setCoarseLocation("Global, ");
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userCoords = [position.coords.longitude, position.coords.latitude];
                        getLocation2(userCoords);
                    },
                    (err) => console.log("getCurrentPosition retry failed:", err),
                    { maximumAge: 60000, timeout: 8000 }
                );
            }
        });
    }
});

async function getLocation2(userCoords) {

    let current_coarse_location = "";
    await spatialDataReady;
    const pt = point(userCoords); //  userCoords = [Lng, Lat]

    //country level
    const foundCountry = countriesGeoJson.features.find(country => 
        booleanPointInPolygon(pt, country)
    );
    if (!foundCountry){
        console.log(`No country found for: ${userCoords}`);
        setCoarseLocation("No country found");
        return ;
    }
    //update coarse location
    current_coarse_location = foundCountry.properties["COUNTRY"];
    //if in USA, find state 
    if (foundCountry.properties["COUNTRY"] == "United States"){
        //State level
        const foundState = statesGeoJson.features.find(state => 
            booleanPointInPolygon(pt, state)
        );
        if(!foundState){
            console.log(`No state found for ${userCoords}`);
            setCoarseLocation("No state found");
            return ;
        }
        //update coarseLocation
        current_coarse_location += ", " + foundState.properties["name"];
    }
    else if(foundCountry.properties["COUNTRY"] == "Canada"){
        //province level
        const foundProvince = canadaProvincesJson.features.find(province => 
            booleanPointInPolygon(pt, province)
        );
        if(!foundProvince){
            console.log(`No province found for ${userCoords}`);
            setCoarseLocation("no province found");
            return ;
        }
        //update coarseLocation
        current_coarse_location += ", " + foundProvince.properties["name"];
    }
    else{
        current_coarse_location += ", ";
    }
    if (foundCountry.properties["COUNTRY"] == "Canada" || foundCountry.properties["COUNTRY"] == "United States"){
        //find watershed id for US and Canada
        const watershedId = aqueductIdsGeoJson.features.find(string_id => 
            booleanPointInPolygon(pt, string_id)
        );
        if(!watershedId){
            console.log(`No watershed id found for ${userCoords}`);
            setCoarseLocation("no watershed found");
            return ;
        }
        //update coarseLocation
        current_coarse_location += ", " + watershedId.properties["string_id"];
    }
    setCoarseLocation(current_coarse_location);
}
