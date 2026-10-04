/* SPDX-License-Identifier: MPL-2.0 */
import {
  PdfViewMode,
  PdfReadingTheme,
  createPdfReaderState,
  setPdfPage,
  setPdfZoom,
  setPdfRotation,
  setPdfViewMode,
  createPdfSourceAnchor,
  validatePdfReaderState,
} from "resource:///modules/EvaartaPdfReaderModel.sys.mjs";

add_task(function testPdfReaderState() {
  let state = createPdfReaderState({ pageCount: 20 });
  Assert.ok(validatePdfReaderState(state));
  state = setPdfPage(state, 12);
  Assert.equal(state.currentPage, 12);
  Assert.equal(state.readingPosition.page, 12);
  state = setPdfZoom(state, 1.5);
  Assert.equal(state.zoom, 1.5);
  state = setPdfRotation(state, 450);
  Assert.equal(state.rotation, 90);
  state = setPdfViewMode(state, PdfViewMode.READING);
  Assert.equal(state.viewMode, PdfViewMode.READING);
  Assert.throws(() => setPdfPage(state, 21), /outside/);
  Assert.throws(() => setPdfZoom(state, 99), /zoom/);
  Assert.throws(() => setPdfViewMode(state, "bad"), /unsupported/);
  state = { ...state, theme: PdfReadingTheme.DARK };
  Assert.ok(validatePdfReaderState(state));
});

add_task(function testPdfSourceAnchor() {
  const anchor = createPdfSourceAnchor({
    documentId: "doc-1",
    page: 4,
    rects: [{ x: 10, y: 20, width: 100, height: 12 }],
    text: "e-Vaarta evidence",
    structurePath: ["article", "section-2", "paragraph-4"],
  });
  Assert.equal(anchor.documentId, "doc-1");
  Assert.equal(anchor.page, 4);
  Assert.equal(anchor.rects[0].width, 100);
  Assert.equal(anchor.structurePath[2], "paragraph-4");
});
