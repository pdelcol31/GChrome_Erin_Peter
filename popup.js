import { getEncoding, encodingForModel } from "js-tiktoken";
e = 2.71828;
batch = 8;
let getModel = document.getElementById('getModel');

let list = document.getElementById('response');

parameters = 800000;

// Handler to receive Models from content Script

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {

    //get responses
    let responses = request.contents;

    const enc = getEncoding("gpt2");

    const tokens = enc.encode(responses);

    alert(tokens);

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
    let [tab] = await chrome.tabs.query({active:
    true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func:   scrapeModelResponse,
    });
})

function scrapeModelResponse(){
    
    const response = document.querySelectorAll("p");

    const contents = Array.from(response)
        .map(p => p.textContent)
        .join(" ");

    chrome.runtime.sendMessage({contents});
}



//https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
//https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
