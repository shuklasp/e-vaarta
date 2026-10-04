# Migrating strings to Fluent

e-Vaarta uses Fluent for new localized UI strings. Legacy DTD and properties
files remain where compatibility with inherited components requires them.

## Migration principles

- New e-Vaarta UI should use Fluent.
- Preserve brand terms such as brand-shorter-name as e-Vaarta brand references.
- Keep migration recipes close to the change they support.
- Test migrations against all supported locales before release.

The underlying migration APIs are inherited from Mozilla tooling, so upstream
Fluent migration documentation may be used as a technical reference.

## Example

A legacy string such as:

    <!ENTITY update.updateButton.label3 "Restart to update &brandShorterName;">

should migrate to a Fluent term such as:

    update-update-button = Restart to update { -brand-shorter-name }

The resulting UI will use the e-Vaarta brand without hard-coding the product
name into individual translations.
