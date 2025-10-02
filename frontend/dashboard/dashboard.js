document.addEventListener('DOMContentLoaded', () => {

const appContainer = document.getElementById('appContainer'); 
const themeToggleBtn = document.getElementById('themeToggleBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationDropdown = document.getElementById('notificationDropdown');
const notificationBadge = document.getElementById('notificationBadge');

const openMobileMenuBtn = document.getElementById('openMobileMenu');
const closeMobileMenuBtn = document.getElementById('closeMobileMenu');
const mobileMenu = document.getElementById('mobileMenu');

const incomeVsExpenseChartElement = document.getElementById('incomeVsExpenseChart');
const expenseBreakdownChartElement = document.getElementById('expenseBreakdownChart');

const searchInput = document.getElementById('searchInput');

const viewAllLinks = document.querySelectorAll('.view-all-link');
const manageLinks = document.querySelectorAll('.manage-link');
const detailLinks = document.querySelectorAll('.detail-link');

const logoutLink = document.querySelector('.logout-link'); 

const filterableItems = document.querySelectorAll('.filterable-item');


const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');



const chartColors = {
income: 'rgba(25, 135, 84, 1)', 
expense: 'rgba(220, 53, 69, 1)', 
categories: [
'rgba(13, 110, 253, 1)', 
'rgba(25, 135, 84, 1)', 
'rgba(255, 193, 7, 1)', 
'rgba(108, 117, 125, 1)', 
'rgba(111, 66, 193, 1)' 
]
};


let incomeVsExpenseChartInstance = null;
let expenseBreakdownChartInstance = null;



function getChartThemeColors() {
const isDarkMode = document.body.classList.contains('dark-mode');
return {
grid: isDarkMode ? 'rgba(45, 55, 72, 0.5)' : 'rgba(233, 236, 239, 1)',
text: isDarkMode ? '#EAEAEA' : '#212529',
tooltipBg: isDarkMode ? '#1B2537' : '#FFFFFF',
tooltipBorder: isDarkMode ? '#2D3748' : '#E9ECEF'
};
}



function renderCharts() {
    if (!incomeVsExpenseChartElement || !expenseBreakdownChartElement) {
        return;
    }

    const theme = getChartThemeColors();
    Chart.defaults.color = theme.text;
    Chart.defaults.borderColor = theme.grid;

    if (incomeVsExpenseChartInstance) incomeVsExpenseChartInstance.destroy();
    if (expenseBreakdownChartInstance) expenseBreakdownChartInstance.destroy();



    incomeVsExpenseChartInstance = new Chart(incomeVsExpenseChartElement, {
        type: 'bar',
        data: {
            labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            datasets: [{
                label: 'Income',
                data: [50000, 52000, 48000, 58000, 60000, 59000],
                backgroundColor: chartColors.income,
                hoverBackgroundColor: chartColors.income
            }, {
                label: 'Expenses',
                data: [35000, 38000, 42000, 39000, 45000, 40000],
                backgroundColor: chartColors.expense,
                hoverBackgroundColor: chartColors.expense
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false,
                    grid: { color: theme.grid, borderColor: theme.grid },
                    ticks: { color: theme.text }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    grid: { color: theme.grid, borderColor: theme.grid },
                    ticks: {
                        color: theme.text,
                        callback: function(value) { return '₹ ' + value.toLocaleString(); }
                    }
                }
            },
            plugins: {
                legend: { labels: { color: theme.text } },
                tooltip: {}
            }
        }
    });


    expenseBreakdownChartInstance = new Chart(expenseBreakdownChartElement, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment'],
            datasets: [{
                data: [25, 20, 15, 30, 10],
                backgroundColor: chartColors.categories,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%', 
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: theme.text, boxWidth: 15 }
                },
                tooltip: {}
            }
        }
    });
}



const savedTheme = localStorage.getItem('theme');


if (savedTheme === 'dark-mode') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.querySelector('i').className = 'fas fa-sun';
    if (mobileMenu) mobileMenu.classList.add('dark-mode'); 
} else {
    document.body.classList.remove('dark-mode'); 
    themeToggleBtn.querySelector('i').className = 'fas fa-moon'; 
    if (mobileMenu) mobileMenu.classList.remove('dark-mode'); 
}


renderCharts();

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark-mode');
        themeToggleBtn.querySelector('i').className = 'fas fa-sun';
        if (mobileMenu) mobileMenu.classList.add('dark-mode');
    } else {
        localStorage.setItem('theme', 'light-mode');
        themeToggleBtn.querySelector('i').className = 'fas fa-moon';
        if (mobileMenu) mobileMenu.classList.remove('dark-mode'); 
    }
    renderCharts();
});



function toggleMobileMenu() {
    mobileMenu.classList.toggle('open');
}
if (openMobileMenuBtn && closeMobileMenuBtn && mobileMenu) {
    openMobileMenuBtn.addEventListener('click', toggleMobileMenu);
    closeMobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
            }
        });
    });
}


if (notificationBtn && notificationDropdown && notificationBadge) {
    notificationBtn.addEventListener('click', (event) => {
        notificationDropdown.classList.toggle('active');
        if (notificationDropdown.classList.contains('active')) {
            setTimeout(() => {
                notificationBadge.textContent = '0';
                notificationBadge.style.display = 'none';
            }, 500);
        }
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (
            !notificationDropdown.contains(event.target) &&
            !notificationBtn.contains(event.target)
        ) {
            notificationDropdown.classList.remove('active');
        }
    });

    if (notificationBadge.textContent === '0') {
        notificationBadge.style.display = 'none';
    } else {
        notificationBadge.style.display = 'block';
    }
}

document.querySelectorAll('.custom-select').forEach(select => {
    select.addEventListener('change', (e) => {
        const container = e.target.closest('.chart-card') || e.target.closest('.stat-card');
        const cardTitleElement = container ? container.querySelector('h4, p') : null;
        const cardTitle = cardTitleElement ? cardTitleElement.textContent.split('(')[0].trim() : 'Filter';
        console.log(`${cardTitle} filter changed to: ${e.target.value}`);
    });
});


desktopNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const linkText = link.textContent.trim();
        let targetPage = '';

        if (linkText.includes('Dashboard')) {
            targetPage = 'dashboard.html';
        } else if (linkText.includes('Transactions')) {
            targetPage = 'transactions.html';
        } else if (linkText.includes('Accounts')) {
            targetPage = 'accounts.html';
        } else if (linkText.includes('Saving Goals')) {
            targetPage = 'saving-goals.html';
        } else if (linkText.includes('Budgeting')) {
            targetPage = 'budgeting.html';
        } else {
            return; 
        }

        e.preventDefault(); 
        console.log(`Navigating to: ${targetPage}`);
        window.location.href = targetPage;
    });
});



viewAllLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); 
        console.log('Navigating to: Transactions Page (from Dashboard link)');
        window.location.href = 'transactions.html'; 
    });
});


manageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Navigating to: Budgeting/Manage Limits Page (from Dashboard link)');
        window.location.href = 'budgeting.html'; 
    });
});


detailLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Navigating to: Accounts/Detailed Stats Page (from Dashboard link)');
        window.location.href = 'accounts.html'; 
    });
});


const mobileMenuItems = document.querySelectorAll('#mobileMenu .nav-link');

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();

        if (event.target.closest('#mobileMenu')) {
             mobileMenuItems.forEach(item => {
                const itemText = item.textContent.toLowerCase();

                if (itemText.includes(searchTerm)) {
                    item.style.display = 'flex'; 
                } else {
                    item.style.display = 'none';
                }
            });
        }
    });
} else {
    console.warn("Search input with ID 'searchInput' was not found. Search functionality is disabled.");
}




if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        localStorage.removeItem('theme'); 
        console.log('User logged out. Redirecting to login page.');
        
 
        window.location.href = 'http://127.0.0.1:5501/auth/index.html'; 
    });
} else {
    
    console.warn("Logout link (selector '.logout-link' or by ID) not found. Logout functionality is disabled.");
}


});