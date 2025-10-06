# Archery Tracker

An application for tracking and managing archery scores, rounds, clubs, and courses.

## Features

- **User Authentication**: Register, login, and manage your archer profile
- **Score Tracking**: Record and track your archery scores using different scoring systems (ABA, IFAA)
- **Club Management**: Join clubs, view club information, and manage your club memberships
- **Courses**: Browse available archery courses and their details
- **Round Management**: Create, view, and score archery rounds
- **Dashboard**: View your statistics, recent rounds, and progress
- **QR Code Integration**: Scan QR codes for quick access to courses and scoring
- **Admin Panel**: Manage users, clubs, and courses (for administrators)

## Technologies Used

- **Frontend**: React.js, Styled Components
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Containerization**: Docker, Docker Compose
- **Deployment**: NGINX for serving the application

## Scoring Systems

The application supports multiple archery scoring systems:

- **ABA (Australian Bowhunters Association)**: Max 20 points per target
- **IFAA (International Field Archery Association)**: Scoring based on arrow placement

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/zachflem/ArcheryTracker.git
   ```

2. Navigate to the project directory:
   ```
   cd ArcheryTracker
   ```

3. Start the application using Docker:
   ```
   ./deploy.sh
   ```

4. Access the application at `http://localhost:3000`

## Development

For development purposes, you can run the frontend and backend separately:

### Frontend

```
cd frontend
npm install
npm start
```

### Backend

```
cd backend
npm install
npm run dev
```

## License

This project is private and not licensed for public use.
