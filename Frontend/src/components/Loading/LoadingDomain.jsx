import { useEffect, useRef } from "react";
import loading from "@assets/video/loading.webm";

export default function LoadingDomain() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-transparent">
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
