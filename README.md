# Expense Tracker Frontend

A modern React + TypeScript expense tracking application built with Vite, Material-UI, and React Query.

## Features

- **Transaction Management**: View, edit, and manage your expenses and income
- **Natural Language Input**: Add expenses using natural language descriptions
- **Real-time Statistics**: Visual charts and analytics for your spending habits
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with Material-UI for a clean, professional look

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for UI components
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Axios** for HTTP requests
- **Recharts** for data visualization
- **Zustand** for state management

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── TransactionTable.tsx
│   ├── TransactionEditModal.tsx
│   ├── ExpenseInput.tsx
│   └── LoadingSkeleton.tsx
├── pages/               # Page components
│   ├── TransactionsPage.tsx
│   └── StatisticsPage.tsx
├── layout/              # Layout components
│   ├── Layout.tsx
│   ├── AppBar.tsx
│   └── Sidebar.tsx
├── api/                 # API client and configuration
│   └── client.ts
├── hooks/               # React Query hooks
│   └── useTransactions.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── index.ts
└── main.tsx            # Application entry point
```

## Prerequisites

- Node.js 18+ and npm
- Backend API server running on http://localhost:8080

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## API Integration

The application expects a backend API at `http://localhost:8080` with the following endpoints:

- `GET /transactions` - Get paginated transactions
- `POST /transactions` - Create new transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `POST /parse` - Parse natural language expense input

## Features

### Transactions Page

- Paginated table displaying all transactions
- Click on any row to edit transaction details
- Real-time updates without page reload
- Natural language expense input at the bottom

### Statistics Page

- Visual charts showing spending by category
- Monthly income vs expenses comparison
- Summary cards with totals and net balance
- Detailed category breakdown

### Global Features

- Responsive layout with collapsible sidebar
- User menu with account options
- Loading states and error handling
- Optimistic updates for better UX

## Development

The application uses modern React patterns and best practices:

- Functional components with hooks
- TypeScript for type safety
- React Query for server state management
- Material-UI for consistent styling
- Modular component architecture

## Environment

- Base API URL: `http://localhost:8080`
- Development server: `http://localhost:5173`
