export interface ListAcceptedProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

export interface ListMyProductsQuery {
  page?: number;
  limit?: number;
}

export interface ListFeedProductsQuery {
  page?: number;
  limit?: number;
}

export interface ListPendingProductsQuery {
  page?: number;
  limit?: number;
}

export interface ListModeratedProductsQuery {
  page?: number;
  limit?: number;
  status?: "ACCEPTED" | "REJECTED";
}

export interface CreateProductInput {
  name: string;
  image: string;
  description: string;
  externalLink: string;
  tagIds?: string[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export type UpdateProductStatusInput = {
  status: "ACCEPTED" | "REJECTED";
  rejectionReason?: string;
};
