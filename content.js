//Now bundling content.js: use this command after installing npm: 
// npx esbuild content.js --bundle --outfile=dist/content.bundle.js --platform=browser --format=iife --external:chrome

// console.log("content service worker loaded");

//import necessary libraries
import { sha256, sha224 } from 'js-sha256';

// Tell the library where esbuild moved the wasm file
// const wasmPath = chrome.runtime.getURL('dist/argon2.wasm'); 

let streamTimer;

// Keep track of which message elements we've already scraped (a set containing
    // message ids)
const getStoredIds = () => JSON.parse(localStorage.getItem('seenMessageIds') || '[]');
const seenMessages = new Set(getStoredIds());
// stores user location (lat,long) as a string (updates with user)
let userLocation = "waiting for location...";
//stores location data as string (country, state, city)
let location_data = "waiting for location data ...";
// let countyGeoJSON = null;

// Load the counties file once when the script starts
// fetch(chrome.runtime.getURL('Pennsylvania_County_Boundaries.geojson'))
//     .then(response => response.json())
//     .then(json => {
//         countyGeoJSON = json;
//         console.log("County boundaries loaded from directory!");
//     })
//     .catch(err => console.error("Failed to load counties.json:", err));


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
    if(text.length < 50){
        return sha256(text);
    }
    else{
        return sha256(text.substring(0,50));
    }
    // const finalHash = sha256(text.substring(0,50));
    // return finalHash;
}

const observer = new MutationObserver((mutations, obs) => {
    // Reset the timer every time a new "chunk" appears
    // clearTimeout(streamTimer);
    // Check if gpt is still typing
    const isTyping = !!document.querySelector('button[aria-label="Stop generating"]');
    if(!isTyping){
        // Look for the specific 'p' tag that signals the end of a response
        const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');        
        // Loop through all the tags (e.g. responses) found
        responseAnchors.forEach((p) => {
            // console.log("Found new p tag");
            // Only continue if done typing
            if (p){
                // Navigate up to the main message container
                const messageContainer = p.closest('.markdown'); 

                if (messageContainer) {
                    // Wait for text to stop generating
                    streamTimer = setTimeout(async () => {
                        // create a message id
                        const message_id = getMessageId(messageContainer);

                        // re-read the latest data from localStorage right before checking
                        // (handles the case where another tab just saved something)
                        const currentStorage = JSON.parse(localStorage.getItem('seenMessageIds') || '[]');

                        // Check if this response has been seen before
                        if(message_id && !seenMessages.has(message_id) && !currentStorage.includes(message_id)){
                            console.log("scraped message id: " + message_id);
                            seenMessages.add(message_id);
                            localStorage.setItem('seenMessageIds', JSON.stringify(Array.from(seenMessages)));

                            // Extract lat/lng from userLocation
                            // const [lat, lng] = userLocation.split(',').map(Number);
        
                            // // find the matching county
                            // const pt = turf.point([lng, lat]); 
                            // const match = countyGeoJSON.features.find(feature => {
                            //     return turf.booleanPointInPolygon(pt, feature);
                            // });

                            // const countyName = match ? match.properties.NAME : "Not Found";

                            // console.log(`Cleaned location data: ${location_data}`);
                            // Capture the text
                            const contents = messageContainer.innerText;
                            console.log("Scraped Data:", contents.substring(0,50));

                            // Send to background.js
                            chrome.runtime.sendMessage({ 
                                action: "COUNT_TOKENS", 
                                text: contents ,
                                location: location_data
                            });
                        }
                        else{
                            console.log("existing message id: " + message_id);
                            const contents = messageContainer.innerText;
                            console.log("existing Data:", contents.substring(0,50));
                        }
                    }, 5000);
                }
            }
        });
    }
});

// Constantly observe webpage
observer.observe(document.body, {
  childList: true,
  subtree: true
});

//run when a user's location changes and update global userLocation variable
navigator.geolocation.watchPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude; 
    
    //update the global variable as your specific string format
    userLocation = `${lat}, ${lng}`;
    //get location data (city, state, country)
    getLocation(lat,lng);
});

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