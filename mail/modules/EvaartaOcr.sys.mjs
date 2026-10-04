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
const { Subprocess } = ChromeUtils.importESModule("resource://gre/modules/Subprocess.sys.mjs");
const { IOUtils } = ChromeUtils.importESModule("resource://gre/modules/IOUtils.sys.mjs");

const OCR_BACKEND_PREF = "mail.evaarta.ocr.backend";
const OCR_TESSERACT_PATH_PREF = "mail.evaarta.ocr.tesseractPath";
const OCR_TESSERACT_LANG_PREF = "mail.evaarta.ocr.language";

function sourceFile(sourceRef) {
  try {
    return Services.io.newURI(sourceRef).QueryInterface(Ci.nsIFileURL).file;
  } catch {
    return null;
  }
}

async function findTesseract() {
  const configured = Services.prefs.getStringPref(OCR_TESSERACT_PATH_PREF, "");
  const candidates = [
    configured,
    "/usr/bin/tesseract",
    "/usr/local/bin/tesseract",
    "/opt/homebrew/bin/tesseract",
    "C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
    "C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      if (await IOUtils.exists(candidate)) return candidate;
    } catch {}
  }
  return "";
}

async function runTesseract(source, command) {
  const file = sourceFile(source.sourceRef);
  if (!file || !file.exists() || !file.isFile()) return null;
  const language = Services.prefs.getStringPref(OCR_TESSERACT_LANG_PREF, "eng");
  const process = await Subprocess.call({
    command,
    arguments: [file.path, "stdout", "-l", language, "--psm", "3"],
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = process.stdout.readString();
  const stderr = process.stderr.readString();
  const [text, errorText] = await Promise.all([stdout, stderr]);
  const result = await process.wait();
  if (result.exitCode !== 0) {
    throw new Error(errorText || `Tesseract exited with code ${result.exitCode}`);
  }
  return {
    text: text.replace(/\s+/g, " ").trim(),
    pages: [],
    language,
    confidence: null,
  };
}

async function initializeLocalBackend() {
  const command = await findTesseract();
  if (!command) return;
  registerOcrBackend({
    name: "tesseract",
    async extractText(source) {
      if (source.kind !== "image") return null;
      return runTesseract(source, command);
    },
  });
}

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


// Auto-enable a local Tesseract backend when it is installed. This is
// intentionally asynchronous so Thunderbird startup is not blocked.
initializeLocalBackend().catch(error =>
  console.warn("e-Vaarta: Tesseract backend initialization failed", error)
);
