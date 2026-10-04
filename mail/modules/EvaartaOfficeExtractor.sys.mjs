/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Lightweight text extraction for OOXML Office documents.
 *
 * This intentionally handles the XML payloads already packaged inside DOCX
 * and PPTX files. It does not attempt to implement the Office formats.
 */

const { Services } = ChromeUtils.importESModule(
  "resource://gre/modules/Services.sys.mjs"
);

function readZipEntry(zip, name) {
  const stream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(
    Ci.nsIScriptableInputStream
  );
  stream.init(zip.getInputStream(name));
  let output = "";
  try {
    while (stream.available() > 0) {
      output += stream.read(stream.available());
    }
  } finally {
    stream.close();
  }
  return output;
}

function xmlText(xml) {
  try {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) return "";
    return document.documentElement?.textContent || "";
  } catch {
    return "";
  }
}

function fileFromSourceRef(sourceRef) {
  try {
    return Services.io
      .newURI(sourceRef)
      .QueryInterface(Ci.nsIFileURL).file;
  } catch {
    return null;
  }
}

function extractDocx(zip) {
  if (!zip.hasEntry("word/document.xml")) return "";
  return xmlText(readZipEntry(zip, "word/document.xml"))
    .replace(/\s+/g, " ")
    .trim();
}

function extractPptx(zip) {
  const entries = [];
  const iterator = zip.findEntries("ppt/slides/slide*.xml");
  while (iterator.hasMore()) entries.push(iterator.getNext());
  entries.sort((a, b) => {
    const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] || 0);
    const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] || 0);
    return na - nb;
  });
  return entries
    .map(name => xmlText(readZipEntry(zip, name)))
    .filter(Boolean)
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractOfficeText(sourceRef, kind) {
  const file = fileFromSourceRef(sourceRef);
  if (!file || !file.exists() || !file.isFile()) return "";

  const zip = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(
    Ci.nsIZipReader
  );
  try {
    zip.open(file);
    if (kind === "word") return extractDocx(zip);
    if (kind === "powerpoint") return extractPptx(zip);
    return "";
  } catch (error) {
    console.warn("e-Vaarta: Office text extraction failed", error);
    return "";
  } finally {
    try {
      zip.close();
    } catch {}
  }
}
