import { Router } from "express";

import {
    addToWishlistController,
    clearWishlistController,
    getWishlistController,
    removeFromWishlistController,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getWishlistController);
router.post("/:productId", addToWishlistController);
router.delete("/:productId", removeFromWishlistController);
router.delete("/", clearWishlistController);

export default router;
