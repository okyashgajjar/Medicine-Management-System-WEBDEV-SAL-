// --- auth.js ---
// Handles logic for login.html and register.html.

document.addEventListener('DOMContentLoaded', () => {
    // --- Common Elements ---
    const messageContainer = document.getElementById('message-container');

    // --- Login Form Logic (login.html) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const userTypeSelect = document.getElementById('user_type');
        const identifierLabel = document.getElementById('identifierLabel');
        
        // Change label based on user type
        userTypeSelect.addEventListener('change', () => {
            identifierLabel.textContent = userTypeSelect.value === 'company' ? 'License Number' : 'Admin Username';
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('api/auth.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();

                if (response.ok) {
                    showMessage('Login successful. Redirecting...', 'success');
                    // Redirect to the appropriate dashboard
                    window.location.href = result.user_type === 'admin' ? 'admin_dashboard.html' : 'company_dashboard.html';
                } else {
                    showMessage(result.error || 'Login failed.', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('An error occurred. Please try again.', 'error');
            }
        });
    }


    // --- Registration Form Logic (register.html) ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

             if (data.password.length < 6) {
                showMessage('Password must be at least 6 characters long.', 'error');
                return;
            }

            try {
                const response = await fetch('api/auth.php?action=register_company', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.status === 201) {
                    showMessage(result.message, 'success');
                    registerForm.reset();
                } else {
                    showMessage(result.error || 'Registration failed.', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showMessage('An error occurred. Please try again.', 'error');
            }
        });
    }


    /**
     * Displays a message to the user.
     * @param {string} text - The message text.
     * @param {string} type - 'success' or 'error'.
     */
    function showMessage(text, type) {
        messageContainer.textContent = text;
        messageContainer.className = type === 'success' ? 'message-success' : 'message-error';
        messageContainer.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
});
