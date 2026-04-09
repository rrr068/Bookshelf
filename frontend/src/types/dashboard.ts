export interface DashboardStats {
  total: {
    want: number;
    reading: number;
    done: number;
  };
  thisMonth: {
    booksRead: number;
    pagesRead: number;
  };
  thisYear: {
    booksRead: number;
  };
}

export interface RecentBook {
  googleBooksId: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  description: string | null;
  publisher: string | null;
  publishedDate: string | null;
  pageCount: number | null;
  status: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentBooks: RecentBook[];
}
