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
});