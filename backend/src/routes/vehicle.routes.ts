import { Router } from "express";
import { vehicleController } from "../controllers/vehicle.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) => vehicleController.list(req, res));
router.get("/:id", (req, res) => vehicleController.get(req, res));
router.post("/", authorize("admin", "attendant"), (req, res) => vehicleController.create(req, res));
router.put("/:id", authorize("admin", "attendant"), (req, res) => vehicleController.update(req, res));
router.delete("/:id", authorize("admin"), (req, res) => vehicleController.delete(req, res));

export default router;
