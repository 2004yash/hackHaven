// src/components/VideoCall.js
import React, { useRef, useEffect, useState } from "react";
import SimplePeer from "simple-peer";

const VideoCall = ({ roomId }) => {
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const myVideo = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef();

  useEffect(() => {
    // Request access to user's video and audio
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      })
      .catch((err) => console.error("Error accessing media devices:", err));

    // Initialize WebSocket connection (replace with your WebSocket URL)
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: "join-room", roomId }));
    };

    socketRef.current.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === "user-joined") {
        const peer = createPeer(data.userId, socketRef.current.id, stream);
        peersRef.current.push({ peerID: data.userId, peer });
        setPeers((prevPeers) => [...prevPeers, peer]);
      }

      if (data.type === "receiving-returned-signal") {
        const item = peersRef.current.find((p) => p.peerID === data.userId);
        if (item) {
          item.peer.signal(data.signal);
        }
      }
    };

    return () => {
      // Clean up when the component unmounts
      socketRef.current.close();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, stream]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.send(
        JSON.stringify({
          type: "sending-signal",
          userToSignal,
          callerID,
          signal,
        })
      );
    });

    return peer;
  };

  return (
    <div className="video-call-container">
      <video ref={myVideo} autoPlay muted className="my-video" />
      {peers.map((peer, index) => (
        <Video key={index} peer={peer} />
      ))}
    </div>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return <video ref={ref} autoPlay className="peer-video" />;
};

export default VideoCall;
