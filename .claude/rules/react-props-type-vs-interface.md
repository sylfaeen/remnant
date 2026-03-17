---
name: react-props-type-vs-interface
scope: frontend
severity: error
applies_to: "**/*.tsx"
---

# React Props: Naming Convention & Type vs Interface

## Rule

All component prop definitions must end with the suffix `Props`. Use `type` when the props are self-contained or extend a single type (via `&`). Use `interface` only when extending **at least two** types or interfaces (via `extends`). A `type` declaration must always end with a semicolon `;` after the closing brace. An `interface` does not. Each Props type/interface must be declared **directly above** the component that uses it — never grouped at the top of the file. This rule applies only to React component props — other types (union literals, hook returns, API responses) are excluded.

## Why

- Consistent naming makes props instantly identifiable
- Clear distinction between `type` and `interface` based on composition complexity
- Prevents misuse of `interface extends` for single-parent inheritance when `&` is simpler

## Examples

### type — self-contained props

```tsx
// ✅ CORRECT
type ServerCardProps = {
  name: string;
  status: 'online' | 'offline';
  onDelete: () => void;
};
```

### type — intersection with a single type

```tsx
// ✅ CORRECT — one parent + own props → use type with &
type ServerFormProps = DialogProps & {
  server: Server;
};

// ❌ WRONG — interface with a single extends
interface ServerFormProps extends DialogProps {
  server: Server;
}
```

### interface — extends at least two types

```tsx
// ✅ CORRECT — two or more parents → use interface with extends
interface ServerFormModalProps extends DialogProps, ServerConfig {
  onSubmit: () => void;
}

// ✅ CORRECT — two parents, no additional props
interface FullDialogProps extends DialogProps, AnimationConfig {}
```

### Suffix Props is mandatory

```tsx
// ❌ WRONG — missing Props suffix
type ServerCard = {
  name: string;
};

// ✅ CORRECT
type ServerCardProps = {
  name: string;
};

// ❌ WRONG — missing Props suffix on interface
interface ServerFormModal extends DialogProps, ServerConfig {}

// ✅ CORRECT
interface ServerFormModalProps extends DialogProps, ServerConfig {}
```

### Pick / Omit — suffix still required

```tsx
// ✅ CORRECT
type EditUserProps = Pick<UserFormProps, 'onSubmit' | 'onCancel'>;
type CreateServerProps = Omit<ServerFormProps, 'server'>;
```

### Props must be declared directly above their component

```tsx
// ❌ WRONG — All Props types grouped at the top, far from their component
type ServerCardProps = {
  name: string;
  status: 'online' | 'offline';
};

type StatusBadgeProps = {
  status: 'online' | 'offline';
};

type MetricsBarProps = {
  cpu: number;
  memory: number;
};

export function ServerCard({ name, status }: ServerCardProps) { ... }
function StatusBadge({ status }: StatusBadgeProps) { ... }
function MetricsBar({ cpu, memory }: MetricsBarProps) { ... }

// ✅ CORRECT — Each Props type directly above its component
type ServerCardProps = {
  name: string;
  status: 'online' | 'offline';
};

export function ServerCard({ name, status }: ServerCardProps) { ... }

type StatusBadgeProps = {
  status: 'online' | 'offline';
};

function StatusBadge({ status }: StatusBadgeProps) { ... }

type MetricsBarProps = {
  cpu: number;
  memory: number;
};

function MetricsBar({ cpu, memory }: MetricsBarProps) { ... }
```

### Excluded from this rule

```tsx
// ✅ These are NOT component props — no Props suffix needed
type WizardStep = 'form' | 'jira' | 'confirm';
type ServerStatus = 'online' | 'offline' | 'starting';
type UseAuthReturn = { user: User; logout: () => void };
type ServerData = { id: number; name: string };
```
