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
        })();
    }
});