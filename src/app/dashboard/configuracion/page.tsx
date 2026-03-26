import { getBusinessConfig } from "@/actions/business";
import { ConfiguracionClient } from "./_components/configuracion-client";

export default async function ConfiguracionPage() {
  const { business, categories } = await getBusinessConfig();
  return <ConfiguracionClient business={business} categories={categories} />;
}
