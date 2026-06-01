import { Router } from "express";
import { geocodingController } from "../controllers/geocoding.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/distance", (req, res) => geocodingController.distance(req, res));

export default router;
