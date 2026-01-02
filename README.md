# RenderDrop - Cinematic Digital Experience

RenderDrop is a high-performance, aesthetically driven web application designed to deliver a premium "Cinematic Digital Experience." Built with modern web technologies, it features immersive scrollytelling, high-end animations, and a robust backend for user authentication and request management.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- **Cinematic UI/UX:** A "Cyberpunk" and "High-Luxury" aesthetic enabled by **GSAP** and **Framer Motion** for smooth, complex animations.
- **Immersive Scrollytelling:** Interactive scroll-based narrative elements that guide the user through the digital experience.
- **Dual Visual Themes:** Seamlessly switch between "Luxury Acquisition" and "Pixel Perfect Persona" themes.
- **User Authentication:** Secure signup and login flow with referral code validation.
- **Request System:** A multi-step form for users to submit rendering requests, generating unique, cryptographic receipt keys for tracking.
- **Admin Panel:** A comprehensive dashboard for administrators to manage requests, view analytics, and control referral codes.
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

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Server:** Express.js (handling API routes for auth and requests).
- **Database:** SQLite (`pds_auth.db`, `pds_requests.db`) for lightweight, efficient data storage.
- **Security:** Secure session handling and API protection.

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

### Running the Application

To run the full stack locally, you will need two terminal windows.

**Terminal 1: Frontend**
```bash
# From the root directory
npm run dev
```
The application will launch at `http://localhost:5173`.

**Terminal 2: Backend**
```bash
# From the backend directory
cd backend
node server.js
# OR if you have a dev script configured
npm run dev
```
The server typically runs on port `5000` or `3000` (check `server.js` or `.env`).

## 📂 Project Structure

```text
PDS/
├── src/                # Frontend source code
│   ├── components/     # Reusable React components (Hero, Navbar, etc.)
│   ├── assets/         # Static assets (images, icons)
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
├── backend/            # Backend server code
│   ├── server.js       # Express server entry point
│   └── *.db            # SQLite databases
├── public/             # Static public files
├── index.html          # HTML entry point
├── package.json        # Frontend dependencies and scripts
└── vite.config.js      # Vite configuration
```

## 🔒 Environment Variables

Create a `.env` file in the root and/or `backend` directory if required (refer to `server.js` for used variables). Common variables include:

```env
PORT=5000
JWT_SECRET=your_super_secret_key
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
*Built with ❤️ by the RenderDrop Team*
