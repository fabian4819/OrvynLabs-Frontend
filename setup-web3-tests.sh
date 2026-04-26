#!/bin/bash
# Setup script for Web3 E2E testing with Synpress

set -e

echo "🚀 Setting up Web3 E2E Testing Environment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.test exists
if [ -f ".env.test" ]; then
    echo -e "${YELLOW}⚠️  .env.test already exists${NC}"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.test"
    else
        cp .env.test.example .env.test
        echo -e "${GREEN}✅ Created .env.test from template${NC}"
    fi
else
    cp .env.test.example .env.test
    echo -e "${GREEN}✅ Created .env.test from template${NC}"
fi

echo ""
echo "📝 Configuration Steps:"
echo "----------------------"
echo ""
echo "1. Edit .env.test with your contract addresses:"
echo "   ${YELLOW}nano .env.test${NC}"
echo ""
echo "   Update these values:"
echo "   - NEXT_PUBLIC_DIKTI_TOKEN_ADDRESS"
echo "   - NEXT_PUBLIC_FACTORY_ADDRESS"
echo "   - NEXT_PUBLIC_STAKING_ADDRESS"
echo ""
echo "2. Ensure your test wallet has funds:"
echo "   - Native ETH/DChain tokens for gas"
echo "   - DKT tokens for testing"
echo ""
echo "   Test wallet address (default):"
echo "   ${YELLOW}0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266${NC}"
echo ""
echo "3. Run your first Web3 test:"
echo "   ${GREEN}pnpm test:web3:ui${NC}"
echo ""
echo "4. Or run in headed mode to watch:"
echo "   ${GREEN}pnpm test:web3:headed${NC}"
echo ""
echo "📚 For detailed instructions, see:"
echo "   ${GREEN}WEB3_TESTING_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
