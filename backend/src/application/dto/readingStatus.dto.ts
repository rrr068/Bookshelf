import { Status } from '../../domain/entities/ReadingStatus';

/**
 * 読書ステータス登録/更新リクエストDTO
 */
export interface UpsertReadingStatusRequestDto {
  bookId: string;
  status: Status;
}

/**
 * 読書ステータスレスポンスDTO
 */
export interface ReadingStatusResponseDto {
  id: string;
  userId: string;
  bookId: string;
  status: Status;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
