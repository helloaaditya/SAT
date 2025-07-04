# SattaWala - Premium Gaming Platform

A responsive Satta number prediction betting website with mobile OTP authentication, admin result announcement, and PayCash wallet payment integration.

## Features

### 🎰 Core Features
- **Number Prediction Betting**: Select numbers 1-20 with varying bet amounts
- **Real-time Balance**: Live balance updates with PayCash wallet integration
- **Admin Panel**: Result announcement and profit management system
- **Secure Authentication**: JWT-based login with email/password and mobile OTP
- **Responsive Design**: Mobile-first design with modern UI/UX

### 💳 Payment Integration
- **PayCash Wallet**: Secure payment gateway integration
- **Minimum Transaction**: ₹50 minimum for all transactions
- **Payment History**: Complete transaction history with status tracking
- **Webhook Support**: Real-time payment status updates
- **Multiple Amounts**: Predefined amounts (₹50, ₹100, ₹200, ₹500, ₹1000, ₹2000, ₹5000)

### 🎯 Betting System
- **Number Range**: 1-20 number selection
- **Bet Amounts**: ₹10 to ₹1000 with 10x multiplier
- **Potential Winnings**: Real-time calculation display
- **Bet History**: Track all your bets and results
- **Admin Profit**: Ensured profit margin for platform sustainability

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Modern UI/UX** with animations and gradients

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **bcryptjs** for password hashing
- **PayCash Wallet API** integration

## Installation & Setup

### Prerequisites
- Node.js (v20.16.0 or higher)
- MongoDB database
- PayCash Wallet merchant account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd satta
```

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Environment Configuration

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PAYCASH_MERCHANT_ID=your_paycash_merchant_id
PAYCASH_API_KEY=your_paycash_api_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### 4. PayCash Wallet Setup

1. **Register** at [pay.showcashwallet.com](https://pay.showcashwallet.com)
2. **Get Credentials**: Obtain your merchant ID and API key
3. **Configure Webhooks**: Set webhook URL to `https://yourdomain.com/api/payment/webhook`
4. **Test Integration**: Use test mode for development

### 5. Run the Application

#### Development Mode
```bash
npm run dev
```
This will start both frontend (port 5173) and backend (port 5000) concurrently.

#### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Betting
- `POST /api/bet` - Place a bet
- `GET /api/bet/current` - Get current round bets
- `GET /api/bet/history` - Get bet history

### Payment (PayCash Wallet)
- `POST /api/payment/create-session` - Create payment session
- `POST /api/payment/webhook` - Payment webhook handler
- `GET /api/payment/verify/:transaction_id` - Verify payment status
- `GET /api/payment/history` - Get payment history

### Admin
- `POST /api/admin/announce-result` - Announce round result
- `GET /api/admin/rounds` - Get all rounds
- `GET /api/admin/stats` - Get platform statistics

## Payment Flow

1. **User clicks "Add Money"** on betting page
2. **Select amount** (minimum ₹50) from predefined options or custom input
3. **Payment session created** with PayCash wallet
4. **Redirect to PayCash** payment gateway
5. **Payment processing** on PayCash platform
6. **Webhook notification** to update user balance
7. **Success/failure** handling with user feedback

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Comprehensive server-side validation
- **CORS Protection**: Configured for production security
- **Payment Verification**: Webhook signature verification (implement as needed)

## Admin Features

- **Result Management**: Announce winning numbers for each round
- **Profit Tracking**: Monitor platform profitability
- **User Management**: View and manage user accounts
- **Round History**: Complete betting round history

## Mobile Responsiveness

- **Mobile-first design** with Tailwind CSS
- **Touch-friendly** interface for mobile betting
- **Responsive navigation** with mobile menu
- **Optimized forms** for mobile input

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@sattawala.com
- Documentation: [docs.sattawala.com](https://docs.sattawala.com)

## Disclaimer

This is a gaming platform for entertainment purposes. Please ensure compliance with local gambling laws and regulations in your jurisdiction. #   S A T  
 #   S A T  
 