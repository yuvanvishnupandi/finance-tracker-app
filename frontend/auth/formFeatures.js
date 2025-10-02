document.addEventListener('DOMContentLoaded', () => {
 
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        const wrapper = icon.closest('.password-toggle-wrapper');
        const tooltip = wrapper ? wrapper.querySelector('.password-tooltip') : null;

        if (wrapper) {
            wrapper.addEventListener('mouseover', () => {
                if (tooltip) {
                    tooltip.textContent = icon.classList.contains('fa-eye-slash') ? 'Show password' : 'Hide password';
                }
            });
        }

        icon.addEventListener('click', () => {
            const passwordInput = icon.parentElement.parentElement.querySelector('input[type="password"], input[type="text"]');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                if (tooltip) tooltip.textContent = 'Hide password';
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                if (tooltip) tooltip.textContent = 'Show password';
            }
        });
    });

    const signInForm = document.querySelector('.sign-in-form');
    const signUpForm = document.querySelector('.sign-up-form');
    const container = document.querySelector(".container");

    const displayError = (inputElement, message) => {
        const errorElement = inputElement.closest('.input-field').nextElementSibling;
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
    };

    const clearAllErrors = (form) => {
        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('visible');
        });
    };

    const validateForm = (form) => {
        let isValid = true;
        clearAllErrors(form);
        
        const isRequired = (input) => {
            if (input.value.trim() === '') {
                displayError(input, `${input.placeholder || input.id} is required.`);
                isValid = false;
                return true;
            }
            return false;
        };
        
        const usernameInput = form.querySelector('#signInUsername, #signUpUsername');
        const passwordInput = form.querySelector('#signInPassword, #signUpPassword');
        
        if (isRequired(usernameInput)) {}
        if (isRequired(passwordInput)) {}

        if (form.classList.contains('sign-up-form')) {
            const emailInput = document.getElementById('signUpEmail');
            const confirmPasswordInput = document.getElementById('signUpConfirmPassword');

            if (!isRequired(emailInput)) {
                 const strictEmailRegex = /^[a-z0-9._%+-]+@(gmail|outlook|yahoo)\.com$/;
                 const emailValue = emailInput.value.toLowerCase();
                if (!strictEmailRegex.test(emailValue)) {
                    displayError(emailInput, 'Must be a common domain (e.g., @gmail.com).');
                    isValid = false;
                }
            }
            
            if (passwordInput.value.trim() !== '') {
                const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
                if (!passwordRegex.test(passwordInput.value)) {
                    displayError(passwordInput, 'Min 8 chars, 1 uppercase, 1 number.');
                    isValid = false;
                }
            }
    
            if (!isRequired(confirmPasswordInput)) {
                 if (passwordInput.value !== confirmPasswordInput.value) {
                    displayError(confirmPasswordInput, 'Passwords do not match.');
                    isValid = false;
                }
            }
        }
        
        return isValid;
    };

 

    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(signInForm)) {
            const usernameInput = signInForm.querySelector('#signInUsername');
            const passwordInput = signInForm.querySelector('#signInPassword');

            const loginData = {
                email: usernameInput.value,
                password: passwordInput.value
            };

            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('username', data.username);
                    
                  
                    window.location.href = '../dashboard/dashboard.html';

                } else {
                    const errorData = await response.json();
                    displayError(usernameInput, errorData.message || 'Login failed.');
                }
            } catch (error) {
                console.error('Login error:', error);
                displayError(usernameInput, 'Could not connect to the server.');
            }
        }
    });

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(signUpForm)) {
            const usernameInput = signUpForm.querySelector('#signUpUsername');
            const emailInput = signUpForm.querySelector('#signUpEmail');
            const passwordInput = signUpForm.querySelector('#signUpPassword');

            const signupData = {
                name: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            };

            try {
                const response = await fetch('http://localhost:8080/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(signupData)
                });

                if (response.ok) {
                    alert('Sign Up successful! Please sign in.');
                    signUpForm.reset();
                    clearAllErrors(signUpForm);
                    container.classList.remove("sign-up-mode");
                } else {
                    const errorData = await response.json();
                    displayError(emailInput, errorData.message || 'Sign up failed.');
                }
            } catch (error) {
                console.error('Signup error:', error);
                displayError(usernameInput, 'Could not connect to the server.');
            }
        }
    });
});

