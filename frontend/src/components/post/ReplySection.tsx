import { useState } from 'react';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getCommentReplies, replyComment, postCommentDelete } from '../../api/api';
import type { Comment } from '@/types/post';
import { ReplyItem } from './ReplyItem';
import { InfiniteScrollTrigger } from '../feed/InfiniteScrollTrigger';

interface ReplySectionProps {
  commentId: number;
}

export const ReplySection = ({ commentId }: ReplySectionProps) => {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const {
    data,
    isLoading: loadingReplies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['replies', commentId],
    queryFn: ({ pageParam = 1 }) =>
      getCommentReplies(commentId, pageParam).then((res) => {
        const raw = res.data;
        const list = (raw?.data ?? []) as Comment[];
        const meta = raw?.meta;
        const nextPage = meta?.current_page && meta?.current_page < meta?.last_page ? meta.current_page + 1 : undefined;
        return { data: list, nextPage };
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const replies = data?.pages.flatMap((page) => page.data) ?? [];

  const { mutate: submitReply, isPending: replying } = useMutation({
    mutationFn: () => replyComment(commentId, text),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['replies', commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const { mutate: deleteReply, isPending: deletingReply } = useMutation({
    mutationFn: (replyId: number) => postCommentDelete(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
      e.preventDefault();
      submitReply();
    }
  };

  return (
    <div style={{ paddingLeft: 12, marginTop: 8 }}>
      {loadingReplies ? (
        <p style={{ color: '#999', fontSize: 12 }}>Loading replies…</p>
      ) : (
        <>
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              onDelete={deleteReply}
              isDeleting={deletingReply}
            />
          ))}
          <InfiniteScrollTrigger
            onIntersect={fetchNextPage}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <div style={{ width: 28, height: 28 }}>
          <img src="/images/comment_img.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
        </div>
        <textarea
          className="form-control"
          placeholder="Write a reply… (Enter to send)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={replying}
          style={{
            fontSize: 13,
            padding: '6px 12px',
            borderRadius: 16,
            resize: 'none',
            background: '#f0f2f5',
            border: 'none',
            flex: 1,
          }}
        />
        {text.trim() && (
          <button
            type="button"
            onClick={() => submitReply()}
            disabled={replying}
            style={{
              background: '#1877f2',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            {replying ? '…' : 'Reply'}
          </button>
        )}
      </div>
    </div>
  );
};
