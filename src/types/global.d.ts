// Global ambient type declarations for JS JSDoc references
export {};

declare global {
  // Many JS files reference TokenRingRegistry in JSDoc types; provide a global alias
  type TokenRingRegistry = any;
}
