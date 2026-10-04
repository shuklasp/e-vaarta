# e-Vaarta project governance

This page describes the project-level governance model for e-Vaarta.

## Principles

- Product and architectural decisions should be documented in the repository.
- Changes to user-visible branding require review because they affect installers,
  application identity, documentation, and localization.
- Security, privacy, accessibility, localization, and release changes should
  receive appropriate specialist review.
- Upstream Mozilla/Thunderbird changes are treated as dependencies and should
  be clearly identified when imported.

## Module ownership

The repository may be organized into module areas such as desktop application,
mail and message storage, calendar and contacts, offline/local-first workspace,
security, extensions, build and release engineering, localization, accessibility,
and documentation.

Each area should have an identified maintainer or review group in the project's
current contributor documentation.

## Upstream relationship

e-Vaarta is an independent product built on substantial inherited Mozilla and
Thunderbird technology. Upstream governance does not define e-Vaarta product
policy; e-Vaarta decisions belong to this project and its maintainers.
