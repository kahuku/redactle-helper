// async function fetchWordlist(file) {
//     const url = `https://raw.githubusercontent.com/kahuku/redactle-helper/refs/heads/main/wordlists/${file}`;
    
//     try {
//         const response = await fetch(url);
//         const text = await response.text();
//         return text.split('\n').filter(word => word.trim() !== '');
//     } catch (error) {
//         console.error(`Error fetching ${file}:`, error);
//         return [];
//     }
// }

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

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "enterWords") {
//         request.lists.forEach(list => enterWordlist(list));
//     }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enterWords") {
        (async () => {
            for (const l of request.lists) {
                await enterWordlist(l);
            }
        })();
    }
});