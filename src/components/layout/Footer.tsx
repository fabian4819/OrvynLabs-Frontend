import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/40 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-8 text-sm text-muted-foreground text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Orvyn-Labs Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </div>
              <span className="font-black tracking-tight text-foreground text-sm leading-tight">Orvyn-Labs</span>
            </Link>
            <p className="max-w-50 leading-relaxed opacity-60">
              A decentralized protocol for Indonesian higher education research.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <p className="font-bold text-foreground uppercase tracking-widest text-[10px]">Academic Context</p>
            <p className="opacity-80">
              Bachelor Thesis — Performance Analysis
            </p>
            <p className="opacity-80">DChain L2 Network Benchmarking</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="font-bold text-foreground uppercase tracking-widest text-[10px]">Tech Stack</p>
            <div className="flex flex-wrap justify-center md:justify-end gap-3 opacity-60">
              <span>Next.js 15</span>
              <span>Wagmi v2</span>
              <span>Shadcn/UI</span>
              <span>Framer Motion</span>
            </div>
            <p className="mt-2 text-[10px] opacity-40">© 2026 Orvyn-Labs Protocol. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
