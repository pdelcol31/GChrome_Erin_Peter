document.addEventListener("DOMContentLoaded", async ()=> {
    const userDiv = document.getElementById('userFootprint');
    const linkButton = document.getElementById('gptFootprintButton');
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
    totTokensButton.innerText = userDataChars[1];
    avgTokensButton.innerText = userDataChars[2];
    totCarbonButton.innerText = userDataChars[3];
    avgCarbonButton.innerText = userDataChars[4];
    milesButton.innerText = userDataChars[5];
    totWaterButton.innerText = userDataChars[6];
    avgWaterButton.innerText = userDataChars[7];
    bottlesButton.innerText = userDataChars[8];

    linkButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'http://gptfootprint.cs.haverford.edu/' });
    });

});