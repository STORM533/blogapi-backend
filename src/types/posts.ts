export interface PostParams {
  [key: string]: string;
  id: string;
}

export interface CreatePostBody {
  title: string;
  content: string;
}

export interface UpdatePostBody {
  title?: string;
  content?: string;
}

export interface PostsQuery {
  [key: string]: string | undefined;
  page?: string;
  limit?: string;
}
