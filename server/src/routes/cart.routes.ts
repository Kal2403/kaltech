import { Router } from "express";

import { 
    addItemToCartController, 
    clearCartController, 
    getCartController, 
    removeCartItemController, 
    updateCartItemController 
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getCartController);
router.post("/items", addItemToCartController);
router.patch("/items/:productId", updateCartItemController);
router.delete("/items/:productId", removeCartItemController);
router.delete("/", clearCartController);

export default router;
