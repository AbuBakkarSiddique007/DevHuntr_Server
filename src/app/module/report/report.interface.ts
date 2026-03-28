export interface CreateReportInput {
  productId: string;
  reason: string;
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
  status?: "OPEN" | "RESOLVED" | "DISMISSED";
}

export type UpdateReportStatusInput = {
  status: "RESOLVED" | "DISMISSED";
  rejectProduct?: boolean;
  rejectionReason?: string;
};
