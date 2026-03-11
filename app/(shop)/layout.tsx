import Link from "next/link";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="page-shell">
      <h1>Shop Layout</h1>
      <p>탐색/추천/구매 흐름을 위한 기본 레이아웃입니다.</p>
      <nav>
        <Link className="pill" href="/">
          Home
        </Link>
        <Link className="pill" href="/catalog">
          Catalog
        </Link>
        <Link className="pill" href="/recommendations">
          Recommendations
        </Link>
        <Link className="pill" href="/cart">
          Cart
        </Link>
        <Link className="pill" href="/checkout">
          Checkout
        </Link>
      </nav>
      {children}
    </section>
  );
}
