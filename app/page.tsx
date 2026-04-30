import { HomeLandingClient } from "@/components/landing/HomeLandingClient";
import { getMaterialsWithPricing } from "@/services/materialService";
import { getPrinters } from "@/services/printerService";
import { getWorkshopInfo } from "@/services/workshopService";

/** Always read Supabase-backed data at request time (runtime env in Docker / production). */
export const dynamic = "force-dynamic";

export default async function Home() {
  const [workshopRes, materialsRes, printersRes] = await Promise.all([
    getWorkshopInfo(),
    getMaterialsWithPricing(),
    getPrinters(),
  ]);

  return (
    <HomeLandingClient
      workshopRows={workshopRes.data ?? []}
      workshopError={workshopRes.error}
      materials={materialsRes.data ?? []}
      materialsError={materialsRes.error}
      printers={printersRes.data ?? []}
      printersError={printersRes.error}
    />
  );
}
