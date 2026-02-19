# Employability Assessment System

Full-stack application with React + Node/Express + MongoDB and JWT role-based authentication for Admin and Candidate portals.

## Features
- Separate admin/candidate login
- JWT authentication + bcrypt password hashing
- Admin dashboard, test management, result export CSV
- Candidate dashboard, test taking with timer + auto submit, history
- Randomized questions, anti-tab switching submit, auto grading
- Performance analytics (bar + pie chart), rank calculation
- Profile management, forgot/reset password APIs
- Dark mode ready CSS class and responsive sidebar layout

## Setup
### Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## API base
- `http://localhost:5000/api`
