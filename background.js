console.log("background service worker loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("SW received:", request);

  if (request?.type === "POST_EMISSION") {
    fetch("http://127.0.0.1:8000/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "dev_key_change_me",
        "X-From-Extension": "1"
      },
      body: JSON.stringify({
        tokens: request.tokenCount,
        location: "Haverford",
        date: new Date().toLocaleDateString("en-US")
      })
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
        return JSON.parse(text);
      })
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: err.message }));

    return true;
  }

});