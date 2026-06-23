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
//or: npm run build

import { encodingForModel } from "js-tiktoken";

// Generate or retrieve encryption key
async function getEncryptionKey() {
  const result = await chrome.storage.local.get(["enc_key"]);
  if (result.enc_key) {
    const rawKey = Uint8Array.from(atob(result.enc_key), c => c.charCodeAt(0));
    return crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"]);
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exported = await crypto.subtle.exportKey("raw", key);
  await chrome.storage.local.set({ enc_key: btoa(String.fromCharCode(...new Uint8Array(exported))) });
  return key;
}

// Encrypt before storing
async function encryptData(data) {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return JSON.stringify({ iv: btoa(String.fromCharCode(...iv)), data: btoa(String.fromCharCode(...new Uint8Array(encrypted))) });
}

// Decrypt after retrieving
async function decryptData(stored) {
  const key = await getEncryptionKey();
  const { iv, data } = JSON.parse(stored);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Uint8Array.from(atob(iv), c => c.charCodeAt(0)) },
    key,
    Uint8Array.from(atob(data), c => c.charCodeAt(0))
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

async function getStoredUserId() {
  const raw = await chrome.storage.local.get(["user_id"]);
  const result = raw.user_id ? await decryptData(raw.user_id) : null;
  return result || null;
}

async function setStoredUserId(userId) {
  await chrome.storage.local.set({ user_id: await encryptData(userId) });
}

async function getStoredUserData() {
  const raw = await chrome.storage.local.get(["user_data"]);
  const result = raw.user_data ? await decryptData(raw.user_data) : null;
  return result || null;
}

async function setStoredUserData(userData) {
  await chrome.storage.local.set({ user_data: await encryptData(userData) });
}

//receive data from content.js, calculate tokens, and send and receive data from server
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request?.action === "COUNT_TOKENS") {
    //get responses and location
    let responses = request.text;
    let userLocation = request.location; //"country, US state, watershed id"
    
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

        console.log("tokens calculated in background = " + tokenCount);
        // console.log("location = " + userLocation);

        const existingUserId = await getStoredUserId();
        // console.log("stored user_id =", existingUserId);

        const payload = {
          file_name: "impacts.csv",
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

        console.log("Sending data to aiimpacttracker.cs");
        // console.log("payload =", payload);

        fetch("https://aiimpacttracker.cs.haverford.edu/api/write-csv2/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
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
            // console.log("server response data =", data);

            await chrome.storage.local.set({ user_data: await encryptData(data.user_data) });
            // console.log("Saved user_data:", data.user_data);
              
            if (data.request_id && !existingUserId) {
              await setStoredUserId(data.request_id);
              // console.log("Saved user_id:", data.request_id);
            }
            sendResponse({ ok: true, tokenCount, data });

            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
          })
          .catch((err) =>
            sendResponse({ ok: false, tokenCount, error: err.message })
          );
      })();  
      return true;
    }
  }
  else if (request?.action === "COUNT_IMAGES"){
    let height = request.height;
    let width = request.width;
    let userLocation = request.location;

    if(height == null || width == null){
      //No response found
      console.log("No image found");
      return;
    }
    else {
      (async () => {
        const existingUserId = await getStoredUserId();
        // console.log("stored user_id =", existingUserId);
        const payload = {
          file_name: "impacts.csv",
          data: [
            {
              height: height,
              width: width,
              location: userLocation,
              date: new Date().toLocaleDateString("en-US"),
            },
          ],
        };
        if (existingUserId) {
          payload.user_id = existingUserId;
        }
        fetch("https://aiimpacttracker.cs.haverford.edu/api/write-csv-img/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
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
            // console.log("server response data =", data);

            await chrome.storage.local.set({ user_data: await encryptData(data.user_data) });
            // console.log("Saved user_data:", data.user_data);
                
            if (data.request_id && !existingUserId) {
              await setStoredUserId(data.request_id);
              // console.log("Saved user_id:", data.request_id);
            }
            sendResponse({ ok: true, data });

            chrome.action.setBadgeText({ text: '!' });
              chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
            })
          .catch((err) =>
            sendResponse({ ok: false, error: err.message })
          );
      })();
      return true;
    }
  }
  else if (request?.action === "RELOAD_USER_DATA") {
    (async () => {
      try {
        const payload = {
          file_name: "impacts.csv",
          data: [] // Only sending the user id context, no new token data
        };

        if (request.userId) {
          payload.user_id = request.userId;
        }

        // console.log("Reload button triggered sync. Payload:", payload);

        const res = await fetch("https://aiimpacttracker.cs.haverford.edu/api/reload-extension-data/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY, 
            "X-From-Extension": "1",
          },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
        const data = JSON.parse(text);

        // Save the updated server data back to local storage
        await chrome.storage.local.set({ user_data: await encryptData(data.user_data) });
        // console.log("Reload synced user_data successfully.");

        // Clear notification badge since user manually updated
        chrome.action.setBadgeText({ text: '' });

        sendResponse({ success: true });
      } catch (err) {
        console.error("Reload sync failed:", err.message);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keeps the message channel open for the async response
  }
});