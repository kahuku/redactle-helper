async function enterWordlist() {
    const inputField = document.getElementById('input-guess');
    inputField.focus();

    const submitButton = document.getElementById('submit');

    try {
        const response = await fetch('https://raw.githubusercontent.com/danielmiessler/SecLists/master/Usernames/top-usernames-shortlist.txt');
        const text = await response.text();
        const words = text.split('\n');
        
        for (const word of words) {
            inputField.value = word;

            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 100)); // Adjust delay as needed

            // Click the submit button
            submitButton.click();
        }
    } catch (error) {
        console.error('Error in the extension script.js:', error);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enterWords") {
        enterWordlist();
    }
});