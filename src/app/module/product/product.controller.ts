import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProductServer } from "./product.server";
import AppError from "../../errorHelpers/AppError";
import type { ListAcceptedProductsQuery, ListMyProductsQuery } from "./product.interface";

const createProduct = catchAsync(async (req, res) => {
    const ownerId = req.user!.userId;

    const created = await ProductServer.createProduct(ownerId, req.body);

    sendResponse(res, {
        httpStatusCode: StatusCodes.CREATED,
        success: true,
        message: "Product submitted successfully",
        data: created,
    });
});


const listAcceptedProducts = catchAsync(async (req, res) => {
    const query = req.query as ListAcceptedProductsQuery;

    const result = await ProductServer.listAcceptedProducts(query);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Products fetched successfully",
        data: result,
    });
});


const listMyProducts = catchAsync(async (req, res) => {
    const ownerId = req.user!.userId;
    const query = req.query as ListMyProductsQuery;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result = await ProductServer.listMyProducts(ownerId, page, limit);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "My products fetched successfully",
        data: result,
    });
});


const getProductById = catchAsync(async (req, res) => {
    const idParam = req.params.id;

    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product id");
    }

    const product = await ProductServer.getProductById(id);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Product fetched successfully",
        data: product,
    });
});


const updateProduct = catchAsync(async (req, res) => {
    const idParam = req.params.id;

    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product id");
    }

    const userId = req.user!.userId;

    const updated = await ProductServer.updateProduct(id, userId, req.body);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Product updated successfully",
        data: updated,
    });
});

const deleteProduct = catchAsync(async (req, res) => {
    const idParam = req.params.id;

    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product id");
    }

    const requester = req.user!;

    await ProductServer.deleteProduct(id, requester);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Product deleted successfully",
        data: null,
    });
});

export const ProductController = {
    createProduct,
    listAcceptedProducts,
    listMyProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
