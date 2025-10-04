// --- admin.js ---
// Handles all logic for the admin_dashboard.html page.

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const logoutButton = document.getElementById('logoutButton');
    const companiesTableBody = document.querySelector('#companiesTable tbody');
    const adminMessageContainer = document.getElementById('admin-message-container');

    // Modal elements
    const modal = document.getElementById('medicinesModal');
    const modalCloseBtn = document.querySelector('.modal .close-button');
    const modalCompanyName = document.getElementById('modalCompanyName');
    const modalMedicinesTableBody = document.querySelector('#modalMedicinesTable tbody');

    // --- Initial Data Loading ---
    loadDashboardStats();
    loadAllCompanies();

    // --- Event Listeners ---
    logoutButton.addEventListener('click', logout);
    modalCloseBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    /**
     * Fetches and displays the dashboard statistics.
     */
    async function loadDashboardStats() {
        try {
            const response = await fetch('api/admin.php?action=get_dashboard_stats');
            if (response.status === 403) {
                window.location.href = 'login.html';
                return;
            }
            const stats = await response.json();
            document.getElementById('totalCompanies').textContent = stats.total_companies;
            document.getElementById('pendingCompanies').textContent = stats.pending_companies;
            document.getElementById('bannedCompanies').textContent = stats.banned_companies;
            document.getElementById('totalMedicines').textContent = stats.total_medicines;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    /**
     * Fetches and displays all registered companies.
     */
    async function loadAllCompanies() {
        try {
            const response = await fetch('api/admin.php?action=get_all_companies');
            const companies = await response.json();
            
            companiesTableBody.innerHTML = '';
            companies.forEach(company => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHTML(company.company_name)}</td>
                    <td>${escapeHTML(company.license_number)}</td>
                    <td>${escapeHTML(company.email)}</td>
                    <td>${getStatusBadge(company.status)}</td>
                    <td class="action-buttons">
                        ${generateActionButtons(company.id, company.status)}
                         <button class="btn btn-tertiary" onclick="viewMedicines(${company.id}, '${escapeJS(company.company_name)}')">Medicines</button>
                    </td>
                `;
                companiesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading companies:', error);
            companiesTableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
        }
    }

    /**
     * Generates action buttons based on company status.
     */
    function generateActionButtons(id, status) {
        let buttons = '';
        if (status === 'pending') {
            buttons += `<button class="btn btn-primary" onclick="updateStatus(${id}, 'approved')">Approve</button>`;
            buttons += `<button class="btn btn-secondary" onclick="updateStatus(${id}, 'banned')">Reject/Ban</button>`;
        } else if (status === 'approved') {
            buttons += `<button class="btn btn-secondary" onclick="updateStatus(${id}, 'banned')">Ban</button>`;
        } else if (status === 'banned') {
            buttons += `<button class="btn btn-primary" onclick="updateStatus(${id}, 'approved')">Unban</button>`;
        }
        return buttons;
    }
    
    /**
     * Creates a styled status badge.
     */
    function getStatusBadge(status) {
        const statusClass = `status-${status}`;
        return `<span class="status-badge ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
    }

    /**
     * Updates a company's status.
     */
    window.updateStatus = async (id, newStatus) => {
        if (!confirm(`Are you sure you want to ${newStatus} this company?`)) return;

        try {
            const response = await fetch('api/admin.php?action=update_company_status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            const result = await response.json();
            if (response.ok) {
                showMessage(result.message, 'success');
                loadAllCompanies(); // Refresh lists
                loadDashboardStats();
            } else {
                showMessage(result.error, 'error');
            }
        } catch (error) {
            showMessage('An error occurred.', 'error');
        }
    };
    
    /**
     * Opens a modal to view a company's medicines.
     */
    window.viewMedicines = async (companyId, companyName) => {
        modalCompanyName.textContent = `${companyName}'s Medicines`;
        modalMedicinesTableBody.innerHTML = '<tr><td>Loading...</td></tr>';
        modal.style.display = 'block';

        try {
            const response = await fetch(`api/admin.php?action=get_medicines_by_company&company_id=${companyId}`);
            const medicines = await response.json();
            
            modalMedicinesTableBody.innerHTML = '';
            if (medicines.length === 0) {
                modalMedicinesTableBody.innerHTML = '<tr><td>This company has no medicines.</td></tr>';
            } else {
                medicines.forEach(med => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${escapeHTML(med.medicine_name)}</td>
                        <td class="action-buttons">
                            <button class="btn btn-secondary" onclick="deleteMedicine(${med.id}, ${companyId}, '${escapeJS(companyName)}')">Delete</button>
                        </td>
                    `;
                    modalMedicinesTableBody.appendChild(row);
                });
            }
        } catch(error) {
            console.error("Error fetching medicines:", error);
            modalMedicinesTableBody.innerHTML = '<tr><td>Could not load medicines.</td></tr>';
        }
    };

    /**
     * Deletes a medicine as an admin.
     */
    window.deleteMedicine = async (medicineId, companyId, companyName) => {
        if (!confirm('ADMIN ACTION: Are you sure you want to permanently delete this medicine?')) return;

        try {
            const response = await fetch('api/admin.php?action=delete_medicine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: medicineId })
            });
            const result = await response.json();
            if(response.ok) {
                showMessage(result.message, 'success');
                viewMedicines(companyId, companyName); // Refresh modal list
                loadDashboardStats(); // Refresh stats
            } else {
                showMessage(result.error, 'error');
            }
        } catch(error) {
            showMessage('An error occurred.', 'error');
        }
    };

    /**
     * Logs the admin out.
     */
    async function logout() {
        await fetch('api/auth.php?action=logout');
        window.location.href = 'login.html';
    }

    function showMessage(text, type) {
        adminMessageContainer.textContent = text;
        adminMessageContainer.className = type === 'success' ? 'message-success' : 'message-error';
        adminMessageContainer.style.display = 'block';
        setTimeout(() => { adminMessageContainer.style.display = 'none'; }, 5000);
    }

    function escapeHTML(str) {
        return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function escapeJS(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
});
