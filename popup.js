import "tiktoken";
let getModel = document.getElementById('getModel');

let list = document.getElementById('response');

parameters = 800000;

// Handler to receive Models from content Script

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {

    //get responses
    let responses = request.contents;

    num_tokens = num_tokens_from_string(responses, "gpt-4o-mini"); // will need to pull model somehow

    alert(num_tokens);

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
