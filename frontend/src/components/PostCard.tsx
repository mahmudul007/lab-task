import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaUrl, togglePostLike } from '../api/api';
import type { Post } from '@/types/post';
import { CommentSection } from './post/CommentSection';
import { LikersModal } from './post/LikersModal';
import { fullName, timeAgo } from './post/helpers';
import { ThumbsUpIcon } from 'lucide-react';

const PostCard = ({ post }: { post: Post }) => {
  const queryClient = useQueryClient();
  const [dropOpen, setDropOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  // Optimistic like state — use PostResource field names
  const [isLiked, setIsLiked] = useState(post.is_liked_by_me ?? false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);

  // Post like toggle
  const { mutate: handleLike, isPending: liking } = useMutation({
    mutationFn: () => togglePostLike(post.id),
    onMutate: () => {
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikeCount((n) => (wasLiked ? n - 1 : n + 1));
      return { wasLiked };
    },
    onError: (_err, _vars, ctx) => {
      setIsLiked(ctx!.wasLiked);
      setLikeCount((n) => (ctx!.wasLiked ? n + 1 : n - 1));
    },
    onSuccess: (data) => {
      // Sync server truth: PostController returns { data: { liked, like_count } }
      const serverLiked: boolean = data?.data?.data?.liked ?? isLiked;
      const serverCount: number = data?.data?.data?.like_count ?? likeCount;
      setIsLiked(serverLiked);
      setLikeCount(serverCount);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Derived display values
  const authorName = fullName(post.user);
  const postTime = post.created_at ? timeAgo(post.created_at) : '';
  const bodyText = post.text_content ?? '';
  const isPrivate = post.is_private ?? false;
  const commentCount = post.comment_count ?? 0;

  const postImages: string[] =
    post.images && post.images.length > 0
      ? post.images.map((img) => img.image_url)
      : [];

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">

        {/* ── Header ── */}
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{authorName}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {postTime} .{' '}
                <a href="#0">{isPrivate ? '🔒 Private' : '🌐 Public'}</a>
              </p>
            </div>
          </div>

          {/* Dropdown */}
          <div className="_feed_inner_timeline_post_box_dropdown">
            <div className="_feed_timeline_post_dropdown">
              <button
                className="_feed_timeline_post_dropdown_link"
                onClick={() => setDropOpen((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>
            {dropOpen && (
              <div className="_feed_timeline_dropdown _timeline_dropdown show">
                <ul className="_feed_timeline_dropdown_list">
                  {['Save Post', 'Turn On Notification', 'Hide', 'Edit Post', 'Delete Post'].map(
                    (item) => (
                      <li className="_feed_timeline_dropdown_item" key={item}>
                        <a href="#0" className="_feed_timeline_dropdown_link">{item}</a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        {bodyText && (
          <h4 className="_feed_inner_timeline_post_title">{bodyText}</h4>
        )}
        {postImages.map((src, i) => (
          <div className="_feed_inner_timeline_image" key={i}>
            <img src={mediaUrl + src} alt="" className="_time_img" />
          </div>
        ))}
      </div>

      {/* ── Reaction summary ── */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div
          className="_feed_inner_timeline_total_reacts_image"
          onClick={() => { if (likeCount > 0) setShowLikers(true); }}
          style={{ cursor: likeCount > 0 ? 'pointer' : 'default' }}
        >

          <p className="_feed_inner_timeline_total_reacts_para">{likeCount}+</p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1">
            <a
              href="#0"
              onClick={(e) => { e.preventDefault(); setShowComments((v) => !v); }}
            >
              <span>{commentCount}</span> Comment
            </a>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2">
            <span>0</span> Share
          </p>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="_feed_inner_timeline_reaction">
        {/* Like */}
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction${isLiked ? ' _feed_reaction_active' : ''}`}
          onClick={() => handleLike()}
          disabled={liking}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              {isLiked ? (
                <>
                  <ThumbsUpIcon /> Liked
                </>
              ) : (
                <>
                  <ThumbsUpIcon /> Like
                </>
              )}
            </span>
          </span>
        </button>

        {/* Comment toggle */}
        <button
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          onClick={() => setShowComments((v) => !v)}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              Comment
            </span>
          </span>
        </button>

        {/* Share */}
        <button className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
              </svg>
              Share
            </span>
          </span>
        </button>
      </div>

      {/* ── Comments section (lazy — only mounts when opened) ── */}
      {showComments && <CommentSection post={post} />}
      {showLikers && (
        <LikersModal
          type="post"
          id={post.id}
          onClose={() => setShowLikers(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
