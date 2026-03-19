import { useRef, useCallback, useEffect } from 'react';
import apiClient from "@/api/apiClient";

export const useVideoProgress = (
    lectureId: string | undefined,
    initialProgress: number,
    onProgressChange?: (newProgress: number) => void
    ) => {
  const lastSyncedProgress = useRef<number>(initialProgress);
  const pendingProgress = useRef<number>(initialProgress);
  const syncTimer = useRef<NodeJS.Timeout | null>(null);
  

  useEffect(() => {
    if (initialProgress > lastSyncedProgress.current) {
      lastSyncedProgress.current = initialProgress;
      pendingProgress.current = initialProgress;
    }
  }, [initialProgress]);

  const handleProgressUpdate = useCallback(async (currentTime: number, duration: number) => {
    if (!duration || !lectureId) return;

    const currentProgress = Math.floor((currentTime / duration) * 100);

    // Only progress forward  
    // stop overriding progress if the scrubber gets moved back
    if (currentProgress > lastSyncedProgress.current) {
      pendingProgress.current = currentProgress;

      if (onProgressChange) {
        onProgressChange(currentProgress);
      }

      // Throttled Heartbeat: Sync every 10 seconds
      if (!syncTimer.current) {
        syncTimer.current = setTimeout(async () => {
          try {
            await apiClient.patch(`/lectures/${lectureId}/validate/`, {
              review_progress: pendingProgress.current,
            });
            lastSyncedProgress.current = pendingProgress.current;
            console.log(`Synced progress: ${pendingProgress.current}%`);
          } catch (err) {
            console.error("Failed to sync progress:", err);
          } finally {
            syncTimer.current = null;
          }
        }, 3500); //3500 ===> 3.5 second intervals 
      }
    }
  }, [lectureId,onProgressChange]);

  // Clean up timer on unmount
  const stopSync = () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
  };

  return { handleProgressUpdate, stopSync, currentProgress: pendingProgress.current };
};