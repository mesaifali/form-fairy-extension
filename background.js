chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    customPresets: {}
  });
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "formFillerMenu",
      title: "Form Filler",
      contexts: ["page", "editable"]
    });
    chrome.contextMenus.create({
      id: "fillRandom",
      parentId: "formFillerMenu",
      title: "Fill with Random Data",
      contexts: ["page", "editable"]
    });
    chrome.contextMenus.create({
      id: "fillPreset",
      parentId: "formFillerMenu",
      title: "Fill with Preset",
      contexts: ["page", "editable"]
    });
    updatePresetSubmenu();
  });
}

function updatePresetSubmenu() {
  chrome.storage.sync.get("customPresets", (result) => {
    const customPresets = result.customPresets || {};
    Object.keys(customPresets).forEach((presetName) => {
      chrome.contextMenus.create({
        id: `preset_${presetName}`,
        parentId: "fillPreset",
        title: presetName,
        contexts: ["page", "editable"]
      });
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForm") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: request.data });
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fillRandom") {
    chrome.tabs.sendMessage(tab.id, { action: "contextMenuFill", fillType: "random" });
  } else if (info.menuItemId.startsWith("preset_")) {
    const presetName = info.menuItemId.replace("preset_", "");
    chrome.storage.sync.get("customPresets", (result) => {
      const customPresets = result.customPresets || {};
      const presetData = customPresets[presetName] || {};
      chrome.tabs.sendMessage(tab.id, { action: "contextMenuFill", fillType: "preset", data: presetData });
    });
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.customPresets) {
    createContextMenu();
  }
});
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fillForm") {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: request.data });
      });
    }
  });
 