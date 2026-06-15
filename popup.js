document.addEventListener("DOMContentLoaded", async ()=> {
    const userDiv = document.getElementById('userFootprint');
    const linkButton = document.getElementById('aiImpactTrackerButton');
    const welcomeButton = document.getElementById('welcomeButton');
    const TokensButton = document.getElementById('TokensButton');
    const CarbonButton = document.getElementById('CarbonButton');
    const WaterButton = document.getElementById('WaterButton');

    const result = await chrome.storage.local.get(["user_data"]);
    const userData = result.user_data || "Your Data will update as you use the extension";
    console.log("incoming message:" + result.user_data);
    userDataChars = ['','','','','','','','',''];
    index = 0;
    for (const char of userData) {
        if (char == '|'){
            index += 1;
        }
        else{
            userDataChars[index] += char;
        }
    }

    welcomeButton.innerText = userDataChars[0];
    TokensButton.innerText = "Tokens: \nYour total:" + userDataChars[1].slice(14) +"\nYour daily average: "+ userDataChars[2].slice(18);
    CarbonButton.innerText = "Carbon: \nYour total:" + userDataChars[3].slice(23,-1) + ", " + userDataChars[5].slice(20) + "\nYour daily average: " + userDataChars[4].slice(18);
    WaterButton.innerText = "Water: \nYour total:" + userDataChars[6].slice(22, -1) + ", " + userDataChars[8].slice(21) + " water bottles\nYour daily average:" + userDataChars[7].slice(17);

    linkButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://aiimpacttracker.cs.haverford.edu/' });
    });

});