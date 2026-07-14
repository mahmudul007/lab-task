import { DesktopStories } from './feed/DesktopStories';
import { MobileStories } from './feed/MobileStories';
import { CreatePost } from './feed/CreatePost';
import { FeedPosts } from './feed/FeedPosts';

const FeedMiddle = () => {
  return (
    <div className="_layout_middle_wrap">
      <div className="_layout_middle_inner">
        {/* Desktop Stories */}
        <DesktopStories />

        {/* Mobile Stories */}
        <MobileStories />

        {/* Create Post */}
        <CreatePost />

        {/* Feed Posts */}
        <FeedPosts />
      </div>
    </div>
  );
};

export default FeedMiddle;
