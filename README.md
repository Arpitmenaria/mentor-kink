# Organization Mentor - Author Dashboard

Author dashboard for managing mini sites, communities, and requests.

## Project Structure

```
organization-mentor/
├── src/
│   ├── pages/
│   │   ├── AuthorLoginPage.jsx
│   │   ├── AuthorLoginPage.css
│   │   ├── AuthorDashboard.jsx
│   │   └── AuthorDashboard.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. The app will run on `http://localhost:5174`

## Features

### AuthorLoginPage
- Email/password login
- Password visibility toggle
- Demo mode (any email + password 6+ chars)
- Form validation
- Session persistence with localStorage

### AuthorDashboard (Placeholder)
- Awaiting UI design from team
- Shows author information
- Logout functionality

## Next Steps

1. ✅ Project structure created
2. 🔄 Login page ready (basic implementation)
3. ⏳ Awaiting dashboard UI design

## Login Credentials (Demo)

- Any email (e.g., author@example.com)
- Any password with 6+ characters

## Notes

- This is a separate project from kick-analyst-frontend
- Accessible at route `/organization`
- Uses localStorage for session management
- Dark theme matching main application
