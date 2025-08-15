<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Expense Tracker Frontend Project Instructions

This is a React + Vite + TypeScript project for an expense tracker application.

## Project Architecture:

- Use Material-UI (MUI) for the UI components
- Use React Query (@tanstack/react-query) for data fetching and caching
- Use Axios for HTTP client
- Use Zustand for minimal state management if needed
- Follow modular component architecture

## API Integration:

- Base API URL: http://localhost:8080
- Use TypeScript interfaces for all API responses
- Handle ISO date formats automatically
- Implement optimistic updates where appropriate

## UI/UX Guidelines:

- Use responsive design with mobile support
- Display expense/income with color coding (red/green)
- Show loading skeletons during data fetching
- Implement proper error handling and user feedback

## Code Organization:

- Keep components reusable and modular
- Use custom hooks for business logic
- Implement proper TypeScript typing
- Follow React best practices for performance
