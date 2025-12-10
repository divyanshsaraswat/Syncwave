# SyncWave 🌊
> Real-time Video Calling Application powered by Next.js and FastAPI

<div align="center">

![SyncWave](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![WebRTC](https://img.shields.io/badge/Protocol-WebRTC-orange)

</div>

## 🚀 About
SyncWave is a lightweight, high-performance video calling application. It uses **WebRTC** for peer-to-peer video streaming and **FastAPI WebSockets** for efficient signaling.

## ✨ Features
- **Real-time Video & Audio**: Low latency peer-to-peer communication.
- **Instant Connection**: Uses WebSockets for immediate signaling.
- **Modern UI**: Built with Next.js and Tailwind CSS.
- **No Sign-up Required**: Drop into a room and start chatting.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Lucide Icons, Simple-Peer.
- **Backend**: FastAPI, Uvicorn, Python WebSockets.

---

## 🏁 Getting Started

Follow these steps to get the application running locally on your machine.

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.8+)

### 2. Backend Setup 🐍
The backend handles the WebSocket signaling server.

```bash
# Navigate to the backend directory
cd back

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on port 8000)
python main.py
```
> The backend will start at `ws://localhost:8000/ws`

### 3. Frontend Setup ⚛️
The frontend is the user interface for the video call.

```bash
# Open a new terminal and navigate to the frontend directory
cd front

# Install dependencies
npm install

# Start the development server
npm run dev
```
> The frontend will be available at `http://localhost:3000`

---

## 🧪 How to Test
1. Start the **Backend** and **Frontend** servers as shown above.
2. Open your browser and go to `http://localhost:3000`.
3. Click "Start Call" to enter the room.
4. **Open a second tab** (or a different browser/incognito window) and go to `http://localhost:3000/room`.
5. You should see "Peer joined" and the video streams connecting! 🎥

## ⚠️ Troubleshooting
- **Black Video?**: Make sure you have granted camera/microphone permissions to the browser.
- **Connection Failed?**: Ensure the backend is running (`python main.py`) and is accessible.
- **Issues on simple-peer?**: This implementation uses `simple-peer` which relies on WebRTC. Ensure you are not behind a restrictive firewall for local testing.

---

## 📂 Project Structure
```
syncwave/
├── back/               # FastAPI Backend
│   ├── main.py         # WebSocket Server
│   └── requirements.txt
├── front/              # Next.js Frontend
│   ├── app/            # App Router
│   ├── components/     # React Components
│   └── public/
└── README.md
```

Made with ❤️ by SyncWave Team