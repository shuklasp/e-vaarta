/* MPL-2.0 */
/** Cross-device capture contract for scan, voice and mobile evidence intake. */
export const CaptureType = Object.freeze({ CAMERA: "camera", SCAN: "scan", VOICE: "voice", PHOTO: "photo" });
export function createCapture({ id, type, uri, sourceId = null, transcript = null, ocrText = null }) {
  if (!id || !uri || !Object.values(CaptureType).includes(type)) throw new TypeError("invalid capture");
  return Object.freeze({ id, type, uri, sourceId, transcript, ocrText });
}
export function createCaptureEvidence({ captureId, quote, confidence = 1, anchor = null }) {
  if (!captureId || !quote) throw new TypeError("captureId and quote are required");
  return Object.freeze({ captureId, quote, confidence, anchor: anchor ? structuredClone(anchor) : null });
}
