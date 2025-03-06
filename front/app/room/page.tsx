'use client';
import React, { useState, useRef, useEffect } from 'react';
import Peer from 'simple-peer';
import { MicOff, Mic, VideoOff, Video, ScreenShare, RefreshCw } from 'lucide-react';

const VideoCall = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerStream,setPeerStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Peer.Instance[]>([]);
  const socket = useRef<WebSocket | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);
  const [text,settext] = useState<string>('')
  useEffect(() => {
    // Get user media
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    //   .then((currentStream) => {
    //     console.log("📸 Media stream received:", currentStream);
    //     setStream(currentStream);
    //     if (myVideo.current) {
    //       myVideo.current.srcObject = currentStream;
    //     }
    //   })
    //   .catch((error) => console.error("❌ Error accessing media devices:", error));

    // Initialize WebSocket
    socket.current = new WebSocket("ws://localhost:8000/ws");

    socket.current.onopen = () => {
      console.log("🔌 WebSocket connected!");
    };

    socket.current.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log("📩 Received WebSocket message:", data);

      if (data.signal) {
        console.log("🔹 Received WebRTC signal:", data.signal);

       
      }
    };

    socket.current.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.current.onclose = () => {
      console.log("🔌 WebSocket disconnected!");
    };
  }, [stream]); // Depend on stream

  async function createPeer(isInitiator:boolean) {
    // Get media stream (optional, for video/audio calls)
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    // Create the peer
    const peer = new Peer({
      initiator: isInitiator,
      stream: stream,
      trickle: false,
    });
    
    // Handle signaling
    peer.on('signal', data => {
      socket.current?.send(JSON.stringify({
        type: 'signal',
        data: data
      }));
    });
    
    // Handle connection
    peer.on('connect', () => {
      console.log('Connected!');
      peer.send('Hello from ' + (isInitiator ? 'initiator' : 'receiver'));
    });
    
    // Handle incoming data
    peer.on('data', data => {
      console.log('Received:', data.toString());
    });
    
    // Handle incoming stream
    peer.on('stream', stream => {
      setPeerStream(stream);
    });
    
    // Display local video
    
    return peer;
  }

  return (
    <div className="flex flex-col gap-2 justify-between items-center h-screen bg-gray-900 p-5">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-white text-xl">Room: {}</h1>
          <button 
            className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
            title="Reconnect"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className='text-5xl' style={{fontFamily:'--font-exo'}}>
          syncwave
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Copy Room Link
        </button>
      </div>
      
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] grid-rows-[repeat(auto-fill,minmax(100px,1fr))] w-full p-2  gap-4 ">
    
        
        <div className="aspect-video relative">

            <video 
              ref={(video) => {
                if (video && stream) {
                  video.srcObject = stream;
                }
              }}
              autoPlay 
              playsInline 
              className="w-full h-full rounded-lg shadow-lg object-cover bg-gray-800"
            />
          

            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
              Initiator
            </div>
        </div>
    
        <div className="aspect-video relative">

<video 
ref={(video) => {
  if (video && peerStream) {
    video.srcObject = peerStream;
  }
}}
  autoPlay 
  playsInline 
  className="w-full h-full rounded-lg shadow-lg object-cover bg-gray-800"
/>


<div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-white text-sm">
  Initiator
</div>
</div>

        
       
      

       
     
      </div>

      <div className='flex flex-col justify-center items-center gap-4'>

      <div className="mt-4 flex flex-row gap-4">
        <button
          className={`border p-4 rounded-full  text-white hover:opacity-90 `}
        >
         <Video className="w-6 h-6" />
        </button>
        
        <button
          className={`border p-4 rounded-full  text-white hover:opacity-90`}
        >
          { <MicOff className="w-6 h-6" /> }
        </button>
        
        <button
          className={`border p-4 rounded-full  text-white hover:opacity-90`}
        >
          <ScreenShare className="w-6 h-6" />
        </button>
        
        <button
          onClick={()=>socket.current?.send(JSON.stringify({ signal: text }))}
          className="bg-red-600 text-white p-2 rounded-lg shadow-md hover:bg-red-700"
          title="End call"
        >
          End Call
        </button>
      </div>
      
        <input type='text' onChange={(e)=>{settext(e.target.value)}} placeholder='Enter text...'/>
        <div className="mt-4 text-white">
          <p>Participants in room (): 
          </p>
        </div>
        </div>

    </div>
  );
};

export default VideoCall;
