# Ria Currency Exchange Dashboard 💱

A modern, high-performance currency exchange dashboard built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. This application allows users to convert currencies in real-time and monitor exchange rates against a base currency using the Frankfurter API.

## 🚀 Project Overview

This project was developed as part of the Ria Software Engineer Internship coding challenge. It focuses on **code quality**, **clean architecture**, and **user experience (UX)**.

### Key Features
* **Real-time Conversion:** Convert amounts between different currencies instantly.
* **Optimized Performance:** Calculation logic runs client-side after the initial rate fetch to minimize API usage and latency.
* **Live Rates Table:** View top 10 major currencies against a customizable base currency.
* **Responsive Design:** Fully responsive UI built with Tailwind CSS, suitable for mobile and desktop.
* **Robust Error Handling:** Graceful handling of API errors and network states.

---

## 💡 Innovation Feature: Market Trend Indicator

> *"Should I send money now, or wait until tomorrow?"*

For the **Bonus Feature**, I implemented a **Market Trend Indicator** (Trending Up ↗ / Down ↘).

### How it works:
When a user selects a currency pair, the app fetches the current rate AND the rate from **48 hours ago**. It compares the two values to determine the trend.

### Why I chose it:
Users sending money internationally care deeply about the *timing* of their transfer. A simple number isn't enough; knowing if the rate is improving or worsening helps users make informed financial decisions. This adds real product value beyond a simple calculator.

---

## 🛠️ Technical Decisions & Trade-offs

### 1. Client-Side Calculation Optimization
**Trade-off:** Instead of calling the API every time the user types in the "Amount" input, the app fetches the *Unit Exchange Rate* (1 Unit) only when the currency pair changes.
**Benefit:**
* **Zero Latency:** The calculation (`Amount * Rate`) happens instantly on the client side.
* **API Efficiency:** Drastically reduces the number of HTTP requests, preventing rate-limiting issues.

### 2. Historical Data Window (48 Hours)
**Decision:** For the trend feature, I compare against data from 2 days ago instead of "yesterday".
**Reasoning:** Financial markets often close on weekends. A 48-hour window smooths out potential gaps where "yesterday's" data might be identical to today's if it was a Sunday, providing a more reliable trend indicator.

### 3. Component Architecture
I followed a "Separation of Concerns" principle:
* **Logic:** API calls and state management are handled via `useEffect` hooks with clean dependency arrays.
* **UI:** Reusable components like `Card` and `Select` were created to keep the main page clean and maintainable (DRY principle).

---

## 🤖 AI Usage Declaration

In the spirit of transparency (as requested in the requirements), I utilized AI tools (Gemini) for the following:

1.  **Scaffolding:** To quickly generate the initial boilerplate for the API fetch logic and TypeScript interfaces.
2.  **Tailwind Styling:** To suggest optimal utility classes for the responsive layout and animations (e.g., `animate-in`, `fade-in`).
3.  **Refactoring:** Used as a pair programmer to optimize the `useEffect` logic, ensuring we don't over-fetch data when the user types rapidly. Also, used to create components in order to allow for separation of concerns.

*All code was reviewed, tested, and understood by me before implementation.*

---

## 📦 Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/eduesquivel/PostulacionRia
    cd PostulacionRia
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Visit `http://localhost:3000` in your browser.

---

## 🔮 Future Improvements

With more time, I would add:
* **Fees explanation:** A short explanation on what are the fees that the service would charge for sending money (if it actually did send money). Transparency would definitely gain users' trust.
* **Historical Charts:** A visual line chart using Recharts to show the rate history over 30 days.
* **Favorite Pairs:** Use `localStorage` to save the user's most frequent currency pairs.
* **Unit Testing:** Implement Jest and React Testing Library to ensure calculation accuracy.
