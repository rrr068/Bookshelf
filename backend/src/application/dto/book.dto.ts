/**
 * 書籍情報のDTO
 */
export interface BookDto {
  id: string;
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
  language: string;
}

/**
 * 書籍登録リクエストDTO
 */
export interface CreateBookRequestDto {
  googleBooksId: string;
  title: string;
  authors: string[];
  publisher?: string | null;
  publishedDate?: string | null;
  description?: string | null;
  isbn10?: string | null;
  isbn13?: string | null;
  pageCount?: number | null;
  thumbnailUrl?: string | null;
  language?: string;
}
