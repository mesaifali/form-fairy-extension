document.addEventListener('DOMContentLoaded', () => {
  const randomFillButton = document.getElementById('randomFill');
  const customPresetSelect = document.getElementById('customPresetSelect');
  const fillCustomPresetButton = document.getElementById('fillCustomPreset');
  const editCustomPresetButton = document.getElementById('editCustomPreset');
  const createEditTitle = document.getElementById('createEditTitle');
  const customPresetName = document.getElementById('customPresetName');
  const customFields = document.getElementById('customFields');
  const addFieldButton = document.getElementById('addField');
  const saveCustomPresetButton = document.getElementById('saveCustomPreset');
  const deleteCustomPresetButton = document.getElementById('deleteCustomPreset');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.getElementById('body');
  const refreshPresetsButton = document.getElementById('refreshPresets');
  const exportPresetsButton = document.getElementById('exportPresets');
  const importPresetsButton = document.getElementById('importPresets');

  exportPresetsButton.addEventListener('click', exportPresets);
  importPresetsButton.addEventListener('click', importPresets);

  let isEditing = false;
  let editingPresetName = '';

  function loadCustomPresets() {
    chrome.storage.sync.get('customPresets', (result) => {
      const customPresets = result.customPresets || {};
      customPresetSelect.innerHTML = '<option value="">Select a custom preset</option>';
      Object.keys(customPresets).forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        customPresetSelect.appendChild(option);
      });
    });
  }

  loadCustomPresets();

  function addFieldToUI(name = '', value = '') {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'mb-2';
    fieldDiv.innerHTML = `
      <input type="text" placeholder="Field Name" class="p-1 border rounded mr-2 field-name" value="${name}">
      <input type="text" placeholder="Field Value" class="p-1 border rounded mr-2 field-value" value="${value}">
      <button class="bg-red-500 text-white p-1 rounded remove-field">Remove</button>
    `;
    customFields.appendChild(fieldDiv);

    fieldDiv.querySelector('.remove-field').addEventListener('click', () => {
      customFields.removeChild(fieldDiv);
    });
  }

  randomFillButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: 'random' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log(response.status);
        }
      });
    });
  });

  fillCustomPresetButton.addEventListener('click', () => {
    const selectedPreset = customPresetSelect.value;
    if (selectedPreset) {
      chrome.storage.sync.get('customPresets', (result) => {
        const customPresets = result.customPresets || {};
        const presetData = customPresets[selectedPreset];
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "fillForm", data: presetData }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else {
              console.log(response.status);
            }
          });
        });
      });
    } else {
      alert('Please select a preset first');
    }
  });



  editCustomPresetButton.addEventListener('click', () => {
    const selectedPreset = customPresetSelect.value;
    if (selectedPreset) {
      isEditing = true;
      editingPresetName = selectedPreset;
      createEditTitle.textContent = 'Edit Custom Preset';
      customPresetName.value = selectedPreset;
      
      chrome.storage.sync.get('customPresets', (result) => {
        const customPresets = result.customPresets || {};
        const presetData = customPresets[selectedPreset];
        
        customFields.innerHTML = '';
        Object.entries(presetData).forEach(([name, value]) => {
          addFieldToUI(name, value);
        });
      });
    }
  });

  addFieldButton.addEventListener('click', () => {
    addFieldToUI();
  });

  saveCustomPresetButton.addEventListener('click', () => {
    const presetName = customPresetName.value;
    if (!presetName) {
      alert('Please enter a preset name');
      return;
    }

    const presetData = {};
    customFields.querySelectorAll('div').forEach(div => {
      const name = div.querySelector('.field-name').value.toLowerCase();
      const value = div.querySelector('.field-value').value;
      if (name && value) {
        presetData[name] = value;
      }
    });

    chrome.storage.sync.get('customPresets', (result) => {
      const customPresets = result.customPresets || {};
      
      if (isEditing && presetName !== editingPresetName) {
        // If renaming, remove the old preset
        delete customPresets[editingPresetName];
      }
      
      customPresets[presetName] = presetData;
      chrome.storage.sync.set({ customPresets }, () => {
        alert('Custom preset saved');
        loadCustomPresets();
        resetForm();
      });
    });
  });

  function resetForm() {
    isEditing = false;
    editingPresetName = '';
    createEditTitle.textContent = 'Create Custom Preset';
    customPresetName.value = '';
    customFields.innerHTML = '';
    addFieldToUI();
  }

  deleteCustomPresetButton.addEventListener('click', () => {
    const selectedPreset = customPresetSelect.value;
    if (selectedPreset) {
      if (confirm(`Are you sure you want to delete the preset "${selectedPreset}"?`)) {
        chrome.storage.sync.get('customPresets', (result) => {
          const customPresets = result.customPresets || {};
          delete customPresets[selectedPreset];
          chrome.storage.sync.set({ customPresets }, () => {
            alert('Custom preset deleted');
            loadCustomPresets();
            resetForm();
          });
        });
      }
    } else {
      alert('Please select a preset to delete');
    }
  });

// Load dark mode preference
chrome.storage.sync.get('darkMode', (result) => {
const darkMode = result.darkMode || false;
darkModeToggle.checked = darkMode;
updateTheme(darkMode);
});

darkModeToggle.addEventListener('change', () => {
const darkMode = darkModeToggle.checked;
chrome.storage.sync.set({ darkMode });
updateTheme(darkMode);
});

function updateTheme(darkMode) {
if (darkMode) {
  body.classList.add('dark', 'bg-gray-800', 'text-gray-100');
  body.classList.remove('bg-white', 'text-black');
} else {
  body.classList.remove('dark', 'bg-gray-800', 'text-gray-100');
  body.classList.add('bg-white', 'text-black');
}
}


refreshPresetsButton.addEventListener('click', () => {
loadCustomPresets();
alert('Presets refreshed from sync storage');
});

function loadCustomPresets() {
chrome.storage.sync.get('customPresets', (result) => {
  const customPresets = result.customPresets || {};
  customPresetSelect.innerHTML = '<option value="">Select a custom preset</option>';
  Object.keys(customPresets).forEach(presetName => {
    const option = document.createElement('option');
    option.value = presetName;
    option.textContent = presetName;
    customPresetSelect.appendChild(option);
  });
});
}

function addFieldToUI(name = '', value = '') {
const fieldDiv = document.createElement('div');
fieldDiv.className = 'flex gap-2 items-center';
fieldDiv.innerHTML = `
  <input type="text" placeholder="Field Name" class="flex-1 p-2 border rounded-lg field-name" value="${name}">
  <input type="text" placeholder="Field Value" class="flex-1 p-2 border rounded-lg field-value" value="${value}">
  <button class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200 remove-field">Remove</button>
`;
customFields.appendChild(fieldDiv);

fieldDiv.querySelector('.remove-field').addEventListener('click', () => {
  customFields.removeChild(fieldDiv);
});
}

function exportPresets() {
chrome.storage.sync.get('customPresets', (result) => {
    const customPresets = result.customPresets || {};
    const dataStr = JSON.stringify(customPresets, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'form_filler_presets.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});
}

function importPresets() {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';

input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const importedPresets = JSON.parse(e.target.result);
            chrome.storage.sync.get('customPresets', (result) => {
                const currentPresets = result.customPresets || {};
                const mergedPresets = { ...currentPresets, ...importedPresets };
                
                chrome.storage.sync.set({ customPresets: mergedPresets }, () => {
                    alert('Presets imported successfully');
                    loadCustomPresets();
                });
            });
        } catch (error) {
            alert('Error importing presets. Please make sure the file is valid JSON.');
            console.error('Import error:', error);
        }
    };

    reader.readAsText(file);
};

input.click();
}


  // Initialize with one empty field
  addFieldToUI();
});


