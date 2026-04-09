export interface PostDto {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  body: string;
  rating: number | null;
  spoiler: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; username: string };
  book?: { googleBooksId: string; title: string; authors: string[]; thumbnailUrl: string | null };
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

export interface CreatePostRequestDto {
  bookId: string; // googleBooksId
  title: string;
  body: string;
  rating?: number;
  spoiler?: boolean;
  bookData?: {
    googleBooksId: string;
    title: string;
    authors: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    isbn10?: string;
    isbn13?: string;
    pageCount?: number;
    thumbnailUrl?: string;
    language?: string;
  };
}

export interface UpdatePostRequestDto {
  title: string;
  body: string;
  rating?: number;
  spoiler?: boolean;
}
