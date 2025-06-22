# Campaign Management Dashboard

A modern web application for businesses to manage customer registration campaigns with OTP verification. Built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Features

- **Authentication**: Secure user authentication using Clerk
- **Campaign Management**: Create and manage customer registration campaigns
- **Customer Registration**: Register customers with phone numbers per campaign
- **OTP Verification**: Verify customers via OTP for each campaign
- **Customer Tracking**: Track total customers per campaign
- **Dashboard**: Beautiful dashboard with campaign and customer statistics
- **Real-time Updates**: Instant feedback with toast notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Clerk account for authentication

### Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sampling
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up/In**: Use the authentication buttons in the header to create an account or sign in
2. **Dashboard**: Once authenticated, you'll be redirected to the campaign dashboard
3. **Create Campaign**: Click the "Create Campaign" button to add a new customer registration campaign
4. **Manage Customers**: Click the customer icon on any campaign to register and verify customers
5. **Customer Registration**: Enter phone numbers to register customers for each campaign
6. **OTP Verification**: Verify customers using the OTP sent to their phone (check console for demo)

## Campaign Features

Each campaign includes:

- **Name**: Campaign title
- **Customer Count**: Number of verified customers
- **Customer Management**: Register and verify customers per campaign

## Customer Registration Process

1. **Register Customer**: Enter phone number for a campaign
2. **OTP Generation**: System generates a 6-digit OTP (check console for demo)
3. **OTP Verification**: Customer enters OTP to complete verification
4. **Customer Count Update**: Verified customers increment the campaign's customer count

## API Endpoints

- `GET /api/campaigns` - Fetch all campaigns for the authenticated user
- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns/[campaignId]/customers` - Get customers for a campaign
- `POST /api/campaigns/[campaignId]/customers` - Register a new customer
- `POST /api/campaigns/[campaignId]/customers/verify` - Verify customer OTP

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── campaigns/
│   │       ├── route.ts                                    # Campaign API endpoints
│   │       └── [campaignId]/
│   │           └── customers/
│   │               ├── route.ts                            # Customer management
│   │               └── verify/
│   │                   └── route.ts                        # OTP verification
│   ├── dashboard/
│   │   └── page.tsx                                        # Dashboard page
│   ├── models/
│   │   ├── Campaign.ts                                     # Campaign model
│   │   └── Customer.ts                                     # Customer model
│   ├── services/
│   │   └── db.ts                                           # Database connection
│   ├── layout.tsx                                          # Root layout
│   └── page.tsx                                            # Home page
├── middleware.ts                                           # Authentication middleware
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
