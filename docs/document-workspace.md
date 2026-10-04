# e-Vaarta Document Workspace

e-Vaarta extends email with an active-reading workspace for documents, attachments, web pages and messages.

The design is inspired by the **workflow** of active document analysis: source material remains addressable while excerpts, notes and relationships are collected in a separate workspace. It is an independent e-Vaarta implementation; it does not copy LiquidText code, UI assets or proprietary implementation.

## Phase 1: Document Foundation

The first implementation establishes a portable semantic model:

- **Documents** — PDF, Word, PowerPoint, images, web pages and email/attachments.
- **Source anchors** — exact document/page/text locations for evidence.
- **Excerpts** — selected source text that can be placed in a workspace.
- **Notes** — free-form analysis independent of the source document.
- **Annotations** — highlights and other source-bound markings.
- **Links** — semantic relationships between excerpts, notes and annotations.
- **Workspaces** — a project-level container for documents and analysis.
- **Serialization** — a versioned JSON representation suitable for local storage and later sync.

This directly supports the active-reading concepts of extracting content, preserving source context, navigating between sources and arranging relationships in a workspace. citeturn0search0turn0search4

## Workspace object graph

```text
Workspace
 ├── Documents
 │    ├── PDF
 │    ├── Email
 │    └── Attachment
 │
 ├── Items
 │    ├── Excerpt ──> SourceAnchor ──> Document
 │    ├── Note
 │    └── Annotation ──> SourceAnchor ──> Document
 │
 └── Links
      ├── excerpt ── note
      ├── excerpt ── excerpt
      ├── note ── note
      └── annotation ── excerpt
```

The critical invariant is that extracted evidence never loses its source anchor.

## Why this is important for e-Vaarta

An email attachment should become a first-class research source instead of being trapped inside a message. For example:

```text
Email
  └── attachment: Contract.pdf
          └── e-Vaarta Workspace: "Solar Project"
                 ├── excerpt: payment clause
                 ├── note: "verify milestone date"
                 └── link → revised contract excerpt
```

This makes email, documents and reasoning part of one information graph.

## Next implementation steps

1. Add a desktop workspace surface and document pane.
2. Connect message attachments to `createDocument()`.
3. Add persistent local workspace storage.
4. Add PDF text selection and source anchors.
5. Add drag/copy-to-workspace excerpts.
6. Add cross-document linking and contextual navigation.
7. Add Android/iOS implementations against the same serialized model.
8. Add AI retrieval over documents, email and workspace items with source anchors preserved.

The product goal is **e-Vaarta: Email + Documents + Knowledge Workspace**, rather than a separate PDF reader bolted onto an email client.
