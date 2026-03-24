//To get this file to actually work, need to run an esbuild command that will 
//bundle this file with its imports. Here is the command I run:

//npx esbuild popup.js --bundle --outfile=dist/popup.bundle.js --platform=browser --format=esm --loader:.wasm=file --external:chrome  

//Here is a resource: https://esbuild.github.io/getting-started/#your-first-bundle 

//https://dev.to/anilkumarum/3-ways-to-add-npm-package-in-chrome-extension-3e3b
//https://dev.to/ramunarasinga-11/use-the-tiktoken-package-to-tokenize-text-for-openai-llms-3f34
// import { encodingForModel } from "js-tiktoken";

// let getModel = document.getElementById('getModel');

// let list = document.getElementById('response');


// Handler to receive Models from content Script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {
//     //get responses
//     let responses = request.contents;
    
//     //display responses in popup
//     if(responses == null || responses.length == 0){
//         //No response found
//         let li = document.createElement('li');
//         li.innerText = "No response Found";
//         list.appendChild(li);
//     }
//     else {
//         console.log("creating encoder");
//         //creating encoder for gpt2 (as of now)
//         const enc = encodingForModel("gpt2");
         
//         //calculate tokens
//         const tokens = enc.encode(responses);
//         const tokenCount = tokens.length;
//         //display tokens
//         console.log("tokens = " + tokenCount);
//         alert("tokens = " + tokenCount);

//         chrome.runtime.sendMessage({ type: "POST_EMISSION", tokenCount }, (resp) => {

//             if (chrome.runtime.lastError) {
//                 console.error("sendMessage failed:", chrome.runtime.lastError.message);
//                 alert("sendMessage failed: " + chrome.runtime.lastError.message);
//                 return;
//             }

//             if (!resp?.ok) {
//               console.error(resp?.error);
//               alert("Failed: " + (resp?.error ?? "unknown error"));
//               return;
//             }
//             console.log(resp.data);
//             alert("Sent!");
//           });
//         //carbonEmission = carbon_Calculator()

//         let li = document.createElement('li');
//         li.innerText = responses;
//         list.appendChild(li);
//     }
// });


document.addEventListener("DOMContentLoaded", async ()=> {
    const userDiv = document.getElementById('userFootprint');
    const button = document.getElementById('gptFootprintButton');

    // Example: Update the text immediately on load
    //I think we can mess with this to update with an incoming message somehow?
    const result = await chrome.storage.local.get(["user_data"]);
    const userData = result.user_data || "Your Data will update as you use the extension";

    document.getElementById("userdata").textContent = userData;

    button.addEventListener('click', function() {
        chrome.tabs.create({ url: 'http://gptfootprint.cs.haverford.edu/' });
    });

});


// getModel.addEventListener("click", async () => {

//     chrome.runtime.sendMessage({event: 'onstart' })

//     let [tab] = await chrome.tabs.query({active:
//     true, currentWindow: true});

//     chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         func:   scrapeModelResponse,
//     });
// })

// function scrapeModelResponse(){
//     console.log("scrapeModelResponse running");
    
//     const response = document.querySelectorAll("p");

//     const contents = Array.from(response)
//         .map(p => p.textContent)
//         .join(" ");
    
//     chrome.runtime.sendMessage({event: 'onstop' })
//     chrome.runtime.sendMessage({contents});
// }



//https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
//https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
