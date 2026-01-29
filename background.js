const TARGET_URL = "https://www.chatgpt.org";
let targetTabId = null;

// Open the site when the extension starts
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({ url: TARGET_URL }, (tab) => {
    targetTabId = tab.id;
  });
});

// Listen for the page to finish loading
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    tabId === targetTabId &&
    changeInfo.status === "complete" &&
    tab.url?.startsWith(TARGET_URL)
  ) {
    try {
      const blob = await chrome.pageCapture.saveAsMHTML({ tabId });
      if (!blob) return;

      const url = URL.createObjectURL(blob);

      await chrome.downloads.download({
        url,
        filename: `chat-${new Date().toISOString().replace(/[:.]/g, "-")}.mhtml`,
        saveAs: false
      });

      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err) {
      console.error("Capture failed:", err);
    }
  }
});
