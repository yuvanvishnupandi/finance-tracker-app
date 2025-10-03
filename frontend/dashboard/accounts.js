document.addEventListener('DOMContentLoaded', () => {

    // --- References ---
    const modal = document.getElementById('accountModal');
    const addNewAccountBtn = document.getElementById('addNewAccountBtn');
    const closeBtnModal = document.querySelector('.close-btn-modal');
    const accountForm = document.getElementById('accountForm');
    const accountsGrid = document.getElementById('accountsGrid'); 
    
    // Mobile/Theme/Notification references
    const logoutLinks = document.querySelectorAll('.logout-link, .logout-mobile'); 
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const mobileMenu = document.getElementById('mobileMenu'); 
    const openMobileMenuBtn = document.getElementById('openMobileMenu');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenu');
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBadge = document.getElementById('notificationBadge');

    // --- State & Dummy Data ---
    let editingAccountId = null;
    let accountsData = [
        { id: 'icici', name: 'ICICI Savings', type: 'savings', balance: 120000, accountName: 'ICICI Savings' },
        { id: 'hdfc', name: 'HDFC Credit Card', type: 'credit', balance: -5000, accountName: 'HDFC Credit Card' },
        { id: 'cash', name: 'Cash Wallet', type: 'cash', balance: 35450, accountName: 'Cash Wallet' }
    ];

    // -------------------------------------------------------------------------
    // --- CORE UTILITY FUNCTIONS (THEME, NET WORTH, DOM MANIPULATION) ---
    // -------------------------------------------------------------------------

    function createAccountCardHTML(data) {
        const isCredit = data.type === 'credit';
        const iconClass = data.type === 'savings' || data.type === 'checking' ? 'fa-university' : 
                          data.type === 'credit' ? 'fa-credit-card' : 
                          'fa-money-bill-wave';
        const iconColor = data.type === 'savings' || data.type === 'checking' ? 'var(--green-success)' : 
                          data.type === 'credit' ? 'var(--red-danger)' : 
                          'var(--primary-blue)';
        const balanceSign = isCredit ? '-₹ ' : '₹ ';
        const balanceClass = isCredit ? 'expense' : 'income';
        const displayType = data.type.charAt(0).toUpperCase() + data.type.slice(1) + 
                            (data.type === 'credit' ? ' Card' : ' Account'); 
        
        const balanceAmount = Math.abs(data.balance).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        return `
            <div class="account-card card-general" data-type="${data.type}" data-id="${data.id}">
                <div class="card-header">
                    <i class="fas ${iconClass} account-icon" style="color: ${iconColor};"></i>
                    <div class="card-actions">
                        <button class="action-btn edit-account-btn" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-account-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <h3 class="account-name">${data.name}</h3>
                <p class="account-type">${displayType}</p>
                <p class="account-balance ${balanceClass}">${balanceSign}${balanceAmount}</p>
                <a href="#" class="view-history-link">View Transactions History <i class="fas fa-chevron-right"></i></a>
            </div>
        `;
    }

    function updateAccountCardDOM(data) {
        const card = document.querySelector(`.account-card[data-id="${data.id}"]`);
        if (!card) return;

        const balanceElement = card.querySelector('.account-balance');
        const balanceAmount = Math.abs(data.balance).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const isCredit = data.type === 'credit';
        const displayType = data.type.charAt(0).toUpperCase() + data.type.slice(1) + 
                            (isCredit ? ' Card' : ' Account'); 
        const iconColor = data.type === 'savings' || data.type === 'checking' ? 'var(--green-success)' : 
                          data.type === 'credit' ? 'var(--red-danger)' : 
                          'var(--primary-blue)';

        card.querySelector('.account-name').textContent = data.name;
        card.querySelector('.account-type').textContent = displayType;
        card.querySelector('.account-icon').style.color = iconColor;

        balanceElement.textContent = `${isCredit ? '-₹ ' : '₹ '}${balanceAmount}`;
        balanceElement.classList.toggle('expense', isCredit);
        balanceElement.classList.toggle('income', !isCredit);
    }
    
    function calculateNetWorth() {
        const total = accountsData.reduce((sum, account) => sum + account.balance, 0);
        document.getElementById('totalNetWorth').textContent = 
            `₹ ${total.toLocaleString('en-IN')}`;
    }

    // -------------------------------------------------------------------------
    // --- FEATURE HANDLERS (MODAL, FORM, ACTIONS) ---
    // -------------------------------------------------------------------------

    // Modal and Form Handlers (Add/Edit)
    if (addNewAccountBtn) {
        addNewAccountBtn.addEventListener('click', () => {
            editingAccountId = null;
            document.getElementById('modalTitle').textContent = 'Add New Account';
            document.querySelector('.modal-submit-btn').textContent = 'Save Account';
            accountForm.reset();
            document.getElementById('accountType').value = 'savings'; 
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
    if (accountForm) {
        accountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(accountForm);
            const accountDataNew = Object.fromEntries(formData.entries());
            accountDataNew.balance = parseFloat(accountDataNew.initialBalance);
            accountDataNew.name = accountDataNew.accountName; 

            let targetId = editingAccountId; 
            let isEdit = !!editingAccountId;

            if (isEdit) {
                // EDIT LOGIC
                let index = accountsData.findIndex(a => a.id === editingAccountId);
                if (index > -1) {
                    accountsData[index].name = accountDataNew.accountName;
                    accountsData[index].type = accountDataNew.accountType;
                    accountsData[index].balance = accountDataNew.balance;
                    alert(`Account '${accountDataNew.accountName}' updated! (MOCK)`);
                }
            } else {
                // ADD NEW LOGIC
                targetId = Date.now().toString(); 
                accountDataNew.id = targetId;
                accountsData.push(accountDataNew);
                alert(`Account '${accountDataNew.accountName}' saved! (MOCK)`);
                
                // Inject the new card HTML into the grid (FIX)
                if (accountsGrid) {
                    const newCardHTML = createAccountCardHTML(accountDataNew);
                    accountsGrid.insertAdjacentHTML('beforeend', newCardHTML);
                }
            }
            
            modal.classList.remove('open');
            setTimeout(() => modal.style.display = 'none', 300);
            
            // Update the HTML card visually 
            updateAccountCardDOM(accountsData.find(a => a.id === targetId));
            
            calculateNetWorth(); 
        });
    }

    // Action Button Handlers (Edit/Delete - Event Delegation)
    if (accountsGrid) {
        accountsGrid.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.action-btn');
            const accountCard = e.target.closest('.account-card');
            if (!actionBtn || !accountCard) return;

            const accountId = accountCard.getAttribute('data-id');
            const accountName = accountCard.querySelector('.account-name').textContent;
            const accountData = accountsData.find(a => a.id === accountId);

            if (actionBtn.classList.contains('edit-account-btn') && accountData) {
                editingAccountId = accountId;
                document.getElementById('modalTitle').textContent = `Edit Account: ${accountName}`;
                document.querySelector('.modal-submit-btn').textContent = 'Save Changes';
                document.getElementById('accountName').value = accountData.name;
                document.getElementById('accountType').value = accountData.type;
                document.getElementById('initialBalance').value = accountData.balance;

                modal.style.display = 'block';
                modal.classList.add('open');
            } else if (actionBtn.classList.contains('delete-account-btn')) {
                if (confirm(`Are you sure you want to permanently delete the account: ${accountName}?`)) {
                    accountsData = accountsData.filter(a => t => t.id !== accountId);
                    accountCard.remove(); 
                    calculateNetWorth();
                    alert(`Account '${accountName}' deleted successfully! (MOCK)`);
                }
            }
        });
    }


    // -------------------------------------------------------------------------
    // --- UX/ACCESSIBILITY HANDLERS (MOBILE, THEME, NOTIFICATION) ---
    // -------------------------------------------------------------------------
    
    // **FIX: Dark Mode (Self-Contained and Functional)**
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
    
    // **FIX: Mobile Menu Toggle**
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

    // **FIX: Notification Button**
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


    // --- CORE LOGOUT FUNCTIONALITY ---
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
    calculateNetWorth();
});