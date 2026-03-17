---
name: typescript-strict-typing
scope: fullstack
severity: error
applies_to: "**/*.{ts,tsx}"
---

# TypeScript Strict Typing: No `any`, No `@ts-ignore`

## Rule

Never use the `any` type, `@ts-ignore`, or `@ts-nocheck`. Both practices disable type checking, defeating the purpose of TypeScript and hiding potential bugs. Use proper types, generics, `unknown`, type assertions, or module augmentation instead.

## Why

- `any` silently disables all type checking, hiding bugs at compile time
- `@ts-ignore` / `@ts-nocheck` suppress errors instead of fixing them
- Proper typing catches bugs early and improves IDE support

## Examples

### Use proper types instead of `any`

```tsx
// ❌ WRONG — any disables all type checking
const GappedBar = (props: any) => { ... }
attributes: any;
listeners: any;

// ✅ CORRECT — Define proper interfaces
interface GappedBarProps {
  data: Array<DataPoint>;
  width: number;
}

export function GappedBar({ data, width }: GappedBarProps) { ... }
```

### Use `unknown` for truly unknown types, then narrow

```tsx
// ❌ WRONG
} catch (e: any) {
  console.error(e.message);
}

// ✅ CORRECT
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

### Use generics for flexible typing

```tsx
// ❌ WRONG
function processData(data: any[]): any[] {
  return data.filter(Boolean);
}

// ✅ CORRECT
function processData<T>(data: Array<T>): Array<T> {
  return data.filter(Boolean);
}
```

### Type callbacks properly

```tsx
// ❌ WRONG — any in callback signatures
labelFormatter={(_: any, payload: string | any[]) => { ... }}

// ✅ CORRECT
const labelFormatter = (label: string, payload: Array<TooltipPayload>) => {
  return payload[0]?.payload?.date ?? label;
};
```

### Type reduce properly

```tsx
// ❌ WRONG
data?.data.reduce((sum: number, dataPoint: { [x: string]: any }) => { ... })

// ✅ CORRECT
data?.data.reduce((sum: number, dataPoint: DataPoint) => sum + dataPoint.value, 0)
```

### Never use @ts-ignore or @ts-nocheck

```tsx
// ❌ WRONG — Suppresses error instead of fixing it
// @ts-ignore
const value = obj.unknownProp;

// @ts-nocheck
// entire file skips type checking

// ✅ CORRECT — Fix the type with assertion if necessary
const value = (obj as ExtendedType).unknownProp;

// ✅ CORRECT — Module augmentation for third-party types
declare module 'some-library' {
  interface SomeInterface {
    unknownProp: string;
  }
}
```
