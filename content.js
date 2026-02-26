console.log("content service worker loaded");

// Keep track of which message elements we've already scraped
const seenMessages = new WeakSet(); 

// Define what to do when a change is detected
const observer = new MutationObserver((mutations, obs) => {
    // 1. Look for the specific 'p' tag that signals the start of a response
    const responseAnchors = document.querySelectorAll('p[data-is-last-node="true"], p[data-is-last-node=""]');
    const isTyping = !!document.querySelector('button[aria-label="Stop generating"]');
    responseAnchors.forEach((p) => {
        // 2. Only proceed if we haven't processed this specific DOM node yet
        if (p && !isTyping && !seenMessages.has(p)) {
      
            // 3. Navigate up to the main message container you identified
            const messageContainer = p.closest('.markdown'); 

            if (messageContainer) {
                // Mark as seen immediately so we don't trigger again while it's typing
                seenMessages.add(p);
                console.log("seenMessage: " + seenMessages);

                setTimeout(() => {
                    // 4.   Capture the text
                    const contents = messageContainer.innerText;
                    console.log("Scraped Data:", contents);

            
                    // 5. Send to background.js
                    chrome.runtime.sendMessage({ 
                        action: "COUNT_TOKENS", 
                        text: contents 
                    });
                }, 1000);
                
                // Scrape text from all <p> tags inside this specific response container
                // const paragraphs = messageContainer.querySelectorAll('p');
                // const contents = Array.from(paragraphs)
                //     .map(p => p.textContent)
                //     .join(" ");
                // console.log(contents);
                // // Send to background script for tokenization
                // chrome.runtime.sendMessage({contents});
            }
        }
    });
});


// Start watching the entire document for added nodes
observer.observe(document.body, {
  childList: true,
  subtree: true
});