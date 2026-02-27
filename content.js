console.log("content service worker loaded");

let streamTimer;

// Keep track of which message elements we've already scraped
const seenMessages = new Set(); 

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

                    // Check if this response has been seen before
                    if(!seenMessages.has(contents)){
                        seenMessages.add(contents);
                        console.log("Scraped Data:", contents);

                        // Send to background.js
                        chrome.runtime.sendMessage({ 
                            action: "COUNT_TOKENS", 
                            text: contents 
                        });
                    }
                }, 2000);
            }
        }
    });
});

// Constantly observe webpage
observer.observe(document.body, {
  childList: true,
  subtree: true
});