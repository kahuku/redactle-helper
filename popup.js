// ----- Tabs (existing) -----
const tabs = document.querySelectorAll('.tab');
const panels = {
  enter: document.getElementById('tab-enter'),
  review: document.getElementById('tab-review'),
};

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const key = btn.dataset.tab;
    Object.entries(panels).forEach(([name, panel]) => {
      const isActive = name === key;
      panel.toggleAttribute('hidden', !isActive);
      panel.classList.toggle('active', isActive);
    });

    tabs.forEach(t => t.setAttribute('aria-selected', t === btn ? 'true' : 'false'));

    // If switching to Review tab, fetch latest
    if (btn.dataset.tab === 'review') {
      loadTopWords();
    }
  });
});

// ----- Render table -----
function renderTopWords(list) {
  const tbody = document.getElementById('review-tbody');
  tbody.innerHTML = '';

  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="muted">No data yet. Click Refresh.</td></tr>`;
    return;
  }

  list.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${row.word}</td>
      <td>${row.hits}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ----- Ask content script to compute (and it will message back) -----
function loadTopWords() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getTopWords' });
    }
  });
}

// Listen for results from content script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'topWords') {
    renderTopWords(msg.top);
  }
});

// ----- Existing "Enter Selected Words" flow (unchanged) -----
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

// ----- Parent group checkbox behavior (existing) -----
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

// ----- Refresh button -----
document.getElementById('refresh-top-words')?.addEventListener('click', loadTopWords);
