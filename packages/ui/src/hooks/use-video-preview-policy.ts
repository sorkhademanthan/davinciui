import * as React from "react";

type ConnectionLike = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

function getConnection(): ConnectionLike | undefined {
  return (navigator as Navigator & { connection?: ConnectionLike }).connection;
}

function isVideoPreviewAllowed(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (document.visibilityState === "hidden") {
    return false;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  const connection = getConnection();
  if (connection?.saveData) {
    return false;
  }
  if (
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g"
  ) {
    return false;
  }
  return true;
}

export function useVideoPreviewPolicy(): boolean {
  const [allowed, setAllowed] = React.useState(isVideoPreviewAllowed);

  React.useEffect(() => {
    const update = () => setAllowed(isVideoPreviewAllowed());
    update();
    document.addEventListener("visibilitychange", update);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", update);
    const connection = getConnection();
    connection?.addEventListener?.("change", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      mediaQuery.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  return allowed;
}
