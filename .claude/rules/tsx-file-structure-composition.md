---
name: tsx-file-structure-composition
scope: frontend
severity: error
applies_to: "**/*.tsx"
---

# TSX File Structure & Composition Patterns

## Rule

TSX files must follow a consistent structural pattern: types at the top, exported wrapper, then private sub-components. Extract complex conditional blocks (wizard steps, tabs, modes) into dedicated components. Use `{...{ prop }}` shorthand when prop name matches the variable name. Do **not** add section comment banners — the file layout order itself provides structure.

## Why

- Predictable file layout makes navigation instant
- Extracted sub-components keep each unit small and testable
- `{...{ prop }}` shorthand reduces noise in JSX
- No unnecessary comments cluttering the code

## File Layout Order

1. **Imports** — grouped: actions, types, libraries, DS components, React hooks
2. **Types** — all types/interfaces before any component
3. **Exported constant(s)** — dialog ID, component name constants
4. **Exported wrapper component** — the public API of the file
5. **Private orchestrator** — manages state, form, handlers; delegates rendering
6. **Step / section components** — one per logical block (wizard step, tab panel, mode)
7. **Field-level components** — atomic form fields, display fragments

## Examples

### Correct file structure

```tsx
type Props = DialogProps & {
  organization: AdminOrganizationSingleData;
  availableTemplates: Array<FormSchemaTemplateData>;
};

type FormStepProps = {
  availableTemplates: Array<FormSchemaTemplateData>;
  canSubmit: boolean;
  onNextStep: () => void;
};

export function MyDialog({ organization, availableTemplates, value, ...props }: Props) {
  return (
    <Dialog canOverlayClose={true} {...{ value }}>
      {props.children && <DialogTrigger asChild={true} {...props} />}
      <DialogClearState>
        <Content {...{ organization, availableTemplates }} />
      </DialogClearState>
    </Dialog>
  );
}

function Content({ organization, availableTemplates }: ContentProps) {
  const [step, setStep] = useState<WizardStep>('form');
  const form = useForm<MyRequest>({ /* ... */ });

  return (
    <DialogContent stroke={true} close={true} size={'md'}>
      <Form form={form} onSubmit={handleSubmit}>
        {step === 'form' && (
          <FormStep {...{ availableTemplates, canSubmit }} onNextStep={() => setStep('jira')} />
        )}
        {step === 'jira' && (
          <JiraStep {...{ canSubmit }} onPreviousStep={() => setStep('form')} />
        )}
      </Form>
    </DialogContent>
  );
}

function FormStep({ availableTemplates, canSubmit, onNextStep }: FormStepProps) {
  const form = useFormState<MyRequest>();
  return (
    <>
      <DialogHeader>...</DialogHeader>
      <DialogBody>...</DialogBody>
      <DialogFooter>...</DialogFooter>
    </>
  );
}
```

### Props shorthand

```tsx
// ❌ WRONG — Redundant prop name
<Content organization={organization} availableTemplates={availableTemplates} />

// ❌ WRONG — Multiple spreads instead of one
<Content {...{ organization }} {...{ availableTemplates }} />

// ✅ CORRECT — Single spread grouping all matching props
<Content {...{ organization, availableTemplates }} />
```

### Spread must be last

```tsx
// ❌ WRONG — Spread in the middle of props
<DeleteDialog
  server={deleteDialogServer}
  {...{ isDeleting }}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setDeleteDialogServer(null)}
/>

// ✅ CORRECT — Spread always at the end
<DeleteDialog
  server={deleteDialogServer}
  onConfirm={handleDeleteConfirm}
  onCancel={() => setDeleteDialogServer(null)}
  {...{ isDeleting }}
/>
```

### Never inline large conditional blocks

```tsx
// ❌ WRONG — Monolithic component with 50+ lines per step inline
function Content({ organization, availableTemplates }: ContentProps) {
  const [step, setStep] = useState('form');
  return (
    <DialogContent>
      <Form form={form} onSubmit={handleSubmit}>
        {step === 'form' && (
          <>
            <DialogHeader>...</DialogHeader>
            <DialogBody>{/* 50+ lines of form fields inline */}</DialogBody>
            <DialogFooter>{/* complex conditional button logic */}</DialogFooter>
          </>
        )}
        {step === 'jira' && (
          <>
            <DialogHeader>...</DialogHeader>
            <DialogBody>{/* another 50+ lines inline */}</DialogBody>
            <DialogFooter>...</DialogFooter>
          </>
        )}
      </Form>
    </DialogContent>
  );
}

// ✅ CORRECT — Extract each step into its own component (see full example above)
```
