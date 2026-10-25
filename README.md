# Saral Banking

**Simple banking. Clear choices. Greater confidence.**

Saral Banking is an accessibility-focused banking prototype built for a hackathon. It explores how banking interfaces can be made easier to understand and safer to use through simple language, clear payment steps, bilingual guidance, and built-in fraud awareness.

> **Demo only:** Saral Banking is not a real banking service. Payments and account activity are simulated. Never enter real banking credentials.

## Features

### Accessible banking experience
- Fictional demo customer profiles for different user needs.
- English and Hindi language options.
- Adjustable text size, high-contrast mode, and balance visibility.
- Read-aloud support for interface guidance.
- Consistent navigation and plain-language instructions.

### Safer payments
- Step-by-step payment review before demo PIN confirmation.
- Safety checks for urgent or suspicious requests.
- Warnings for new recipients and large payments.
- Configurable daily UPI limit in the demo.
- Extra confirmation for payments above ₹5,000 in Simple Mode.
- Young Saver guardian-approval workflow for applicable demo payments.

### Fraud awareness
- Scam-message checker with six warning-pattern categories.
- English and Hindi explanations and safety advice.
- 25 frequently asked questions in English and Hindi.
- Fraud-reporting guidance, including India's cyber fraud helpline **1930** and the [National Cyber Crime Reporting Portal](https://cybercrime.gov.in/).

### Account and service demonstrations
- Transaction history, search, and filters.
- Demo transaction export.
- Nominee details form.
- Contact-detail update demonstration.
- Cheque-book request demonstration.
- Demo card block/unblock controls.
- Service-request status tracking.
- Savings goal tracking for the Young Saver profile.

### Session and demo data
- Demo data persisted in browser local storage.
- Automatic sign-out after two minutes of inactivity.
- Reset-demo option for testing.

## Tech Stack

- React
- Vite
- JavaScript (JSX)
- Tailwind CSS
- Browser local storage

## Getting Started

### Requirements

Install a current version of [Node.js](https://nodejs.org/) and npm.

### Installation

Clone the repository:

```bash
git clone https://github.com/gourab2307/saral-banking.git
cd saral-banking
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed in your terminal by Vite.

### Production build

Build the application:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Demo Access

Use the fictional customer profiles available on the sign-in screen.

**Demo PIN:** `1234`

This PIN is for the prototype only. Do not use real banking PINs, OTPs, passwords, account details, or other sensitive information.

## Privacy and Limitations

Saral Banking is a frontend hackathon prototype, not a production banking application.

- Payments are simulated; the app does not transfer real money.
- Account balances, transactions, and service requests are demonstration data.
- Local storage is used for selected demo data on the current browser.
- Demo sign-in and inactivity lock are not substitutes for secure server-side authentication and session management.
- The scam checker uses configured keywords and patterns. It may miss scams or flag legitimate messages; a low-risk result does not guarantee safety.
- The app does not replace advice from a bank or official authorities.

If you suspect cyber financial fraud in India, contact your bank through an official channel and report it promptly using **1930** or the [National Cyber Crime Reporting Portal](https://cybercrime.gov.in/).

## Project Repository

[GitHub: gourab2307/saral-banking](https://github.com/gourab2307/saral-banking)

## Future Improvements

- Secure backend authentication and session management.
- Persistent server-side storage with appropriate access controls.
- More comprehensive scam detection and testing.
- Additional accessibility testing with real users.
- Automated tests for payment safety and user workflows.

## Author

**Gourab Taran**

Built as a hackathon project exploring accessible, understandable, and safer digital banking experiences.
