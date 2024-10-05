let currentPopup = null; // Variable to keep track of the current popup

document.addEventListener('dblclick', async function(event) {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
        try {
            const response = await fetch('http://localhost:3000/api/define', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word: selectedText })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                showPopup(event.clientX, event.clientY, selectedText, `Error: ${data.error}`);
            } else {
                showPopup(event.clientX, event.clientY, selectedText, data.definition, data.example);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showPopup(event.clientX, event.clientY, selectedText, 'An error occurred while fetching the definition.');
        }
    }
});

function showPopup(x, y, word, definition, example = '') {
    // Remove the previous popup if it exists
    if (currentPopup) {
        currentPopup.remove();
    }

    const popup = document.createElement('div');

    // Calculate the position with respect to the current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Style the popup
    popup.style.position = 'absolute';
    popup.style.backgroundColor = '#fff'; // White background
    popup.style.color = '#000'; // Black text for readability
    popup.style.border = '1px solid #ddd'; // Light gray border for subtle visibility
    popup.style.padding = '15px'; // Padding for a better look
    popup.style.borderRadius = '8px'; // Rounded corners
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)'; // Soft shadow for depth
    popup.style.zIndex = '1000'; // Ensure it’s on top of other elements
    popup.style.top = `${y + 15 + scrollY}px`; // Adjust for vertical scroll
    popup.style.left = `${x + 15 + scrollX}px`; // Adjust for horizontal scroll
    popup.style.maxWidth = '400px'; // Increase width for a better fit
    popup.style.maxHeight = '200px'; // Limit height
    popup.style.overflow = 'auto'; // Allow scrolling if content overflows
    popup.style.wordWrap = 'break-word'; // Ensure long words break correctly
    popup.style.boxSizing = 'border-box'; // Include padding and border in element's total width and height

    // Set the content of the popup
    popup.innerHTML = `
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px; color: #333;">
            ${word}
        </div>
        <div style="margin-bottom: 10px;">
            <span style="font-weight: bold;">Definition:</span><br>
            <span>${definition}</span><br><br>
            ${example ? `<span style="font-weight: bold;">Example:</span><br><span>${example}</span>` : ''}
        </div>
    `;

    document.body.appendChild(popup);

    // Update the reference to the current popup
    currentPopup = popup;

    // Add an event listener to close the popup when clicking anywhere else
    const handleClickOutside = (event) => {
        if (!popup.contains(event.target)) {
            currentPopup.remove();
            currentPopup = null;
            document.removeEventListener('click', handleClickOutside);
        }
    };

    document.addEventListener('click', handleClickOutside);

    // Ensure the popup is removed when a new word is double-clicked
    document.addEventListener('dblclick', () => {
        if (currentPopup) {
            currentPopup.remove();
            currentPopup = null;
        }
    }, { once: true }); // Use { once: true } to ensure it only runs once

    // Remove the popup after 10 seconds if the user doesn't click elsewhere
    setTimeout(() => {
        if (currentPopup === popup) { // Check if it's still the current popup
            currentPopup.remove();
            currentPopup = null; // Reset current popup reference
        }
    }, 20000);
}
