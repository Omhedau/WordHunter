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
                showPopup(event.clientX, event.clientY, selectedText, `${data.definition}\n\n${data.example}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showPopup(event.clientX, event.clientY, selectedText, 'An error occurred while fetching the definition.');
        }
    }
});

document.getElementById('fetchWordInfo').addEventListener('click', async function() {
    const input = document.getElementById('wordInput');
    const word = input.value.trim();

    if (!word || word.split(/\s+/).length > 2) {
        alert('Please enter one or two words.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/word-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ word })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            showPopup(0, 0, word, `Error: ${data.error}`);
        } else {
            showPopup(0, 0, word, data.text);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showPopup(0, 0, word, 'An error occurred while fetching the word information.');
    }
});


function showPopup(x, y, word, markdownContent) {
    // Remove the previous popup if it exists
    if (currentPopup) {
        currentPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'popup padded light-green-bg'; // Add the classes for padding and background color

    // Convert the markdown content to HTML using Showdown
    const converter = new showdown.Converter();
    const htmlContent = converter.makeHtml(markdownContent);
    popup.innerHTML = htmlContent; // Use innerHTML to inject the converted HTML

    document.body.appendChild(popup);

    // Position the popup
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    popup.style.top = `${y + 15 + scrollY}px`; // Adjust for vertical scroll
    popup.style.left = `${x + 15 + scrollX}px`; // Adjust for horizontal scroll

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
}



