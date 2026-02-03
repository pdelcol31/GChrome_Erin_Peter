let scrapeChat = document.getElementById('scrapeChat');
let getModel = document.getElementById('getModel');

let list = document.getElementById('emaillist');
let mList = document.getElementById('modelList');

// Handler to receive Models from content Script

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {

    // get emails
    let emails = request.emails;
    
    let responses = request.contents;

    if (responses == null || responses.length == 0) {
        // no response
        let li2 = document.createElement("li2");
        li2.innerText = "No response found";
        list.appendChild(li2);
    } else {
        //
        responses.forEach((response) => {
            let li2 = document.createElement("li2");
            li2.innerText = response;
            list.appendChild(li2);s
        });
    }
    // Display emails on popup
    if (emails == null || emails.length == 0) {
        // no emails
        let li = document.createElement("li");
        li.innerText = "No emails found";
        list.appendChild(li);
    } else {
        //display emails
        emails.forEach((email) => {
            let li = document.createElement("li");
            li.innerText = email;
            list.appendChild(li);
        });
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

    alert("check 0")
    
    const response = document.queryselector(".whitespace-pre-wrap");

    alert("check 1")

    const contents = response.innerHTML;

    alert("check 2")

    chrome.runtime.sendMessage({contents});
}

// Button's click event listener
scrapeChat.addEventListener("click", async () => {

    // Get current active tab
    let [tab] = await chrome.tabs.query({active: 
    true, currentWindow: true});

    // Execute script to parse emails on page
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func:  scrapeChatResponse,
    });
})  

function scrapeChatResponse(){
    
    //RegEx to parse emails from html code
    const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
 
    // Parse emails from the HTML of the page
    let emails = document.body.innerHTML.match(emailRegEx);

    // send emails to popup
    chrome.runtime.sendMessage({emails});
} 

//https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
//
