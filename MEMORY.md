# Organization Mentor - Project Documentation

## 📋 Project Overview

**Name:** organization-mentor  
**Purpose:** Author dashboard for managing mini sites, communities, and member requests  
**Location:** `f:\company\kick-analyst\Updated\organization-mentor`  
**Separate Project:** Yes - independent from kick-analyst-frontend  
**Route:** `/organization` (to be integrated)

---

## 🏗️ Project Structure

```
organization-mentor/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx (Navigation sidebar)
│   │   └── Sidebar.css
│   ├── pages/
│   │   ├── AuthorLoginPage.jsx (Login form)
│   │   ├── AuthorLoginPage.css
│   │   ├── AuthorDashboard.jsx (Main dashboard with sidebar + content)
│   │   ├── AuthorDashboard.css
│   │   ├── MembersPage.jsx (Members list table)
│   │   └── MembersPage.css
│   ├── App.jsx (Root component, auth logic)
│   ├── App.css
│   ├── main.jsx (Entry point)
│   └── index.css (Global styles)
├── index.html
├── package.json (React 18.3.1, Vite)
├── vite.config.js (Port: 5174)
└── README.md
```

---

## ✅ Completed Features

### 1. AuthorLoginPage
- Email and password input fields
- Password visibility toggle (👁️ icon)
- Form validation (email format, password length 6+)
- Error messages display
- Loading state on submit
- Demo mode: Any email + password (6+ chars) works
- Session persistence with localStorage
- Professional dark theme styling

### 2. AuthorDashboard
- Sidebar navigation (280px fixed)
- Top bar with logout button
- Integrates MembersPage as main content
- Shows logged-in user info
- Responsive layout

### 3. Sidebar Navigation
- Dashboard header
- Members section with 4 subsections:
  - **Active Members** - View all active members
  - **Pending Requests** - Join requests
  - **Invitations** - Sent invitations
  - **Rejected** - Rejected members
- Active tab highlighting
- Smooth transitions

### 4. MembersPage
- Stat cards showing counts (Active, Pending, Invitations, Rejected)
- Search bar (filter by name/email)
- Dynamic table with context-aware columns
- Demo data across all member types
- Action buttons (three-dot menu)
- Empty state handling
- Responsive design

### 5. Demo Data (10+ Members)
**Active Members (4)**
```
- Carlos Rodriguez (carlos@example.com) - 5 sites
- Sarah Chen (sarah@example.com) - 3 sites
- James Wilson (james@example.com) - 8 sites
- Maria Garcia (maria@example.com) - 2 sites
```

**Pending Requests (2)**
```
- Alex Thompson (alex@example.com)
- Emma Davis (emma@example.com)
```

**Invitations (3)**
```
- Michael Brown (michael@example.com)
- Lisa Anderson (lisa@example.com)
- David Martinez (david@example.com)
```

**Rejected (1)**
```
- Robert Johnson (robert@example.com) - Reason: Spam account
```

---

## 🎨 Design System

- **Theme:** Dark mode with blue accents (#64c8ff)
- **Background:** Gradient (0f1419 → 1a2332)
- **Components:** Cards, tables, buttons, sidebar
- **Responsive:** Mobile, tablet, desktop (breakpoint: 768px)
- **Fonts:** System fonts with monospace for code
- **Icons:** SVG inline components

---

## 🚀 Setup & Running

### Installation
```bash
cd organization-mentor
npm install
npm run dev
```

### Development Server
- **Port:** 5174
- **URL:** `http://localhost:5174`
- **Auto-reload:** Enabled
- **Browser:** Opens automatically

### Build
```bash
npm run build
```

### Production Preview
```bash
npm run preview
```

---

## 🔐 Authentication Flow

1. **AuthorLoginPage** (Initial state)
   - User enters email and password
   - Form validation
   - Demo: Any email + password (6+ chars)

2. **Session Storage**
   - Saves to localStorage: `authorSession`
   - Contains: id, email, name, organization, loginTime

3. **AuthorDashboard** (Logged in state)
   - Loads saved session on app mount
   - Shows Members page by default
   - Sidebar navigation active

4. **Logout**
   - Clears localStorage
   - Returns to login page

---

## 📊 Current Pages

### Page 1: AuthorLoginPage ✅
- Email field
- Password field (with visibility toggle)
- Submit button with loading state
- Error display
- Demo info text
- Professional styling

### Page 2: AuthorDashboard ✅
- Top navigation bar
- Sidebar (left 280px)
- Main content area
- Members page integration

### Page 3: MembersPage (Active) ✅
- Stat cards (4 columns)
- Search input
- Table with columns:
  - NAME (avatar + name)
  - EMAIL
  - JOINED / REQUESTED / INVITED / REJECTED
  - SITES (active) / ACTION buttons
  - ACTIONS (three dots)

### Page 4: MembersPage (Pending) ✅
- Same layout, different columns
- Shows REQUESTED date

### Page 5: MembersPage (Invitations) ✅
- Same layout, different columns
- Shows INVITED date

### Page 6: MembersPage (Rejected) ✅
- Same layout, different columns
- Shows REJECTED date and REASON

---

## 🔧 Key Technical Details

### Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

### Build Tool
- Vite (fast development server)
- Port: 5174
- HMR: Enabled

### State Management
- React hooks (useState, useEffect, useMemo)
- localStorage for persistence
- No Redux (keeping it simple for now)

### CSS
- CSS Modules NOT used (plain CSS files)
- Responsive with media queries
- Dark theme with CSS variables concept
- Smooth transitions on all interactive elements

---

## 🐛 Known Issues & Fixes

### Fixed Issues
- ✅ Redux dependency conflict → Removed Redux (not needed)
- ✅ React not defined → Added useEffect import

### To Debug
- Check browser console (F12)
- Check Network tab for API calls
- localStorage values: Open DevTools → Application → Local Storage

---

## 📝 Next Steps (For Next Claude Session)

1. **Action Buttons** - Implement member actions (Accept/Reject/Remove/etc.)
2. **Mini Sites Integration** - Show which sites belong to which members
3. **Member Details** - Modal/page for individual member view
4. **Admin Features** - Member role management, permissions, etc.
5. **API Integration** - Connect to backend (when ready)
6. **Export/Reports** - Export member list to CSV/PDF
7. **Batch Actions** - Multi-select and bulk operations

---

## 💾 localStorage Keys

```javascript
// Current keys
authorSession: {
  id: string,
  email: string,
  name: string,
  organization: string,
  loginTime: ISO string
}
```

---

## 🎯 Demo Credentials

- **Email:** Any email (e.g., author@example.com)
- **Password:** Any 6+ character password
- **Note:** Demo mode - accepts all valid inputs

---

## 📌 Important Notes

1. **Separate Project** - Do NOT modify kick-analyst-frontend when working on this
2. **localStorage** - Data persists on page refresh (session management)
3. **Sidebar Fixed** - 280px width, always visible on desktop
4. **Responsive** - Hides sidebar on mobile (< 768px)
5. **Dark Theme** - Consistent with main application
6. **No Redux** - Using React hooks only for simplicity
7. **Demo Data** - Hardcoded, will be replaced with API calls

---

## 🔗 Related Projects

- **Main App:** `kick-analyst-frontend` (localhost:5173)
- **This App:** `organization-mentor` (localhost:5174)
- **Integration:** Route `/organization` to this app

---

## 📖 File Reference

- **Sidebar:** `src/components/Sidebar.jsx` (Navigation)
- **Members Page:** `src/pages/MembersPage.jsx` (Main content)
- **Dashboard:** `src/pages/AuthorDashboard.jsx` (Layout)
- **Login:** `src/pages/AuthorLoginPage.jsx` (Auth)
- **App:** `src/App.jsx` (Root, session logic)

---

**Last Updated:** 2026-09-02  
**Status:** Ready to test ✅  
**Next Session:** Ready for backend integration or additional features
