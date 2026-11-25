"use client";

import { useHoverIntent } from "@workspace/ui/hooks/use-hover-intent";
import { useVideoPreviewPolicy } from "@workspace/ui/hooks/use-video-preview-policy";
import {
  teardownVideoPreview,
  videoPlaybackManager,
  type VideoPlaybackToken,
} from "@workspace/ui/lib/video-playback-manager";
import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

export interface VideoPreviewSource {
  /** Primary source URL. WebM is listed first when available for size. */
  src: string;
  type?: string;
}

export interface VideoPreviewCardProps extends Omit<
  React.ComponentPropsWithoutRef<"a">,
  "children"
> {
  /** Poster shown until the video starts playing. Never removed while idle. */
  poster: string;
  /** Loopable video sources rendered only on user intent. */
  sources: VideoPreviewSource[];
  /** CSS aspect-ratio for the media frame. @default "244 / 190" */
  aspectRatio?: string;
  /** Pointer hover must last this long to start the video. @default 120 */
  hoverIntentDelay?: number;
  /**
   * Touch devices: start playback when the card intersects the viewport
   * (threshold 0.6). The manager enforces a single active video.
   */
  playOnIntersect?: boolean;
  videoClassName?: string;
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
  children?: React.ReactNode;
}

const DEFAULT_ASPECT_RATIO = "244 / 190";

export function VideoPreviewCard({
  poster,
  sources,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  hoverIntentDelay = 120,
  playOnIntersect = false,
  videoClassName,
  onPlaybackStart,
  onPlaybackStop,
  className,
  style,
  children,
  onFocus,
  onBlur,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  ...props
}: VideoPreviewCardProps) {
  const [showVideo, setShowVideo] = React.useState(false);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const tokenRef = React.useRef<VideoPlaybackToken | null>(null);
  const rootRef = React.useRef<HTMLAnchorElement | null>(null);
  const mountedRef = React.useRef(true);

  const policyAllowed = useVideoPreviewPolicy();
  const hoverIntent = useHoverIntent({ delay: hoverIntentDelay });

  const teardown = React.useCallback(() => {
    tokenRef.current = null;
    teardownVideoPreview(videoRef.current);
    if (mountedRef.current) {
      setShowVideo(false);
      setVideoPlaying(false);
    }
    onPlaybackStop?.();
  }, [onPlaybackStop]);

  const startVideo = React.useCallback(() => {
    if (!policyAllowed || videoFailed || tokenRef.current) return;
    tokenRef.current = videoPlaybackManager.acquire(teardown);
    if (mountedRef.current) setShowVideo(true);
    onPlaybackStart?.();
  }, [policyAllowed, videoFailed, teardown, onPlaybackStart]);

  const stopVideo = React.useCallback(() => {
    const token = tokenRef.current;
    if (token) videoPlaybackManager.release(token);
    else teardown();
  }, [teardown]);

  React.useEffect(() => {
    if (!hoverIntent.active) return;
    startVideo();
  }, [hoverIntent.active, startVideo]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!showVideo || !video) return;
    setVideoPlaying(false);
    video.play().catch(() => {});
  }, [showVideo]);

  React.useEffect(() => {
    if (!policyAllowed && showVideo) stopVideo();
  }, [policyAllowed, showVideo, stopVideo]);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const token = tokenRef.current;
      if (token) videoPlaybackManager.release(token);
    };
  }, []);

  React.useEffect(() => {
    if (!playOnIntersect) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      () => {
        startVideo();
      },
      { threshold: 0.6 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [playOnIntersect, startVideo]);

  return (
    <a
      ref={rootRef}
      className={cn("group block", className)}
      style={{ aspectRatio, ...style }}
      onFocus={(event) => {
        onFocus?.(event);
        startVideo();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        stopVideo();
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType !== "touch") hoverIntent.start();
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        hoverIntent.cancel();
        stopVideo();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.pointerType === "touch") startVideo();
      }}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={poster}
          alt=""
          width={244}
          height={190}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {showVideo && !videoFailed ? (
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
              videoPlaying ? "opacity-100" : "opacity-0",
              videoClassName,
            )}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            poster={poster}
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={() => setVideoPlaying(true)}
            onError={() => setVideoFailed(true)}
          >
            {sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : null}
      </div>
      {children}
    </a>
  );
}

export default VideoPreviewCard;
