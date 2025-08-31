// --- Tabs wiring ---
const tabs = document.querySelectorAll('.tab');
const panels = {
  enter: document.getElementById('tab-enter'),
  review: document.getElementById('tab-review'),
};

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    // update active tab button
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // show/hide panels
    const key = btn.dataset.tab;
    Object.entries(panels).forEach(([name, panel]) => {
      const isActive = name === key;
      panel.toggleAttribute('hidden', !isActive);
      panel.classList.toggle('active', isActive);
    });

    // Maintain proper aria-selected on tabs
    tabs.forEach(t => t.setAttribute('aria-selected', t === btn ? 'true' : 'false'));
  });
});

// --- Existing button handler (unchanged) ---
document.getElementById('enter-selected').addEventListener('click', () => {
  const selectedLists = Array.from(document.querySelectorAll('.wordlist:checked'))
      .map(checkbox => checkbox.value);

  if (selectedLists.length === 0) {
      alert("Please select at least one wordlist.");
      return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "enterWords", lists: selectedLists });
  });

  window.close();
});

// --- Existing parent-checkbox logic (unchanged) ---
document.querySelectorAll('.parent-checkbox').forEach(parent => {
  parent.addEventListener('change', () => {
      const fieldset = parent.closest('fieldset');
      const childCheckboxes = fieldset.querySelectorAll('.wordlist');
      childCheckboxes.forEach(child => {
          child.checked = parent.checked;
      });
  });

  parent.dispatchEvent(new Event('change'));
});
