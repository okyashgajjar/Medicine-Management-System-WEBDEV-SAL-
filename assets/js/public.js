// --- public.js ---
// Handles the logic for the public-facing medicine search page (index.html).

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const loader = document.getElementById('loader');

    // Perform search on button click
    searchButton.addEventListener('click', performSearch);
    
    // Perform search on pressing Enter in the input field
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    /**
     * Executes the search by calling the public API.
     */
    async function performSearch() {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            resultsContainer.innerHTML = '<p class="placeholder-text">Please enter at least 2 characters to search.</p>';
            return;
        }

        // Show loader and clear previous results
        loader.style.display = 'block';
        resultsContainer.innerHTML = '';

        try {
            const response = await fetch(`api/public.php?action=search_medicines&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                displayResults(data);
            } else {
                resultsContainer.innerHTML = `<p class="placeholder-text">${data.message || 'An error occurred.'}</p>`;
            }
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = '<p class="placeholder-text">Could not connect to the server. Please try again later.</p>';
        } finally {
            // Hide loader
            loader.style.display = 'none';
        }
    }

    /**
     * Renders the search results in the results container.
     * @param {Array} medicines - An array of medicine objects from the API.
     */
    function displayResults(medicines) {
        if (!medicines || medicines.length === 0) {
            resultsContainer.innerHTML = '<p class="placeholder-text">No medicines found matching your search.</p>';
            return;
        }

        resultsContainer.innerHTML = ''; // Clear placeholder
        
        medicines.forEach(medicine => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h4>${escapeHTML(medicine.medicine_name)}</h4>
                <p>
                    <strong>Company:</strong> ${escapeHTML(medicine.company_name)}
                    <span class="status-badge status-approved">Licensed Verified</span>
                </p>
                <p><strong>License #:</strong> ${escapeHTML(medicine.license_number)}</p>
                <p><strong>Use Case:</strong> ${escapeHTML(medicine.use_case)}</p>
                <p><strong>Ingredients:</strong> ${escapeHTML(medicine.ingredients)}</p>
            `;
            resultsContainer.appendChild(card);
        });
    }

    /**
     * A simple utility to escape HTML and prevent XSS.
     * @param {string} str - The string to escape.
     */
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
