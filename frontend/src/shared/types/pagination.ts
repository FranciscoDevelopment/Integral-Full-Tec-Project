export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

// Every list returns this shape, both the mocks and the real API.
export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: PaginationMeta;
}
