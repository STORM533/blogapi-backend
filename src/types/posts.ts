export interface PostParams {
  [key: string]: string;
  id: string;
}

export interface CreatePostBody {
  title: string;
  content: string;
  published?: boolean;
}

export interface UpdatePostBody {
  title?: string;
  content?: string;
  published?: boolean;
}

export interface PostsQuery {
  [key: string]: string | undefined;
  page?: string;
  limit?: string;
}
