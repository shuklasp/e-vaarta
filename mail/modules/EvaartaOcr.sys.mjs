/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain a copy of the License at http://mozilla.org/MPL/2.0/.
 */

/**
 * e-Vaarta OCR adapter boundary.
 *
 * The desktop client does not bundle an OCR engine here. Instead, this module
 * provides the normalized contract used by the ingestion pipeline. A native,
 * bundled, or remote OCR implementation can register itself without changing
 * workspace or search code.
 */

const { Services } = ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs");

const OCR_BACKEND_PREF = "mail.evaarta.ocr.backend";

let backend = null;

export function registerOcrBackend(adapter) {
  if (!adapter || typeof adapter.extractText !== "function") {
    throw new TypeError("OCR adapter must implement extractText(source).");
  }
  backend = adapter;
}

export function getOcrBackend() {
  return backend;
}

export function isOcrAvailable() {
  return !!backend;
}

export function setConfiguredOcrBackend(name) {
  Services.prefs.setStringPref(OCR_BACKEND_PREF, name || "");
}

export function getConfiguredOcrBackend() {
  try {
    return Services.prefs.getStringPref(OCR_BACKEND_PREF, "");
  } catch {
    return "";
  }
}

/**
 * Extract OCR text using the registered adapter.
 *
 * The adapter may return a string or:
 *   { text, pages, language, confidence }
 */
export async function extractOcrText(source) {
  if (!backend) return null;
  const result = await backend.extractText(source);
  if (typeof result === "string") {
    return { text: result, pages: [], language: "", confidence: null };
  }
  if (!result || typeof result.text !== "string") {
    throw new TypeError("OCR adapter returned an invalid result.");
  }
  return {
    text: result.text,
    pages: result.pages || [],
    language: result.language || "",
    confidence: result.confidence ?? null,
  };
}
