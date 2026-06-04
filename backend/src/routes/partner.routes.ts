import { Router } from "express";
import { partnerController } from "../controllers/partner.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) => partnerController.list(req, res));
router.post("/", authorize("administrador", "gestor", "admin", "attendant"), (req, res) =>
  partnerController.create(req, res)
);
router.post("/tickets", authorize("administrador", "gestor", "admin", "attendant"), (req, res) =>
  partnerController.createTicket(req, res)
);

export default router;
