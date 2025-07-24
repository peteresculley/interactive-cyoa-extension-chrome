chrome.runtime.onInstalled.addListener(async () => {
  await chrome.action.disable();
  await chrome.action.setBadgeBackgroundColor(
    { color: '#FFFFFF' }
  );
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: pageScript,
      args: [chrome.runtime.id],
      world: chrome.scripting.ExecutionWorld.MAIN
    });
  } catch (e) {}
});

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  const tabId = sender.tab.id;

  switch (message.type) {
    case 'activate':
      await chrome.action.enable(tabId);
      await chrome.action.setBadgeText({ text: 'ON', tabId });
      break;
  }
});

function pageScript(extId) {
  try {
    (() => {
      const attachInterval = setInterval(() => {
        try {
          let app = undefined;
          try {
            // try vue
            app = document.querySelector('#app').__vue__.$store.state.app;
          } catch (e) {}
          if (!app) {
            // try svelte
            app = window.debugApp;
          }

          if (!app) return;

          clearInterval(attachInterval);
          chrome.runtime.sendMessage(extId, { type: 'activate' });

          setInterval(updateScores, 500);
        } catch(e) {}
      }, 1000);

      setTimeout(() => clearInterval(attachInterval), 5 * 60 * 1000); // stop trying after 5 minutes

      function updateScores() {
        let app = undefined;
        try {
          // try vue
          app = document.querySelector('#app').__vue__.$store.state.app;
        } catch (e) {}
        if (!app) {
          // try svelte
          app = window.debugApp;
        }

        if (!app) return;

        const points = app.pointTypes.map((point) => ({
          name: point.name,
          value: point.startingSum
        }));

        chrome.runtime.sendMessage(extId, { type: 'points', points });
      }
    })();  
  } catch (e) {}
}
