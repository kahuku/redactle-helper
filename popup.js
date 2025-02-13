document.querySelectorAll('.enter-words').forEach(button => {
    button.addEventListener('click', () => {
        const list = button.getAttribute('data-list');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "enterWords", list });
        });
    });
});
