document.addEventListener('DOMContentLoaded', () => {
    const dailyPage = document.getElementById('dailyPage');
    const summaryPage = document.getElementById('summaryPage');
    const dailyPageLink = document.getElementById('dailyPageLink');
    const summaryPageLink = document.getElementById('summaryPageLink');
    const transactionFormModal = document.getElementById('transactionFormModal');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const closeBtn = document.querySelector('.close-btn');
    const transactionForm = document.getElementById('transactionForm');
    const transactionList = document.getElementById('transactionList');
    const totalAmountDisplay = document.getElementById('totalAmount');
    const summaryList = document.getElementById('summaryList');
    const clearTransactionsButton = document.getElementById('clearTransactions');
    const clearSummaryButton = document.getElementById('clearSummary');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let summary = JSON.parse(localStorage.getItem('summary')) || {};

    // Ensure stored values are always numbers when retrieving from localStorage
    const parseTransactions = (transactions) => transactions.map((t) => ({
        ...t,
        amount: parseFloat(t.amount), // Ensure amount is stored as a number
    }));
    // Clear All Data Button
    const clearLocalStorageBtn = document.getElementById('clearLocalStorage');

    // Event Listener for Clear All Data
    clearLocalStorageBtn.addEventListener('click', () => {
        localStorage.clear(); // Clear all localStorage data
        alert("All data has been cleared!");
        location.reload(); // Reload the page to reset the app
    });

    const parseSummary = (summary) => {
        for (const key in summary) {
            summary[key].income = parseFloat(summary[key].income);
            summary[key].expenses = parseFloat(summary[key].expenses);
            summary[key].remaining = parseFloat(summary[key].remaining);
        }
        return summary;
    };

    transactions = parseTransactions(transactions);
    summary = parseSummary(summary);

    // Navigation between pages
    dailyPageLink.addEventListener('click', () => {
        showPage(dailyPage);
        setActiveLink(dailyPageLink);
    });

    summaryPageLink.addEventListener('click', () => {
        showPage(summaryPage);
        setActiveLink(summaryPageLink);
        displaySummary();
    });

    const showPage = (page) => {
        // Hide both pages
        dailyPage.style.display = 'none';
        summaryPage.style.display = 'none';

        // Show the selected page
        page.style.display = 'block';
    };

    const setActiveLink = (link) => {
        // Remove active class from all nav links
        dailyPageLink.classList.remove('active');
        summaryPageLink.classList.remove('active');

        // Add active class to the clicked link
        link.classList.add('active');
    };

    // Show modal for adding a transaction
    addTransactionBtn.addEventListener('click', () => {
        transactionFormModal.style.display = 'flex';
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        transactionFormModal.style.display = 'none';
    });

    
    // Add new transaction
    const addTransaction = (name, amount, type) => {
        const now = new Date();
        const dateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        const transaction = {
            id: Date.now(),
            dateTime,
            name,
            amount: parseFloat(amount), // Store amount as a number
            type
        };
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        displayTransactions();
        updateSummary();
    };

    // Display transactions
    const displayTransactions = () => {
        transactionList.innerHTML = '';
        if (transactions.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.textContent = 'No transactions available.';
            tr.appendChild(td);
            transactionList.appendChild(tr);
            updateTotalRemainingMoney(0); // Ensure total is reset when there are no transactions
            return;
        }

        let totalAmount = 0;
        transactions.forEach(transaction => {
            const tr = document.createElement('tr');
            const dateTd = document.createElement('td');
            const nameTd = document.createElement('td');
            const amountTd = document.createElement('td');
            const typeTd = document.createElement('td');
            const deleteTd = document.createElement('td');

            dateTd.textContent = transaction.dateTime;
            nameTd.textContent = transaction.name;
            amountTd.textContent = Math.abs(transaction.amount).toFixed(2); // Ensure display as a number
            typeTd.textContent = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);

            totalAmount += transaction.amount;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteTransaction(transaction.id);
            });
            deleteTd.appendChild(deleteBtn);

            tr.appendChild(dateTd);
            tr.appendChild(nameTd);
            tr.appendChild(amountTd);
            tr.appendChild(typeTd);
            tr.appendChild(deleteTd);
            transactionList.appendChild(tr);
        });

        // Display total remaining money immediately
        updateTotalRemainingMoney(totalAmount);
    };

    // Update total remaining money in the table footer
    const updateTotalRemainingMoney = (totalAmount) => {
        totalAmountDisplay.textContent = totalAmount.toFixed(2); // Ensure display as a number
    };

    // Delete transaction
    const deleteTransaction = (id) => {
        transactions = transactions.filter(transaction => transaction.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        displayTransactions();
        updateSummary();
    };

    // Update summary
    const updateSummary = () => {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const remaining = income - expenses;

        summary[currentMonth] = {
            income: parseFloat(income.toFixed(2)), // Ensure stored as number
            expenses: parseFloat(expenses.toFixed(2)), // Ensure stored as number
            remaining: parseFloat(remaining.toFixed(2)) // Ensure stored as number
        };

        localStorage.setItem('summary', JSON.stringify(summary));
        displaySummary();
    };

    // Display summary with delete buttons
    const displaySummary = () => {
        summaryList.innerHTML = '';
        for (const month in summary) {
            const tr = document.createElement('tr');
            const monthTd = document.createElement('td');
            const incomeTd = document.createElement('td');
            const expensesTd = document.createElement('td');
            const remainingTd = document.createElement('td');
            const deleteTd = document.createElement('td');

            monthTd.textContent = month;
            incomeTd.textContent = `₹${summary[month].income}`;
            expensesTd.textContent = `₹${summary[month].expenses}`;
            remainingTd.textContent = `₹${summary[month].remaining}`;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteMonthSummary(month);
            });
            deleteTd.appendChild(deleteBtn);

            tr.appendChild(monthTd);
            tr.appendChild(incomeTd);
            tr.appendChild(expensesTd);
            tr.appendChild(remainingTd);
            tr.appendChild(deleteTd);
            summaryList.appendChild(tr);
        }
    };

    // Delete month summary
    const deleteMonthSummary = (month) => {
        delete summary[month]; // Remove the month from the summary object
        localStorage.setItem('summary', JSON.stringify(summary)); // Update localStorage
        displaySummary(); // Refresh the summary table
    };

    // Handle form submission
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('transactionName').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value); // Ensure value as number
        const type = document.querySelector('input[name="transactionType"]:checked').value;

        if (name && !isNaN(amount)) {
            addTransaction(name, amount, type);
            transactionForm.reset();
            transactionFormModal.style.display = 'none';
        }
    });

    // Clear all transactions and update summary for the current month
    clearTransactionsButton.addEventListener('click', () => {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });

        // Clear all transactions
        transactions = [];
        localStorage.removeItem('transactions');
        displayTransactions(); // Refresh transaction list immediately
        updateTotalRemainingMoney(0); // Reset total remaining money

        // Update summary for the current month to 0 values
        summary[currentMonth] = {
            income: 0.00,
            expenses: 0.00,
            remaining: 0.00
        };
        localStorage.setItem('summary', JSON.stringify(summary));
        displaySummary(); // Refresh the summary immediately
    });

    // Clear all summary
    clearSummaryButton.addEventListener('click', () => {
        summary = {};
        localStorage.removeItem('summary');
        displaySummary();
    });

    // Load initial data
    displayTransactions();
    displaySummary();

    // Initially only show Daily Transactions page
    showPage(dailyPage);
});
