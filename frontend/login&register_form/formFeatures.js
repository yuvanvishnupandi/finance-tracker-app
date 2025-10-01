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

    
    const displayError = (inputElement, message) => {
        const errorElement = inputElement.parentElement.nextElementSibling;
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    };

   
    const clearError = (inputElement) => {
        const errorElement = inputElement.parentElement.nextElementSibling;
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    };

    const validateForm = (form) => {
        let isValid = true;
        
        const isRequired = (input) => {
            if (input.value.trim() === '') {
                displayError(input, `${input.placeholder || input.id} is required.`);
                isValid = false;
                return true;
            }
            clearError(input);
            return false;
        };
        
        const usernameInput = form.querySelector('#signInUsername, #signUpUsername');
        const passwordInput = form.querySelector('#signInPassword, #signUpPassword');
        
        if (isRequired(usernameInput)) { /* checks username */ }
        if (isRequired(passwordInput)) { /* checks password */ }

        if (form.classList.contains('sign-up-form')) {
            const emailInput = document.getElementById('signUpEmail');
            const confirmPasswordInput = document.getElementById('signUpConfirmPassword');

            if (!isRequired(emailInput)) {
                 
                
                 const strictEmailRegex = /^[a-z0-9._%+-]+@(gmail|outlook|yahoo)\.com$/;
                 
                
                 const emailValue = emailInput.value.toLowerCase();

                if (!strictEmailRegex.test(emailValue)) {
                    displayError(emailInput, 'Must be lowercase and end with a common domain (e.g., @gmail.com).');
                    isValid = false;
                } else {
                    clearError(emailInput);
                }
            }

          
            if (passwordInput.value.trim() !== '') {
                const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
                if (!passwordRegex.test(passwordInput.value)) {
                    displayError(passwordInput, 'Min 8 chars, must include 1 uppercase and 1 number.');
                    isValid = false;
                } else {
                    clearError(passwordInput);
                }
            }
            
    
            if (passwordInput.value.trim() !== '' && confirmPasswordInput.value.trim() !== '') {
                if (passwordInput.value !== confirmPasswordInput.value) {
                    displayError(confirmPasswordInput, 'Passwords do not match.');
                    isValid = false;
                } else {
                    clearError(confirmPasswordInput);
                }
            } else if (isRequired(confirmPasswordInput)) {
                
            }
        }
        
        return isValid;
    };


    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(signInForm)) {
            alert('Sign In successful (Client-side mock)');
            signInForm.reset(); 
        }
    });

    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(signUpForm)) {
            alert('Sign Up successful (Client-side mock)');
            signUpForm.reset(); 
        }
    });

    
 
});