# Web3 Tests Quick Reference Card

## 🚀 Quick Commands

```bash
# UI mode (recommended - interactive debugging)
pnpm test:web3:ui

# Headed mode (watch tests run)
pnpm test:web3:headed

# Headless mode (CI/CD)
pnpm test:web3

# Debug single test
pnpm test:web3:debug -g "Connect MetaMask"

# View report
pnpm test:web3:report
```

## 📝 Test Coverage

| Test Suite | Tests | Duration | Prerequisites |
|------------|-------|----------|---------------|
| **Wallet Connection** | 6 | ~2 min | None |
| **Project Creation** | 6 | ~5 min | Test wallet funded |
| **Donations** | 6 | ~3 min | Active project + DKT |
| **Staking** | 7 | ~4 min | DKT tokens |
| **TOTAL** | **25 tests** | **~15 min** | |

## ✅ What's Tested

### Wallet Connection (6 tests)
- ✅ Connect MetaMask via RainbowKit
- ✅ Switch to DChain network
- ✅ Wallet persists across pages
- ✅ Disconnect wallet
- ✅ Display DKT balance
- ✅ Reject connection

### Project Creation (6 tests)
- ✅ Access create project page
- ✅ Create project with 2 milestones
- ✅ Form validation (empty fields)
- ✅ Cancel project creation
- ✅ Reject transaction
- ✅ View created project details

### Donations (6 tests)
- ✅ Donate to a project
- ✅ Donation amount validation
- ✅ Donate more than balance (error handling)
- ✅ View donation history
- ✅ Cancel donation transaction

### Staking (7 tests)
- ✅ View staking page and stats
- ✅ Stake DKT tokens
- ✅ Stake with insufficient balance
- ✅ View pending rewards
- ✅ Claim staking rewards
- ✅ Unstake tokens
- ✅ Staking statistics display

## 🔧 Setup Checklist

- [ ] Run setup script: `./setup-web3-tests.sh`
- [ ] Edit `.env.test` with contract addresses
- [ ] Fund test wallet with ETH (for gas)
- [ ] Fund test wallet with DKT (for testing)
- [ ] Run first test: `pnpm test:web3:ui`

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MetaMask not connecting | Run `pnpm test:web3:headed` to see popup |
| Transactions failing | Check wallet has ETH for gas |
| Tests timeout | Increase timeout in `playwright.config.web3.ts` |
| Wrong network | Verify `DCHAIN_NETWORK` config |
| State conflicts | Tests run sequentially by default |

## 📁 File Structure

```
frontend/
├── e2e/
│   ├── tests/
│   │   ├── 01-wallet-connection.web3.spec.ts  ← Wallet tests
│   │   ├── 02-project-creation.web3.spec.ts   ← Project tests
│   │   ├── 03-donations.web3.spec.ts          ← Donation tests
│   │   └── 04-staking.web3.spec.ts            ← Staking tests
│   ├── fixtures/
│   │   ├── test-data.ts                       ← Test constants
│   │   └── web3-fixtures.ts                   ← Web3 fixtures
│   └── utils/
│       ├── helpers.ts                         ← UI helpers
│       └── web3-helpers.ts                    ← Web3 helpers
├── playwright.config.web3.ts                  ← Web3 config
├── .env.test.example                          ← Template
├── .env.test                                  ← Your config
├── WEB3_TESTING_GUIDE.md                      ← Full guide
└── setup-web3-tests.sh                        ← Setup script
```

## 🎯 Test Wallet

**Default Hardhat wallet:**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Seed: test test test test test test test test test test test junk
```

⚠️ **NEVER use this wallet on mainnet!**

## 📊 Example Test Run

```bash
$ pnpm test:web3

Running 25 tests using 1 worker

  ✓  1  Connect MetaMask wallet (3.2s)
  ✓  2  Switch to DChain network (2.1s)
  ✓  3  Wallet persists across pages (1.8s)
  ✓  4  Create project with 2 milestones (45.3s)
  ✓  5  Donate to project (12.4s)
  ✓  6  Stake DKT tokens (8.7s)
  ...

  25 passed (14m 23s)
```

## 🌐 Networks Supported

| Network | Chain ID | RPC | Status |
|---------|----------|-----|--------|
| DChain Testnet | 2713017997578000 | https://dchaintestnet.rpc.caldera.xyz/http | ✅ Configured |
| Base Sepolia | 84532 | https://sepolia.base.org | ✅ Available |
| Localhost | 31337 | http://localhost:8545 | ⚙️ For dev |

## 📚 Resources

- **Full Guide:** [WEB3_TESTING_GUIDE.md](WEB3_TESTING_GUIDE.md)
- **UI Tests:** [e2e/README.md](e2e/README.md)
- **Synpress Docs:** https://github.com/Synthetixio/synpress
- **Playwright Docs:** https://playwright.dev

---

**Last Updated:** 2026-04-24
