chrome.action.setBadgeText({ text: '' });

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

async function updateUIWithLatestData() {
    const userDiv = document.getElementById('userFootprint');
    const welcomeButton = document.getElementById('welcomeButton');
    const TokensButton = document.getElementById('TokensButton');
    const CarbonButton = document.getElementById('CarbonButton');
    const WaterButton = document.getElementById('WaterButton');

    const result = await chrome.storage.local.get(["user_data"]);
    const userData = result.user_data ? await decryptData(result.user_data) : "Welcome to AI Impact Tracker!";

    userDataChars = ['','','','','','','','','','',''];
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

    CarbonButton.innerHTML = `
    <b>Carbon</b>
    <table>
        <tr><td>Your total:</td><td>${userDataChars[3].slice(23,-1)}</td><td><img src="car.svg" width="30" height="30" style="vertical-align: middle; margin: 0 6px;"></td><td>${userDataChars[5].slice(20)}</td></tr>
        <tr><td>Daily average:</td><td>${userDataChars[4].slice(18)}</td><td></td><td></td></tr>
    </table>`;

    WaterButton.innerHTML = `
    <b>Water</b>
    <table>
        <tr><td>Your total:</td><td>${userDataChars[6].slice(22,-1)}</td><td><img src="water_bottle.svg" width="30" height="30" style="vertical-align: middle; margin: 0 6px;"></td><td>${userDataChars[8].slice(21)} bottles</td></tr>
        <tr><td>Daily average:</td><td>${userDataChars[7].slice(17)}</td><td></td><td></td></tr>
    </table>`;

    TokensButton.innerHTML = `
    <b>Energy & Tokens</b>
    <table>
        <tr><td>Your total:</td><td>${userDataChars[9].slice(14,-1)}</td><td><img src="lightbulb.svg" width="30" height="30" style="vertical-align: middle; margin: 0 6px;"></td><td>${userDataChars[1].slice(15,-1)} tokens</td></tr>
        <tr><td>Daily average:</td><td>${userDataChars[10].slice(19)}</td><td> </td><td>${userDataChars[2].slice(18)} tokens</td></tr>
    </table>`;
}
document.addEventListener("DOMContentLoaded", async () => {
    const linkButton = document.getElementById('aiImpactTrackerButton');

    // Load the initial data when popup opens
    await updateUIWithLatestData();

    linkButton.addEventListener('click', function() {
        chrome.tabs.create({ url: 'https://aiimpacttracker.cs.haverford.edu/' });
    });

    const raw = await chrome.storage.local.get(["user_id"]);
    const existingUserId = raw.user_id ? await decryptData(raw.user_id) : null;
    // console.log("decrypted user_id:", existingUserId);

    if(existingUserId) {
        chrome.runtime.sendMessage({ 
            action: "RELOAD_USER_DATA", 
            userId: existingUserId 
        }, async (response) => {
            if (response && response.success) {
                console.log("Popup received fresh data from background!");
                // Force the UI to refresh using the freshly fetched server data
                await updateUIWithLatestData(); 
            }
        });
    } else{
        console.log("No user_id found yet. Skipping server sync until user registers/initializes.");
    }
});