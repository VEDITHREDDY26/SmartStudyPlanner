# 📚 Smart StudyPlanner

**Smart StudyPlanner** is a comprehensive productivity application designed to help students and professionals manage their study schedules, tasks, and habits effectively. Built with the MERN stack, it combines task management and spaced repetition to boost learning efficiency.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 🚀 Features

- **🔐 Secure Authentication:** User sign-up and login utilizing JWT and Bcrypt.
- **📊 Dashboard:** Centralized view of your activities, progress, and upcoming tasks.
- **📝 Task Management:** Precise tracking of study tasks and to-dos.
- **🍅 Pomodoro Timer:** Integrated timer to help you focus using the Pomodoro technique.
- **🧠 Spaced Repetition:** Flashcard system to improve long-term retention.
- **📅 Calendar Integration:** View tasks and deadlines in a calendar format.
- **🔔 Notifications:** Customizable notification settings to keep you on track.
- **🌗 Theme Support:** User-friendly interface with modern design and styling.

## 🛠️ Tech Stack

### Frontend

- **React** (Vite)
- **Tailwind CSS** & **Tw-Elements-React**
- **Framer Motion** (Animations)
- **React Router DOM** (Routing)
- **Axios** (API Requests)

### Backend

- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose)
- **JSON Web Token (JWT)** (Auth)
- **Nodemailer** (Email Services)
- **Node-Cron** (Scheduled Jobs)

## ⚙️ Installation & Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (cloud or local instance)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SmartStudyPlanner.git
cd SmartStudyPlanner
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd ../frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173` (or the port specified by Vite).

## 📂 Project Structure

```
SmartStudyPlanner/
├── backend/            # Express.js API and Server
│   ├── config/         # DB and other configurations
│   ├── controllers/    # Route logic
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── server.js       # Entry point
│
└── frontend/           # React Application
    ├── public/         # Static assets
    └── src/
        ├── components/ # Reusable UI components
        ├── pages/      # Application views/pages
        └── context/    # React Context (Theme, Auth)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
