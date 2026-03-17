---
name: react-function-declarations
scope: frontend
severity: error
applies_to: "**/*.tsx"
---

# React Components: Function Declarations

## Rule

React components **must** be declared using function declarations, not arrow function expressions.

## Why

- Better debugging experience
- Clearer stack traces
- Consistent code style across the project

## Examples

```tsx
// ❌ WRONG — Arrow function expression
export const AddSectionDialog = ({ dialogId, onAdd }: Props) => {
  return (
    <Dialog value={dialogId}>
      <Content />
    </Dialog>
  );
};

// ✅ CORRECT — Function declaration
export function AddSectionDialog({ dialogId, onAdd }: Props) {
  return (
    <Dialog value={dialogId}>
      <Content />
    </Dialog>
  );
}
```
