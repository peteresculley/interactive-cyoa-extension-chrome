try {
  (() => {
    const attachInterval = setInterval(() => {
      try {
        let app = undefined;
        try {
          // try vue
          app = document.querySelector('#app').wrappedJSObject.__vue__.$store.state.app;
        } catch (e) {}
        if (!app) {
          // try svelte
          app = window.wrappedJSObject.debugApp;
        }
        if (!app) return;

        clearInterval(attachInterval);
        browser.runtime.sendMessage({ type: 'activate' });

        setInterval(updateScores, 500);
      } catch(e) {}
    }, 1000);

    setTimeout(() => clearInterval(attachInterval), 5 * 60 * 1000); // stop trying after 5 minutes

    function updateScores() {
      let app = undefined;
      try {
        // try vue
        app = document.querySelector('#app').wrappedJSObject.__vue__.$store.state.app;
      } catch (e) {}
      if (!app) {
        // try svelte
        app = window.wrappedJSObject.debugApp;
      }

      if (!app) return;

      const points = Array.prototype.map.call(app.pointTypes, (point) => ({
        name: point.name,
        value: point.startingSum
      }));

      browser.runtime.sendMessage({ type: 'points', points }).catch(() => {});
    }
  })();  
} catch (e) {}
