//Now using a background.bundle.js file from manifest because we need to install the js-tiktoken library. Make edits in this file and then run the command below to bundle:
// npx esbuild background.js --bundle --outfile=dist/background.bundle.js --platform=browser --format=esm --loader:.wasm=file --external:chrome

console.log("background service worker loaded");
import { encodingForModel } from "js-tiktoken";

//receive data from content.js and send to server
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request?.action === "COUNT_TOKENS") {
    //get responses and location
    let responses = request.text;
    let userLocation = request.location; //"country, state, city"
    
    if(responses == null || responses.length == 0){
      //No response found
      console.log("No response found");
      return;
    }
    else {
      //creating encoder for gpt2 (as of now)
      const enc = encodingForModel("gpt2");

      //calculate tokens
      const tokens = enc.encode(responses);
      const tokenCount = tokens.length;
      //display tokens
      console.log("tokens calculated in background = " + tokenCount);
      console.log("location = " + userLocation);
        
      console.log("Sending data to gptfootprint.cs");
      fetch("http://gptfootprint.cs.haverford.edu/api/write-csv/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "dev_key_change_me",
          "X-From-Extension": "1",
        },
        body: JSON.stringify({
          file_name: "emissions.csv",
          data: [
            {
              tokens: tokenCount,
              location: userLocation,
              date: new Date().toLocaleDateString("en-US"),
            },
          ],
        }),
      })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
        return JSON.parse(text);
      })
      .then((data) => sendResponse({ ok: true, tokenCount, data }))
      .catch((err) => sendResponse({ ok: false, tokenCount, error: err.message }));
      return true;
    }
  }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("SW received:", request);

//   if (request?.type === "POST_EMISSION") {
//     getActiveTabLocation().then((loc) => {
//       const locationToUse = loc || "Unknown";
//       console.log("location = " + locationToUse)
      
//       fetch("http://165.82.168.3:8000/data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-API-Key": "dev_key_change_me",
//           "X-From-Extension": "1"
//         },
//         body: JSON.stringify({
//           file_name: "emissions.csv",
//           data: {
//             tokens: request.tokenCount,
//             location: locationToUse,
//             date: new Date().toLocaleDateString("en-US")
//           }
//         })
//       })
//         .then(async (res) => {
//           const text = await res.text();
//           if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
//           return JSON.parse(text);
//         })
//         .then((data) => sendResponse({ ok: true, data }))
//         .catch((err) => sendResponse({ ok: false, error: err.message }));
//     });
//     return true;
//   }

// });

//MOST RECENT WORKING VERSION!!!!!!!!!!!!!!!!!!!!
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

//   if (request?.action === "COUNT_TOKENS") {
//     //get responses
//     let responses = request.text;
    
//     if(responses == null || responses.length == 0){
//       //No response found
//       console.log("No response found");
//       return;
//     }
//     else {
//       //creating encoder for gpt2 (as of now)
//       const enc = encodingForModel("gpt2");

//       //calculate tokens
//       const tokens = enc.encode(responses);
//       const tokenCount = tokens.length;
//       //display tokens
//       console.log("tokens calculated in background = " + tokenCount);
    
//       getActiveTabLocation().then((loc) => {
//         const locationToUse = loc || "Unknown";
//         console.log("location = " + locationToUse)
        
//         fetch("http://165.82.168.3:8000/write-csv/", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-API-Key": "dev_key_change_me",
//             "X-From-Extension": "1",
//           },
//           body: JSON.stringify({
//             file_name: "emissions.csv",
//             data: [
//               {
//                 tokens: tokenCount,
//                 location: locationToUse,
//                 date: new Date().toLocaleDateString("en-US"),
//               },
//             ],
//           }),
//         })
//           .then(async (res) => {
//             const text = await res.text();
//             if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
//             return JSON.parse(text);
//           })
//           .then((data) => sendResponse({ ok: true, tokenCount, data }))
//           .catch((err) => sendResponse({ ok: false, tokenCount, error: err.message }));
//       });
//       return true;
//     }
//   }

// });





// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   //console.log("SW received:", request);

//   if (request?.action === "COUNT_TOKENS") {
//     //get responses
//     let responses = request.text;
    
//     //display responses in popup
//     if(responses == null || responses.length == 0){
//       //No response found
//       console.log("No response found");
//       return;
//     }
//     else {
//       //console.log("creating encoder");
//       //creating encoder for gpt2 (as of now)
//       const enc = encodingForModel("gpt2");

//       //calculate tokens
//       const tokens = enc.encode(responses);
//       const tokenCount = tokens.length;
//       //display tokens
//       console.log("tokens calculated in background = " + tokenCount);
    
//       getActiveTabLocation().then((loc) => {
//         const locationToUse = loc || "Unknown";
//         console.log("location = " + locationToUse)
        
//         fetch("http://165.82.168.3:8000/write-csv/", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "X-API-Key": "dev_key_change_me",
//             "X-From-Extension": "1",
//           },
//           body: JSON.stringify({
//             file_name: "emissions.csv",
//             data: [
//               {
//                 tokens: tokenCount,
//                 location: locationToUse,
//                 date: new Date().toLocaleDateString("en-US"),
//               },
//             ],
//           }),
//         })
//           .then(async (res) => {
//             const text = await res.text();
//             if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
//             return JSON.parse(text);
//           })
//           .then((data) => sendResponse({ ok: true, tokenCount, data }))
//           .catch((err) => sendResponse({ ok: false, tokenCount, error: err.message }));
//       });
//       return true;
//     }
//   }

// });

// // Function to get user location from content.js
// async function getActiveTabLocation() {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   if (!tab) return null;

//   try {
//     const response = await chrome.tabs.sendMessage(tab.id, { action: "GET_LOCATION" });
//     return response.error ? null : `${response.lat}, ${response.lng}`;
//   } catch (err) {
//     console.error("Could not reach content script:", err);
//     return null;
//   }
// }
// Handler to receive Models from content Script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
//   // 1. Filter for the specific message type from Content Script
//   if (request.action === "COUNT_TOKENS") {
//     //get responses
//     let responses = request.text;
    
//     //display responses in popup
//     if(responses == null || responses.length == 0){
//       //No response found
//       console.log("No response found");
//       return;
//     }
//     else {
//       console.log("creating encoder");
//       //creating encoder for gpt2 (as of now)
//       const enc = encodingForModel("gpt2");

//       //calculate tokens
//       const tokens = enc.encode(responses);
//       const tokenCount = tokens.length;
//       //display tokens
//       console.log("tokens calculated in background = " + tokenCount);

//       chrome.runtime.sendMessage({ type: "POST_EMISSION", tokenCount }, (resp) => {
//         if (chrome.runtime.lastError) {
//           console.error("sendMessage failed:", chrome.runtime.lastError.message);
//           return;
//         }
//         if (!resp?.ok) {
//           console.error(resp?.error);
//           return;
//         }
//         console.log(resp.data);
//       });
//     }
//   }
// });


