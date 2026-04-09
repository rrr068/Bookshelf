/**
 * Bookエンティティ
 */
export class Book {
  constructor(
    public readonly id: string,
    public readonly googleBooksId: string,
    public readonly title: string,
    public readonly authors: string,
    public readonly publisher: string | null,
    public readonly publishedDate: string | null,
    public readonly description: string | null,
    public readonly isbn10: string | null,
    public readonly isbn13: string | null,
    public readonly pageCount: number | null,
    public readonly thumbnailUrl: string | null,
    public readonly language: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * ファクトリメソッド: 新規書籍を生成
   */
  static create(
    googleBooksId: string,
    title: string,
    authors: string[],
    createdBy: string,
    options: {
      publisher?: string;
      publishedDate?: string;
      description?: string;
      isbn10?: string;
      isbn13?: string;
      pageCount?: number;
      thumbnailUrl?: string;
      language?: string;
    } = {}
  ): Book {
    return new Book(
      '', // IDはリポジトリで生成
      googleBooksId,
      title,
      authors.join(', '),
      options.publisher || null,
      options.publishedDate || null,
      options.description || null,
      options.isbn10 || null,
      options.isbn13 || null,
      options.pageCount || null,
      options.thumbnailUrl || null,
      options.language || 'ja',
      createdBy,
      new Date(),
      new Date()
    );
  }
}
