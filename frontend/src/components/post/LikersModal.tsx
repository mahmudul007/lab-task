import { useInfiniteQuery } from '@tanstack/react-query';
import { getPostLikers, getCommentLikers } from '../../api/api';
import { fullName } from './helpers';
import { InfiniteScrollTrigger } from '../feed/InfiniteScrollTrigger';

interface LikersModalProps {
  type: 'post' | 'comment';
  id: number;
  onClose: () => void;
}

export const LikersModal = ({ type, id, onClose }: LikersModalProps) => {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['likers', type, id],
    queryFn: ({ pageParam = 1 }) => {
      const apiCall = type === 'post' ? getPostLikers(id, pageParam) : getCommentLikers(id, pageParam);
      return apiCall.then((res) => {
        const raw = res.data;
        let list = raw?.data?.data ?? [];
        let meta = raw?.data;
        const nextPage = meta?.current_page && meta?.current_page < meta?.last_page ? meta.current_page + 1 : undefined;
        return { data: list, nextPage, total: meta?.total ?? 0 };
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const likers = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          width: '90%',
          maxWidth: 440,
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Likes ({total})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#999',
              padding: 0,
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 20px',
          }}
        >
          {isLoading ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>Loading...</p>
          ) : likers.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>No likes yet.</p>
          ) : (
            <>
              {likers.map((liker: any, i) => (
                <div
                  key={liker.id ?? i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < likers.length - 1 ? '1px solid #f9f9f9' : 'none',
                  }}
                >
                  <img
                    src="/images/comment_img.png"
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: '50%' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                      
                      {fullName(liker.user)}
                    </h4>
                  </div>
                </div>
              ))}
              <InfiniteScrollTrigger
                onIntersect={fetchNextPage}
                hasNextPage={!!hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
