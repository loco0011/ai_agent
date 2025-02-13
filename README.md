# AI Agent Chat Application

A full-stack chat application with AI capabilities powered by OpenRouter API, built using React, Node.js, Express, and MongoDB.

## Features

- 🤖 Real-time AI chat interface with Agent Sam
- 💾 Persistent chat history with MongoDB
- 🌓 Dark/Light theme toggle
- 🎨 Modern, responsive UI with Tailwind CSS
- ✨ Smooth animations with Framer Motion
- 📱 Multiple chat conversations support
- 🕒 Real-time clock display with date
- 💬 Chat management (create, rename, delete)
- ⌨️ Typing indicators
- 🔄 Real-time development with hot reloading
- 🐳 Docker containerization for easy deployment

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion (for animations)
- Lucide React (for icons)
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- OpenRouter API (GPT-3.5 Turbo)

## Prerequisites

- Docker and Docker Compose
- Node.js 20 or higher
- OpenRouter API key

## Environment Setup

1. Create a `.env` file in the `backend` directory:
```env
PORT=5000
OPENROUTE_API_KEY=your_openrouter_api_key
MONGODB_URI=mongodb://mongodb:27017/ai_agent
```

## Installation & Running

1. Clone the repository:
```bash
git clone <repository-url>
cd ai_agent
```

2. Start the application using Docker Compose:
```bash
docker-compose up
```

This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:5000
- MongoDB at localhost:27017

## API Endpoints

### Chat Routes
- `GET /api/chat/chats` - Get all chats
- `POST /api/chat/chats` - Create a new chat
- `PUT /api/chat/chats/:id` - Update chat name
- `DELETE /api/chat/chats/:id` - Delete a chat
- `GET /api/chat/chats/:id/messages` - Get messages for a specific chat
- `POST /api/chat/chats/:id/messages` - Send a message in a specific chat

## Features in Detail

### Theme Switching
- Toggle between dark and light modes
- Smooth transition animations
- Persistent theme preference
- Custom gradient backgrounds

### Chat Management
- Create multiple chat conversations
- Rename chats with inline editing
- Delete unwanted chats
- Automatic chat naming based on first message

### Real-time Features
- Live clock display with date
- Typing indicators with animations
- Smooth message transitions
- Auto-scrolling to latest messages

### UI/UX Enhancements
- Responsive sidebar layout
- Message bubbles with role-based styling
- Welcome screen for new users
- Interactive buttons with hover effects
- Custom scrollbar styling

## Development

The project uses Docker Compose for development with hot reloading enabled for both frontend and backend.

### Frontend Development
- Located in `/frontend`
- Uses Vite for fast development
- Hot module replacement enabled
- Tailwind CSS for styling
- Framer Motion for animations
- Component-based architecture

### Backend Development
- Located in `/backend`
- Nodemon for auto-reloading
- MongoDB connection with Mongoose
- Express for API routing
- RESTful API design

## Project Structure

```
ai_agent/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   └── chat.js
│   │   └── models/
│   │       ├── Message.js
│   │       └── Chat.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
└── docker-compose.yml
```

## Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^12.4.2",
    "lucide-react": "^0.344.0",
    "axios": "^1.6.7"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "mongoose": "^8.2.0",
    "node-schedule": "^2.1.1",
    "openai": "^4.28.4"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This is a practice project by Sambit