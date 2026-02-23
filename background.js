async function sendToApi(event, payload) {
    const res = await fetch("http://127.0.0.1:8000/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "REPLACE_WITH_A_REAL_KEY_STRATEGY"
      },
      body: JSON.stringify({
        event,
        payload,
        user_id: "optional-anonymous-id"
      })
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
  }
  
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "INGEST") {
      sendToApi(msg.event, msg.payload)
        .then(() => sendResponse({ ok: true }))
        .catch((e) => sendResponse({ ok: false, error: e.message }));
      return true; // keeps the message channel open for async
    }
  });