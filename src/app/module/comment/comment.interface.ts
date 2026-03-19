export interface CreateCommentInput {
  productId: string;
  description: string;
}

export interface ListCommentsQuery {
  page?: number;
  limit?: number;
}
