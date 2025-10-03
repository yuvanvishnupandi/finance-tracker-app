# 💰 FinTrakk: Personal Finance Tracker Application

FinTrakk is a comprehensive, full-stack personal finance application designed to help users gain granular control over their money. It allows for detailed transaction tracking, goal setting, and proactive budget management, offering a clear, visual overview of financial health.

---

## ✨ Features and Project Status

This project features a robust, responsive frontend that integrates with a powerful Java Spring Boot API.

### Financial Management Modules (Frontend Complete)

| Module | Key Functionality | Status |
| :--- | :--- | :--- |
| **Dashboard** | At-a-glance financial summary, Net Worth display, Income vs. Expense charts, and Spending Breakdown analytics. | Complete |
| **Transactions** | Full CRUD (Create, Read, Update, Delete) for transactions, with filtering and sorting options. | Complete |
| **Accounts** | Management of multiple financial accounts (Savings, Credit Card, Cash), **Total Net Worth** calculation, and card-based editing/deletion. | Complete |
| **Budgeting** | Setting and tracking monthly spending limits by category, visual progress bars, and over-budget alerts. | Complete |
| **Saving Goals** | **In Progress.** Functionality to set financial targets (e.g., "New Phone") and track visual progress toward the goal amount. | Next Step |

### UX & Accessibility

* **Responsive Design:** Fully functional and optimized for mobile, tablet, and desktop views.
* **Dark/Light Mode:** Full theme toggling implemented on all main application pages.
* **Intuitive Navigation:** Seamless, conflict-free transitions and functioning logout across all application views.

---

## 🔑 Key Technologies

| Category | Tools & Technologies |
| :--- | :--- |
| **Frontend (FE)** | **HTML5**, **CSS3** (Custom Variables), **Pure JavaScript (ES6+)**, **Chart.js** (for data visualization) |
| **Backend (BE) & API** | **Java**, **Spring Boot** (Microservices & REST API), **MySQL** (Database), **Maven** (Dependency/Build Management), **JavaFX** (for potential advanced desktop features) |
| **Tooling & Version Control** | **Git** |

---

## 🚀 Getting Started

To run the *FinTrakk* application locally, you need to start both the backend server and serve the frontend files.

### Prerequisites

* **Java Development Kit (JDK)**
* **MySQL Server**
* **Maven**
* **A local web server** (e.g., VS Code Live Server or `http-server`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yuvanvishnupandi/finance-tracker-app/
    cd finance-tracker-app
    ```

2.  **Setup Backend (Java/Spring Boot):**
    * Navigate to the `backend` directory.
    * Use Maven to install dependencies and build the project.
    * Configure your MySQL connection properties.
    * Start the Spring Boot application.

3.  **Setup Frontend (HTML/JS):**
    * Navigate to the `frontend/auth/index.html`.
    * Open this file using your preferred local web server (e.g., VS Code Live Server, which usually runs on a port like `5500`).

---

## 🤝 Contribution

Contributions are welcome! If you have suggestions, feature ideas, or encounter any bugs, please feel free to open an issue or submit a pull request.
