// Function to generate a random person's data
function generateRandomPerson() {
  const firstNames = [
    'john', 'jane', 'mike', 'emily', 'chris', 'sarah', 'david', 'emma', 'alex', 'olivia',
    'william', 'sophia', 'james', 'isabella', 'benjamin', 'mia', 'lucas', 'charlotte', 'henry', 'amelia',
    'alexander', 'harper', 'daniel', 'evelyn', 'matthew', 'abigail', 'joseph', 'elizabeth', 'samuel', 'avery'
  ];
  const lastNames = [
    'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez',
    'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin',
    'lee', 'perez', 'thompson', 'white', 'harris', 'sanchez', 'clark', 'ramirez', 'lewis', 'robinson'
  ];
  const domains = ['cnavaro.com', 'curuth.com', 'xinn.edu.pl', 'ngacrot.com', 'bacot.in'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${firstName} ${lastName}`;
  const username = `${firstName}${lastName}${Math.floor(Math.random() * 10000)}`.toLowerCase().replace(/\s+/g, '');
  
  return {
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
    username: username,
    email: `${username}@${domains[Math.floor(Math.random() * domains.length)]}`,
    password: Array(12).fill().map(() => 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'.charAt(Math.floor(Math.random() * 46))).join(''),
    address: `${Math.floor(Math.random() * 1000)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)} St, ${firstName.charAt(0).toUpperCase() + firstName.slice(1)}ville, ST ${Math.floor(Math.random() * 90000) + 10000}`,
    phone: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    age: Math.floor(Math.random() * (80 - 18 + 1)) + 18,
    birthDate: (() => {
      const year = Math.floor(Math.random() * (2000 - 1950 + 1)) + 1950;
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })()
  };
}


// Function to determine the type of input field
function getInputType(element) {
  const type = element.getAttribute('type');
  const name = (element.getAttribute('name') || '').toLowerCase();
  const id = (element.getAttribute('id') || '').toLowerCase();
  const placeholder = (element.getAttribute('placeholder') || '').toLowerCase();

  if (element.tagName === 'SELECT') {
    return 'select';
  } else if (type === 'radio') {
    return 'radio';
  } else if (type === 'date') {
    return 'date';
  } else if (type === 'number' && (name.includes('age') || id.includes('age'))) {
    return 'age';
  } else if (type === 'password' || name.includes('password') || id.includes('password')) {
    return 'password';
  } else if (type === 'email' || name.includes('email') || id.includes('email')) {
    return 'email';
  } else if (name.includes('name') || id.includes('name') || placeholder.includes('name')) {
    if (name.includes('first') || id.includes('first')) return 'firstName';
    if (name.includes('last') || id.includes('last')) return 'lastName';
    return 'fullName';
  } else if (name.includes('address') || id.includes('address')) {
    return 'address';
  } else if (name.includes('phone') || id.includes('phone')) {
    return 'phone';
  } else if (name.includes('user') || id.includes('user') || name.includes('login') || id.includes('login')) {
    return 'username';
  }
  
  return 'text';
}



// Function to fill input fields
function fillInputs(data) {
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select');
  const personData = data === 'random' ? generateRandomPerson() : data;
  
  inputs.forEach(input => {
    const type = getInputType(input);
    let value = personData[type] || personData[input.name] || personData[input.id];
    
    if (!value) {
      // If no matching field is found, use the username as a fallback for text inputs
      value = type === 'text' ? personData.username : '';
    }
    
    switch (type) {
      case 'select':
        fillSelect(input, value);
        break;
      case 'radio':
        fillRadio(input, value);
        break;
      case 'date':
        fillDate(input, value);
        break;
      case 'age':
        fillAge(input, value);
        break;
      default:
        input.value = value;
        break;
    }
    
    // Dispatch events to trigger any listeners
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}



function fillSelect(select, value) {
  const options = Array.from(select.options);
  const optionToSelect = options.find(option => option.value === value || option.textContent === value);
  if (optionToSelect) {
    select.value = optionToSelect.value;
  } else {
    // If no matching option, select a random one
    const randomIndex = Math.floor(Math.random() * options.length);
    select.selectedIndex = randomIndex;
  }
}

function fillRadio(radio, value) {
  const name = radio.getAttribute('name');
  const radioGroup = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
  const radioToSelect = Array.from(radioGroup).find(r => r.value === value);
  if (radioToSelect) {
    radioToSelect.checked = true;
  } else {
    // If no matching radio, select a random one
    const randomIndex = Math.floor(Math.random() * radioGroup.length);
    radioGroup[randomIndex].checked = true;
  }
}

function fillDate(dateInput, value) {
  if (value) {
    dateInput.value = value;
  } else {
    // Generate a random date between 1950 and 2000
    const year = Math.floor(Math.random() * (2000 - 1950 + 1)) + 1950;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
}

function fillAge(ageInput, value) {
  if (value) {
    ageInput.value = value;
  } else {
    // Generate a random age between 18 and 80
    ageInput.value = Math.floor(Math.random() * (80 - 18 + 1)) + 18;
  }
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillInputs(request.data);
    sendResponse({status: 'Form filled successfully'});
  }
  return true; // Indicates that the response will be sent asynchronously
});


// Add a context menu item
chrome.runtime.sendMessage({ action: 'addContextMenu' });