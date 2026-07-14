import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toggleCommentLike } from '../../api/api';
import type { Comment } from '@/types/post';
import { fullName, timeAgo } from './helpers';
import { ReplySection } from './ReplySection';
import { LikersModal } from './LikersModal';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const CommentItem = ({ comment, postId, onDelete, isDeleting }: CommentItemProps) => {
  console.log(postId);
  // Optimistic like state initialized from API fields
  const [liked, setLiked] = useState(comment.is_liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(comment.like_count ?? 0);
  const [showReplies, setShowReplies] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const { mutate: handleToggleLike, isPending: liking } = useMutation({
    mutationFn: () => toggleCommentLike(comment.id),
    onMutate: () => {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikeCount((n) => (wasLiked ? n - 1 : n + 1));
      return { wasLiked };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back
      setLiked(ctx!.wasLiked);
      setLikeCount((n) => (ctx!.wasLiked ? n + 1 : n - 1));
    },
    onSuccess: (data) => {
      // Sync with server truth from toggle response
      const serverLiked: boolean = data?.data?.is_liked ?? data?.data?.data?.liked ?? liked;
      const serverCount: number = data?.data?.like_count ?? data?.data?.data?.like_count ?? likeCount;
      setLiked(serverLiked);
      setLikeCount(serverCount);
    },
  });

  return (
    <div className="_comment_main" style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      {/* Avatar */}
      <div className="_comment_image">
        <a href="#0" className="_comment_image_link">
          <img src="/images/txt_img.png" alt="" className="_comment_img1" />
        </a>
      </div>

      {/* Body */}
      <div className="_comment_area" style={{ flex: 1 }}>
        <div className="_comment_details">
          {/* Name */}
          <div className="_comment_details_top">
            <div className="_comment_name">
              <a href="#0">
                <h4 className="_comment_name_title">{fullName(comment.user)}</h4>
              </a>
            </div>
          </div>

          {/* Text */}
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.text_content}</span>
            </p>
          </div>

          {/* Like badge */}
          {likeCount > 0 && (
            <div
              className="_total_reactions"
              onClick={() => setShowLikers(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="_total_react">
                <span className="_reaction_like">👍</span>
              </div>
              <span className="_total">{likeCount}</span>
            </div>
          )}

          {/* Actions */}
          <div className="_comment_reply">
            <div className="_comment_reply_num">
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
                      color: liked ? '#1877f2' : 'inherit',
                      fontSize: 13,
                    }}
                  >
                    {liked ? 'Unlike' : 'Like'}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowReplies(!showReplies)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontWeight: showReplies ? 700 : 400,
                      color: showReplies ? '#1877f2' : 'inherit',
                      fontSize: 13,
                    }}
                  >
                    Reply{comment.reply_count ? ` (${comment.reply_count})` : ''}
                  </button>
                </li>
                <li>
                  <span style={{ color: '#999', fontSize: 12 }}>
                    {comment.created_at ? timeAgo(comment.created_at) : ''}
                  </span>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
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
        </div>
        {showReplies && <ReplySection commentId={comment.id} />}
      </div>
      {showLikers && (
        <LikersModal
          type="comment"
          id={comment.id}
          onClose={() => setShowLikers(false)}
        />
      )}
    </div>
  );
};
