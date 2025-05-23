function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: '#000',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    zIndex: 9999,
    opacity: 0.9,
    transition: 'opacity 0.5s ease'
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 500);
  }, 2000); // visible for 2 seconds
}


function setHighestQuality() {
  console.log("[Auto HD] Trying to set video quality...");
  
  const ytPlayer = document.querySelector('ytd-player');
  if (!ytPlayer || !ytPlayer.getPlayer) {
    console.log("[Auto HD] ytPlayer or getPlayer not ready");
    return false;
  }

  const playerApi = ytPlayer.getPlayer();
  const levels = playerApi.getAvailableQualityLevels?.() || [];

  if (levels.length > 0) {
    console.log("[Auto HD] Available quality levels:", levels);
    playerApi.setPlaybackQualityRange(levels[0]);
    playerApi.setPlaybackQuality(levels[0]);
    console.log(`[Auto HD] Quality set to: ${levels[0]}`);
    return true;
  } else {
    console.log("[Auto HD] No quality levels found yet");
    return false;
  }
}

function trySetQualityRepeatedly(retries = 5, delay = 2000) {
  let attempts = 0;

  const intervalId = setInterval(() => {
    const success = setHighestQuality();
    attempts++;

    if (success || attempts >= retries) {
      clearInterval(intervalId);
    }
  }, delay);
}

function runIfEnabled() {
  chrome.storage.sync.get(['enabled'], (data) => {
    if (data.enabled !== false) {
      trySetQualityRepeatedly();
    } else {
      console.log("[Auto HD] Extension is disabled.");
    }
  });
}

// Run on initial load
runIfEnabled();

// Handle YouTube's SPA (Single Page App) navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(runIfEnabled, 1000);
  }
}).observe(document, { childList: true, subtree: true });
