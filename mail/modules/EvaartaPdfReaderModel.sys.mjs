/* MPL-2.0 */

/**
 * e-Vaarta PDF Reader semantic contract.
 *
 * This module is renderer-neutral: native PDF engines own glyph/layout rendering,
 * while this model defines the reader experience and stable state shared by
 * desktop/mobile readers and the evidence layer.
 */

export const PdfViewMode = Object.freeze({
  PAGE: "page",
  CONTINUOUS: "continuous",
  TWO_PAGE: "two-page",
  TWO_PAGE_CONTINUOUS: "two-page-continuous",
  FIT_WIDTH: "fit-width",
  FIT_PAGE: "fit-page",
  READING: "reading",
  PRESENTATION: "presentation",
});

export const PdfReadingTheme = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
  SEPIA: "sepia",
  HIGH_CONTRAST: "high-contrast",
  SYSTEM: "system",
});

export const PdfAnnotationKind = Object.freeze({
  HIGHLIGHT: "highlight",
  UNDERLINE: "underline",
  STRIKEOUT: "strikeout",
  NOTE: "note",
  FREE_TEXT: "free-text",
  INK: "ink",
  SHAPE: "shape",
  STAMP: "stamp",
  IMAGE: "image",
  LINK: "link",
  REDACTION: "redaction",
});

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite`);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createPdfReaderState(overrides = {}) {
  return {
    documentId: null,
    pageCount: 0,
    currentPage: 1,
    viewMode: PdfViewMode.CONTINUOUS,
    zoom: 1,
    rotation: 0,
    theme: PdfReadingTheme.SYSTEM,
    sidebar: "thumbnails",
    sidebarWidth: 320,
    search: {
      query: "",
      caseSensitive: false,
      wholeWord: false,
      regex: false,
      currentMatch: 0,
      totalMatches: 0,
    },
    readingPosition: {
      page: 1,
      offset: 0,
      characterOffset: 0,
    },
    presentation: {
      active: false,
      cursorHidden: false,
    },
    accessibility: {
      screenReaderOrder: true,
      textSelection: true,
      keyboardNavigation: true,
      reducedMotion: false,
      textScale: 1,
    },
    ...overrides,
  };
}

export function setPdfPage(state, page) {
  if (!Number.isInteger(page) || page < 1 || page > state.pageCount) {
    throw new RangeError("page is outside the document");
  }
  return { ...state, currentPage: page,
    readingPosition: { ...state.readingPosition, page } };
}

export function setPdfZoom(state, zoom) {
  assertFiniteNumber(zoom, "zoom");
  return { ...state, zoom: clamp(zoom, 0.25, 8) };
}

export function setPdfRotation(state, rotation) {
  if (!Number.isFinite(rotation)) throw new TypeError("rotation must be finite");
  const normalized = ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;
  return { ...state, rotation: normalized };
}

export function setPdfViewMode(state, viewMode) {
  if (!Object.values(PdfViewMode).includes(viewMode)) {
    throw new RangeError("unsupported PDF view mode");
  }
  return { ...state, viewMode };
}

export function setPdfReadingTheme(state, theme) {
  if (!Object.values(PdfReadingTheme).includes(theme)) {
    throw new RangeError("unsupported PDF reading theme");
  }
  return { ...state, theme };
}

export function updatePdfSearch(state, patch) {
  return {
    ...state,
    search: { ...state.search, ...patch, currentMatch: patch.query === undefined
      ? state.search.currentMatch : 0 },
  };
}

/**
 * A renderer can map a visual selection to a stable semantic anchor.
 * The reader never treats page pixels as the only identity of evidence.
 */
export function createPdfSourceAnchor({
  documentId,
  page,
  rects = [],
  text = "",
  textStart = null,
  textEnd = null,
  structurePath = null,
}) {
  if (!documentId) throw new TypeError("documentId is required");
  if (!Number.isInteger(page) || page < 1) throw new RangeError("page must be positive");
  return Object.freeze({
    documentId,
    page,
    rects: rects.map(rect => ({
      x: Number(rect.x) || 0,
      y: Number(rect.y) || 0,
      width: Math.max(0, Number(rect.width) || 0),
      height: Math.max(0, Number(rect.height) || 0),
    })),
    text,
    textStart,
    textEnd,
    structurePath,
  });
}

/**
 * Reader actions are declarative so desktop, Android and iOS can share
 * behavior without sharing a rendering engine.
 */
export function createPdfReaderCommand(type, payload = {}) {
  return Object.freeze({ type, payload: { ...payload } });
}

export function validatePdfReaderState(state) {
  if (!state || typeof state !== "object") return false;
  if (!Number.isInteger(state.currentPage) || state.currentPage < 1) return false;
  if (!Number.isInteger(state.pageCount) || state.pageCount < 0) return false;
  if (state.pageCount > 0 && state.currentPage > state.pageCount) return false;
  if (!Object.values(PdfViewMode).includes(state.viewMode)) return false;
  if (!Object.values(PdfReadingTheme).includes(state.theme)) return false;
  if (!Number.isFinite(state.zoom) || state.zoom < 0.25 || state.zoom > 8) return false;
  return true;
}
