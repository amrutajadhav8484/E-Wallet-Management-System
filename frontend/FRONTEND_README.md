# E-Wallet Frontend - React Application

This is the React frontend for the E-Wallet monolithic Spring Boot backend application.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend Spring Boot application running on `http://localhost:8080`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Configuration

The backend API URL is configured in `.env` file:
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

You can modify this if your backend runs on a different port or host.

## Running the Application

1. Make sure the Spring Boot backend is running on port 8080.

2. Start the React development server:
```bash
npm start
```

3. The application will open in your browser at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/              # API service functions
│   │   ├── authApi.js    # Authentication endpoints
│   │   ├── walletApi.js  # Wallet operations
│   │   ├── bankApi.js    # Bank account operations
│   │   ├── beneficiaryApi.js  # Beneficiary management
│   │   ├── billApi.js    # Bill payment
│   │   ├── adminApi.js   # Admin operations
│   │   └── http.js       # Axios instance with interceptors
│   ├── components/       # Reusable components
│   │   ├── Navbar.js     # Navigation bar
│   │   └── ProtectedRoute.js  # Route protection
│   ├── context/          # React Context
│   │   └── AuthContext.js  # Authentication context
│   ├── hooks/            # Custom hooks
│   │   └── useAuth.js    # Auth hook
│   ├── pages/            # Page components
│   │   ├── Home.js       # Landing page
│   │   ├── Login.js      # Login page
│   │   ├── Signup.js     # Registration page
│   │   ├── Dashboard.js  # User dashboard
│   │   ├── Wallet.js     # Wallet management
│   │   ├── BankAccounts.js  # Bank account linking
│   │   ├── Beneficiaries.js  # Beneficiary management
│   │   ├── Bills.js      # Bill payment
│   │   ├── Admin.js      # Admin panel
│   │   └── NotFound.js   # 404 page
│   ├── utils/            # Utility functions
│   │   └── jwtUtils.js   # JWT decoding utilities
│   ├── App.js            # Main app component with routing
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## Features

### Authentication
- User registration (signup)
- User login with JWT token
- Token storage in localStorage
- Automatic token refresh on page reload
- Role-based access control (Admin vs User)

### User Features
- **Dashboard**: Overview with quick links to all features
- **Wallet Management**:
  - View balance
  - Set/Change PIN
  - Add funds from bank account
  - Withdraw funds
  - Transfer funds between wallets
  - View transaction history
- **Bank Accounts**: Link and view bank account details
- **Beneficiaries**: Add, view, and delete beneficiaries
- **Bill Payments**: Pay various types of bills (Mobile, Electricity, Water, etc.)

### Admin Features
- View all users
- View user details
- Assign/Remove admin roles
- Block/Unblock users

## API Endpoints Mapping

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### Wallet
- `GET /api/v1/wallets/{walletId}/balance?pin=XXXX` - Get balance
- `POST /api/v1/wallets/{walletId}/set-pin` - Set PIN
- `PUT /api/v1/wallets/{walletId}/change-pin` - Change PIN
- `POST /api/v1/wallets/{walletId}/add-funds?amount=X&pin=XXXX` - Add funds
- `POST /api/v1/wallets/{walletId}/withdraw?amount=X&pin=XXXX` - Withdraw
- `POST /api/v1/wallets/transfer` - Transfer funds
- `GET /api/v1/wallets/{walletId}/history?pin=XXXX` - Transaction history

### Bank Accounts
- `POST /api/v1/bank-accounts/link?walletId=X` - Link bank account
- `GET /api/v1/bank-accounts/wallet/{walletId}` - Get linked account

### Beneficiaries
- `POST /api/v1/beneficiaries/{walletId}` - Add beneficiary
- `GET /api/v1/beneficiaries/{walletId}` - Get all beneficiaries
- `DELETE /api/v1/beneficiaries/{beneficiaryId}` - Delete beneficiary

### Bills
- `POST /api/v1/bills/pay?walletId=X&amount=Y&type=...&pin=XXXX` - Pay bill

### Admin
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/users/{userId}` - Get user by ID
- `POST /api/v1/admin/users/{userId}/assign-admin` - Assign admin role
- `POST /api/v1/admin/users/{userId}/remove-admin` - Remove admin role
- `POST /api/v1/admin/users/{userId}/block` - Block user
- `POST /api/v1/admin/users/{userId}/unblock` - Unblock user

## Security

- JWT tokens are stored in localStorage
- Tokens are automatically attached to API requests via Axios interceptors
- Protected routes require authentication
- Admin routes require both authentication and admin role
- 401 errors automatically redirect to login
- 403 errors are handled gracefully

## Technologies Used

- **React** 18.2.0 - UI library
- **React Router DOM** 6.20.0 - Routing
- **Axios** 1.6.2 - HTTP client
- **Bootstrap** 5.3.2 - CSS framework
- **React Bootstrap** 2.9.1 - Bootstrap components for React

## Troubleshooting

### Backend Connection Issues
- Ensure the Spring Boot backend is running on port 8080
- Check CORS configuration in backend SecurityConfig
- Verify `.env` file has correct API URL

### Authentication Issues
- Clear localStorage if tokens are corrupted
- Check browser console for error messages
- Verify JWT secret matches between frontend and backend

### Build Issues
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure Node.js version is 14 or higher

## Development Notes

- The app uses React Context for global state management (authentication)
- All API calls go through a centralized `http.js` axios instance
- JWT tokens are decoded on the frontend to extract roles
- Protected routes check authentication and admin status
- Error handling is done via Axios interceptors and component-level try-catch
