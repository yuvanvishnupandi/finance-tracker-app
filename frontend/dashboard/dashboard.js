document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION & ROUTE PROTECTION ---
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    // --- CORRECTED PATH ---
    /*
    // TEMPORARILY DISABLED FOR DESIGNING - Re-enable when backend is ready
    if (!authToken) {
        window.location.href = '../auth/index.html'; 
        return; 
    }
    */

    // --- DOM ELEMENT SELECTORS ---
    const appContainer = document.getElementById('app-container');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const themeSwitch = document.getElementById('theme-switch');

    // --- UI INITIALIZATION ---
    if (usernameDisplay && username) {
        usernameDisplay.textContent = username;
    } else if (usernameDisplay) {
        usernameDisplay.textContent = "Guest User"; // Placeholder for designing
    }

    if (localStorage.getItem('sidebar-collapsed') === 'true') {
        appContainer.classList.add('collapsed');
    }

    // --- EVENT LISTENERS ---
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('collapsed');
            const isCollapsed = appContainer.classList.contains('collapsed');
            localStorage.setItem('sidebar-collapsed', isCollapsed);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            // --- CORRECTED PATH ---
            window.location.href = '../auth/index.html';
        });
    }
    
    // --- DARK MODE LOGIC ---
    const enableDarkMode = () => {
        document.body.classList.add('dark-mode');
        localStorage.setItem('dark-mode', 'active');
    };
    const disableDarkMode = () => {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('dark-mode', 'inactive');
    };

    if (localStorage.getItem('dark-mode') === 'active') {
        enableDarkMode();
    }

    if (themeSwitch) {
        themeSwitch.addEventListener('click', () => {
            if (localStorage.getItem('dark-mode') !== 'active') {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        });
    }

    // --- CHARTS INITIALIZATION (with placeholder data) ---
    const monthlyTrendData = {
        labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        income: [50000, 52000, 48000, 55000, 60000, 58000],
        expenses: [35000, 38000, 42000, 39000, 45000, 41000],
    };

    const expenseBreakdownData = {
        labels: ['Food', 'Shopping', 'Transport', 'Bills', 'Entertainment'],
        data: [8500, 4200, 2100, 3500, 1950],
        colors: ['#0D6EFD', '#198754', '#FFC107', '#DC3545', '#6F42C1'],
    };

    const monthlyTrendCtx = document.getElementById('monthlyTrendChart')?.getContext('2d');
    if (monthlyTrendCtx) {
        new Chart(monthlyTrendCtx, {
            type: 'bar',
            data: {
                labels: monthlyTrendData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: monthlyTrendData.income,
                        backgroundColor: 'rgba(25, 135, 84, 0.7)',
                        borderColor: 'rgba(25, 135, 84, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                    },
                    {
                        label: 'Expenses',
                        data: monthlyTrendData.expenses,
                        backgroundColor: 'rgba(220, 53, 69, 0.7)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value / 1000 + 'k';
                            }
                        }
                    } 
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    const expensePieCtx = document.getElementById('expensePieChart')?.getContext('2d');
    if (expensePieCtx) {
        new Chart(expensePieCtx, {
            type: 'pie',
            data: {
                labels: expenseBreakdownData.labels,
                datasets: [{
                    label: 'Expenses',
                    data: expenseBreakdownData.data,
                    backgroundColor: expenseBreakdownData.colors,
                    hoverOffset: 8,
                    borderColor: document.body.classList.contains('dark-mode') ? '#1B2537' : '#FFFFFF',
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
});
