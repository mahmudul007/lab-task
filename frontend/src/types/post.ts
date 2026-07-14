export interface CreatePostData {
  text_content: string;
  is_private: boolean;
  images?: File[];
}

export interface PostUser {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

export interface PostImage {
  id: number;
  image_url: string;
}

// Matches CommentController response fields
export interface Comment {
  id: number;
  text_content: string;
  created_at: string;
  user?: PostUser;
  // from CommentController raw counts
  like_count?: number;
  is_liked_by_me?: boolean;
  reply_count?: number;
}

// Matches PostResource fields
export interface Post {
  id: number;
  text_content?: string;
  is_private?: boolean;
  user?: PostUser;
  images?: PostImage[];
  created_at?: string;
  updated_at?: string;
  // PostResource field names
  like_count?: number;
  comment_count?: number;
  is_liked_by_me?: boolean;
}