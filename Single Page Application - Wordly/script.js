const searchForm = document.getElementById('search-form');
const resultContainer = document.getElementById('result-container');

// 1. Listen for when the user clicks "Search"
searchForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop the page from refreshing!
    
    const word = document.getElementById('word-input').value;
    fetchDefinition(word);
});

// 2. The function that "talks" to the Internet
async function fetchDefinition(word) {
    resultContainer.innerHTML = "<p>Searching...</p>"; // Visual feedback
    
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/tourism`);
        
        // If the word isn't found
        if (!response.ok) {
            throw new Error("Word not found");
        }

        const data = await response.json();
        displayData(data[0]); // Send the data to be shown on screen
        
    } catch (error) {
        resultContainer.innerHTML = `<p style="color:red;">❌ ${error.message}. Try another word!</p>`;
    }
}

// 3. The function that puts the info on the page
function displayData(data) {
    const wordName = data.word;
    const definition = data.meanings[0].definitions[0].definition;
    const partOfSpeech = data.meanings[0].partOfSpeech;

    resultContainer.innerHTML = `
        <div class="word-card">
            <h2>${wordName.toUpperCase()}</h2>
            <p><strong>${partOfSpeech}</strong></p>
            <p>${definition}</p>
            <button onclick="saveWord('${wordName}')">⭐ Save Favorite</button>
        </div>
    `;
}

// 4. Bonus: Style the page dynamically
function saveWord(word) {
    alert(`${word} added to favorites!`);
    // Change background color to show it's "saved"
    document.querySelector('.word-card').style.backgroundColor = "#fff9c4";
}