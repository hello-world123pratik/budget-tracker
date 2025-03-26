// Check if user is logged in
document.addEventListener("DOMContentLoaded", function () {
    applyDarkMode();
    checkUserSession();
});

// Function to format the date
function getFormattedDate(dateInput) {
    if (!dateInput) return "N/A";
    return new Date(dateInput).toLocaleDateString("en-IN");
}

// Authentication
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");

registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    if (localStorage.getItem(username)) {
        alert("User already exists! Please login.");
    } else {
        localStorage.setItem(username, JSON.stringify({ password }));
        alert("Registration successful! Please login.");
        registerForm.reset();
    }
});

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const userData = JSON.parse(localStorage.getItem(username));

    if (userData && userData.password === password) {
        localStorage.setItem("loggedInUser", username);
        alert("Login successful!");
        showApp();
    } else {
        alert("Invalid credentials! Please try again.");
    }
});

logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully!");
    location.reload();
});

function checkUserSession() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        showApp();
    } else {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("app-section").style.display = "none";
    }
}

function showApp() {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("app-section").style.display = "block";
    document.getElementById("username-display").textContent = localStorage.getItem("loggedInUser");
    loadSummary();
    loadTransactions();
}

// Salary Input
document.querySelector("#salary-form form").addEventListener("submit", function (e) {
    e.preventDefault();
    const salary = parseFloat(document.getElementById("salary-amount").value);
    if (salary > 0) {
        localStorage.setItem("salary", salary);
        alert("Salary updated successfully!");
        loadSummary();
    }
});

// Transaction Handling
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

document.querySelector("#transaction-form form").addEventListener("submit", function (e) {
    e.preventDefault();
    const type = document.getElementById("transaction-type").value;
    const category = document.getElementById("transaction-category").value;
    const amount = parseFloat(document.getElementById("transaction-amount").value);
    const dateInput = document.getElementById("transaction-date").value;
    const formattedDate = getFormattedDate(dateInput);

    if (amount > 0) {
        transactions.push({ type, category, amount, date: formattedDate });
        localStorage.setItem("transactions", JSON.stringify(transactions));
        loadSummary();
        loadTransactions();
    } else {
        alert("Invalid amount!");
    }
});

// Load Transactions
function loadTransactions() {
    const transactionList = document.getElementById("transaction-list");
    transactionList.innerHTML = "";
    transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    transactions.forEach((tx, index) => {
        const li = document.createElement("li");
        li.textContent = `${tx.date} - ${tx.type}: ₹${tx.amount} (${tx.category})`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.onclick = function () {
            removeTransaction(index);
        };

        li.appendChild(deleteBtn);
        transactionList.appendChild(li);
    });
    updateChart();
}

// Load Summary
function loadSummary() {
    const salary = parseFloat(localStorage.getItem("salary")) || 0;
    let income = 0, expense = 0;

    transactions.forEach(tx => {
        if (tx.type === "Income") income += tx.amount;
        else expense += tx.amount;
    });

    document.getElementById("summary-income").textContent = `₹${income}`;
    document.getElementById("summary-expense").textContent = `₹${expense}`;
    document.getElementById("summary-balance").textContent = `₹${salary + income - expense}`;
}

// Expense Chart
let expenseChart;
function updateChart() {
    const categoryTotals = {};

    transactions.forEach(tx => {
        if (tx.type === "Expense") {
            categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
        }
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const ctx = document.getElementById("expenseChart").getContext("2d");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: categories,
            datasets: [{
                label: "Expenses by Category",
                data: amounts,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800"],
            }]
        }
    });
}

// Dark Mode Toggle
document.getElementById("dark-mode-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

function applyDarkMode() {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
}

// Reset Tracker
document.getElementById("reset-btn").addEventListener("click", function () {
    localStorage.clear();
    alert("Tracker reset!");
    location.reload();
});

// Function to remove a transaction
function removeTransaction(index) {
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    alert("Transaction removed successfully!");
    loadSummary();
    loadTransactions();
}

document.addEventListener("DOMContentLoaded", function () {
    checkUserSession();
    
    if (document.getElementById("register-form")) {
        document.getElementById("register-form").addEventListener("submit", registerUser);
    }
    
    if (document.getElementById("login-form")) {
        document.getElementById("login-form").addEventListener("submit", loginUser);
    }
    
    if (document.getElementById("logout-btn")) {
        document.getElementById("logout-btn").addEventListener("click", logoutUser);
    }
    
    if (document.getElementById("salary-form")) {
        document.querySelector("#salary-form form").addEventListener("submit", updateSalary);
    }
});

function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    
    if (localStorage.getItem(username)) {
        alert("Username already exists! Try another.");
        return;
    }
    
    localStorage.setItem(username, JSON.stringify({ password }));
    alert("Registration successful! You can now log in.");
    document.getElementById("register-form").reset();
}

function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    
    const user = JSON.parse(localStorage.getItem(username));
    if (!user || user.password !== password) {
        alert("Invalid username or password");
        return;
    }
    
    localStorage.setItem("loggedInUser", username);
    checkUserSession();
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    checkUserSession();
}

function checkUserSession() {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("app-section").style.display = "block";
        document.getElementById("username-display").textContent = user;
    } else {
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("app-section").style.display = "none";
    }
}

function updateSalary(event) {
    event.preventDefault();
    const salaryInput = document.getElementById("salary-amount");
    const salary = parseFloat(salaryInput.value);
    
    if (isNaN(salary) || salary <= 0) {
        alert("Enter a valid salary!");
        return;
    }
    
    const user = localStorage.getItem("loggedInUser");
    if (!user) return;
    
    localStorage.setItem(user + "_salary", salary);
    alert("Salary updated successfully!");
    salaryInput.value = "";
}
 
