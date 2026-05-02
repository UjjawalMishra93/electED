import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  // @ts-expect-error global polyfill for Jest environment
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  // @ts-expect-error global polyfill for Jest environment
  global.TextDecoder = TextDecoder;
}

if (typeof global.fetch === 'undefined') {
  // @ts-expect-error jest global mock support
  global.fetch = jest.fn();
}

if (typeof HTMLElement.prototype.scrollIntoView !== 'function') {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: jest.fn(),
  });
}
