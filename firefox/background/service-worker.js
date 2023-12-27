chrome.runtime.onInstalled.addListener(async () => {
  await chrome.action.disable();
  await chrome.action.setBadgeBackgroundColor(
    { color: '#FFFFFF' }
  );
});

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch(message.type) {
    case 'activate':
      const tabId = sender.tab.id;
      await browser.action.enable(tabId);
      await browser.action.setBadgeText({ text: 'ON', tabId });
      break;
  }
});
