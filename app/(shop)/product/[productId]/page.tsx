interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return (
    <main>
      <h2>ProductPage</h2>
      <p>상품 상세 라우트: `/product/{productId}`</p>
      <p>productId: {productId}</p>
    </main>
  );
}
