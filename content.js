document.addEventListener('keydown', function(event) {
    // Check if the pressed key is 'g' (case insensitive)
    if (event.key.toLowerCase() === 'g') {
        hoverGuessMap();
    }
    // Check if the pressed key is a number 1-6
    else if (/^[1-6]$/.test(event.key)) {
        hoverGuessMap();
        setTimeout(() => {
            setGuessSize(event.key);
            makeGuess(parseInt(event.key) - 1); // Convert key to size (1->0, 2->1, 3->2, 4->3, 5->4, 6->5)
        }, 100);
    }
});

function hoverGuessMap() {
    const guessMap = document.querySelector('.guess-map_canvas__cvpqv');
    
    if (guessMap) {
        const mouseoverEvent = new MouseEvent('mouseover', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        
        guessMap.dispatchEvent(mouseoverEvent);
    }
}

function getCurrentRound() {
    const statusElement = document.querySelector('#__next > div.in-game_root__8QarP.in-game_backgroundDefault__kgVVj > div.in-game_content__KO9vD > main > div > div > aside.game-panorama_gameOverview__kRCu7 > div > div.game-panorama_status__EFoeD > div > div.status_inner__KNSYc > div:nth-child(2) > div.status_value__oUOZ0');
    if (statusElement) {
        const roundText = statusElement.textContent.trim();
        const currentRound = parseInt(roundText.split('/')[0]);
        return currentRound;
    }
    return 1; // Default to round 1 if not found
}

function getGameId() {
    const path = window.location.pathname;
    const matches = path.match(/\/bullseye\/([^\/]+)/);
    return matches ? matches[1] : null;
}

function getMapCoordinates() {
    // This is a placeholder - we need to find the correct way to get coordinates
    // You might need to intercept the map's events or find elements containing coordinates
    return {
        lat: -12.737471137032008,
        lng: -41.78831619989075
    };
}

async function makeGuess(size) {
    const gameId = getGameId();
    const roundNumber = getCurrentRound();
    const coords = getMapCoordinates();

    if (!gameId || !coords) {
        console.error('Missing required data for guess');
        return;
    }

    const guessData = {
        isDraft: true,
        lat: coords.lat,
        lng: coords.lng,
        roundNumber: roundNumber,
        size: size
    };

    try {
        const response = await fetch(`https://game-server.geoguessr.com/api/bullseye/${gameId}/guess`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(guessData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Guess submitted successfully:', data);
    } catch (error) {
        console.error('Error submitting guess:', error);
    }
}

function setGuessSize(key) {
    // Convert key to corresponding guess size value
    // 1 = Ultra (0), 2 = Large (1), 3 = Medium (2), 4 = Small (3), 5 = Mini (4), 6 = Bulls-Eye (5)
    const sizeMap = {
        '1': 0, // Ultra (largest)
        '2': 1, // Large
        '3': 2, // Medium
        '4': 3, // Small
        '5': 4, // Mini
        '6': 5  // Bulls-Eye (smallest)
    };

    const slider = document.querySelector('.styles_rangeslider__8vVg3');
    if (slider) {
        // Create and dispatch an input event
        const inputEvent = new Event('input', {
            bubbles: true,
            cancelable: true
        });

        // Set the value on the slider
        slider.setAttribute('aria-valuenow', sizeMap[key]);
        
        // Update the fill width based on the selection
        const totalWidth = 523; // Total width of the slider in pixels
        const step = totalWidth / 5; // Width per step
        const fillElement = slider.querySelector('.styles_fill__9MeZ9');
        const handleElement = slider.querySelector('.styles_handle__h9ytQ');
        
        if (fillElement && handleElement) {
            const position = step * sizeMap[key];
            fillElement.style.width = `${position}px`;
            handleElement.style.left = `${position}px`;
        }

        // Dispatch the event
        slider.dispatchEvent(inputEvent);
    }
} 