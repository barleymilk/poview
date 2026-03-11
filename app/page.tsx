import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <h1>POVIEW</h1>
      <p>키 기반 1인칭 POV 시뮬레이션 스캐폴딩이 준비되었습니다.</p>
      <nav>
        <Link className="pill" href="/catalog">
          /catalog
        </Link>
        <Link className="pill" href="/product/demo-product">
          /product/[productId]
        </Link>
        <Link className="pill" href="/simulator/desk-1200-wood">
          /simulator/[productId]
        </Link>
        <Link className="pill" href="/recommendations">
          /recommendations
        </Link>
        <Link className="pill" href="/cart">
          /cart
        </Link>
        <Link className="pill" href="/checkout">
          /checkout
        </Link>
        <Link className="pill" href="/profile">
          /profile
        </Link>
      </nav>
    </main>
  );
}
