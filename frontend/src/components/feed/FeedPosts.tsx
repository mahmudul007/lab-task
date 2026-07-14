import { useInfiniteQuery } from '@tanstack/react-query';
import PostCard from '../PostCard';
import { getPosts } from '../../api/api';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';
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
        const nextPage = meta?.current_page && meta?.current_page < meta?.last_page ? meta.current_page + 1 : undefined;
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
      <InfiniteScrollTrigger
        onIntersect={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  );
};
