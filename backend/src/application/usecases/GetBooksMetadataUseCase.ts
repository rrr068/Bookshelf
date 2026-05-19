import { IBookRepository } from '../../domain/repositories/IBookRepository';

export interface BookMetadataDto {
  googleBooksId: string;
  averageRating: number | null;
}

/**
 * 複数の本のメタデータ（平均評価）を取得するユースケース
 */
export class GetBooksMetadataUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(googleBooksIds: string[]): Promise<BookMetadataDto[]> {
    const books = await this.bookRepository.findManyByGoogleBooksIds(googleBooksIds);
    const booksMap = new Map(books.map((b) => [b.googleBooksId, b]));

    const existingBookIds = books.map((b) => b.id);

    const averageRatings =
      existingBookIds.length > 0
        ? await this.bookRepository.getAverageRatings(existingBookIds)
        : ({} as Record<string, number | null>);

    return googleBooksIds.map((googleBooksId) => {
      const book = booksMap.get(googleBooksId);
      if (!book) {
        return { googleBooksId, averageRating: null };
      }
      return {
        googleBooksId,
        averageRating: averageRatings[book.id] ?? null,
      };
    });
  }
}
