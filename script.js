async function fetchWordlist(file) {
    const url = `https://raw.githubusercontent.com/kahuku/redactle-helper/refs/heads/main/wordlists/${file}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        return text.split('\n').filter(word => word.trim() !== ''); // Clean empty lines
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
        await new Promise(resolve => setTimeout(resolve, 100)); // Adjust delay
        submitButton.click();
    }
}

async function fetchStructure() {
    const url = `https://raw.githubusercontent.com/kahuku/redactle-helper/refs/heads/main/wordlists/structure.json`;
    try {
        const response = await fetch(url);
        return await response.json();
    }
    catch (error) {
        console.error('Error fetching structure:', error);
        return {};
    }
}

function getWordlists(structure, path) {
    let wordlists = [];

    let arr = structure[path];
    if (arr === undefined) {
        // console.error(`Path ${path} not found in structure`);
        return [path];
    }

    for (let item of arr) {
        if (item.length >= 4 && item.slice(-4) === 'string') {
            wordlists.push(item);
        } else {
            wordlists = wordlists.concat(getWordlists(structure, item));
        }
    }

    return wordlists;
}

async function guess(path) {
    let structure = await fetchStructure();
    let wordlists = getWordlists(structure, path);

    for (let wordlist of wordlists) {
        console.log(`Entering wordlist: ${wordlist}`);
        enterWordlist(wordlist);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enterWords") {
        guess(request.list);
    }
});