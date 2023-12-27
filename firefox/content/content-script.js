try {
  (() => {
    const attachInterval = setInterval(() => {
      try {
        const app = document.querySelector('#app').wrappedJSObject.__vue__.$store.state.app;
        if (!app) return;

        clearInterval(attachInterval);
        browser.runtime.sendMessage({ type: 'activate' });

        setInterval(updateScores, 500);
      } catch(e) {}
    }, 1000);

    setTimeout(() => clearInterval(attachInterval), 5 * 60 * 1000); // stop trying after 5 minutes

    function updateScores() {
      const app = document.querySelector('#app').wrappedJSObject.__vue__.$store.state.app;
      if (!app) return;

      const points = Array.prototype.map.call(app.pointTypes, (point) => ({
        name: point.name,
        value: point.startingSum
      }));

      browser.runtime.sendMessage({ type: 'points', points }).catch(() => {});
    }
  })();  
} catch (e) {}
