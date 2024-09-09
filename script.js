document.addEventListener("DOMContentLoaded", function () {
    const transactionForm = document.getElementById("transaction-form");
    const transactionTableBody = document.getElementById("transactions-table-body");
    const totalRemainingElement = document.getElementById("total-remaining");
    const monthlyExpensesTableBody = document.getElementById("monthly-expenses-table-body");
    const monthlyIncomeTableBody = document.getElementById("monthly-income-table-body");
    const totalMonthlyExpensesElement = document.getElementById("total-monthly-expenses");
    const totalMonthlyIncomeElement = document.getElementById("total-monthly-income");
    const monthlySummaryOverview = document.getElementById("monthly-summary-overview");

    const oweToTableBody = document.getElementById("owe-to-table-body");
    const owedByTableBody = document.getElementById("owed-by-table-body");
    const debtForm = document.getElementById("debt-form");

    const sections = document.querySelectorAll(".section");
    const navHome = document.getElementById("nav-home");
    const navMonthlySummary = document.getElementById("nav-monthly-summary");
    const navDebt = document.getElementById("nav-debt");

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let debts = JSON.parse(localStorage.getItem("debts")) || [];

    // Helper function to format date in DD/MM/YYYY HH:MM
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // Add transaction button event
    document.getElementById("add-transaction-btn").addEventListener("click", () => {
        transactionForm.classList.toggle("hidden");
    });

    // Navigation logic
    navHome.addEventListener("click", () => showSection("home"));
    navMonthlySummary.addEventListener("click", () => showSection("monthly-summary"));
    navDebt.addEventListener("click", () => showSection("debt"));

    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add("active");
                section.classList.remove("hidden");
            } else {
                section.classList.remove("active");
                section.classList.add("hidden");
            }
        });
    }

    // Form submission for daily transactions
    transactionForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const type = document.querySelector('input[name="type"]:checked').value;
        const date = new Date();
        const formattedDate = formatDate(date); // Use formatted date

        const transaction = {
            id: Date.now(),
            date: formattedDate,
            month: date.getMonth(),
            year: date.getFullYear(),
            name,
            amount,
            type
        };
        transactions.push(transaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        refreshTables();
        transactionForm.reset();
        transactionForm.classList.add("hidden");
    });

    // Form submission for debts
    debtForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("debt-name").value;
        const amount = parseFloat(document.getElementById("debt-amount").value);
        const type = document.querySelector('input[name="debt-type"]:checked').value;

        const debt = {
            id: Date.now(),
            name,
            amount,
            type
        };

        debts.push(debt);
        localStorage.setItem("debts", JSON.stringify(debts));

        refreshDebtTables(); // Refresh debt tables after adding the debt
        debtForm.reset();
    });

    // Function to refresh all transaction tables
    function refreshTables() {
        transactionTableBody.innerHTML = '';
        monthlyExpensesTableBody.innerHTML = '';
        monthlyIncomeTableBody.innerHTML = '';
        monthlySummaryOverview.innerHTML = '';

        updateTotalRemaining();
        updateMonthlySummary();
        transactions.forEach(addTransactionToHomeTable);
    }

    // Function to refresh all debt tables
    function refreshDebtTables() {
        oweToTableBody.innerHTML = '';
        owedByTableBody.innerHTML = '';

        debts.forEach(addDebtToTable);
    }

    function addTransactionToHomeTable(transaction) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.name}</td>
            <td>${transaction.amount}</td>
            <td>${transaction.type}</td>
            <td><button class="delete-btn">X</button></td>
        `;
        transactionTableBody.appendChild(row);

        // Add event listener for delete button
        row.querySelector(".delete-btn").addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });
    }

    function addDebtToTable(debt) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${debt.name}</td>
            <td>${debt.amount}</td>
            <td><button class="delete-btn">X</button></td>
        `;

        if (debt.type === "owe-to") {
            oweToTableBody.appendChild(row);
        } else if (debt.type === "owed-by") {
            owedByTableBody.appendChild(row);
        }

        // Add event listener for delete button
        row.querySelector(".delete-btn").addEventListener("click", () => {
            deleteDebt(debt.id);
        });
    }

    function deleteTransaction(transactionId) {
        transactions = transactions.filter(transaction => transaction.id !== transactionId);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        refreshTables(); // Refresh all tables after deletion
    }

    function deleteDebt(debtId) {
        debts = debts.filter(debt => debt.id !== debtId);
        localStorage.setItem("debts", JSON.stringify(debts));
        refreshDebtTables(); // Refresh debt tables after deletion
    }

    // Function to calculate and update total remaining
    function updateTotalRemaining() {
        const total = transactions.reduce((acc, transaction) => {
            return transaction.type === "income" ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        totalRemainingElement.textContent = total.toFixed(2);
    }

    // Monthly summary update
    function updateMonthlySummary() {
        const monthlySummary = {};
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Iterate through all transactions
        transactions.forEach(transaction => {
            // Create a key based on the month and year
            const monthYear = `${monthNames[transaction.month]}-${transaction.year}`;

            // Initialize the object for this month if it doesn't exist
            if (!monthlySummary[monthYear]) {
                monthlySummary[monthYear] = {
                    totalIncome: 0,
                    totalExpenses: 0,
                    remainingAmount: 0
                };
            }

            // Add income or expense to the appropriate field
            if (transaction.type === "income") {
                monthlySummary[monthYear].totalIncome += transaction.amount;
            } else if (transaction.type === "expense") {
                monthlySummary[monthYear].totalExpenses += transaction.amount;
            }

            // Calculate the remaining amount for the month
            monthlySummary[monthYear].remainingAmount = 
                monthlySummary[monthYear].totalIncome - monthlySummary[monthYear].totalExpenses;
        });

        // Clear the existing content in the monthly summary table
        monthlySummaryOverview.innerHTML = '';
        monthlyExpensesTableBody.innerHTML = '';
        monthlyIncomeTableBody.innerHTML = '';

        // Loop over the monthlySummary object and update the overall monthly summary table
        Object.keys(monthlySummary).forEach(monthYear => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${monthYear}</td>
                <td>${monthlySummary[monthYear].totalIncome.toFixed(2)}</td>
                <td>${monthlySummary[monthYear].totalExpenses.toFixed(2)}</td>
                <td>${monthlySummary[monthYear].remainingAmount.toFixed(2)}</td>
            `;
            monthlySummaryOverview.appendChild(row);
        });

        // Update the current month's income and expenses table
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        transactions.forEach(transaction => {
            if (transaction.month === currentMonth && transaction.year === currentYear) {
                if (transaction.type === "income") {
                    addTransactionToMonthlyTable(transaction, "income");
                } else if (transaction.type === "expense") {
                    addTransactionToMonthlyTable(transaction, "expense");
                }
            }
        });

        // Update totals for the current month
        updateMonthlyTotals();
    }

    function addTransactionToMonthlyTable(transaction, type) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.name}</td>
            <td>${transaction.amount}</td>
            <td><button class="delete-btn">X</button></td>
        `;

        if (type === "income") {
            monthlyIncomeTableBody.appendChild(row);
        } else if (type === "expense") {
            monthlyExpensesTableBody.appendChild(row);
        }

        row.querySelector(".delete-btn").addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });
    }

    function updateMonthlyTotals() {
        const totalIncome = Array.from(monthlyIncomeTableBody.querySelectorAll('tr')).reduce((acc, row) => {
            const amount = parseFloat(row.cells[2].textContent);
            return acc + amount;
        }, 0);

        const totalExpenses = Array.from(monthlyExpensesTableBody.querySelectorAll('tr')).reduce((acc, row) => {
            const amount = parseFloat(row.cells[2].textContent);
            return acc + amount;
        }, 0);

        totalMonthlyIncomeElement.textContent = totalIncome.toFixed(2);
        totalMonthlyExpensesElement.textContent = totalExpenses.toFixed(2);
    }

    // Add download functionality for Excel and PDF based on user choice
    document.getElementById("download-home-data").addEventListener("click", () => {
        promptDownload('home');
    });

    document.getElementById("download-monthly-data").addEventListener("click", () => {
        promptDownload('monthly-summary');
    });

    document.getElementById("download-debt-data").addEventListener("click", () => {
        promptDownload('debt');
    });

    function promptDownload(sectionId) {
        const choice = prompt("Which format would you like to download? (pdf/excel/both)");

        if (choice === 'pdf') {
            downloadPDF(sectionId);
        } else if (choice === 'excel') {
            downloadExcel(sectionId);
        } else if (choice === 'both') {
            downloadPDF(sectionId);
            downloadExcel(sectionId);
        } else {
            alert("Invalid choice. Please enter 'pdf', 'excel', or 'both'.");
        }
    }

    function downloadPDF(sectionId) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let sectionTitle = '';
        let tableBody = [];

        switch (sectionId) {
            case 'home':
                sectionTitle = 'Daily Transactions';
                tableBody = [...document.querySelectorAll("#transactions-table-body tr")].map(row => {
                    return [...row.cells].map(cell => cell.textContent);
                });
                doc.autoTable({
                    head: [['Date & Time', 'Name', 'Amount', 'Type', 'Action']],
                    body: tableBody,
                });
                break;
            case 'monthly-summary':
                sectionTitle = 'Monthly Summary';
                tableBody = [...document.querySelectorAll("#monthly-summary-overview tr")].map(row => {
                    return [...row.cells].map(cell => cell.textContent);
                });
                doc.autoTable({
                    head: [['Month', 'Total Income', 'Total Expenses', 'Remaining Amount']],
                    body: tableBody,
                });
                break;
            case 'debt':
                sectionTitle = 'Debt Overview';
                tableBody = [...document.querySelectorAll("#owe-to-table-body tr, #owed-by-table-body tr")].map(row => {
                    return [...row.cells].map(cell => cell.textContent);
                });
                doc.autoTable({
                    head: [['Name', 'Amount', 'Action']],
                    body: tableBody,
                });
                break;
        }

        doc.text(sectionTitle, 15, 10);
        doc.save(`${sectionId}-data.pdf`);
    }

    function downloadExcel(sectionId) {
        let data = [];
        let worksheetName = '';
        let fileName = '';

        switch (sectionId) {
            case 'home':
                worksheetName = 'Daily Transactions';
                fileName = 'daily_transactions.xlsx';
                data = transactions.map(transaction => ({
                    'Date & Time': transaction.date,
                    'Name': transaction.name,
                    'Amount': transaction.amount,
                    'Type': transaction.type
                }));
                break;

            case 'monthly-summary':
                worksheetName = 'Monthly Summary';
                fileName = 'monthly_summary.xlsx';
                data = transactions.map(transaction => ({
                    'Month': `${transaction.month + 1}-${transaction.year}`,
                    'Name': transaction.name,
                    'Amount': transaction.amount,
                    'Type': transaction.type
                }));
                break;

            case 'debt':
                worksheetName = 'Debt Data';
                fileName = 'debt_data.xlsx';
                data = debts.map(debt => ({
                    'Name': debt.name,
                    'Amount': debt.amount,
                    'Type': debt.type === 'owe-to' ? 'Owe to Someone' : 'Owed by Someone'
                }));
                break;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, worksheetName);

        XLSX.writeFile(wb, fileName);
    }

    // Load transactions and debts from localStorage on page load
    refreshTables();
    refreshDebtTables();
});
