'use client'
import React, { useState, useRef, useEffect } from "react";
import Peer from "simple-peer";

const VideoCall = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);
  const peerVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((currentStream) => {
    console.log("Media stream received:", currentStream);
    setStream(currentStream);
    if (myVideo.current) {
      myVideo.current.srcObject = currentStream;
    }
  })
  .catch((error) => console.error("Error accessing media devices:", error));

    // Connect to WebSocket
    socket.current = new WebSocket("ws://127.0.0.1:8000/ws");

  socket.current.onopen = () => {
    console.log("WebSocket connected!");
  };

  socket.current.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.log("📩 Received WebSocket message:", data);
  
    if (data.signal) {
      console.log("🔹 Applying received WebRTC signal...");
      console.log(data.signal);
      if (peer) {
        peer.signal(data.signal);
      } else {
        console.error("❌ Peer connection not established!");
      }
    } else {
      console.error("❌ No signal data received!");
    }
  };
  

  socket.current.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.current.onclose = () => {
    console.log("WebSocket disconnected!");
  };
  }, [peer]);

  // Function to create peer connection
  const createPeer = () => {
    console.log("Start Call button clicked");
    alert("Clicked");
    
    const newPeer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });
    alert("In");
  
    newPeer.on("signal", (signal) => {
      console.log("Generated WebRTC signal:", signal);
      socket.current?.send(JSON.stringify({ signal }));
    });
    
    newPeer.on("connect", () => {
      console.log("✅ Peer-to-peer connection established!");
    });
  
    newPeer.on("stream", (remoteStream) => {
      console.log("Received remote stream:", remoteStream);
      if (peerVideo.current) {
        peerVideo.current.srcObject = remoteStream;
      }
    });
  
    setPeer(newPeer);
    console.log(newPeer)
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <video ref={myVideo} autoPlay playsInline className="w-1/2 rounded-lg shadow-lg" />
      <video ref={peerVideo} autoPlay playsInline className="w-1/2 rounded-lg shadow-lg mt-4" />
      <button
        onClick={createPeer}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md"
      >
        Start Call
      </button>
    </div>
  );
};

export default VideoCall;
