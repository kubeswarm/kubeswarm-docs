# Contributing to kubeswarm-docs

Thank you for helping improve the kubeswarm documentation. This repo contains the source for [docs.kubeswarm.io](https://docs.kubeswarm.io).

## What lives here

- `docs/` - all documentation pages (Markdown/MDX)
- `src/components/` - React components used in docs (e.g. `VersionedCode`)
- `docusaurus.config.ts` - site configuration
- `sidebars.ts` - sidebar structure

## Making changes

### Fixing a typo or improving existing content

Go straight to a PR - no issue needed.

### Adding a new page

1. Create a `.md` file in the appropriate `docs/` subdirectory.
2. Add `sidebar_position` frontmatter to control ordering.
3. If the section doesn't exist yet, add it to `sidebars.ts`.

### Adding a new section

Open an issue first to discuss structure before writing content.

## Frontmatter conventions

```yaml
---
title: Page Title
description: One-line description for SEO and link previews.
sidebar_position: 3
---
```

## API reference

`docs/reference/api.md` is **auto-generated** from Go types in the [kubeswarm](https://github.com/kubeswarm/kubeswarm) repo. Do not edit it manually - changes will be overwritten. To update it, modify the Go type comments in `kubeswarm/api/v1alpha1/` and run `make docs-api`.

## Running locally

```bash
npm install
npm run start
```

## Submitting a pull request

1. Fork and create a branch from `main`.
2. Run `npm run build` locally - the build must pass with no broken links.
3. Open a PR with a clear description of what changed.

We use **Rebase and merge** to keep a linear history.

## License

By contributing, you agree your contributions will be licensed under [Apache 2.0](./LICENSE).
