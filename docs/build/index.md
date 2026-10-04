# Building e-Vaarta

This guide describes building the e-Vaarta desktop application from source.

## Product branding

The active product branding is stored under mail/branding/nightly/ and is
configured by mail/confvars.sh. The branding assets, localized product names,
installer metadata, update links, and application icons in that directory are
e-Vaarta assets.

Do not restore upstream Thunderbird branding when updating these files.

## Build commands

Typical development builds use the standard mach workflow:

    ./mach build
    ./mach run

For source documentation:

    ./mach tb-doc

## Upstream architecture

e-Vaarta inherits substantial code from the Thunderbird mail application and
the Mozilla platform. This is an implementation dependency, not the product
identity. When debugging inherited code, consult the corresponding Mozilla or
Thunderbird upstream documentation as a technical reference.

## Release identity

Builds, installers, update metadata, and user-visible application information
must identify the product as e-Vaarta.
