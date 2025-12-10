'use client'
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { Video, MicOff } from "lucide-react";

const VideoCall = () => {
  const router = useRouter();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const myVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Get user media for preview
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    // Cleanup preview stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, []);


  // Function to create peer connection


  return (
    <div className="flex flex-col gap-2 items-center items-center justify-center h-screen bg-gray-900 p-5">
      <div className='text-5xl' style={{ fontFamily: '--font-exo' }}>
        syncwave
      </div>
      <div className="flex flex-row flex-wrap items-center gap-12 items-center justify-center w-full h-full">
        <div className="relative w-1/2 rounded-lg shadow-lg mt-4 ">
          <video ref={myVideo} autoPlay playsInline className=" w-full rounded-lg shadow-lg" >
          </video>
          <div className=" flex flex-row justify-center absolute w-full  text-black bottom-2 left-0 px-2 gap-5">
            <button
              className={`border p-4 rounded-full  text-white hover:bg-white hover:text-black cursor-pointer `}
            >
              <Video className="w-6 h-6" />
            </button>

            <button
              className={`border p-4 rounded-full  text-white hover:bg-white hover:text-black cursor-pointer`}
            >
              {<MicOff className="w-6 h-6" />}
            </button>
          </div>

        </div>
        <div className=" flex flex-col  w-130 bg-gray-800 items-center p-5 rounded-md">
          <h1>Ongoing Rooms:</h1>
          <div className="flex flex-row justify-between p-2  mt-2 items-center w-full">
            <h2>Room-1</h2>
            <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">Connect</button>
          </div>
          <button
            onClick={() => {

              router.push("/room")
            }}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 cursor-pointer"
          >
            Start Call
          </button>
        </div>
      </div>



    </div>
  );
};

export default VideoCall;
