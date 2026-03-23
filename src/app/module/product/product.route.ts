import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyModerator from "../../middlewares/verifyModerator.js";
import { ProductController } from "./product.controller.js";
import {
    createProductSchema,
    listAcceptedProductsQuerySchema,
    listFeedProductsQuerySchema,
    listPendingProductsQuerySchema,
    listMyProductsQuerySchema,
    productIdParamsSchema,
    updateProductSchema,
    updateProductStatusSchema,
} from "./product.validation.js";

const router = Router();

// Public : 
router.get("/", validateRequest({ query: listAcceptedProductsQuerySchema }), ProductController.listAcceptedProducts);

router.get(
    "/featured",
    validateRequest({ query: listFeedProductsQuerySchema }),
    ProductController.listFeaturedProducts,
);

router.get(
    "/trending",
    validateRequest({ query: listFeedProductsQuerySchema }),
    ProductController.listTrendingProducts,
);


// Protected : 
router.post("/", verifyToken, validateRequest(createProductSchema), ProductController.createProduct);
router.get(
    "/my-products",
    verifyToken,
    validateRequest({ query: listMyProductsQuerySchema }),
    ProductController.listMyProducts,
);

router.get(
    "/queue",
    verifyToken,
    verifyModerator,
    validateRequest({ query: listPendingProductsQuerySchema }),
    ProductController.listPendingProducts,
);

router.patch(
    "/:id/status",
    verifyToken,
    verifyModerator,
    validateRequest({ params: productIdParamsSchema, body: updateProductStatusSchema }),
    ProductController.updateProductStatus,
);

router.patch(
    "/:id/feature",
    verifyToken,
    verifyModerator,
    validateRequest({ params: productIdParamsSchema }),
    ProductController.toggleProductFeatured,
);

router.get("/:id", validateRequest({ params: productIdParamsSchema }), ProductController.getProductById);

router.patch(
    "/:id",
    verifyToken,
    validateRequest({ params: productIdParamsSchema, body: updateProductSchema }),
    ProductController.updateProduct,
);

router.delete(
    "/:id",
    verifyToken,
    validateRequest({ params: productIdParamsSchema }),
    ProductController.deleteProduct,
);


export const ProductRoute = router;