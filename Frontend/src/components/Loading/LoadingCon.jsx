import { useEffect, useRef } from "react";
import loading from "@assets/video/loading.webm";

export default function LoadingCon() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[9999] bg-transparent">
      <video
        ref={videoRef}
        src={loading}
        autoPlay
        loop
        muted
        playsInline
        className="w-40 h-auto"
      />
    </div>
  );
}
