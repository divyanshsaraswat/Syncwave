'use client';
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import Peer from 'simple-peer';
import { MicOff, Mic, Video, VideoOff, ScreenShare, PhoneOff, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoGridProps {
  stream: MediaStream | null;
  localScreenStream: MediaStream | null;
  remoteStreams: { id: string, stream: MediaStream }[];
  isVideoOff: boolean;
}

const VideoGrid = memo(({ stream, localScreenStream, remoteStreams, isVideoOff }: VideoGridProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 overflow-hidden p-2">
      {/* Local Video Area */}
      <div className="flex flex-1 flex-wrap gap-4 min-w-0 justify-center content-center">
        {/* Main Camera */}
        <div className={`relative bg-black rounded-lg overflow-hidden flex-1 min-w-[200px] ${localScreenStream ? 'basis-1/3 md:max-w-[300px]' : 'basis-full'}`}>
          <video
            ref={video => { if (video && stream) video.srcObject = stream; }}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          {isVideoOff && <div className="absolute inset-0 flex items-center justify-center text-gray-500">Camera Off</div>}
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm z-10">
            You
          </div>
        </div>

        {/* Local Screen Share */}
        {localScreenStream && (
          <div className="relative bg-black rounded-lg overflow-hidden flex-1 min-w-[200px] basis-2/3">
            <video
              ref={video => { if (video && localScreenStream) video.srcObject = localScreenStream; }}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm z-10">
              You (Screen)
            </div>
          </div>
        )}
      </div>

      {/* Remote Video Area */}
      <div className="flex flex-1 flex-wrap gap-4 min-w-0 justify-center content-center">
        {remoteStreams.length === 0 && (
          <div className="flex items-center justify-center w-full h-full bg-black rounded-lg text-gray-500">
            Waiting for peer video...
          </div>
        )}

        {remoteStreams.map((remote, index) => (
          <div key={remote.id} className={`relative bg-black rounded-lg overflow-hidden flex-1 min-w-[200px] ${remoteStreams.length > 1 && index === 0 ? 'basis-1/3 md:max-w-[300px]' : 'basis-full'}`}>
            <video
              ref={video => { if (video) video.srcObject = remote.stream; }}
              autoPlay
              playsInline
              className={`w-full h-full ${index > 0 ? 'object-contain' : 'object-cover'}`}
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm z-10">
              Remote {index > 0 ? '(Screen)' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
VideoGrid.displayName = 'VideoGrid';

interface ChatAreaProps {
  messages: string[];
  onSendMessage: (text: string) => void;
}

const ChatArea = memo(({ messages, onSendMessage }: ChatAreaProps) => {
  const [chatText, setChatText] = useState('');

  const handleSend = () => {
    if (chatText.trim()) {
      onSendMessage(chatText);
      setChatText('');
    }
  };

  return (
    <div className="w-full">
      <div className="mt-4 flex gap-2 w-full max-w-lg mx-auto">
        <input
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2"
          value={chatText}
          onChange={e => setChatText(e.target.value)}
          placeholder="Send a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500">
          Send
        </button>
      </div>
      <div className="max-w-lg mx-auto w-full mt-2 h-20 overflow-y-auto text-sm text-gray-400">
        {messages.map((m, i) => <div key={i}>{m}</div>)}
      </div>
    </div>
  );
});
ChatArea.displayName = 'ChatArea';

const RoomPage = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ id: string, stream: MediaStream }[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Waiting for connection...');

  // State for controls
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Refs for mutable objects
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const isScreenSharingRef = useRef(false);
  const [messages, setMessages] = useState<string[]>([]);

  const router = useRouter();

  // Keep refs in sync with state for use in callbacks/closures
  useEffect(() => {
    localScreenStreamRef.current = localScreenStream;
  }, [localScreenStream]);

  useEffect(() => {
    isScreenSharingRef.current = isScreenSharing;
  }, [isScreenSharing]);

  useEffect(() => {
    // 1. Get User Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        streamRef.current = currentStream;

        // 2. Connect to WebSocket after media is ready
        connectWebSocket();
      })
      .catch(err => {
        console.error("Error accessing media devices:", err);
        setConnectionStatus("Error: Could not access camera/microphone");
      });

    // Get list of devices
    navigator.mediaDevices.enumerateDevices().then(setDevices);

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (peerRef.current) peerRef.current.destroy();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  const connectWebSocket = () => {
    const wsUrl = "ws://localhost:8000/ws";
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("🔌 WebSocket connected");
      setConnectionStatus("Connected. Waiting for peer...");
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (e) {
        console.error("Error parsing WS message:", e);
      }
    };

    socketRef.current.onclose = () => setConnectionStatus("Disconnected");
  };

  const handleWebSocketMessage = (message: any) => {
    if (message.type === 'user-joined') {
      console.log("New user joined");
      setConnectionStatus("Peer joined. Calling...");
      createPeer(true);
    } else if (message.type === 'signal') {
      if (!peerRef.current) {
        setConnectionStatus("Receiving call...");
        createPeer(false);
      }
      peerRef.current?.signal(message.data);
    } else if (message.type === 'chat') {
      setMessages(prev => [...prev, message.data]);
    }
  };

  const createPeer = (isInitiator: boolean) => {
    if (peerRef.current && isInitiator) return;

    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: streamRef.current || undefined,
    });

    peer.on('signal', (data) => {
      socketRef.current?.send(JSON.stringify({ type: 'signal', data: data }));
    });

    peer.on('stream', (remoteStream) => {
      console.log("Received remote stream", remoteStream.id);

      setRemoteStreams(prev => {
        if (prev.some(s => s.id === remoteStream.id)) return prev;
        return [...prev, { id: remoteStream.id, stream: remoteStream }];
      });

      remoteStream.getTracks().forEach(track => {
        track.onended = () => {
          if (remoteStream.getTracks().every(t => t.readyState === 'ended')) {
            setRemoteStreams(prev => prev.filter(s => s.id !== remoteStream.id));
          }
        };
      });
    });

    peer.on('connect', () => {
      setConnectionStatus("Connected");
      // Use refs to get current state within closure
      if (isScreenSharingRef.current && localScreenStreamRef.current) {
        console.log("Adding existing screen share to new peer connection");
        peer.addStream(localScreenStreamRef.current);
      }
    });

    peer.on('error', (err) => {
      console.error("Peer error:", err);
      setConnectionStatus("Error: " + err.message);
    });

    peer.on('close', () => {
      console.log("Peer closed");
      setRemoteStreams([]);
      peerRef.current = null;
      setConnectionStatus("Peer disconnected");
    });

    peerRef.current = peer;
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsAudioMuted(!track.enabled); // track.enabled is true if unmuted
      });
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      });
    }
  };

  const shareScreen = () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (localScreenStream) {
        localScreenStream.getTracks().forEach(track => track.stop());
        if (peerRef.current) {
          peerRef.current.removeStream(localScreenStream);
        }
        setLocalScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((screenStream) => {
        setLocalScreenStream(screenStream);

        if (peerRef.current) {
          peerRef.current.addStream(screenStream);
        }

        screenStream.getVideoTracks()[0].onended = () => {
          if (peerRef.current) {
            peerRef.current.removeStream(screenStream);
          }
          setLocalScreenStream(null);
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      }).catch(err => console.error("Error sharing screen", err));
    }
  };

  const onSendMessage = useCallback((text: string) => {
    if (text.trim()) {
      socketRef.current?.send(JSON.stringify({ type: 'chat', data: text }));
      setMessages(prev => [...prev, `Me: ${text}`]);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 p-5 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold font-exo">SyncWave</h1>
        <div className="text-sm bg-gray-800 px-3 py-1 rounded">
          Status: {connectionStatus}
        </div>
      </div>

      <VideoGrid
        stream={stream}
        localScreenStream={localScreenStream}
        remoteStreams={remoteStreams}
        isVideoOff={isVideoOff}
      />

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full cursor-pointer ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full cursor-pointer ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={shareScreen}
          className={`p-4 rounded-full cursor-pointer ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <ScreenShare className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-4 rounded-full cursor-pointer bg-gray-700 hover:bg-gray-600">
          <Settings className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            socketRef.current?.close();
            router.push('/');
          }}
          className="p-4 rounded-full cursor-pointer bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      <ChatArea messages={messages} onSendMessage={onSendMessage} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Settings</h2>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Input Devices</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {devices.map((device, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-medium text-blue-400">{device.kind}</span>
                    <span>{device.label || `Device ${i + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
