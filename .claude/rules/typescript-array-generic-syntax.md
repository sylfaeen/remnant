---
name: typescript-array-generic-syntax
scope: fullstack
severity: error
applies_to: "**/*.{ts,tsx}"
---

# TypeScript Arrays: Generic Syntax Array<T>

## Rule

Always use the generic syntax `Array<T>` instead of the shorthand `T[]` for typing arrays.

## Why

- Consistent with other generic types (`Map<K, V>`, `Set<T>`, `Promise<T>`)
- Better readability for nested types or unions
- More explicit and self-documenting

## Examples

### Basic arrays

```typescript
// ❌ WRONG — Shorthand syntax
const users: User[] = [];
const numbers: number[] = [1, 2, 3];

// ✅ CORRECT — Generic syntax
const users: Array<User> = [];
const numbers: Array<number> = [1, 2, 3];
```

### Nested arrays

```typescript
// ❌ WRONG
const matrix: number[][] = [[1, 2], [3, 4]];

// ✅ CORRECT
const matrix: Array<Array<number>> = [[1, 2], [3, 4]];
```

### Function return types

```typescript
// ❌ WRONG
function getItems(): string[] { return ['a', 'b']; }

// ✅ CORRECT
function getItems(): Array<string> { return ['a', 'b']; }
const fetchData = async (): Promise<Array<Product>> => { ... };
```

### Union types in arrays

```typescript
// ❌ WRONG — Requires parentheses, harder to read
type Props = { ids: (string | number)[] };

// ✅ CORRECT — Cleaner
type Props = { ids: Array<string | number> };
```

### Props and state

```tsx
// ✅ CORRECT
type UserListProps = {
  users: Array<UserData>;
  selectedIds: Array<string>;
};

const [items, setItems] = useState<Array<Item>>([]);
```

### Never mix syntaxes

```typescript
// ❌ WRONG — Inconsistent
type Props = {
  users: Array<User>;
  products: Product[]; // Inconsistent!
};

// ✅ CORRECT — All generic
type Props = {
  users: Array<User>;
  products: Array<Product>;
};
```

## ESLint

```javascript
// eslint.config.js
{
  rules: {
    '@typescript-eslint/array-type': ['error', { default: 'generic' }],
  },
}
```
