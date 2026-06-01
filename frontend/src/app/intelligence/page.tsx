import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function IntelligenceRedirect() {
  redirect(`${ROUTES.fleetIntelligence}?ia=manutencao`);
}
