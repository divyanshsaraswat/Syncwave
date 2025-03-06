'use client'
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import Peer from "simple-peer";

const VideoCall = () => {
  const router = useRouter();
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
  
   
  }, []);

  
  // Function to create peer connection
  

  return (
    <div className="flex flex-col gap-2 items-center items-center justify-center h-screen bg-gray-900 p-5">
      <div className="flex flex-row flex-wrap items-center  items-center justify-center w-full h-full">
      <video ref={myVideo} autoPlay playsInline className="w-1/2 rounded-lg shadow-lg mt-4" />

      </div>
      <button
        onClick={()=>{
          
          router.push("/room")}}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 cursor-pointer"
      >
        Start Call
      </button>
    </div>
  );
};

export default VideoCall;
