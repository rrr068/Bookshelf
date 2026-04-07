/**
 * 読書ステータスの型定義
 */
export type ReadingStatus = 'want_to_read' | 'reading' | 'completed' | 'on_hold' | 'dropped';

/**
 * 読書ステータスのラベル
 */
export const ReadingStatusLabel: Record<ReadingStatus, string> = {
  want_to_read: '読みたい',
  reading: '読書中',
  completed: '読了',
  on_hold: '一時中断',
  dropped: '中止',
};

/**
 * 読書ステータスの色
 */
export const ReadingStatusColor: Record<ReadingStatus, string> = {
  want_to_read: 'bg-blue-500',
  reading: 'bg-yellow-500',
  completed: 'bg-green-500',
  on_hold: 'bg-gray-500',
  dropped: 'bg-red-500',
};

/**
 * 読書ステータスレスポンス
 */
export interface ReadingStatusResponse {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
