//To get this file to actually work, need to run an esbuild command that will 
//bundle this file with its imports. Here is the command I run:

//npx esbuild popup.js --bundle --outfile=dist/popup.bundle.js --platform=browser --format=esm --loader:.wasm=file --external:chrome  

//Here is a resource: https://esbuild.github.io/getting-started/#your-first-bundle 

//https://dev.to/anilkumarum/3-ways-to-add-npm-package-in-chrome-extension-3e3b
//https://dev.to/ramunarasinga-11/use-the-tiktoken-package-to-tokenize-text-for-openai-llms-3f34
import { encodingForModel } from "js-tiktoken";


//import the encoding type we want to use - this will depend on the model type
//cl100k is used by 
//https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken/
// import cl100k_base from "./node_modules/js-tiktoken/dist/ranks/cl100k_base.js";
// import { Tiktoken } from "./node_modules/js-tiktoken/dist/index.cjs";
// import {getEncoding, encodingForModel } from "./node_modules/js-tiktoken/dist/index.cjs";
// import {getEncoding, encodingForModel } from "Tiktoken";
//import { getEncoding, encodingForModel } from "./node_modules/js-tiktoken";

let getModel = document.getElementById('getModel');

let list = document.getElementById('response');


// Handler to receive Models from content Script

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {

    //get responses
    let responses = request.contents;

    //create encoder for token detection -- for now giving gp2 as model
    // const enc = new Tiktoken({ model: "gpt2" });
    //create encoder for token detection -- for now giving gp2 as model
    // const enc = new Tiktoken({ model: "gpt2" });
    // const enc = new Tiktoken(
    //     cl100k_base.bpe_ranks,
    //     cl100k_base.special_tokens,
    //     cl100k_base.pat_str
    // );
    console.log("creating encoder");
    //creating encoder for gpt2 (as of now)
    const enc = encodingForModel("gpt2");

    //calculate tokens
    const tokens = enc.encode(responses);
    //display tokens
    console.log("tokens = " + tokens.length);
    alert("tokens = " + tokens.length);

    //carbonEmission = carbon_Calculator()

    //display responses in popup
    if(responses == null || responses.length == 0){
        //No response found
        let li = document.createElement('li');
        li.innerText = "No response Found";
        list.appendChild(li);
    }
    else {
        let li = document.createElement('li');
        li.innerText = responses;
        list.appendChild(li);
    }

    //free the encoder when done
    enc.free();
});
/*
function carbon_Calculator(parameters, tokens){
    alpha = 1.17 * 10^-6;
    lambda = -1.12 * 10^-2;
    beta = 4.05 * 10^-5;
    powerConsumption = 1.2; // Kw
    latency = 1 // NEED TO UPDATE just a Placeholder

    //
    E_GPU = tokens * alpha * e^(beta * batch)* parameters + lambda;

    //
    E_Server_per_GPU = latency * powerConsumption * (GPU/NumGPU) * (1/batch);

    //

    return;
}*/

getModel.addEventListener("click", async () => {
    chrome.runtime.sendMessage({event: 'onstart' })

    let [tab] = await chrome.tabs.query({active:
    true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func:   scrapeModelResponse,
    });
})

function scrapeModelResponse(){
    console.log("scrapeModelResponse running");
    
    const response = document.querySelectorAll("p");

    const contents = Array.from(response)
        .map(p => p.textContent)
        .join(" ");
    
    chrome.runtime.sendMessage({event: 'onstop' })
    chrome.runtime.sendMessage({contents});
}



//https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
//https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
