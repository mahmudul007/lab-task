import { useState } from 'react';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getPostComments, commentPost, postCommentDelete } from '../../api/api';
import type { Post, Comment } from '@/types/post';
import { CommentItem } from './CommentItem';
import { InfiniteScrollTrigger } from '../feed/InfiniteScrollTrigger';

interface CommentSectionProps {
  post: Post;
}

export const CommentSection = ({ post }: CommentSectionProps) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  // Fetch comments for this post using useInfiniteQuery
  const {
    data,
    isLoading: loadingComments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['comments', post.id],
    queryFn: ({ pageParam = 1 }) =>
      getPostComments(post.id, pageParam).then((res) => {
        const raw = res.data;
        const list = (raw?.data ?? []) as Comment[];
        const meta = raw?.meta;
        const nextPage = meta?.current_page && meta?.current_page < meta?.last_page ? meta.current_page + 1 : undefined;
        return { data: list, nextPage, total: meta?.total ?? 0 };
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const comments = data?.pages.flatMap((page) => page.data) ?? [];
  const totalComments = data?.pages[0]?.total ?? 0;

  // Submit comment
  const { mutate: submitComment, isPending: commenting } = useMutation({
    mutationFn: () => commentPost(post.id, text),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Delete comment
  const { mutate: deleteComment, isPending: deletingComment } = useMutation({
    mutationFn: (commentId: number) => postCommentDelete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault();
      submitComment();
    }
  };

  return (
    <div className="_feed_inner_timeline_cooment_area">
      {/* ── Input ── */}
      <div className="_feed_inner_comment_box">
        <form
          className="_feed_inner_comment_box_form"
          onSubmit={(e) => { e.preventDefault(); if (text.trim()) submitComment(); }}
        >
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <img src="/images/comment_img.png" alt="" className="_comment_img" />
            </div>
            <div
              className="_feed_inner_comment_box_content_txt"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}
            >
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment… (Enter to send)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={commenting}
              />
              {text.trim() && (
                <button
                  type="submit"
                  disabled={commenting}
                  style={{
                    background: '#1877f2',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {commenting ? '…' : 'Send'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ── List ── */}
      <div className="_timline_comment_main">
        {loadingComments ? (
          <p style={{ color: '#999', fontSize: 13, padding: '6px 0' }}>Loading comments…</p>
        ) : comments.length === 0 ? (
          <p style={{ color: '#999', fontSize: 13, padding: '6px 0' }}>
            No comments yet. Be the first!
          </p>
        ) : (
          <>
            <div className="_previous_comment">
              <span className="_previous_comment_txt">
                {totalComments} comment{totalComments !== 1 ? 's' : ''}
              </span>
            </div>
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                postId={post.id}
                onDelete={deleteComment}
                isDeleting={deletingComment}
              />
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
  );
};
