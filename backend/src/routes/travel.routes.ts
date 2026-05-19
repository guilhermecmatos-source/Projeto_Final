import { Router } from "express";
import { travelController } from "../controllers/travel.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) => travelController.list(req, res));
router.get("/:id", (req, res) => travelController.get(req, res));
router.post("/", authorize("admin", "attendant"), (req, res) => travelController.create(req, res));
router.put("/:id", authorize("admin", "attendant"), (req, res) => travelController.update(req, res));
router.patch("/:id/cancel", authorize("admin", "attendant"), (req, res) => travelController.cancel(req, res));

export default router;
