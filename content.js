console.log("content service worker loaded");

let streamTimer;

// Keep track of which message elements we've already scraped (a set containing
    // message ids)
const seenMessages = new Set(); 
let userLocation = "waiting for location...";
let countyGeoJSON = null;

// Load the counties file once when the script starts
fetch(chrome.runtime.getURL('Pennsylvania_County_Boundaries.geojson'))
    .then(response => response.json())
    .then(json => {
        countyGeoJSON = json;
        console.log("County boundaries loaded from directory!");
    })
    .catch(err => console.error("Failed to load counties.json:", err));


// Function to find and store saved chats
(function() {
    // track current/last url
    let lastUrl = location.href;

    // Setup the listener for URL change
    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log("URL Changed to:", url);
            getExistingMessages();
        }
    });

    // Start watching the html 'body' for any changes (which happens during navigation)
    observer.observe(document.body, { subtree: true, childList: true });

    //scan for existingMessages in the current html page (e.g. saved chats)
    const getExistingMessages = () => {
        //wait for page to load (5 seconds)
        setTimeout(() => {
            //last part (p tags) of a response
            const existing_p_tags = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');
            console.log(existing_p_tags);

            existing_p_tags.forEach((p) => {
                //find the closest larger div class
                const existing_messageContainer = p.closest('.markdown');
                //text of the response
                existing_contents = existing_messageContainer.innerText;
                //create a message id for the response to store in seenMessages
                existing_message_id = getMessageId2(existing_messageContainer);

                if(existing_message_id && !seenMessages.has(existing_message_id)){
                    console.log("existing message id: " + existing_message_id);
                    // console.log("Existing text!!!!!!!!: " +existing_contents);
                    //add the message id to seenMessages if not already seen
                    seenMessages.add(existing_message_id);
                }
            });
        }, 5000);
    };

    // Run once on initial url load
    if (document.readyState === 'complete') getExistingMessages();
    else window.addEventListener('load', getExistingMessages); //wait for loading
})();

//create an Id for a chat response - attempt 2
function getMessageId2(container) {
    // 1. Normalize the string to a standard form (handles different emoji encodings)
    // 2. Trim trailing/leading spaces
    // 3. Replace all "runs" of whitespace/newlines with a single space
    const cleanText = container.innerText
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' '); 

    // choose first 150 chars for the id
    // ignore the total length because it's inconsistent across URLs
    return cleanText.substring(0, 150);
}
//create an Id for a chat response - attempt 1
function getMessageId(container) {
    const p = container.querySelector('p');
    
    // If it doesn't have the "last-node" attribute, ignore it as it hasn't loaded
    if (!p.hasAttribute('data-is-last-node')) return null;

    const text = container.innerText.trim();

    // Pattern check: If it contains the placeholder "Writing", ignore it.
    if (text.includes("Writing Writing")) return null;

    // Normalize: Clean up whitespace and take a unique slice (150 chars)
    const cleanText = text.normalize('NFC').replace(/\s+/g, ' ');
    return cleanText.substring(0, 150);
}

const observer = new MutationObserver((mutations, obs) => {
    // Reset the timer every time a new "chunk" appears
    clearTimeout(streamTimer);

    // Look for the specific 'p' tag that signals the end of a response
    const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');
    // Check if gpt is still typing
    const isTyping = !!document.querySelector('button[aria-label="Stop generating"]');
    // Loop through all the tags (e.g. responses) found
    responseAnchors.forEach((p) => {
        // Only continue if dones typing
        if (p && !isTyping){
            // Navigate up to the main message container
            const messageContainer = p.closest('.markdown'); 

            if (messageContainer) {
                // Wait for text to stop generating
                 streamTimer = setTimeout(() => {
                    // Capture the text
                    const contents = messageContainer.innerText;
                    // create a message id
                    const message_id = getMessageId2(messageContainer);

                    // Check if this response has been seen before
                    if(message_id && !seenMessages.has(message_id)){
                        console.log("scraped message id: " + message_id);
                        seenMessages.add(message_id);
                        // console.log("Scraped Data:", contents);

                        // Extract lat/lng from userLocation
                        // const [lat, lng] = userLocation.split(',').map(Number);
    
                        // // find the matching county
                        // const pt = turf.point([lng, lat]); 
                        // const match = countyGeoJSON.features.find(feature => {
                        //     return turf.booleanPointInPolygon(pt, feature);
                        // });

                        // const countyName = match ? match.properties.NAME : "Not Found";

                        // Send to background.js
                        chrome.runtime.sendMessage({ 
                            action: "COUNT_TOKENS", 
                            text: contents ,
                            location: userLocation
                        });
                    }
                }, 5000);
            }
        }
    });
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
});

//function to get and send user location
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
    if (request.action === "GET_LOCATION") {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            sendResponse({
                lat: lat,
                lng: lng
            })
        },
        (error) => {
        sendResponse({ error: error.message });
        }
      );
    }
    return true; //keep channel open
});