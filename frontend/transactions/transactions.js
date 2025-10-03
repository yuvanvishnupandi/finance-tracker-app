document.addEventListener('DOMContentLoaded', () => {

    // --- References ---
    const modal = document.getElementById('transactionModal');
    const addNewTransactionBtn = document.getElementById('addNewTransactionBtn');
    const refreshTransactionsBtn = document.getElementById('refreshTransactionsBtn');
    const closeBtnModal = document.querySelector('.close-btn-modal');
    const transactionForm = document.getElementById('transactionForm');
    const modalTitle = modal.querySelector('h2');
    const modalSubmitBtn = modal.querySelector('.modal-submit-btn');
    const transactionTableBody = document.querySelector('#transactionTable tbody');
    // Removed #transactionSearchInput from the query selector below
    const filterControls = document.querySelectorAll('.filter-select'); 
    const sortDateBtn = document.getElementById('sortDateBtn');
    
    // 👇 NEW LINE: Reference for all logout links (desktop and mobile)
    const logoutLinks = document.querySelectorAll('.logout-link, .logout-mobile'); 

    // Master data source array, initialized by parsing existing table rows
    let transactionData = [];

    // State variables
    let editingId = null;
    let sortOrder = 'desc'; // 'desc' for Newest First (default) or 'asc' for Oldest First

    // Utility functions 
    function getAccountDisplayName(id) {
        const select = document.getElementById('filter-account');
        if (!select) return id;

        const option = Array.from(select.options).find(opt => opt.value === id);
        return option ? option.textContent : id;
    }
    
    function formatDateToInput(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
        return date.toISOString().split('T')[0];
    }
    
    function formatDateToDisplay(date) {
        if (typeof date === 'string') {
            date = new Date(date.replace(/-/g, '/')); 
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
    
    function parseRowToData(row) {
        const id = row.querySelector('.edit-btn').getAttribute('data-id');
        const type = row.getAttribute('data-type');
        const amountText = row.querySelector('.amount-income, .amount-expense').textContent;
        const dateText = row.querySelector('td:nth-child(1)').textContent;

        const data = {
            id: id,
            date: formatDateToInput(dateText), // Stored as YYYY-MM-DD
            description: row.querySelector('td:nth-child(2)').textContent.replace(/ \u27F2.*/g, '').trim(),
            transactionType: type,
            category: row.getAttribute('data-category'),
            account: row.getAttribute('data-account'),
            amount: parseFloat(amountText.replace(/[+₹\s,]/g, '')),
            recurring: row.querySelector('.recurring-icon') ? 'on' : undefined
        };
        return data;
    }
    
    function createNewTransactionRow(data) {
        const isIncome = data.transactionType === 'income';
        const amountSign = isIncome ? '+' : '-';
        const amountClass = isIncome ? 'amount-income' : 'amount-expense';
        const badgeType = isIncome ? 'income-badge' : 'expense-badge';
        const rowType = isIncome ? 'income-row' : 'expense-row';

        const formattedDate = formatDateToDisplay(data.date);
        const formattedAmount = Number(data.amount).toLocaleString('en-IN');
        const displayAccount = getAccountDisplayName(data.account);

        const newRow = document.createElement('tr');
        newRow.classList.add('transaction-row', rowType);
        newRow.setAttribute('data-type', data.transactionType);
        newRow.setAttribute('data-category', data.category);
        newRow.setAttribute('data-account', data.account);
        newRow.setAttribute('data-id', data.id);

        newRow.innerHTML = `
            <td>${formattedDate}</td>
            <td>${data.description} ${data.recurring === 'on' ? '<i class="fas fa-redo recurring-icon"></i>' : ''}</td>
            <td><span class="badge ${badgeType}">${data.transactionType}</span></td>
            <td>${data.category}</td>
            <td>${displayAccount}</td>
            <td class="text-right ${amountClass}">${amountSign}₹ ${formattedAmount}</td>
            <td class="text-center action-cells">
                <button class="action-btn edit-btn" data-id="${data.id}" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${data.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        return newRow;
    }

    function initializeTransactions() {
        const existingRows = Array.from(document.querySelectorAll('#transactionTable tbody .transaction-row'));
        transactionData = existingRows.map(row => parseRowToData(row));
        sortTransactionsAndRender(sortOrder);
    }
    
    // --- Sorting Logic ---
    function sortTransactionsAndRender(order) {
        transactionData.sort((a, b) => {
            if (order === 'asc') {
                return a.date.localeCompare(b.date); 
            } else {
                return b.date.localeCompare(a.date);
            }
        });

        transactionTableBody.innerHTML = '';
        transactionData.forEach(data => {
            transactionTableBody.appendChild(createNewTransactionRow(data));
        });

        // Update the sort arrow icon (targets the second icon in the button)
        const sortIcon = sortDateBtn.querySelectorAll('i')[1]; 
        if (sortIcon) {
            if (order === 'asc') {
                sortIcon.className = 'fas fa-sort-amount-up-alt'; 
                sortDateBtn.title = 'Sort by Date (Oldest First)';
            } else {
                sortIcon.className = 'fas fa-sort-amount-down-alt';
                sortDateBtn.title = 'Sort by Date (Newest First)';
            }
        }

        applyFiltersAndSearch();
    }

    // Sort Button Handler
    if (sortDateBtn) {
        sortDateBtn.addEventListener('click', () => {
            sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'; 
            sortTransactionsAndRender(sortOrder);
            console.log(`Transactions sorted: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`);
        });
    }

    // --- Date Range Filter Helper ---
    function isDateInRange(transactionDateString, range) {
        if (range === 'all') return true;
        if (range === 'custom') return true; // Requires custom date inputs which aren't fully implemented

        const txDate = new Date(transactionDateString.replace(/-/g, '/'));
        const today = new Date();
        let startDate = new Date();
        let endDate = today;

        // Reset time to midnight for accurate day comparison
        today.setHours(0, 0, 0, 0);
        txDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        if (range === 'this-month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (range === 'last-month') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
        } else if (range === 'last-3-months') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        }

        return txDate >= startDate && txDate <= endDate;
    }

    // --- Filtering and Display Logic ---

    function updateTransactionCount(visibleCount, totalCount) {
        const transactionCountElement = document.getElementById('transactionCount');
        const maxDisplayed = Math.min(visibleCount, transactionData.length); 
        if (transactionCountElement) {
            transactionCountElement.textContent = `Showing 1 to ${maxDisplayed} of ${visibleCount} transactions`;
        }
    }

    function applyFiltersAndSearch() {
        const typeFilter = document.getElementById('filter-type').value;
        const accountFilter = document.getElementById('filter-account').value;
        const categoryFilter = document.getElementById('filter-category').value;
        const dateFilter = document.getElementById('filter-date-range').value; // Get the date filter value
        // const searchTerm = document.getElementById('transactionSearchInput').value.toLowerCase().trim(); // REMOVED SEARCH INPUT

        let visibleCount = 0;

        const transactionRows = Array.from(document.querySelectorAll('#transactionTable tbody .transaction-row'));

        transactionRows.forEach(row => {
            const rowType = row.getAttribute('data-type');
            const rowAccount = row.getAttribute('data-account');
            const rowCategory = row.getAttribute('data-category');
            // const rowDescription = row.querySelector('td:nth-child(2)').textContent.toLowerCase(); // REMOVED FOR SEARCH
            const rowDate = row.getAttribute('data-id') ? transactionData.find(t => t.id === row.getAttribute('data-id')).date : ''; // Get YYYY-MM-DD date

            let isVisible = true;

            // Basic Filters
            if (typeFilter !== 'all' && rowType !== typeFilter) { isVisible = false; }
            if (isVisible && accountFilter !== 'all' && rowAccount !== accountFilter) { isVisible = false; }
            if (isVisible && categoryFilter !== 'all' && rowCategory !== categoryFilter) { isVisible = false; }
            
            // Search Filter (Now completely removed)
            // if (isVisible && searchTerm && !rowDescription.includes(searchTerm)) { isVisible = false; }
            
            // Date Range Filter
            if (isVisible && dateFilter !== 'all' && !isDateInRange(rowDate, dateFilter)) { isVisible = false; }

            row.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                visibleCount++;
            }
        });

        updateTransactionCount(visibleCount, transactionData.length); 
    }

    // Filter Change Handlers
    filterControls.forEach(control => {
        // Only listening for 'change' now, as there's no input field
        control.addEventListener('change', applyFiltersAndSearch);
    });

    // --- Modal and Form Handlers ---

    function resetModalForAdd() {
        modalTitle.textContent = 'Add New Transaction';
        modalSubmitBtn.textContent = 'Save Transaction';
        transactionForm.reset();
        document.querySelector('input[name="transactionType"][value="income"]').checked = true;
        
        // FIX: Set default date to today for the Add transaction modal
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today; 
        
        editingId = null;
    }

    // Refresh Button Handler
    if (refreshTransactionsBtn) {
        refreshTransactionsBtn.addEventListener('click', () => {
            applyFiltersAndSearch();
            console.log('Transaction list refreshed and filters re-applied.');
        });
    }

    // Open Modal
    if (addNewTransactionBtn) {
        addNewTransactionBtn.addEventListener('click', () => {
            resetModalForAdd();
            modal.classList.add('open');
            modal.style.display = 'block';
        });
    }

    // Close Modal
    if (closeBtnModal) {
        closeBtnModal.addEventListener('click', () => {
            modal.classList.remove('open');
            setTimeout(() => modal.style.display = 'none', 300);
            resetModalForAdd();
        });
    }

    // Form Submission (Handles BOTH Add and Edit)
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(transactionForm);
            const transactionDataNew = Object.fromEntries(formData.entries());
            transactionDataNew.amount = parseFloat(transactionDataNew.amount);

            modal.classList.remove('open');
            setTimeout(() => modal.style.display = 'none', 300);

            if (editingId) {
                // EDIT/UPDATE LOGIC
                transactionDataNew.id = editingId;
                const index = transactionData.findIndex(t => t.id === editingId);
                if(index > -1) {
                    transactionData[index] = transactionDataNew;
                }
                alert(`Transaction ID ${editingId} successfully updated!`);

            } else {
                // ADD NEW LOGIC
                const newId = Date.now().toString();
                transactionDataNew.id = newId;
                transactionData.push(transactionDataNew);
                alert(`Transaction of ₹${transactionDataNew.amount} saved and added to the list!`);
            }
            
            // Re-sort and re-render after data change
            sortTransactionsAndRender(sortOrder);
            resetModalForAdd();
        });
    }

    // --- Action Button Handlers (Edit/Delete) ---

    if (transactionTableBody) {
        transactionTableBody.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.action-btn');
            const row = e.target.closest('.transaction-row');

            if (!actionBtn || !row) return;

            const transactionId = actionBtn.getAttribute('data-id');

            if (actionBtn.classList.contains('edit-btn')) {
                // EDIT FEATURE
                editingId = transactionId;
                const rowData = transactionData.find(t => t.id === transactionId);

                if (!rowData) {
                    console.error('Data not found for ID:', transactionId);
                    return;
                }

                modalTitle.textContent = `Edit Transaction (ID: ${transactionId})`;
                modalSubmitBtn.textContent = 'Save Changes';

                document.getElementById('amount').value = rowData.amount;
                document.getElementById('description').value = rowData.description;
                document.getElementById('category').value = rowData.category;
                document.getElementById('account').value = rowData.account;
                document.getElementById('date').value = rowData.date; 

                document.querySelector(`input[name="transactionType"][value="${rowData.transactionType}"]`).checked = true;
                document.getElementById('recurring').checked = rowData.recurring === 'on';

                modal.classList.add('open');
                modal.style.display = 'block';

            } else if (actionBtn.classList.contains('delete-btn')) {
                // DELETE FEATURE
                if (confirm(`Are you sure you want to permanently delete transaction ID: ${transactionId}?`)) {
                    transactionData = transactionData.filter(t => t.id !== transactionId);
                    alert('Transaction deleted!');
                    sortTransactionsAndRender(sortOrder); 
                }
            }
        });
    }

    // Initial load
    initializeTransactions();

    // 👇 NEW BLOCK: Logout Handler for Transactions Page
    if (logoutLinks.length > 0) {
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                
                // Clear user session data (Auth token, username, theme)
                localStorage.removeItem('theme'); 
                localStorage.removeItem('authToken'); 
                localStorage.removeItem('username'); 
                
                console.log('User logged out. Redirecting to login page.');
                
                // Redirect to the login page using the correct relative path
                window.location.href = '../auth/index.html'; 
            });
        });
    }
    
});