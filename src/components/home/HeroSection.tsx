"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] bg-violet-500/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="text-center space-y-8 relative z-10">
        <StaggerContainer delay={0.2}>
          <StaggerItem>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
              Decentralized <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                Research Funding
              </span>
            </h1>
          </StaggerItem>
          
          <StaggerItem>
            <p className="mt-6 text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Orvyn-Labs enables researchers to raise funds through blockchain-based crowdfunding. 
              Transparent, immutable, and optimized for scale on DChain.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base glow hover:scale-105 transition-transform">
                <Link href="/projects">
                  Browse Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base hover:bg-white/5 transition-colors">
                <Link href="/stake">Stake DKT</Link>
              </Button>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Stats / Proof of scaling */}
        <FadeIn delay={0.8} y={40}>
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 mt-16">
            {[
              { label: "Gas Efficiency", val: "O(1) Rewards" },
              { label: "Network", val: "Base L2" },
              { label: "Architecture", val: "UUPS Proxy" },
              { label: "Benchmark", val: "L1 vs L2" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{stat.label}</p>
                <p className="text-sm font-mono text-blue-400">{stat.val}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
