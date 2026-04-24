# Testing Guide

Comprehensive guide for testing the Orvyn-Labs DApp frontend.

---

## Test Stack

- **Test Runner**: Vitest 4.x (Vite-native, fast)
- **Component Testing**: React Testing Library
- **DOM Matchers**: @testing-library/jest-dom
- **User Interactions**: @testing-library/user-event
- **Environment**: jsdom
- **Coverage**: Vitest v8 provider

---

## Quick Start

```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── button.test.tsx        # Component tests
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── utils.test.ts             # Unit tests
│   │   └── favorites.test.ts
│   └── test/
│       ├── setup.ts                   # Global test setup
│       ├── utils.tsx                  # Custom render helpers
│       └── mocks/
│           └── wagmi.ts              # Mock wagmi hooks
├── vitest.config.ts                   # Vitest configuration
└── TESTING_GUIDE.md                   # This file
```

---

## Writing Tests

### Unit Tests

Test pure functions and utilities:

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatDkt } from "./utils";

describe("formatDkt", () => {
  it("formats bigint to decimal string", () => {
    const result = formatDkt(BigInt("1000000000000000000"));
    expect(result).toContain("1");
    expect(typeof result).toBe("string");
  });

  it("handles zero correctly", () => {
    const result = formatDkt(0n);
    expect(typeof result).toBe("string");
  });
});
```

### Component Tests

Test React components with Testing Library:

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { Button } from "./button";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });
});
```

### Tests with localStorage

```typescript
import { beforeEach, describe, it, expect } from "vitest";
import { getFavorites, addFavorite } from "./favorites";

describe("Favorites", () => {
  const walletAddress = "0x1234...";

  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array for new wallet", () => {
    const favorites = getFavorites(walletAddress);
    expect(favorites).toEqual([]);
  });

  it("adds a favorite", () => {
    addFavorite(walletAddress, "0xabc...");
    const favorites = getFavorites(walletAddress);
    expect(favorites).toContain("0xabc...");
  });
});
```

---

## Custom Render Function

Use the custom `render` from `@/test/utils` to wrap components with providers:

```typescript
import { render, screen } from "@/test/utils";

// This automatically wraps with:
// - NextIntlClientProvider (i18n)
// - QueryClientProvider (React Query)
```

**Note**: For components that need wagmi hooks, you'll need to mock them (see Mocking section).

---

## Mocking

### Wagmi Hooks

```typescript
// In your test file
import { vi } from "vitest";

vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => ({
    address: "0x1234567890123456789012345678901234567890",
    isConnected: true,
  })),
  useBalance: vi.fn(() => ({
    data: {
      value: BigInt("100000000000000000000"),
      formatted: "100.0",
      symbol: "DKT",
    },
  })),
}));
```

### Next.js Router

```typescript
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

### localStorage

Already mocked globally in `src/test/setup.ts`:

```typescript
// Just use it normally in tests
localStorage.setItem("key", "value");
localStorage.getItem("key"); // "value"
localStorage.clear(); // Clears between tests
```

---

## Test Organization

### File Naming

- Component tests: `ComponentName.test.tsx`
- Utility tests: `fileName.test.ts`
- Hook tests: `useHookName.test.ts`

### Test Structure

Use `describe` blocks to group related tests:

```typescript
describe("ComponentName", () => {
  describe("rendering", () => {
    it("renders correctly", () => {});
    it("renders with props", () => {});
  });

  describe("interactions", () => {
    it("handles click", () => {});
    it("handles input", () => {});
  });

  describe("edge cases", () => {
    it("handles empty state", () => {});
    it("handles errors", () => {});
  });
});
```

---

## Testing Patterns

### Testing User Interactions

```typescript
import userEvent from "@testing-library/user-event";

it("handles form submission", async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<Form onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText("Name"), "John");
  await user.click(screen.getByText("Submit"));

  expect(handleSubmit).toHaveBeenCalledWith({ name: "John" });
});
```

### Testing Async Operations

```typescript
import { waitFor } from "@testing-library/react";

it("loads data", async () => {
  render(<DataLoader />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Data loaded")).toBeInTheDocument();
  });
});
```

### Testing Errors

```typescript
it("displays error message", () => {
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  render(<ComponentThatErrors />);

  expect(screen.getByText("Error occurred")).toBeInTheDocument();

  consoleError.mockRestore();
});
```

---

## Coverage

Generate coverage reports:

```bash
pnpm test:coverage
```

Opens `coverage/index.html` in your browser.

### Coverage Thresholds

Currently no thresholds set. Recommended for production:

```typescript
// vitest.config.ts
coverage: {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80,
}
```

### Excluded from Coverage

- `node_modules/`
- `src/test/` (test utilities)
- `**/*.d.ts` (type definitions)
- `**/*.config.*` (config files)
- ABIs and generated files

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Best Practices

### ✅ Do

- **Test behavior, not implementation**: Test what users see and do
- **Use accessible queries**: `getByRole`, `getByLabelText` over `getByTestId`
- **Clean up**: Use `beforeEach` to reset state
- **Mock external dependencies**: APIs, wagmi hooks, etc.
- **Test edge cases**: Empty states, errors, loading states
- **Keep tests simple**: One concept per test
- **Use descriptive test names**: "it('displays error when API fails')"

### ❌ Don't

- **Don't test implementation details**: CSS classes, internal state
- **Don't use `act()` manually**: Testing Library handles it
- **Don't snapshot everything**: Snapshots are brittle
- **Don't mock what you don't need**: Only mock external dependencies
- **Don't write flaky tests**: Avoid timeouts and race conditions

---

## Common Queries

### Preferred (Accessible)

```typescript
// By role (best)
screen.getByRole("button", { name: "Submit" });
screen.getByRole("textbox", { name: "Email" });

// By label
screen.getByLabelText("Password");

// By placeholder
screen.getByPlaceholderText("Enter email");

// By text
screen.getByText("Welcome");
```

### Fallback

```typescript
// By test ID (last resort)
screen.getByTestId("custom-element");
```

### Query Variants

```typescript
// getBy* - Throws if not found (use for assertions)
screen.getByText("Hello");

// queryBy* - Returns null if not found (use for existence checks)
screen.queryByText("Hello"); // null if not found

// findBy* - Returns promise, waits for element (use for async)
await screen.findByText("Hello");
```

---

## Debugging Tests

### View DOM

```typescript
import { screen } from "@testing-library/react";

it("test", () => {
  render(<Component />);

  // Print entire DOM
  screen.debug();

  // Print specific element
  screen.debug(screen.getByText("Hello"));
});
```

### Run specific test

```bash
# Run tests matching pattern
pnpm test button

# Run single file
pnpm test src/lib/utils.test.ts

# Run with --ui for interactive debugging
pnpm test:ui
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Vitest",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

---

## Testing Checklist

When adding a new component:

- [ ] Create `ComponentName.test.tsx` next to component
- [ ] Test rendering with default props
- [ ] Test rendering with different prop combinations
- [ ] Test user interactions (click, type, etc.)
- [ ] Test edge cases (empty, error, loading states)
- [ ] Test accessibility (keyboard navigation, ARIA)
- [ ] Verify tests pass: `pnpm test:run`
- [ ] Check coverage: `pnpm test:coverage`

---

## Troubleshooting

### "ReferenceError: window is not defined"

- Ensure `environment: "jsdom"` in `vitest.config.ts`
- Or wrap code: `if (typeof window !== "undefined") { ... }`

### "Cannot find module '@/...'

- Check `resolve.alias` in `vitest.config.ts`
- Should match `tsconfig.json` paths

### "Element is not connected"

- Use `await waitFor()` for async updates
- Ensure cleanup in `afterEach`

### Tests hang

- Avoid infinite loops
- Mock timers if needed: `vi.useFakeTimers()`

---

## Example Test Files

### Button Component

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { Button } from "./button";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText("Click me"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Function

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { formatDkt } from "./utils";

describe("formatDkt", () => {
  it("formats bigint correctly", () => {
    const result = formatDkt(BigInt("1000000000000000000"));
    expect(result).toContain("1");
  });
});
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

## Current Test Coverage

| Category | Files Tested | Coverage |
|----------|--------------|----------|
| UI Components | Button | ✅ |
| Utilities | utils, favorites | ✅ |
| Hooks | - | ⚠️ |
| Pages | - | ⚠️ |
| Forms | - | ⚠️ |

**Status**: Basic testing infrastructure in place. Expand coverage as needed.

---

**Last Updated**: 2026-04-20
**Test Framework**: Vitest 4.1.4 + React Testing Library
