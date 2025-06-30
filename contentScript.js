function setHighestQualityUI() {
  const settingsBtn = document.querySelector('.ytp-settings-button');
  if (!settingsBtn) {
    console.log('[YouTube Auto HD] No settings button');
    return;
  }
  settingsBtn.click();

  // click “Quality” in the settings menu
  const menuItems = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'));
  const qualityItem = menuItems.find(item =>
    item.querySelector('.ytp-menuitem-label')?.textContent.trim() === 'Quality'
  );
  if (!qualityItem) {
    console.log('[YouTube Auto HD] Quality item missing');
    document.body.click();
    return;
  }
  qualityItem.click();

  // pick the top non-“Auto” option (highest res)
  const qualityOptions = Array.from(document.querySelectorAll('.ytp-quality-menu .ytp-menuitem'));
  const realOptions = qualityOptions.filter(opt =>
    opt.querySelector('.ytp-menuitem-label')?.textContent.trim() !== 'Auto'
  );
  const pick = realOptions[0] || qualityOptions[0];
  if (!pick) {
    console.log('[YouTube Auto HD] No quality options found');
  } else {
    const label = pick.querySelector('.ytp-menuitem-label')?.textContent.trim();
    pick.click();
    console.log('[YouTube Auto HD] Set to', label);
  }

  // close the settings menu
  setTimeout(() => document.body.click(), 300);
}

function runIfEnabled() {
  chrome.storage.sync.get(['enabled'], ({ enabled }) => {
    if (enabled !== false) {
      setHighestQualityUI();
    }
  });
}

// initial run
runIfEnabled();

// rerun on SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(runIfEnabled, 1000);
  }
}).observe(document, { childList: true, subtree: true });
