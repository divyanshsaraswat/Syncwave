'use client'
import React, { useState, useRef, useEffect } from "react";
import Peer from "simple-peer";

const VideoCall = () => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [peer,setPeer] = useState<Peer.Instance|null>(null);
  const [peerStreams,setPeerStreams] = useState<any>();
  const socket = useRef<WebSocket|undefined>(undefined)
  const myVideo = useRef<HTMLVideoElement>(null);
  const peerVideo = useRef<HTMLVideoElement|null>(null);

  const getMediaStream = async () => {
    try {
      if (!stream) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
      } else {
        // Clone the stream to allow multiple users
        const clonedStream = stream.clone();
        setStream(clonedStream);
      }
  
      if (myVideo.current) {
        myVideo.current.srcObject = stream!;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };
  useEffect(() => {
    getMediaStream()
    return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

  }, []);
  const createPeer = (userId: string, socket: WebSocket, event?: React.MouseEvent<HTMLButtonElement>) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
  
    peer.on("signal", (signal) => {
      socket.send(JSON.stringify({ type: "signal", userId, signal }));
    });
  
    peer.on("stream", (remoteStream) => {
      setPeerStreams((prev:any) => [...prev, { id: userId, stream: remoteStream }]);
    });
  
    return peer;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <video ref={myVideo} autoPlay playsInline className="w-1/2 rounded-lg shadow-lg" />
      <video ref={peerVideo} autoPlay playsInline className="w-1/2 rounded-lg shadow-lg mt-4" />
      <button
        onClick={() => socket.current && createPeer("user123", socket.current)}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md"
      >
        Start Call
      </button>
    </div>
  );
};

export default VideoCall;
