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
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    // Connect to WebSocket
    socket.current = new WebSocket("http://127.0.0.1:8000/ws");

    socket.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.signal) {
        peer?.signal(data.signal);
      }
    };
  }, []);

  // Function to create peer connection
  const createPeer = () => {
    alert('Clikced')
    const newPeer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });
    
    newPeer.on("signal", (signal) => {
      
      alert('Clikced')
      socket.current?.send(JSON.stringify({ signal }));
    });
    
    newPeer.on("stream", (remoteStream) => {
      if (peerVideo.current) {
        alert('Clikced')
        peerVideo.current.srcObject = remoteStream;
      }
    });

    setPeer(newPeer);
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
