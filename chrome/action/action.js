const pointsContainer = document.getElementById('points-container');
const actionsContainer = document.getElementById('actions-container');

chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
  const tab = await getCurrentTab();

  if (!tab || !sender.tab || sender.tab.id === tab.id) {
    if (actionsContainer.style.display !== 'flex') {
      actionsContainer.style.display = 'flex';
    }
    switch (message.type) {
      case 'points':
        updatePoints(message.points, sender.frameId);
        break;
    }
  }
});

function updatePoints(points, frameId = 0) {
  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    let child;
    if (i < pointsContainer.childNodes.length) {
      child = pointsContainer.childNodes[i];
    } else {
      child = document.createElement('div');
      child.className = 'point';
      const nameElem = document.createElement('div');
      nameElem.className = 'name';
      const valueElem = document.createElement('input');
      valueElem.className = 'value';
      const index = i;
      valueElem.onchange = () => {
        try {
          const value = parseFloat(valueElem.value);
          getCurrentTab().then((tab) => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id, frameIds: [frameId] },
              func: updatePoint,
              args: [index, value],
              world: chrome.scripting.ExecutionWorld.MAIN
            });
          });
        } catch(e) {}
      };
      child.appendChild(nameElem);
      child.appendChild(valueElem);
      pointsContainer.appendChild(child);
    }

    const nameElem = child.querySelector('.name');
    const valueElem = child.querySelector('.value');
    if (nameElem.innerText !== point.name) {
      nameElem.innerText = point.name;
    }
    if (valueElem.value !== point.value && valueElem !== document.activeElement) {
      valueElem.value = point.value;
    }
  }

  for (let i = pointsContainer.childNodes.length - 1; i >= points.length; i--) {
    pointsContainer.removeChild(pointsContainer.childNodes[i]);
  }
}

function updatePoint(index, value) {
  try {
    (() => {
      let app = undefined;
      try {
        // try vue
        app = document.querySelector('#app').__vue__.$store.state.app;
      } catch (e) {}
      if (!app) {
        // try svelte
        app = window.debugApp;
      }

      app.pointTypes[index].startingSum = value;
    })()
  } catch(e) {}
}

document.getElementById('remove-row-limits-button').onclick = async () => {
  try {
    const tab = await getCurrentTab();

    await chrome.scripting.executeScript({
      target: { 
        tabId: tab.id,
        allFrames: true
      },
      func: removeRowLimits,
      world: chrome.scripting.ExecutionWorld.MAIN
    });
  } catch(e) {}
};

function removeRowLimits() {
  try {
    (() => {
      let app = undefined;
      try {
        // try vue
        app = document.querySelector('#app').__vue__.$store.state.app;
      } catch (e) {}
      if (!app) {
        // try svelte
        app = window.debugApp;
      }
    
      function allThings(func) {
        app.rows.forEach((row) => allObjects(row, func));
      }
      function allObjects(row, func) {
        func(row);
        if (row.objects && row.objects.length) {
          row.objects.forEach((row) => allObjects(row, func));
        }
      }
      allThings((obj) => obj.allowedChoices = 0);
    })();
  } catch (e) {}
}

document.getElementById('remove-randomness-button').onclick = async () => {
  try {
    const tab = await getCurrentTab();

    await chrome.scripting.executeScript({
      target: { 
        tabId: tab.id,
        allFrames: true
      },
      func: removeRandomness,
      world: chrome.scripting.ExecutionWorld.MAIN
    });
  } catch(e) {}
};

function removeRandomness() {
  try {
    (() => {
      let app = undefined;
      try {
        // try vue
        app = document.querySelector('#app').__vue__.$store.state.app;
      } catch (e) {}
      if (!app) {
        // try svelte
        app = window.debugApp;
      }
    
      function allThings(func) {
        app.rows.forEach((row) => allObjects(row, func));
      }
      function allObjects(row, func) {
        func(row);
        if (row.objects && row.objects.length) {
          row.objects.forEach((row) => allObjects(row, func));
        }
      }
      allThings((obj) => obj.isInfoRow && (obj.isInfoRow = false));
    })();
  } catch (e) {}
}

document.getElementById('remove-requirements-button').onclick = async () => {
  try {
    const tab = await getCurrentTab();

    await chrome.scripting.executeScript({
      target: { 
        tabId: tab.id,
        allFrames: true
      },
      func: removeRequirements,
      world: chrome.scripting.ExecutionWorld.MAIN
    });
  } catch (e) {}
};

function removeRequirements() {
  try {
    (() => {
      let app = undefined;
      try {
        // try vue
        app = document.querySelector('#app').__vue__.$store.state.app;
      } catch (e) {}
      if (!app) {
        // try svelte
        app = window.debugApp;
      }

      function allThings(func) {
        app.rows.forEach((row) => allObjects(row, func));
      }
      function allObjects(row, func) {
        func(row);
        if (row.objects && row.objects.length) {
          row.objects.forEach((row) => allObjects(row, func));
        }
      }
      allThings((obj) => obj.requireds ? obj.requireds = [] : undefined);
    })();
  } catch (e) {}
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
