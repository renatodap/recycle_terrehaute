// Jest setup file for test configuration
require('dotenv').config({ path: '.env.local' });

// Mock Next.js specific features
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Add custom Jest matchers
expect.extend({
  toBeRecyclable(received) {
    const pass = received.is_recyclable === true;
    if (pass) {
      return {
        message: () => `expected ${received.item_name} not to be recyclable`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received.item_name} to be recyclable`,
        pass: false,
      };
    }
  },
  toHaveBinColor(received, color) {
    const pass = received.bin_color === color;
    if (pass) {
      return {
        message: () => `expected ${received.item_name} not to have bin color ${color}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received.item_name} to have bin color ${color}, but got ${received.bin_color}`,
        pass: false,
      };
    }
  },
});

// Suppress console errors during tests unless explicitly needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Add skipIf helper for conditional test execution
global.it.skipIf = (condition) => condition ? it.skip : it;