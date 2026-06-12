document.addEventListener("DOMContentLoaded", async ()=> {
    const userDiv = document.getElementById('userFootprint');
    const linkButton = document.getElementById('aiImpactTrackerButton');
    const welcomeButton = document.getElementById('welcomeButton');
    const totTokensButton = document.getElementById('totTokensButton');
    const avgTokensButton = document.getElementById('avgTokensButton');
    const totCarbonButton = document.getElementById('totCarbonButton');
    const avgCarbonButton = document.getElementById('avgCarbonButton');
    const milesButton = document.getElementById('milesButton');
    const totWaterButton = document.getElementById('totWaterButton');
    const avgWaterButton = document.getElementById('avgWaterButton');
    const bottlesButton = document.getElementById('bottlesButton');

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

    // document.getElementById("userdata").textContent = userData;
    welcomeButton.innerText = userDataChars[0];
    totTokensButton.innerText = "Tokens: \n" + userDataChars[1] +"\n"+ userDataChars[2];
    // avgTokensButton.innerText = userDataChars[2];
    totCarbonButton.innerText = "Carbon: \n" + userDataChars[3] + "\n" + userDataChars[4] + "\n" + userDataChars[5];
    // avgCarbonButton.innerText = userDataChars[4];
    // milesButton.innerText = userDataChars[5];
    totWaterButton.innerText = "Water: \n" + userDataChars[6] + "\n"+ userDataChars[7] + "\n" + userDataChars[8];
    // avgWaterButton.innerText = userDataChars[7];
    // bottlesButton.innerText = userDataChars[8];

    linkButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'http://aiimpacttracker.cs.haverford.edu/' });
    });

});