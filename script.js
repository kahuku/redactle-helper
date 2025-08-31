async function fetchWordlist(file) {
    const url = chrome.runtime.getURL(`wordlists/${file}`);

    try {
        const response = await fetch(url);
        const text = await response.text();
        return text.split('\n').filter(word => word.trim() !== '');
    } catch (error) {
        console.error(`Error fetching ${file}:`, error);
        return [];
    }
}

async function enterWordlist(file) {
    let words = await fetchWordlist(file);

    const inputField = document.getElementById('input-guess');
    const submitButton = document.getElementById('submit');

    inputField.focus();

    for (const word of words) {
        inputField.value = word;
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 125));

        submitButton.click();
    }
}

// Scrape table, compute top 20 (exclude zeros), and notify popup
function loadTopWords() {
  try {
    // Grab all rows from the on-page guesses table
    const rows = Array.from(
      document.querySelectorAll('.guess-table-container table.guess-table tbody tr')
    );

    // Extract { word, hits } (skip malformed rows and zero hits)
    const items = rows.map(row => {
      const tds = row.querySelectorAll('td');
      if (tds.length < 3) return null;

      const word = tds[1].textContent.trim();
      const hitsText = tds[2].textContent.trim();
      const hits = parseInt(hitsText.replace(/[^\d-]/g, ''), 10);

      if (!word || isNaN(hits) || hits <= 0) return null;
      return { word, hits };
    }).filter(Boolean);

    // If duplicates exist, aggregate by word
    const byWord = new Map();
    for (const { word, hits } of items) {
      byWord.set(word, (byWord.get(word) || 0) + hits);
    }

    // Sort by hits desc, then alphabetically, and take top 20
    const top = Array.from(byWord.entries())
      .map(([word, hits]) => ({ word, hits }))
      .sort((a, b) => b.hits - a.hits || a.word.localeCompare(b.word))
      .slice(0, 20);

    // Send to popup (if it's open/listening)
    chrome.runtime.sendMessage({ action: 'topWords', top });
  } catch (e) {
    console.error('loadTopWords failed:', e);
  }
}

// Existing message handler: run lists, then refresh top words
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const arrowButton = document.querySelector("#guess-tail-arrow button");
  if (arrowButton) {
    arrowButton.style.background = "transparent";
  }

  if (request.action === "enterWords") {
    (async () => {
      for (const l of request.lists) {
        await enterWordlist(l);
      }
      // After lists finish, compute & publish fresh top words
      loadTopWords();
    })();
  }

  // On-demand refresh from popup
  if (request.action === "getTopWords") {
    loadTopWords();
  }
});
