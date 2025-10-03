// --- MOCK DATA SIMULATING BACKEND RESPONSE ---
let savingsGoals = [
    {
        goalId: 1,
        name: "New MacBook Pro",
        targetAmount: 180000.00,
        savedAmount: 45000.00,
        targetDate: "2026-05-01",
        status: "IN_PROGRESS"
    },
    {
        goalId: 2,
        name: "Emergency Fund",
        targetAmount: 50000.00,
        savedAmount: 50000.00,
        targetDate: "2025-01-31",
        status: "COMPLETED"
    },
    {
        goalId: 3,
        name: "Europe Trip",
        targetAmount: 250000.00,
        savedAmount: 8500.00,
        targetDate: "2027-08-15",
        status: "IN_PROGRESS"
    }
];

// Mock Accounts Data (to populate the contribution source dropdown)
const mockAccounts = [
    { id: 'icici', name: 'ICICI Savings', balance: 120000 },
    { id: 'hdfc', name: 'HDFC Credit Card', balance: -5000 },
    { id: 'cash', name: 'Cash Wallet', balance: 35450 }
];


// --- DOM ELEMENTS ---
const goalsList = document.getElementById('goals-list');
const addGoalBtn = document.getElementById('add-goal-btn');
const goalFormContainer = document.getElementById('goal-form-container');
const newGoalForm = document.getElementById('new-goal-form');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const loadingMessage = document.getElementById('loading-message');

const modal = document.getElementById('contribution-modal');
const modalGoalName = document.getElementById('modal-goal-name');
const contributeForm = document.getElementById('contribute-form');
const contributingGoalId = document.getElementById('contributing-goal-id');
const contributionAmountInput = document.getElementById('contribution-amount');
const sourceAccountSelect = document.getElementById('source-account');
const closeBtnModal = document.querySelector('.close-btn-modal');


// --- UTILITY FUNCTIONS ---
// FIX: Ensure currency formatting is clean (no decimal points for large amounts)
const formatCurrency = (amount) => `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const calculateRemaining = (target, saved) => target - saved;

// Checks if the dark mode is currently active.
const isDarkMode = () => document.body.classList.contains('dark-mode');

// --- RENDERING FUNCTIONS ---

/** Renders the list of goal cards to the DOM. */
const renderGoals = () => {
    goalsList.innerHTML = ''; // Clear existing goals
    loadingMessage.textContent = ''; // Hide loading message

    if (savingsGoals.length === 0) {
        goalsList.innerHTML = '<p>You have no savings goals yet. Start one now!</p>';
        return;
    }

    // Sort: In Progress first, then Completed
    const sortedGoals = savingsGoals.sort((a, b) => {
        if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
        if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
        return 0;
    });


    sortedGoals.forEach(goal => {
        const percentage = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100).toFixed(1);
        const remaining = calculateRemaining(goal.targetAmount, goal.savedAmount);
        const isCompleted = goal.status === 'COMPLETED';
        const progressClass = isCompleted ? 'status-completed' : '';

        // --- Monthly Save and Days Left Calculation FIX ---
        let monthlySaveText = 'N/A';
        let daysRemainingText = 'No target date';

        if (goal.targetDate) {
            const target = new Date(goal.targetDate);
            const today = new Date();
            
            // Calculate Days Remaining
            const timeDiff = target.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            daysRemainingText = daysDiff > 0 ? `${daysDiff} Days` : '0 Days';
            
            // Calculate Monthly Save only if the goal is not complete AND date is in the future
            if (remaining > 0 && daysDiff > 0) {
                // Approximate months remaining: days / (365.25 / 12) 
                const monthsRemaining = daysDiff / 30.4375; 
                
                if (monthsRemaining >= 1) { // Calculate suggested amount only if at least one month remains
                    const suggestedAmount = remaining / monthsRemaining;
                    monthlySaveText = `<span style="font-weight: 600;">${formatCurrency(suggestedAmount)}</span>`;
                } else if (daysDiff > 0) {
                     // If less than a month, show the remaining amount
                     monthlySaveText = `<span style="font-weight: 600;">${formatCurrency(remaining)} (Due Soon)</span>`;
                }
            } else if (isCompleted) {
                 monthlySaveText = `N/A`;
            } else if (daysDiff <= 0 && !isCompleted) {
                 monthlySaveText = `<span style="color: var(--red-danger); font-weight: 600;">Past Due: ${formatCurrency(remaining)}</span>`;
            }
        }
        // --- End Calculation FIX ---

        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card card-general';

        goalCard.innerHTML = `
            <h3>${goal.name}</h3>
            <div class="progress-bar-container">
                <div class="progress-bar ${progressClass}" style="width: ${percentage}%">
                    ${percentage}%
                </div>
            </div>
            <div class="goal-details">
                <p><strong>Target:</strong> <span>${formatCurrency(goal.targetAmount)}</span></p>
                <p><strong>Saved:</strong> <span class="amount-saved">${formatCurrency(goal.savedAmount)}</span></p>
                <p><strong>Remaining:</strong> <span class="amount-remaining">${formatCurrency(remaining)}</span></p>
                <p><strong>Target Date:</strong> <span>${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('en-IN') : 'N/A'}</span></p>
                <p><strong>Days Left:</strong> <span>${daysRemainingText}</span></p>
                <p><strong>Monthly Save:</strong> <span>${monthlySaveText}</span></p>
            </div>
            <button class="btn-primary contribute-btn" data-goal-id="${goal.goalId}" data-goal-name="${goal.name}" ${isCompleted ? 'disabled' : ''}>
                ${isCompleted ? 'Goal Achieved' : 'Contribute Funds'}
            </button>
        `;
        goalsList.appendChild(goalCard);
    });

    // Re-attach listeners every time the list is rendered
    attachContributeListeners();
};

/** Populates the source account dropdown in the modal. */
const populateSourceAccounts = () => {
    sourceAccountSelect.innerHTML = '<option value="" disabled selected>Select Source Account</option>';
    
    mockAccounts.forEach(account => {
        const balanceDisplay = formatCurrency(account.balance);
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = `${account.name} (${account.balance >= 0 ? '+' : ''}${balanceDisplay})`;
        sourceAccountSelect.appendChild(option);
    });
};

// --- EVENT HANDLERS (Same as before, only internal logic changed) ---

// Listener for the "Contribute" buttons
const attachContributeListeners = () => {
    document.querySelectorAll('.contribute-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            if (e.target.disabled) return;
            const goalId = parseInt(e.target.dataset.goalId);
            const goalName = e.target.dataset.goalName;
            
            // Populate and show the modal
            contributingGoalId.value = goalId;
            modalGoalName.textContent = goalName;
            populateSourceAccounts();
            modal.style.display = 'block';
            modal.classList.add('open');
        });
    });
};

// Toggle the New Goal form
addGoalBtn.addEventListener('click', () => {
    goalFormContainer.classList.toggle('hidden');
    newGoalForm.reset();
});

cancelFormBtn.addEventListener('click', () => {
    goalFormContainer.classList.add('hidden');
    newGoalForm.reset();
});

// Handle New Goal submission (MOCK)
newGoalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('goal-name').value;
    const targetAmount = parseFloat(document.getElementById('target-amount').value);
    const targetDate = document.getElementById('target-date').value;

    const newGoal = {
        goalId: Date.now(), 
        name,
        targetAmount,
        savedAmount: 0.00, 
        targetDate: targetDate || null,
        status: "IN_PROGRESS"
    };
    
    savingsGoals.unshift(newGoal); 
    renderGoals(); 
    
    goalFormContainer.classList.add('hidden'); 
    newGoalForm.reset();
    alert(`MOCK: Goal "${name}" created successfully!`);
});

// Handle Contribution submission (MOCK)
contributeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const goalId = parseInt(contributingGoalId.value);
    const amount = parseFloat(contributionAmountInput.value);
    const sourceAccount = sourceAccountSelect.options[sourceAccountSelect.selectedIndex].text; 

    if (amount <= 0 || !sourceAccountSelect.value) {
        alert('Please enter a valid amount and select a source account.');
        return;
    }

    const goalIndex = savingsGoals.findIndex(g => g.goalId === goalId);
    if (goalIndex !== -1) {
        savingsGoals[goalIndex].savedAmount += amount;
        
        if (savingsGoals[goalIndex].savedAmount >= savingsGoals[goalIndex].targetAmount) {
             savingsGoals[goalIndex].status = 'COMPLETED';
        }
    }
    
    renderGoals(); 

    modal.classList.remove('open');
    setTimeout(() => modal.style.display = 'none', 300);
    contributeForm.reset();
    
    alert(`MOCK: Contributed ${formatCurrency(amount)} from ${sourceAccount} to ${savingsGoals[goalIndex].name}.`);
});

// Close Modal logic
closeBtnModal.addEventListener('click', () => {
    modal.classList.remove('open');
    setTimeout(() => modal.style.display = 'none', 300);
    contributeForm.reset();
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.style.display = 'none', 300);
        contributeForm.reset();
    }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', renderGoals);