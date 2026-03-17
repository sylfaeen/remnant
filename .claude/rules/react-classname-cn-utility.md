---
name: react-classname-cn-utility
scope: frontend
severity: error
applies_to: "**/*.tsx"
---

# React className: cn() Utility for Conditional & Multiple Classes

## Rule

Use the `cn()` utility from `@/lib/utils` **only** when there is class merging, conditional logic, or a `className` prop override. Do **not** use `cn()` for a single static string — use plain curly braces instead. Never use template literals, string concatenation, or inline ternaries to build className strings.

## Why

- `cn()` combines `clsx` + `tailwind-merge` for proper Tailwind class resolution
- Filters falsy values (`false`, `null`, `undefined`, `''`) automatically
- Last class wins with Tailwind merge (e.g. `cn('px-4', 'px-8')` → `"px-8"`)

## Examples

### Do NOT use cn() for static strings

```tsx
// ❌ WRONG — cn() is unnecessary, no merging or condition
<div className={cn('flex items-center')}></div>

// ✅ CORRECT — Plain curly braces for static string
<div className={'flex items-center'}></div>
```

### Use cn() for multiple or conditional classes

```tsx
import { cn } from '@/lib/utils';

// ❌ WRONG — Template literals for conditional classes
<div className={`my-class ${isActive ? 'active' : 'inactive'}`}></div>

// ✅ CORRECT — Use cn() utility
<div className={cn('my-class', isActive ? 'active' : 'inactive')}></div>
```

### Use && for single conditional class (no else)

```tsx
// ❌ WRONG — Empty string in ternary
<div className={cn('base', isActive ? 'active' : '')}></div>

// ✅ CORRECT — Use && when no else class
<div className={cn('base', isActive && 'active')}></div>

// ✅ CORRECT — Multiple && conditions
<div className={cn(
  'base',
  isActive && 'bg-brand',
  isDisabled && 'opacity-50',
  hasError && 'border-red-500',
)}></div>
```

### Use ternary when both states need classes

```tsx
// ✅ CORRECT
<div className={cn(value === 100 ? 'stroke-fg-success' : 'stroke-fg-brand')}></div>
```

### Never use template literals or string concatenation

```tsx
// ❌ WRONG — Template literal with dynamic value
<span className={`fi fi-${language.alpha2Code} rounded-full !size-4`} />

// ✅ CORRECT
<span className={cn(`fi fi-${language.alpha2Code}`, 'rounded-full !size-4')} />

// ❌ WRONG — String concatenation
<div className={'base ' + (isActive ? 'active' : 'inactive')}></div>

// ✅ CORRECT
<div className={cn('base', isActive ? 'active' : 'inactive')}></div>
```

### Component props with className override

```tsx
// ✅ CORRECT — Allow className prop to override defaults
export function Card({ className, children }: Props) {
  return (
    <div className={cn('bg-bg-secondary border border-border-primary rounded-16 p-4', className)}>
      {children}
    </div>
  );
}
```
