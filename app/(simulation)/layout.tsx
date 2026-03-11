import Link from "next/link";

export default function SimulationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="page-shell">
      <h1>Simulation Layout</h1>
      <p>POV 몰입형 시뮬레이션 레이아웃입니다.</p>
      <nav>
        <Link className="pill" href="/simulator/desk-1200-wood">
          Simulator (desk-1200-wood)
        </Link>
        <Link className="pill" href="/simulator/desk-1200-wood?share=pov-desk-focus">
          Share Deep Link
        </Link>
        <Link className="pill" href="/product/desk-1200-wood">
          Back to Product
        </Link>
      </nav>
      {children}
    </section>
  );
}
