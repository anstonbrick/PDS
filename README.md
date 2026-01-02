# RenderDrop - Cinematic Digital Experience

RenderDrop is a high-performance, aesthetically driven web application designed to deliver a premium "Cinematic Digital Experience." Built with modern web technologies, it features immersive scrollytelling, high-end animations, and a robust, secure backend for user authentication and request management.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- **Cinematic UI/UX:** A "Cyberpunk" and "High-Luxury" aesthetic enabled by **GSAP** and **Framer Motion** for smooth, complex animations.
- **Immersive Scrollytelling:** Interactive scroll-based narrative elements that guide the user through the digital experience.
- **Dual Visual Themes:** Seamlessly switch between "Luxury Acquisition" and "Pixel Perfect Persona" themes.
- **User Authentication:** Secure signup and login flow with referral code validation and JWT sessions.
- **Request System:** A multi-step form for users to submit rendering requests, generating unique, cryptographic receipt keys for tracking.
- **Admin Panel:** A comprehensive dashboard for administrators to manage requests, view analytics, and control referral codes.
- **Security First:** Implements industry-standard security headers (Helmet), rate limiting, and strict input validation (Zod).
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop viewing.

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://react.dev/) (v19) linked with [Vite](https://vitejs.dev/) for lightning-fast development.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling.
- **Animations:**
  - [GSAP](https://greensock.com/gsap/) (GreenSock Animation Platform) for timeline and scroll-based animations.
  - [Framer Motion](https://www.framer.com/motion/) for component-level transitions and gestures.
- **Icons:** [Lucide React](https://lucide.dev/) for clean, consistent iconography.
- **Routing:** [React Router DOM](https://reactrouter.com/) for single-page application routing.
- **State Management:** React Context API.

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Server:** Express.js (handling API routes for auth and requests).
- **Database:** SQLite (`pds_auth.db`, `pds_requests.db`) for lightweight, efficient data storage.
- **Security:**
  - **Helmet:** Secure HTTP headers.
  - **Express Rate Limit:** Brute-force protection.
  - **Bcrypt:** Password hashing.
  - **Zod:** Strict input validation and schema enforcement.
- **Logging:** Morgan for request visibility.

## 🚀 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/render-drop.git
    cd render-drop
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    Navigate to the backend directory and install packages.
    ```bash
    cd backend
    npm install
    ```

### Configuration

**Backend Environment Variables:**
You must configure the backend environment variables for the server to run correctly.

1.  Navigate to `backend/`.
2.  Copy the example file:
    ```bash
    cp .env.example .env
    ```
3.  Edit `.env` and update the values:
    ```env
    PORT=3001
    JWT_SECRET=your-super-secret-jwt-key
    ADMIN_PASSWORD=your-secure-admin-password
    NODE_ENV=development
    ```

### Running the Application

To run the full stack locally, you will need two terminal windows.

**Terminal 1: Backend Server**
```bash
cd backend
npm start
```
*The server will start on http://localhost:3001*

**Terminal 2: Frontend Client**
```bash
# From the root directory
npm run dev
```
*The application will launch at http://localhost:5173*

## 📦 Building for Production

To deploy the application:

1.  **Build the Frontend:**
    ```bash
    npm run build
    ```
    This creates a `dist` folder with optimized static assets.

2.  **Backend Deployment:**
    - Ensure your backend server is running in production mode (`NODE_ENV=production`).
    - Use a process manager like `pm2` to keep the server running:
      ```bash
      cd backend
      npm install -g pm2
      pm2 start server.js --name "render-drop-api"
      ```

3.  **Serving the App:**
    - Configure Nginx or Apache to serve the `dist` folder as static files.
    - Proxy `/api` requests to `http://localhost:3001`.

## 📂 Project Structure

```text
PDS/
├── src/                # Frontend source code
│   ├── components/     # High-fidelity React UI components
│   ├── assets/         # Static assets
│   ├── hooks/          # Custom hooks
│   └── App.jsx         # Main application logic
├── backend/            # Backend API
│   ├── server.js       # Secured Express server
│   ├── .env            # Secrets (NOT committed to git)
│   ├── .env.example    # Template for secrets
│   └── *.db            # SQLite Data (Requests & Users)
├── public/             # Public assets
└── vite.config.js      # Build configuration
```

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
*Built with ❤️ by the RenderDrop Team*
