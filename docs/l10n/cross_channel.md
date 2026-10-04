# e-Vaarta localization channels

e-Vaarta uses Fluent-based localization and can share the Mozilla localization
tooling used by the inherited mail application.

The product-facing rule is simple: localized UI may translate ordinary interface
text, but the e-Vaarta product name and other protected brand terms remain
unchanged.

## Channel consistency

Release, beta, nightly/development, and test builds should use the same e-Vaarta
brand terms unless a deliberate product-channel distinction is documented.

## Upstream tooling

For details of Mozilla's underlying localization infrastructure, consult the
upstream Mozilla localization documentation. Do not copy upstream product names
into e-Vaarta locale files.
