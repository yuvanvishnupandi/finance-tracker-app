document.addEventListener('DOMContentLoaded', () => {

    // --- References ---
    const modal = document.getElementById('budgetModal');
    const setNewBudgetBtn = document.getElementById('setNewBudgetBtn');
    const closeBtnModal = document.querySelector('.close-btn-modal');
    const budgetForm = document.getElementById('budgetForm');
    const budgetsGrid = document.getElementById('budgetsGrid');
    
    // Mobile/Theme/Notification references
    const logoutLinks = document.querySelectorAll('.logout-link, .logout-mobile'); 
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileMenu = document.getElementById('mobileMenu'); 
    const openMobileMenuBtn = document.getElementById('openMobileMenu');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenu');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBadge = document.getElementById('notificationBadge');

    // --- State & Dummy Data (MOCK) ---
    let editingBudgetId = null;
    let budgetData = [
        { id: 'b1', category: 'food', name: 'Food & Dining', limit: 5000, spent: 3500, alert: 90 },
        { id: 'b2', category: 'shopping', name: 'Shopping', limit: 10000, spent: 9500, alert: 90 },
        { id: 'b3', category: 'transport', name: 'Transport', limit: 5000, spent: 6500, alert: 90 }
    ];

    // -------------------------------------------------------------------------
    // --- CORE UTILITY FUNCTIONS ---
    // -------------------------------------------------------------------------

    function updateSummaryData() {
        const totalBudgetedValue = budgetData.reduce((sum, b) => sum + b.limit, 0);
        const totalSpentValue = budgetData.reduce((sum, b) => sum + b.spent, 0);
        const remaining = totalBudgetedValue - totalSpentValue;

        document.getElementById('totalBudgeted').textContent = `₹ ${totalBudgetedValue.toLocaleString('en-IN')}`;
        document.getElementById('remainingBudget').textContent = `₹ ${Math.abs(remaining).toLocaleString('en-IN')}`;
        
        const remainingElement = document.getElementById('remainingBudget');
        remainingElement.classList.toggle('income', remaining >= 0);
        remainingElement.classList.toggle('expense', remaining < 0);
    }
    
    // Function to update the visual state of a budget card after edit/save
    function updateBudgetCardDOM(data) {
        const card = document.querySelector(`.budget-card[data-id="${data.id}"]`);
        if (!card) return;
        
        const percentUsed = (data.spent / data.limit) * 100;
        const remaining = data.limit - data.spent;
        const isOver = remaining < 0;
        
        // Determine color based on usage
        let barColor = 'var(--green-success)';
        let alertTagClass = 'safe';
        let statusText = `₹ ${Math.abs(remaining).toLocaleString('en-IN')} Left`;

        if (isOver) {
            barColor = 'var(--red-danger)';
            alertTagClass = 'exceeded';
            statusText = `Over by ₹ ${Math.abs(remaining).toLocaleString('en-IN')}`;
        } else if (percentUsed >= data.alert) {
            barColor = 'orange';
            alertTagClass = 'alert-near';
        }

        // Update card elements
        card.querySelector('.category-name').textContent = data.name;
        card.querySelector('.limit-value').textContent = `₹ ${data.limit.toLocaleString('en-IN')}`;
        card.querySelector('.spent-value').textContent = `₹ ${data.spent.toLocaleString('en-IN')}`;
        card.querySelector('.progress-percentage').textContent = `${Math.min(100, percentUsed).toFixed(0)}% Used`;
        card.querySelector('.progress-status').textContent = statusText;
        card.querySelector('.progress-bar').style.width = `${Math.min(100, percentUsed)}%`;
        card.querySelector('.progress-bar').style.backgroundColor = barColor;
        
        // Update alert tag
        const tag = card.querySelector('.budget-alert-tag');
        tag.className = `budget-alert-tag ${alertTagClass}`;
        tag.textContent = alertTagClass.replace('-', ' ').toUpperCase();
    }


    // -------------------------------------------------------------------------
    // --- FEATURE HANDLERS (MODAL, FORM, ACTIONS) ---
    // -------------------------------------------------------------------------

    // Modal and Form Handlers (Set/Edit)
    if (setNewBudgetBtn) {
        setNewBudgetBtn.addEventListener('click', () => {
            editingBudgetId = null;
            document.getElementById('modalTitle').textContent = 'Set New Budget';
            document.querySelector('.modal-submit-btn').textContent = 'Save Budget';
            budgetForm.reset();
            document.getElementById('alertThreshold').value = 90; 
            modal.style.display = 'block';
            modal.classList.add('open');
        });
    }

    if (closeBtnModal) {
        closeBtnModal.addEventListener('click', () => {
            modal.classList.remove('open');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    // Form Submission handler
    if (budgetForm) {
        budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(budgetForm);
            const newBudgetData = Object.fromEntries(formData.entries());
            
            newBudgetData.limit = parseFloat(newBudgetData.budgetLimit);
            newBudgetData.alert = parseInt(newBudgetData.alertThreshold);
            
            const categorySelect = document.getElementById('budgetCategory');
            newBudgetData.name = categorySelect.options[categorySelect.selectedIndex].text;
            newBudgetData.category = newBudgetData.budgetCategory; 

            let targetId = editingBudgetId;
            let isEdit = !!editingBudgetId;
            let currentSpent = 0; // Initialize spent amount

            if (isEdit) {
                // Find existing budget to get current spent amount
                let existingBudget = budgetData.find(b => b.id === editingBudgetId);
                let index = budgetData.indexOf(existingBudget);
                
                if (existingBudget) {
                    currentSpent = existingBudget.spent; // Preserve existing spent amount

                    // Update data in the array
                    budgetData[index].name = newBudgetData.name;
                    budgetData[index].category = newBudgetData.category;
                    budgetData[index].limit = newBudgetData.limit;
                    budgetData[index].alert = newBudgetData.alert;
                    // spent is already preserved
                    
                    alert(`Budget for ${newBudgetData.name} updated! (MOCK)`);
                }
            } else {
                // ADD LOGIC
                targetId = Date.now().toString();
                newBudgetData.id = targetId;
                newBudgetData.spent = 0; // New budgets start at zero spent
                budgetData.push(newBudgetData);
                alert(`New budget for ${newBudgetData.name} set! (MOCK)`);
                
                // You would typically inject a new HTML card here for the new budget.
            }
            
            modal.classList.remove('open');
            setTimeout(() => modal.style.display = 'none', 300);
            
            // Get the final budget object (either new or updated)
            const finalBudget = budgetData.find(b => b.id === targetId);
            
            // Update the totals and the card
            if (finalBudget) {
                updateBudgetCardDOM(finalBudget);
            }
            updateSummaryData(); 
            // NOTE: A full page reload is required to see newly added budget cards if not using a render function.
        });
    }

    // Action Button Handlers (Edit/Delete)
    if (budgetsGrid) {
        budgetsGrid.addEventListener('click', (e) => {
            // *** CORRECTION APPLIED HERE ***
            // Use closest to find the specific button class (edit or delete) from the click target
            const editBtn = e.target.closest('.edit-budget-btn');
            const deleteBtn = e.target.closest('.delete-budget-btn');

            // Find the parent budget card from the click target
            const budgetCard = e.target.closest('.budget-card');

            if (!editBtn && !deleteBtn || !budgetCard) return; // Exit if no action button or no card is found

            const budgetId = budgetCard.getAttribute('data-id');
            const categoryName = budgetCard.querySelector('.category-name').textContent;
            const budget = budgetData.find(b => b.id === budgetId);
            
            if (editBtn && budget) {
                // Populate modal for editing
                editingBudgetId = budgetId;
                document.getElementById('modalTitle').textContent = `Edit Budget: ${categoryName}`;
                document.querySelector('.modal-submit-btn').textContent = 'Save Changes';
                
                document.getElementById('budgetCategory').value = budget.category;
                document.getElementById('budgetLimit').value = budget.limit;
                document.getElementById('alertThreshold').value = budget.alert;

                modal.style.display = 'block';
                modal.classList.add('open');
            } else if (deleteBtn) {
                // Delete logic
                if (confirm(`Are you sure you want to delete the budget for ${categoryName}?`)) {
                    budgetData = budgetData.filter(b => b.id !== budgetId);
                    budgetCard.remove(); 
                    updateSummaryData();
                    alert(`Budget for ${categoryName} deleted!`);
                }
            }
        });
    }


    // -------------------------------------------------------------------------
    // --- UX/ACCESSIBILITY HANDLERS (MOBILE, THEME, NOTIFICATION, LOGOUT) ---
    // -------------------------------------------------------------------------
    
    // Theme Toggle (Self-Contained and Functional)
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme');
        const isDarkModeActive = savedTheme === 'dark-mode';

        document.body.classList.toggle('dark-mode', isDarkModeActive);
        if (mobileMenu) mobileMenu.classList.toggle('dark-mode', isDarkModeActive);
        themeToggleBtn.querySelector('i').className = isDarkModeActive ? 'fas fa-sun' : 'fas fa-moon';


        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkModeToggle = document.body.classList.contains('dark-mode');
            
            if (mobileMenu) mobileMenu.classList.toggle('dark-mode', isDarkModeToggle);

            if (isDarkModeToggle) {
                localStorage.setItem('theme', 'dark-mode');
                themeToggleBtn.querySelector('i').className = 'fas fa-sun';
            } else {
                localStorage.setItem('theme', 'light-mode');
                themeToggleBtn.querySelector('i').className = 'fas fa-moon';
            }
        });
    }
    
    // Mobile Menu Toggle
    function toggleMobileMenu() {
        if (mobileMenu) mobileMenu.classList.toggle('open');
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

    // Notification Button
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


    // Logout Functionality
    if (logoutLinks.length > 0) {
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                localStorage.removeItem('theme'); 
                localStorage.removeItem('authToken'); 
                localStorage.removeItem('username'); 
                window.location.href = '../auth/index.html'; 
            });
        });
    }
    
    // --- Initial Load ---
    updateSummaryData();
    budgetData.forEach(updateBudgetCardDOM); 
});