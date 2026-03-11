import { notFound } from "next/navigation";
import { SimulatorClient } from "@/src/components/simulator-client";
import { getProductById } from "@/src/mocks/products";

interface SimulatorPageProps {
  params: Promise<{ productId: string }>;
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const { productId } = await params;
  const product = getProductById(productId);

  if (!product) {
    notFound();
  }

  return <SimulatorClient product={product} />;
}
