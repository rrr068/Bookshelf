import { Book } from '../entities/Book';

/**
 * 書籍リポジトリのインターフェース
 */
export interface IBookRepository {
  /**
   * Google Books IDで書籍を検索
   */
  findByGoogleBooksId(googleBooksId: string): Promise<Book | null>;

  /**
   * IDで書籍を検索
   */
  findById(id: string): Promise<Book | null>;

  /**
   * 書籍を保存
   */
  save(book: Book): Promise<Book>;

  /**
   * 複数の書籍を取得
   */
  findMany(ids: string[]): Promise<Book[]>;
}
