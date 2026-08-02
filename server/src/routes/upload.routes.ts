import { Router } from "express";

import { uploadImageController } from "../controllers/upload.controller.js";
import { authorizeRoles, protect } from "../middlewares/auth.middleware.js";
import { uploadImageMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
    "/image",
    protect,
    authorizeRoles("admin"),
    uploadImageMiddleware,
    uploadImageController
);

export default router;
