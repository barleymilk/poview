interface SimulatorPageProps {
  params: Promise<{ productId: string }>;
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const { productId } = await params;

  return (
    <main>
      <h2>SimulatorPage</h2>
      <p>POV 시뮬레이터 라우트: `/simulator/{productId}`</p>
      <p>productId: {productId}</p>
    </main>
  );
}
