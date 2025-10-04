// --- company.js ---
// Handles all logic for the company_dashboard.html page.

document.addEventListener('DOMContentLoaded', () => {
    // --- Check for login status ---
    // If not logged in as a company, redirect to login page.
    // This is a simple client-side check. The server-side check in the API is the main security measure.
    // We can't use a direct fetch here to check session, so we'll rely on the API endpoints to fail
    // if the session isn't valid. The UI will just appear broken, which is acceptable for this level.
    
    // --- Elements ---
    const companyNameSpan = document.getElementById('companyName');
    const logoutButton = document.getElementById('logoutButton');
    const medicineForm = document.getElementById('medicineForm');
    const myMedicinesTableBody = document.querySelector('#myMedicinesTable tbody');
    const allMedicinesTableBody = document.querySelector('#allMedicinesTable tbody');
    const messageContainer = document.getElementById('message-container');
    const formTitle = document.getElementById('form-title');
    const medicineIdInput = document.getElementById('medicineId');
    const clearFormBtn = document.getElementById('clearFormBtn');

    // --- Initial Data Loading ---
    loadMyMedicines();
    loadAllMedicines();

    // --- Event Listeners ---
    logoutButton.addEventListener('click', logout);
    medicineForm.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', resetForm);

    /**
     * Handles submission of the add/edit medicine form.
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const medicineData = {
            id: medicineIdInput.value,
            medicine_name: document.getElementById('medicine_name').value,
            ingredients: document.getElementById('ingredients').value,
            use_case: document.getElementById('use_case').value,
        };

        const isUpdating = medicineData.id !== '';
        const url = `api/company.php?action=${isUpdating ? 'update_medicine' : 'add_medicine'}`;
        const method = 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicineData)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                resetForm();
                loadMyMedicines(); // Refresh the list of my medicines
            } else {
                 if (response.status === 403) { // Session expired or invalid
                    window.location.href = 'login.html';
                }
                showMessage(result.error || 'An error occurred.', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('Could not connect to the server.', 'error');
        }
    }

    /**
     * Fetches and displays the logged-in company's medicines.
     */
    async function loadMyMedicines() {
        try {
            const response = await fetch('api/company.php?action=get_my_medicines');
            
            if (response.status === 403) { // Unauthorized, redirect to login
                 window.location.href = 'login.html';
                 return;
            }

            const medicines = await response.json();
            
            myMedicinesTableBody.innerHTML = ''; // Clear existing rows
            if (medicines.length === 0) {
                 myMedicinesTableBody.innerHTML = '<tr><td colspan="4">You have not added any medicines yet.</td></tr>';
            } else {
                medicines.forEach(med => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${escapeHTML(med.medicine_name)}</td>
                        <td>${escapeHTML(med.ingredients)}</td>
                        <td>${escapeHTML(med.use_case)}</td>
                        <td class="action-buttons">
                            <button class="btn btn-tertiary" onclick="editMedicine(${med.id},'${escapeJS(med.medicine_name)}','${escapeJS(med.ingredients)}','${escapeJS(med.use_case)}')">Edit</button>
                            <button class="btn btn-secondary" onclick="deleteMedicine(${med.id})">Delete</button>
                        </td>
                    `;
                    myMedicinesTableBody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading my medicines:', error);
             myMedicinesTableBody.innerHTML = '<tr><td colspan="4">Error loading medicines. Please try again.</td></tr>';
        }
    }


    /**
     * Fetches and displays all medicines from approved companies.
     */
    async function loadAllMedicines() {
        try {
            const response = await fetch('api/company.php?action=get_all_medicines');
            const medicines = await response.json();

            allMedicinesTableBody.innerHTML = '';
            if (medicines.length > 0) {
                medicines.forEach(med => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${escapeHTML(med.medicine_name)}</td>
                        <td>${escapeHTML(med.company_name)}</td>
                        <td>${escapeHTML(med.license_number)}</td>
                        <td>${escapeHTML(med.ingredients)}</td>
                    `;
                    allMedicinesTableBody.appendChild(row);
                });
            } else {
                allMedicinesTableBody.innerHTML = '<tr><td colspan="4">No approved medicines found in the system.</td></tr>';
            }
        } catch (error) {
             console.error('Error loading all medicines:', error);
             allMedicinesTableBody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
        }
    }


    /**
     * Logs the user out.
     */
    async function logout() {
        await fetch('api/auth.php?action=logout');
        window.location.href = 'login.html';
    }
    
    /**
     * Displays a message to the user.
     */
    function showMessage(text, type) {
        messageContainer.textContent = text;
        messageContainer.className = type === 'success' ? 'message-success' : 'message-error';
        messageContainer.style.display = 'block';
        setTimeout(() => { messageContainer.style.display = 'none'; }, 4000);
    }
    
    /**
     * Resets the medicine form to its initial state.
     */
    function resetForm() {
        medicineForm.reset();
        medicineIdInput.value = '';
        formTitle.textContent = 'Add New Medicine';
    }

    /**
     * Escapes HTML characters to prevent XSS.
     */
    function escapeHTML(str) {
        return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    
    /**
    * Escapes characters for safe insertion into JavaScript string literals.
    */
    function escapeJS(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }

    // --- Make functions globally accessible for inline onclick handlers ---
    window.editMedicine = (id, name, ingredients, use_case) => {
        medicineIdInput.value = id;
        document.getElementById('medicine_name').value = name;
        document.getElementById('ingredients').value = ingredients;
        document.getElementById('use_case').value = use_case;
        formTitle.textContent = 'Edit Medicine';
        window.scrollTo(0, 0); // Scroll to top to see the form
    };

    window.deleteMedicine = async (id) => {
        if (!confirm('Are you sure you want to delete this medicine?')) {
            return;
        }

        try {
            const response = await fetch('api/company.php?action=delete_medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(result.message, 'success');
                loadMyMedicines();
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showMessage('Could not connect to the server.', 'error');
        }
    };
});
    