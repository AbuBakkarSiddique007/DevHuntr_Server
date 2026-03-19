import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import verifyToken from "../../middlewares/verifyToken";
import { ProductController } from "./product.controller";
import {
    createProductSchema,
    listAcceptedProductsQuerySchema,
    listMyProductsQuerySchema,
    productIdParamsSchema,
    updateProductSchema,
} from "./product.validation";

const router = Router();

// Public : 
router.get("/", validateRequest({ query: listAcceptedProductsQuerySchema }), ProductController.listAcceptedProducts);


// Protected : 
router.post("/", verifyToken, validateRequest(createProductSchema), ProductController.createProduct);
router.get(
    "/my-products",
    verifyToken,
    validateRequest({ query: listMyProductsQuerySchema }),
    ProductController.listMyProducts,
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