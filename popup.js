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