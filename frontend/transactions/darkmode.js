
let darkMode = localStorage.getItem('dark-mode'); 


const themeSwitch = document.getElementById('theme-switch');

const enableDarkMode = () => {

    document.body.classList.add('dark-mode');
    
 
    localStorage.setItem('dark-mode', 'active');
};


const disableDarkMode = () => {

    document.body.classList.remove('dark-mode');
    

    localStorage.setItem('dark-mode', 'inactive');
};


if (darkMode === 'active') { 
    enableDarkMode(); 
}


themeSwitch.addEventListener('click', () => {
    

    darkMode = localStorage.getItem('dark-mode');
    

    if (darkMode !== 'active') { 
        enableDarkMode(); 
    } else { 
        disableDarkMode(); 
    }
});