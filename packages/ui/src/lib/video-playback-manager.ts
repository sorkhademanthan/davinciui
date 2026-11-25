export type VideoPlaybackToken = object;

interface ActivePlayback {
  token: VideoPlaybackToken;
  teardown: () => void;
}

let activePlayback: ActivePlayback | null = null;

export function teardownVideoPreview(video: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.removeAttribute("src");
  video.querySelectorAll("source").forEach((source) => source.remove());
  video.load();
}

export const videoPlaybackManager = {
  get active() {
    return activePlayback !== null;
  },

  activeCount(): number {
    return activePlayback ? 1 : 0;
  },

  acquire(teardown: () => void): VideoPlaybackToken {
    activePlayback?.teardown();
    const token = {} as VideoPlaybackToken;
    activePlayback = { token, teardown };
    return token;
  },

  release(token: VideoPlaybackToken) {
    if (!activePlayback || activePlayback.token !== token) return;
    activePlayback.teardown();
    activePlayback = null;
  },
};
