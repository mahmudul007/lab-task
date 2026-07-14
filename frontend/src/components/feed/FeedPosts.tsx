import { useInfiniteQuery } from '@tanstack/react-query';
import PostCard from '../PostCard';
import { getPosts } from '../../api/api';
import type { Post } from '@/types/post';

export const FeedPosts = () => {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) =>
      getPosts(pageParam).then((res) => {
        const raw = res.data;
        const list = (raw?.data ?? []) as Post[];
        const meta = raw?.meta;
        const nextPage =
          meta?.current_page != null && meta.current_page < meta.last_page
            ? meta.current_page + 1
            : undefined;
        return { data: list, nextPage };
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (isLoading) {
    return <p style={{ textAlign: 'center', color: '#999' }}>Loading posts...</p>;
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  if (posts.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No posts yet. Be the first!</p>;
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              padding: '10px 28px',
              background: '#1877f2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
              opacity: isFetchingNextPage ? 0.7 : 1,
            }}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <p style={{ textAlign: 'center', color: '#bbb', fontSize: 13, margin: '16px 0' }}>
          You're all caught up!
        </p>
      )}
    </>
  );
};
