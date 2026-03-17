---
name: tsx-jsx-curly-brace-attributes
scope: frontend
severity: error
applies_to: "**/*.tsx"
---

# JSX Attributes: Always Use Curly Braces for String Values

## Rule

All JSX string attribute values must use curly braces with single quotes `={'value'}` instead of double quotes `="value"`. This applies to **every** attribute, not just `className`.

## Why

- Consistent syntax across all JSX attributes
- Aligns with the curly brace pattern already enforced for `className`
- Reduces mental overhead — one pattern for all attributes

## Examples

### Static string attributes

```tsx
// ❌ WRONG — Double quotes
<Button variant="ghost" size="sm">Click</Button>
<input type="text" placeholder="Enter name" />
<img src="/logo.png" alt="Logo" />
<Dialog value="my-dialog" />

// ✅ CORRECT — Curly braces with single quotes
<Button variant={'ghost'} size={'sm'}>Click</Button>
<input type={'text'} placeholder={'Enter name'} />
<img src={'/logo.png'} alt={'Logo'} />
<Dialog value={'my-dialog'} />
```

### Boolean attributes remain unchanged

```tsx
// ✅ CORRECT — Booleans don't need curly braces
<input disabled />
<Dialog open />
<Button asChild />
```

### Expression attributes remain unchanged

```tsx
// ✅ CORRECT — Already using curly braces
<div onClick={handleClick} />
<input value={name} />
<Component count={42} />
```

### className follows the same rule (plus cn() for conditionals)

```tsx
// ❌ WRONG
<div className="flex items-center"></div>

// ✅ CORRECT
<div className={'flex items-center'}></div>
<div className={cn('flex', isActive && 'bg-brand')}></div>
```
