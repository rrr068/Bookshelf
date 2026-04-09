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
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  thumbnailUrl?: string;
  language?: string;
}
