"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CinematicMediaProps = {
  enabled: boolean;
  src: string;
  poster: string;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  sizes?: string;
};

export default function CinematicMedia({
  enabled,
  src,
  poster,
  alt,
  className = "",
  fit = "cover",
  priority = false,
  sizes = "100vw",
}: CinematicMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoAvailable, setVideoAvailable] = useState(enabled);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoAvailable || reducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused) {
          void video.play().catch(() => setVideoAvailable(false));
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion, userPaused, videoAvailable]);

  const useVideo = enabled && videoAvailable && !reducedMotion;
  const wrapperClass = [
    "cinematic-media",
    fit === "contain" ? "cinematic-media--contain" : "cinematic-media--cover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!useVideo) {
    return (
      <div className={wrapperClass} data-media-mode="poster">
        <Image src={poster} alt={alt} fill priority={priority} sizes={sizes} />
      </div>
    );
  }

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      void video.play().catch(() => setVideoAvailable(false));
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  return (
    <div className={wrapperClass} data-media-mode="video">
      <span className="cinematic-media__description">{alt}</span>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setVideoAvailable(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        className="cinematic-media__control"
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause cinematic background" : "Play cinematic background"}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
