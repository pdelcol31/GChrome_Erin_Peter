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
import { AutoTokenizer, env } from '@huggingface/transformers';

//Configure the Hugging Face environment to look ONLY inside this extension 
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = chrome.runtime.getURL(''); 
let gemmaTokenizer = null;

let cachedEncryptionKey = null;
let encryptionKeyPromise = null;

//initialize Google Gemma tokenizer
async function initTokenizer() {
  if (gemmaTokenizer) return gemmaTokenizer;

  try {
    // point to the folder name in dist directory
    gemmaTokenizer = await AutoTokenizer.from_pretrained('models/gemma');
    return gemmaTokenizer;
  } catch (error) {
    console.error("Failed to load local Hugging Face Gemma tokenizer:", error);
    return null;
  }
}

//create notification (for new data) badge
async function setCornerCircleBadge(text, badgeColor, textColor) {
  const canvasSize = 32;
  
  // fetch and load your base extension logo image
  const response = await fetch(chrome.runtime.getURL('images/icon32.png'));
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  // draw your main logo image as the background layer
  ctx.drawImage(imageBitmap, 0, 0, canvasSize, canvasSize);

  // define dimensions and position (shifted closer to the true corner edges)
  const circleRadius = 7; 
  const circleX = 25; // Adjusted to mimic the overlapping layout next to it
  const circleY = 25; 

  // configure the drop shadow effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'; // Semi-transparent black shadow
  ctx.shadowBlur = 3;                      // Softness of the shadow edge
  ctx.shadowOffsetX = 0;                   // Centered shadow offset
  ctx.shadowOffsetY = 1;                   // Push shadow slightly downwards

  // draw the solid circular badge background (with shadow applied)
  ctx.fillStyle = badgeColor;
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
  ctx.fill();

  // turn off shadows for the border and text layers so they stay crisp
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // add the thick white stroke border around the circle ring
  ctx.strokeStyle = '#FFFFFF'; // Crisp white border color
  ctx.lineWidth = 2.5;         // Match the border thickness of the reference icon
  ctx.stroke();

  // configure text settings
  ctx.fillStyle = textColor;
  ctx.font = 'bold 9px Arial'; // Slightly smaller font to balance inside the bordered ring
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // draw the text inside the center of the badge
  ctx.fillText(text, circleX, circleY);

  // apply the combined image data to your extension icon
  const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  await chrome.action.setIcon({ imageData: imageData });
}

//clear notification badge
async function clearBadgeOnly() {
  const size = 32;
  const logoSize = 32; 
  
  const response = await fetch(chrome.runtime.getURL('images/icon32.png'));
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);
  
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(imageBitmap, 0, 0, logoSize, logoSize);
  
  const imageData = ctx.getImageData(0, 0, size, size);
  await chrome.action.setIcon({ imageData: imageData });
}

//lookup encryption key
function getEncryptionKey() {
  // If a key lookup is already in progress (or finished), return that exact same promise!
  if (encryptionKeyPromise) {
    return encryptionKeyPromise;
  }

  // assign the entire async execution chain to the promise cache
  encryptionKeyPromise = (async () => {
    const result = await chrome.storage.local.get(["enc_key"]);
    
    if (result.enc_key) {
      const rawKey = Uint8Array.from(atob(result.enc_key), c => c.charCodeAt(0));
      return await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt", "decrypt"]);
    }
    
    // First-time setup (generation)
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const exported = await crypto.subtle.exportKey("raw", key);
    await chrome.storage.local.set({ enc_key: btoa(String.fromCharCode(...new Uint8Array(exported))) });
    return key;
  })();

  return encryptionKeyPromise;
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
    let userLocation = request.location; //"country, US state / Canada province, watershed id"
    let current_model = request.model;
    let payload = "";
    let tokenCount = 0;
    
    if(responses == null || responses.length == 0){
      //No response found
      console.log("No response found");
      return;
    }
    else {
      (async () => {
        const existingUserId = await getStoredUserId();
        let fetch_url="";

        if(current_model == "gpt"){
          // creating js-tiktoken encoder
          const enc = encodingForModel("gpt-5-chat-latest");

          // calculate tokens
          const tokens = enc.encode(responses);
          tokenCount = tokens.length;

          console.log("tokens calculated in background = " + tokenCount);
          // console.log("location = " + userLocation);

          payload = {
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
          fetch_url = "https://aiimpacttracker.cs.haverford.edu/api/write-csv2/";
        } else{ //google ai overview and ai mode
          // creating huggingface/transformers encoder
          const tokenizer = await initTokenizer();
          if (!tokenizer) return 0;

          // Encode the text into an ID array
          const encoded = tokenizer.encode(responses);
          tokenCount = encoded.length; //get number of tokens

          console.log("tokens calculated in background = " + tokenCount);

          payload = {
            file_name: "impacts.csv",
            data: [
              {
                tokens: tokenCount,
                location: userLocation,
                model: current_model,
                date: new Date().toLocaleDateString("en-US"),
              },
            ],
          };

          if (existingUserId) {
            payload.user_id = existingUserId;
          }

          console.log("Sending google ai overview data to aiimpacttracker.cs");
          fetch_url = "https://aiimpacttracker.cs.haverford.edu/api/write-csv-google/"
        }
      if(payload == ""){console.log("Payload is undefined"); return}
        fetch(fetch_url, {
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
            }
            sendResponse({ ok: true, tokenCount, data });

            setCornerCircleBadge("", "#FF0000", "#FFFFFF").catch(console.error);
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

            await chrome.storage.local.set({ user_data: await encryptData(data.user_data) });
                
            if (data.request_id && !existingUserId) {
              await setStoredUserId(data.request_id);
            }
            sendResponse({ ok: true, data });
            console.log("got to setting badge");
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

        // Clear notification badge since user manually updated
        clearBadgeOnly();

        sendResponse({ success: true });
      } catch (err) {
        console.error("Reload sync failed:", err.message);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keeps the message channel open for the async response
  }
});