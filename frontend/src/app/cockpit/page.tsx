import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function CockpitRedirect() {
  redirect(ROUTES.mapOperations);
}
