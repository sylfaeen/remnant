# Compound Pattern

## Rule

The Compound Pattern is the **default approach** for structuring React components that expose sub-components. It must be preferred over exporting multiple independent components or passing sub-elements via props.

## Why

- Co-locates parent and sub-components in a single, discoverable export
- Preserves readable names in React DevTools and stack traces
- Avoids prop-drilling sub-elements or scattering related exports across the file

## Implementation

Export the parent component directly on its declaration, then attach sub-components immediately after using named function expressions.

```tsx
export function MyComponent({ ...rest }: PropsWithChildren) {
  return <div {...rest} />;
}

MyComponent.Header = function MyComponentHeader({ ...rest }: PropsWithChildren) {
  return <header {...rest} />;
};

MyComponent.Body = function MyComponentBody({ ...rest }: PropsWithChildren) {
  return <div {...rest} />;
};

MyComponent.Footer = function MyComponentFooter({ ...rest }: PropsWithChildren) {
  return <footer {...rest} />;
};
```

## Rules

- **Always `export` inline** on the parent function declaration — no separate `export { MyComponent }` at the bottom.
- **Always name sub-component functions explicitly** (`function MyComponentHeader`) — never use anonymous arrow functions. This ensures readable names in React DevTools and stack traces.
- **Attach sub-components immediately after** the parent declaration, grouped together, never scattered across the file.
- **Sub-components may reference sibling sub-components** via `MyComponent.SubComponent` inside JSX — this is safe because the reference is resolved at render time, not at declaration time.

## When not to use

- A standalone utility component with no meaningful sub-structure (e.g. a simple `<Spinner />` or `<Badge />`).
- A component whose sub-elements are systematically generated from data (e.g. a list rendered via `.map()`), where sub-components would add no semantic value.

## Examples

```tsx
// ❌ Separate export at the bottom
function MyComponent(...) { ... }
export { MyComponent };

// ❌ Anonymous arrow functions as sub-components
MyComponent.Header = ({ children }) => <header>{children}</header>;

// ❌ Sub-component attachments scattered across the file (after imports, hooks, etc.)
MyComponent.Header = function MyComponentHeader(...) { ... };
// ... 50 lines later ...
MyComponent.Body = function MyComponentBody(...) { ... };

// ❌ Separate export of each sub-component
export function MyComponentHeader(...) { ... }
export function MyComponentBody(...) { ... }

// ❌ Sub-elements passed as props
<MyComponent header={<Header />} body={<Body />} />

// ✅ CORRECT — Compound pattern
export function MyComponent({ ...rest }: PropsWithChildren) {
  return <div {...rest} />;
}

MyComponent.Header = function MyComponentHeader({ ...rest }: PropsWithChildren) {
  return <header {...rest} />;
};

MyComponent.Body = function MyComponentBody({ ...rest }: PropsWithChildren) {
  return <div {...rest} />;
};
```
