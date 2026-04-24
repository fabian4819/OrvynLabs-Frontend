# Orvyn-Labs DApp Frontend

Decentralized research crowdfunding platform on DChain blockchain.

## Features

- **Multi-language Support**: English and Bahasa Indonesia
- **Web3 Integration**: RainbowKit + Wagmi v2
- **Smart Contract Interaction**: Full DApp functionality
- **Responsive Design**: Mobile-first with Tailwind CSS v4
- **Analytics & Charts**: Recharts visualization
- **Transaction History**: Export to CSV, JSON, Tax Summary
- **Staking & Rewards**: Stake DKT tokens
- **Project Management**: Create, fund, vote on research projects
- **Leaderboard & Gamification**: Achievement badges
- **Dark/Light Mode**: Theme toggle

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your contract addresses
```

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Language Support

The app supports English and Indonesian. Users can switch languages using the globe icon in the navbar. See [I18N_GUIDE.md](./I18N_GUIDE.md) for developer documentation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Web3**: Wagmi v2, Viem, RainbowKit
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Blockchain**: DChain (Chain ID: 17845)

## Documentation

- [I18N_GUIDE.md](./I18N_GUIDE.md) - Internationalization guide
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Deployment instructions
- [USER_GUIDE.md](../USER_GUIDE.md) - User manual
- [KNOWN_ISSUES.md](../KNOWN_ISSUES.md) - Known issues and workarounds

## Build & Deploy

```bash
# Production build
pnpm build

# Start production server
pnpm start

# Or deploy to Vercel
vercel --prod
```

See [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) for full deployment guide.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [DChain Explorer](https://dchain.id/explorer)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

## License

Bachelor Thesis Project - Orvyn-Labs Research Funding Platform
