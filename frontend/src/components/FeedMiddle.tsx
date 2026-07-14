import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/PostCard';
import { createPost, getPosts } from '../api/api';

const stories = [
  { img: '/images/card_ppl1.png', name: 'Your Story', isOwn: true },
  { img: '/images/card_ppl2.png', name: 'Ryan Roslansky', isOwn: false },
  { img: '/images/card_ppl3.png', name: 'Dylan Field', isOwn: false },
  { img: '/images/card_ppl4.png', name: 'Steve Jobs', isOwn: false },
];

const FeedMiddle = () => {
  const queryClient = useQueryClient();
  const [postText, setPostText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch posts ──────────────────────────────────────────────────────────
  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts().then((res) => res.data?.data ?? res.data ?? []),
  });
  const posts: any[] = postsData ?? [];

  // ── Create post ──────────────────────────────────────────────────────────
  const { mutate: submitPost, isPending: submitting } = useMutation({
    mutationFn: () =>
      createPost({ text_content: postText, is_private: isPrivate, images }),
    onSuccess: () => {
      // Invalidate so the feed refetches automatically
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setPostText('');
      setIsPrivate(false);
      setImages([]);
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const canPost = postText.trim().length > 0 || images.length > 0;

  // ── Image helpers ────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        {/* Desktop Stories */}
        <div className="_feed_inner_ppl_card _mar_b16">
          <div className="_feed_inner_story_arrow">
            <button type="button" className="_feed_inner_story_arrow_btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
              </svg>
            </button>
          </div>
          <div className="row">
            {stories.map((story, i) => (
              <div
                key={i}
                className={`col-xl-3 col-lg-3 col-md-4 col-sm-4${i > 1 ? ' _custom_mobile_none' : ''}${i === 3 ? ' _custom_none' : ''}`}
              >
                {story.isOwn ? (
                  <div className="_feed_inner_profile_story _b_radious6">
                    <div className="_feed_inner_profile_story_image">
                      <img src={story.img} alt="Image" className="_profile_story_img" />
                      <div className="_feed_inner_story_txt">
                        <div className="_feed_inner_story_btn">
                          <button className="_feed_inner_story_btn_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                              <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                            </svg>
                          </button>
                        </div>
                        <p className="_feed_inner_story_para">{story.name}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="_feed_inner_public_story _b_radious6">
                    <div className="_feed_inner_public_story_image">
                      <img src={story.img} alt="Image" className="_public_story_img" />
                      <div className="_feed_inner_pulic_story_txt">
                        <p className="_feed_inner_pulic_story_para">{story.name}</p>
                      </div>
                      <div className="_feed_inner_public_mini">
                        <img src="/images/mini_pic.png" alt="Image" className="_public_mini_img" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Stories */}
        <div className="_feed_inner_ppl_card_mobile _mar_b16">
          <div className="_feed_inner_ppl_card_area">
            <ul className="_feed_inner_ppl_card_area_list">
              {[
                { img: '/images/mobile_story_img.png', name: 'Your Story', type: 'own' },
                { img: '/images/mobile_story_img1.png', name: 'Ryan...', type: 'active' },
                { img: '/images/mobile_story_img2.png', name: 'Ryan...', type: 'inactive' },
                { img: '/images/mobile_story_img1.png', name: 'Ryan...', type: 'active' },
                { img: '/images/mobile_story_img2.png', name: 'Ryan...', type: 'inactive' },
              ].map((s, i) => (
                <li className="_feed_inner_ppl_card_area_item" key={i}>
                  <a href="#0" className="_feed_inner_ppl_card_area_link">
                    <div className={s.type === 'own' ? '_feed_inner_ppl_card_area_story' : s.type === 'active' ? '_feed_inner_ppl_card_area_story_active' : '_feed_inner_ppl_card_area_story_inactive'}>
                      <img src={s.img} alt="Image" className={s.type === 'own' ? '_card_story_img' : '_card_story_img1'} />
                      {s.type === 'own' && (
                        <div className="_feed_inner_ppl_btn">
                          <button className="_feed_inner_ppl_btn_link" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                              <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {s.type === 'own' ? (
                      <p className="_feed_inner_ppl_card_area_link_txt">{s.name}</p>
                    ) : (
                      <p className="_feed_inner_ppl_card_area_txt">{s.name}</p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Create Post */}
        <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
          <div className="_feed_inner_text_area_box">
            <div className="_feed_inner_text_area_box_image">
              <img src="/images/txt_img.png" alt="Image" className="_txt_img" />
            </div>
            <div className="form-floating _feed_inner_text_area_box_form">
              <textarea
                className="form-control _textarea"
                placeholder="Leave a comment here"
                id="floatingTextarea"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              ></textarea>
              <label className="_feed_textarea_label" htmlFor="floatingTextarea">
                Write something ...
                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" fill="none" viewBox="0 0 23 24">
                  <path fill="#666" d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 01-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 01.794-1.982l8.852-9.5z" />
                </svg>
              </label>
            </div>
          </div>

          {/* Image previews */}
          {previews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: 20, height: 20, cursor: 'pointer',
                      fontSize: 11, lineHeight: '20px', textAlign: 'center', padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          {/* Post actions */}
          <div className="_feed_inner_text_area_bottom">
            <div className="_feed_inner_text_area_item">
              <div className="_feed_inner_text_area_bottom_photo _feed_common">
                <button
                  type="button"
                  className="_feed_inner_text_area_bottom_photo_link"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">📷</span>
                  Photo
                </button>
              </div>
              <div className="_feed_inner_text_area_bottom_video _feed_common">
                <button
                  type="button"
                  className="_feed_inner_text_area_bottom_photo_link"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">🎥</span>
                  Video
                </button>
              </div>
              {/* Visibility toggle */}
              <div className="_feed_inner_text_area_bottom_event _feed_common">
                <button
                  type="button"
                  className="_feed_inner_text_area_bottom_photo_link"
                  onClick={() => setIsPrivate((p) => !p)}
                >
                  <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                    {isPrivate ? '🔒' : '🌐'}
                  </span>
                  {isPrivate ? 'Private' : 'Public'}
                </button>
              </div>
            </div>

            <div className="_feed_inner_text_area_btn">
              <button
                type="button"
                className="_feed_inner_text_area_btn_link"
                onClick={() => submitPost()}
                disabled={submitting || !canPost}
              >
                <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                  <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                </svg>{' '}
                <span>{submitting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        {loadingPosts ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>No posts yet. Be the first!</p>
        ) : (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default FeedMiddle;
