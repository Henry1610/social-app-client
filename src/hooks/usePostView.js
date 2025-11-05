import { useEffect, useRef } from 'react';
import { useMarkPostAsViewedMutation } from '../features/post/postApi';
import { useMarkRepostAsViewedMutation } from '../features/repost/repostApi';

export const usePostView = (postId, repostId = null, enabled = true, threshold = 0.5, delayMs = 1000) => {
  const postRef = useRef(null);
  const [markAsViewed] = useMarkPostAsViewedMutation();
  const [markRepostAsViewed] = useMarkRepostAsViewedMutation();
  const hasBeenViewed = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const targetId = repostId || postId;
    if (!enabled || !targetId || hasBeenViewed.current) return;

    const element = postRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenViewed.current) {
            // Post/Repost đang visible, đợi một chút rồi mark as viewed
            timeoutRef.current = setTimeout(() => {
              if (!hasBeenViewed.current) {
                if (repostId) {
                  // Nếu là repost, mark repost view
                  markRepostAsViewed(repostId).catch((err) => {
                    console.error('Error marking repost as viewed:', err);
                  });
                } else {
                  // Nếu là post, mark post view
                  markAsViewed(postId).catch((err) => {
                    console.error('Error marking post as viewed:', err);
                  });
                }
                hasBeenViewed.current = true;
              }
            }, delayMs);
          } else if (!entry.isIntersecting) {
            // Post/Repost không còn visible, cancel timeout nếu chưa mark
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [postId, repostId, enabled, threshold, delayMs, markAsViewed, markRepostAsViewed]);

  return postRef;
};

