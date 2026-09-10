export interface PostCommentParams {
  [key: string]: string;
  postId: string;
}

export interface CommentParams {
  [key: string]: string;
  id: string;
}

export interface CommentBody {
  content: string;
}
