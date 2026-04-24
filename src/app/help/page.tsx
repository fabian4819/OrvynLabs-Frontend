"use client";

import { useState } from "react";
import { FadeIn, ParallaxBackground } from "@/components/ui/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  HelpCircle,
  Rocket,
  Wallet,
  Coins,
  Target,
  ChevronDown,
  ChevronRight,
  Mail,
  ExternalLink,
  Video,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "Getting Started",
    question: "What is Orvyn-Labs?",
    answer: "Orvyn-Labs is a decentralized crowdfunding platform for research projects built on DChain blockchain. It enables researchers to raise funds transparently through milestone-based funding, while allowing supporters to stake DKT tokens and earn rewards.",
  },
  {
    category: "Getting Started",
    question: "How do I connect my wallet?",
    answer: 'Click the "Connect Wallet" button in the top right corner. You\'ll need a Web3 wallet like MetaMask with DChain network configured. Make sure you have some DKT tokens for transactions.',
  },
  {
    category: "Getting Started",
    question: "What is DChain?",
    answer: "DChain is an EVM-compatible blockchain network optimized for decentralized applications. It offers fast transactions and low fees, making it ideal for crowdfunding platforms.",
  },
  {
    category: "For Researchers",
    question: "How do I create a research project?",
    answer: 'Connect your wallet, navigate to the Projects page, and click "Create Project". Fill in your project details, define milestones with funding goals and deadlines, optionally upload an image, and submit. The project will be deployed as a smart contract.',
  },
  {
    category: "For Researchers",
    question: "What are milestones?",
    answer: "Milestones are funding stages for your project. Each milestone has a goal amount and deadline. Funds are released incrementally as you complete milestones, ensuring accountability and progress tracking.",
  },
  {
    category: "For Researchers",
    question: "How do I withdraw funds?",
    answer: "Once a milestone reaches its funding goal, you can withdraw the funds to your wallet. Navigate to your project page and click the withdraw button. Funds are transferred directly to your wallet address.",
  },
  {
    category: "For Supporters",
    question: "How do I donate to a project?",
    answer: 'Browse projects on the Projects page, click on one you like, and click the "Donate" button. Enter the amount of DKT tokens you want to contribute and confirm the transaction in your wallet.',
  },
  {
    category: "For Supporters",
    question: "Can I get my donation back?",
    answer: "Donations are final and cannot be refunded. However, if a project is cancelled, the smart contract may have provisions for refunds. Always review the project carefully before donating.",
  },
  {
    category: "For Supporters",
    question: "What are the benefits of donating?",
    answer: "By donating, you support groundbreaking research and innovation. You also receive transaction records on the blockchain as proof of your contribution. Some projects may offer additional rewards or recognition.",
  },
  {
    category: "Staking & Rewards",
    question: "What is staking?",
    answer: "Staking is locking your DKT tokens in a smart contract to earn rewards. By staking, you support the platform's liquidity and earn yield based on the staking duration and amount.",
  },
  {
    category: "Staking & Rewards",
    question: "How do I stake DKT tokens?",
    answer: 'Go to the "Stake DKT" page, enter the amount you want to stake, and confirm. Your tokens will be locked for the staking period, during which you\'ll earn rewards that can be claimed later.',
  },
  {
    category: "Staking & Rewards",
    question: "When can I unstake my tokens?",
    answer: "You can unstake your tokens at any time, but there may be a cooldown period or penalties for early withdrawal depending on the staking terms. Check the staking page for specific details.",
  },
  {
    category: "Technical",
    question: "What tokens do I need?",
    answer: "You need DKT (Dikti Token) for all platform interactions - creating projects, donating, and staking. You also need a small amount of native DChain tokens for gas fees.",
  },
  {
    category: "Technical",
    question: "Are smart contracts audited?",
    answer: "Our smart contracts follow best practices and use OpenZeppelin libraries. For production deployments, we recommend third-party audits. This is a research project demonstrating decentralized crowdfunding.",
  },
  {
    category: "Technical",
    question: "Where is my data stored?",
    answer: "Project data is stored on DChain blockchain (immutable and transparent). Images are stored on IPFS (decentralized storage). User preferences like favorites and search history are stored locally in your browser.",
  },
];

const GLOSSARY = [
  {
    term: "DKT (Dikti Token)",
    definition: "The native utility token of the platform used for donations, staking, and rewards.",
  },
  {
    term: "DChain",
    definition: "An EVM-compatible blockchain network where all smart contracts and transactions are executed.",
  },
  {
    term: "Milestone",
    definition: "A funding stage with a specific goal and deadline. Projects are funded incrementally through milestones.",
  },
  {
    term: "Staking",
    definition: "Locking tokens in a smart contract to earn rewards and support platform liquidity.",
  },
  {
    term: "Yield Farming",
    definition: "Earning passive income by staking tokens. Rewards are calculated based on amount and duration.",
  },
  {
    term: "Smart Contract",
    definition: "Self-executing code on the blockchain that automatically enforces agreements without intermediaries.",
  },
  {
    term: "Gas Fee",
    definition: "A small transaction fee paid to the network for executing operations on the blockchain.",
  },
  {
    term: "Web3 Wallet",
    definition: "A digital wallet (like MetaMask) that stores your cryptocurrency and allows blockchain interactions.",
  },
  {
    term: "IPFS",
    definition: "InterPlanetary File System - a decentralized storage network for images and metadata.",
  },
];

const QUICK_START_STEPS = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Install MetaMask and connect to DChain network",
  },
  {
    icon: Coins,
    title: "Get DKT Tokens",
    description: "Acquire DKT tokens to participate in the platform",
  },
  {
    icon: Target,
    title: "Explore Projects",
    description: "Browse research projects and find ones you want to support",
  },
  {
    icon: Rocket,
    title: "Start Contributing",
    description: "Donate to projects or create your own research proposal",
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={false}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left hover:text-blue-400 transition-colors group"
      >
        <div className="flex items-start gap-3 flex-1">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 shrink-0 mt-0.5" />
          )}
          <span className="font-semibold">{item.question}</span>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-8 pr-4 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(FAQ_DATA.map((item) => item.category)))];
  const filteredFAQ = selectedCategory === "all"
    ? FAQ_DATA
    : FAQ_DATA.filter((item) => item.category === selectedCategory);

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      <ParallaxBackground />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header */}
        <FadeIn>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full glass-morphism border border-white/10 mb-4">
              <HelpCircle className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Help Center
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about using Orvyn-Labs platform for decentralized research crowdfunding
            </p>
          </div>
        </FadeIn>

        {/* Quick Start Guide */}
        <FadeIn delay={0.1}>
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-400" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUICK_START_STEPS.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <step.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{step.title}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* FAQ Section */}
        <FadeIn delay={0.2}>
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  Frequently Asked Questions
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-blue-500 text-white"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "all" ? "All" : cat}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {filteredFAQ.map((item, index) => (
                  <FAQAccordion key={index} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Glossary */}
        <FadeIn delay={0.3}>
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                Glossary of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GLOSSARY.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2"
                  >
                    <div className="font-semibold text-sm text-blue-400">
                      {item.term}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {item.definition}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Resources */}
        <FadeIn delay={0.4}>
          <Card className="glass-morphism border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-green-400" />
                Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="https://dchain.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">DChain Documentation</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400" />
                </Link>

                <Link
                  href="https://dchain.id/explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">Block Explorer</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">Need More Help?</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      This is a research project demonstrating decentralized crowdfunding on DChain blockchain.
                      For technical support or questions, please refer to the project documentation or contact the development team.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.5}>
          <div className="text-center space-y-4 py-8">
            <p className="text-sm text-muted-foreground">Ready to get started?</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/projects">
                <Button variant="default" className="gap-2">
                  <Target className="h-4 w-4" />
                  Browse Projects
                </Button>
              </Link>
              <Link href="/stake">
                <Button variant="outline" className="gap-2">
                  <Coins className="h-4 w-4" />
                  Stake DKT
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
