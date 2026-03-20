export interface CreateReportInput {
  productId: string;
  reason: string;
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
}
