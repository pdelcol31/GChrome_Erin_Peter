//**** Spring 2026
// This file contains the code to receive data (text of chatGPT response and coarse
//  location) from content.js, calculate the number of tokens from the response 
// text, and send the token count, coarse user location, and current data to our 
// server. This file also handles the server's response and stores a unique, 
// randomized user id to be sent with the other data in messages to the server. To 
// perform necessary functionality, this file is bundled with imported libraries 
// into dist/bacakground.bundle.js (which is the file included in Manifest.json). If
//  making edits to this file, make sure to use the command below to bundle in order
//  to see changes in the chrome extension. */

// Use this command after installing npm:
// npx esbuild background.js --bundle --outfile=dist/background.bundle.js --platform=browser --format=esm --loader:.wasm=file --external:chrome

console.log("background service worker loaded");
import { encodingForModel } from "js-tiktoken";

async function getStoredUserId() {
  const result = await chrome.storage.local.get(["user_id"]);
  return result.user_id || null;
}

async function setStoredUserId(userId) {
  await chrome.storage.local.set({ user_id: userId });
}

async function getStoredUserData() {
  const result = await chrome.storage.local.get(["user_data"]);
  return result.user_data || null;
}

async function setStoredUserData(userData) {
  await chrome.storage.local.set({ user_data: userData });
}

//receive data from content.js, calculate tokens, and send and receive data from server
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request?.action === "COUNT_TOKENS") {
    //get responses and location
    let responses = request.text;
    let userLocation = request.location; //"country, US state, PA county"
    
    if(responses == null || responses.length == 0){
      //No response found
      console.log("No response found");
      return;
    }
    else {
      (async () => {
        // creating js-tiktoken encoder
        const enc = encodingForModel("gpt-5-chat-latest");

        // calculate tokens
        const tokens = enc.encode(responses);
        const tokenCount = tokens.length;

        // display tokens
        console.log("tokens calculated in background = " + tokenCount);
        console.log("location = " + userLocation);

        const existingUserId = await getStoredUserId();
        console.log("stored user_id =", existingUserId);

        const payload = {
          file_name: "emissions.csv",
          data: [
            {
              tokens: tokenCount,
              location: userLocation,
              date: new Date().toLocaleDateString("en-US"),
            },
          ],
        };

        if (existingUserId) {
          payload.user_id = existingUserId;
        }

        console.log("Sending data to gptfootprint.cs");
        console.log("payload =", payload);

        fetch("http://gptfootprint.cs.haverford.edu/api/write-csv/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": "dev_key_change_me",
            "X-From-Extension": "1",
          },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
            return JSON.parse(text);
          })
          .then(async (data) => {
            console.log("server response data =", data);

            await chrome.storage.local.set({ user_data: data.user_data });
            console.log("Saved user_data:", data.user_data);
              
            if (data.request_id && !existingUserId) {
              await setStoredUserId(data.request_id);
              console.log("Saved user_id:", data.request_id);

              const check = await chrome.storage.local.get(["requst_id"]);
              console.log("storage after save =", check);
            }
            sendResponse({ ok: true, tokenCount, data });
          })
          .catch((err) =>
            sendResponse({ ok: false, tokenCount, error: err.message })
          );
      })();
      return true;
    }
  }
});