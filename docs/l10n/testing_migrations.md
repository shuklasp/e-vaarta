# Testing localization migrations

Run the repository's migration test command for the recipe under development.
The exact command depends on the migration tooling enabled by the current build.

Before merging a localization change:

- verify the recipe runs without errors;
- inspect the generated diff;
- verify that e-Vaarta brand terms remain unchanged;
- test representative locales;
- build the affected UI where practical.

The migration framework is inherited from Mozilla infrastructure, but the
expected product output is e-Vaarta.
