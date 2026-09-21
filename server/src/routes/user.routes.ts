import { Router } from "express";
import {
    addAddressController,
    changePasswordController,
    deleteAddressController,
    getAddressesController,
    getProfileController,
    setDefaultAddressController,
    updateAddressController,
    updateProfileController,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

// Profile
router.get("/profile", getProfileController);
router.put("/profile", updateProfileController);
router.put("/profile/password", changePasswordController);

// Addresses
router.get("/addresses", getAddressesController);
router.post("/addresses", addAddressController);
router.put("/addresses/:addressId", updateAddressController);
router.delete("/addresses/:addressId", deleteAddressController);
router.patch("/addresses/:addressId/default", setDefaultAddressController);

export default router;
