console.log("content service worker loaded");

let streamTimer;

// Keep track of which message elements we've already scraped
const seenMessages = new Set(); 

// Function to find and store saved chats
// const baselineExistingMessages = () => {

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

    // Start watching the 'body' for any changes (which happens during navigation)
    observer.observe(document.body, { subtree: true, childList: true });

    //scan for existingMessages in the current html page (e.g. saved chats)
    const getExistingMessages = () => {
        console.log("IN getExistingMessages");
        setTimeout(() => {
            const existing_p_tags = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');
            console.log(existing_p_tags);
            existing_p_tags.forEach((p) => {
                const existing_messageContainer = p.closest('.markdown');
                existing_contents = existing_messageContainer.innerText;
                existing_message_id = getSpecialCharId(existing_messageContainer);
                // if(!seenMessages.has(existing_contents)){
                if(existing_message_id && !seenMessages.has(existing_message_id)){
                    console.log("existing message id: " + existing_message_id);
                    // console.log("Existing text!!!!!!!!: " +existing_contents);
                    // seenMessages.add(existing_contents);
                    seenMessages.add(existing_message_id);
                }
            });
        }, 5000);
    };

    // Run once on initial url load
    if (document.readyState === 'complete') getExistingMessages();
    else window.addEventListener('load', getExistingMessages); //wait for loading
})();

function getSpecialCharId(container) {
    // 1. Normalize the string to a standard form (handles different emoji encodings)
    // 2. Trim trailing/leading spaces
    // 3. Replace all "runs" of whitespace/newlines with a single space
    const cleanText = container.innerText
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' '); 

    // Use a large enough slice to be unique (e.g., first 150 chars)
    // We ignore the total length because it's inconsistent across URLs
    return cleanText.substring(0, 150);
}
function getMessageId(pTag) {
    const p = container.querySelector('p');
    
    // 1. STRICT CHECK: If it doesn't have the "last-node" attribute, ignore it.
    if (!p.hasAttribute('data-is-last-node')) return null;

    const text = container.innerText.trim();

    // 2. PATTERN CHECK: If it contains the placeholder "Writing", ignore it.
    // Adjust "Writing" to whatever specific placeholder your site uses.
    if (text.includes("Writing Writing")) return null;

    // 3. NORMALIZE: Clean up whitespace and take a unique slice
    const cleanText = text.normalize('NFC').replace(/\s+/g, ' ');
    return cleanText.substring(0, 150);

    // const text = pTag.innerText.trim();
    // const dataEnd = pTag.getAttribute('data-end') || text.length; // Use the attribute or actual length
    
    // // Create a fingerprint: "Length-First30Chars"
    // return `${dataEnd}-${text.substring(0, 30)}`;
}
// getExistingMessages();

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
                    const message_id = getSpecialCharId(messageContainer);

                    // Check if this response has been seen before
                    if(message_id && !seenMessages.has(message_id)){
                        console.log("scraped message id: " + message_id);
                    // if(!seenMessages.has(contents)){
                        seenMessages.add(message_id);
                        // console.log("Scraped Data:", contents);

                        // Send to background.js
                        chrome.runtime.sendMessage({ 
                            action: "COUNT_TOKENS", 
                            text: contents 
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