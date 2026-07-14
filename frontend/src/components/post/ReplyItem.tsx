import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toggleCommentLike } from '../../api/api';
import type { Comment } from '@/types/post';
import { fullName, timeAgo } from './helpers';
import { LikersModal } from './LikersModal';

interface ReplyItemProps {
  reply: Comment;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const ReplyItem = ({ reply, onDelete, isDeleting }: ReplyItemProps) => {
  const [liked, setLiked] = useState(reply.is_liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(reply.like_count ?? 0);
  const [showLikers, setShowLikers] = useState(false);

  const { mutate: handleToggleLike, isPending: liking } = useMutation({
    mutationFn: () => toggleCommentLike(reply.id),
    onMutate: () => {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikeCount((n) => (wasLiked ? n - 1 : n + 1));
      return { wasLiked };
    },
    onError: (_err, _vars, ctx) => {
      setLiked(ctx!.wasLiked);
      setLikeCount((n) => (ctx!.wasLiked ? n + 1 : n - 1));
    },
    onSuccess: (data) => {
      const serverLiked: boolean = data?.data?.is_liked ?? data?.data?.data?.liked ?? liked;
      const serverCount: number = data?.data?.like_count ?? data?.data?.data?.like_count ?? likeCount;
      setLiked(serverLiked);
      setLikeCount(serverCount);
    },
  });

  return (
    <div className="_comment_main" style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid #ddd' }}>
      <div className="_comment_image" style={{ width: 28, height: 28 }}>
        <img src="/images/txt_img.png" alt="" className="_comment_img1" style={{ width: 28, height: 28, borderRadius: '50%' }} />
      </div>
      <div className="_comment_area" style={{ flex: 1 }}>
        <div className="_comment_details" style={{ background: '#f0f2f5', padding: '6px 12px', borderRadius: 12 }}>
          <div className="_comment_details_top">
            <h5 className="_comment_name_title" style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{fullName(reply.user)}</h5>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text" style={{ fontSize: 13, margin: '2px 0 0' }}>
              <span>{reply.text_content}</span>
            </p>
          </div>
          {likeCount > 0 && (
            <div
              className="_total_reactions"
              onClick={() => setShowLikers(true)}
              style={{ marginTop: 4, cursor: 'pointer' }}
            >
              <span className="_reaction_like">👍</span>
              <span className="_total" style={{ fontSize: 11, marginLeft: 2 }}>{likeCount}</span>
            </div>
          )}
        </div>
        <div className="_comment_reply" style={{ marginTop: 2 }}>
          <ul className="_comment_reply_list" style={{ display: 'flex', gap: 12, listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <button
                type="button"
                onClick={() => handleToggleLike()}
                disabled={liking}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: liked ? 700 : 400,
                  color: liked ? '#1877f2' : '#65676b',
                  fontSize: 12,
                }}
              >
                {liked ? 'Unlike' : 'Like'}
              </button>
            </li>
            <li>
              <span style={{ color: '#8a8d91', fontSize: 11 }}>
                {reply.created_at ? timeAgo(reply.created_at) : ''}
              </span>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onDelete(reply.id)}
                disabled={isDeleting}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  color: '#e74c3c',
                  fontSize: 12,
                }}
              >
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
      {showLikers && (
        <LikersModal
          type="comment"
          id={reply.id}
          onClose={() => setShowLikers(false)}
        />
      )}
    </div>
  );
};
