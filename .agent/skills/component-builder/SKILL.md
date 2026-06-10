# Component Builder Skill

Load this skill whenever you are creating or modifying a React component in SellSnap. It tells you where the component goes, how it should be structured, and how to wire it up to the design system without reinventing anything.

## Before You Start

Read `.agents/rules/design-system.md` first. Components that do not follow the design system get rejected at review. This skill assumes you already know the tokens, the spacing scale, and the component primitives.

Then ask: does this component already exist? Search `components/` before adding a new one. Two slightly different `Button` components is how codebases rot.

## Where Components Live

```
components/
├── ui/                  primitives: Button, Input, Card, Badge, Avatar, etc.
├── product/             anything specific to the product domain (ProductCard, ProductImage, PriceTag)
├── dashboard/           anything that only exists inside the seller dashboard (OrdersTable, ProductList)
└── shared/              composites used across more than one domain (EmptyState, PageHeader)
```

If a component is used exactly once and it is complex, it can live next to the page that uses it in `app/.../_components/`. Promote it to `components/` when a second caller shows up.

## Component File Template

```tsx
// components/<folder>/<ComponentName>.tsx

import styles from './<ComponentName>.module.css';

type <ComponentName>Props = {
  // Props go here. Required props first, optional after.
  children?: React.ReactNode;
  className?: string;
};

export function <ComponentName>({ children, className }: <ComponentName>Props) {
  // Merge multiple classes if className prop is provided
  const rootClass = className ? `${styles.root} ${className}` : styles.root;
  return (
    <div className={rootClass}>
      {children}
    </div>
  );
}
```

```css
/* components/<folder>/<ComponentName>.module.css */
.root {
  /* Use CSS variables for everything */
  padding: 16px;
  background-color: var(--color-surface);
  border-radius: 8px;
}
```

Notes:

- Named export, not default export. Default exports make renaming harder and break auto-imports.
- `className` prop is always accepted on components that render a single root element so callers can extend or override positioning.
- Props type goes above the component, named `<ComponentName>Props`.
- Required props come before optional ones in the type definition.

## Server vs. Client Components

Default to server components. A component becomes a client component only when it needs one of these:

- React state (`useState`, `useReducer`)
- Effects (`useEffect`, `useLayoutEffect`)
- Browser-only APIs (`window`, `document`, `localStorage`)
- Event handlers that are more than a simple link (`onClick`, `onChange`)
- Context consumption for interactivity

If you add `"use client"`, put it on the first line of the file. Do not add it defensively.

Keep the client boundary as low in the tree as possible. A page that is mostly static but has one interactive button should not be a client component; the button should be.

## Styling

CSS Modules only. Do not use inline styles, styled-components, or utility frameworks like Tailwind. 

Use the design tokens defined directly from `tokens/design-tokens.css`:

- Backgrounds use `var(--color-brand)`, `var(--color-surface)`, `var(--color-bg)`
- Texts use `var(--color-text-primary)`, `var(--color-text-muted)`, `var(--color-text-subtle)`

If you find yourself writing custom hex values like `color: #1A7F3C;`, stop. Either use a token or add one to the CSS token file (with developer approval).

## Variants

For components with variants (Button, Badge), manage them cleanly within your CSS Module and apply the proper class based on the prop. 

```tsx
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const rootClass = [
    styles.root,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={rootClass} {...props} />
  );
}
```

```css
/* Button.module.css */
.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  transition: colors 0.2s;
}
.root:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-brand);
}
.root:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Variants */
.primary {
  background-color: var(--color-brand);
  color: white;
}
.secondary {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
.ghost {
  color: var(--color-text-primary);
}
.danger {
  background-color: var(--color-danger);
  color: white;
}

/* Sizes */
.sm {
  height: 36px;
  padding: 0 12px;
  font-size: var(--font-size-sm);
}
.md {
  height: 44px;
  padding: 0 16px;
  font-size: var(--font-size-base);
}
.lg {
  height: 48px;
  padding: 0 24px;
  font-size: var(--font-size-base);
}
```

## Accessibility

Every interactive element needs a keyboard-reachable focus state. Provide custom focus-visible styling mapped to `var(--color-brand)`.

Buttons without visible text need `aria-label`. Icon-only buttons are the most common offender. Do not let them ship without a label.

Form inputs need associated labels via `htmlFor`/`id`. Error messages are linked via `aria-describedby`.

Images need `alt`. Decorative images use `alt=""`. Do not omit the attribute.

## Props to Avoid

- Do not expose raw color props (`color="red"`). Use variants.
- Do not expose raw size values in pixels. Use the size variants.
- Do not accept arbitrary inline styles via a `style` prop unless there is a specific reason (like a dynamic value that cannot be expressed in CSS modules).

## Testing a New Component

If the component is a primitive (lives in `ui/`), write a simple Storybook-style manual-check by importing it into `app/_dev/page.tsx` (a dev-only route gated by `NODE_ENV === 'development'`). Verify:

- Default appearance
- Every variant
- Every size
- Disabled state (if applicable)
- Focus state (tab into it)
- Hover state
- On mobile viewport (Chrome DevTools at 360px wide)

Domain components (product, dashboard) can be reviewed in place on the relevant page.

## Common Mistakes

- Creating a new primitive when an existing one would work with a new variant. Extend, do not duplicate.
- Forgetting `className` prop on a component that might need to be laid out differently in different places.
- Making a component a client component because it was easier, when a server component would have worked.
- Hardcoding custom pixels or hex values instead of CSS variables from `tokens/design-tokens.css`.
- Adding complex logic inside the JSX. Extract to a named constant or helper above the return.
