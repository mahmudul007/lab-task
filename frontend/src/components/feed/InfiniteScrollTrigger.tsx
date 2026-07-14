import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export const InfiniteScrollTrigger = ({
  onIntersect,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollTriggerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 0.1 }
    );

    const current = ref.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [onIntersect, hasNextPage, isFetchingNextPage]);

  return (
    <div ref={ref} style={{ height: 20, margin: '10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {isFetchingNextPage && <p style={{ fontSize: 13, color: '#999' }}>Loading more…</p>}
    </div>
  );
};
