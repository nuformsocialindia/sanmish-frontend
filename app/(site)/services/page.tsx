import { fetchApiServices } from "@/lib/publicApi";
import ServicesPageClient from "@/components/ServicesPageClient";

export default async function ServicesPage() {
  const apiServices = await fetchApiServices();

  return <ServicesPageClient apiServices={apiServices} />;
}
