/* MPL-2.0 */
export const EVAARTA_ATTACHMENT_CHUNK_SIZE = 256 * 1024;

export function createAttachmentTransfer({ attachmentId, bytes, chunkSize = EVAARTA_ATTACHMENT_CHUNK_SIZE }) {
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    chunks.push({
      attachmentId,
      index: chunks.length,
      total: Math.ceil(bytes.length / chunkSize),
      data: bytes.slice(offset, Math.min(offset + chunkSize, bytes.length)),
    });
  }
  return { attachmentId, size: bytes.length, total: chunks.length, chunks };
}

export class EvaartaAttachmentAssembler {
  constructor({ attachmentId, total }) {
    this.attachmentId = attachmentId;
    this.total = total;
    this.parts = new Map();
  }

  add(chunk) {
    if (chunk.attachmentId !== this.attachmentId || chunk.total !== this.total) {
      throw new Error("attachment chunk does not match transfer");
    }
    if (!Number.isInteger(chunk.index) || chunk.index < 0 || chunk.index >= this.total) {
      throw new Error("invalid attachment chunk index");
    }
    this.parts.set(chunk.index, chunk.data);
    return this.parts.size === this.total;
  }

  assemble() {
    if (this.parts.size !== this.total) throw new Error("attachment transfer incomplete");
    const result = [];
    for (let i = 0; i < this.total; i++) result.push(this.parts.get(i));
    const size = result.reduce((n, part) => n + part.length, 0);
    const output = new Uint8Array(size);
    let offset = 0;
    for (const part of result) {
      output.set(part, offset);
      offset += part.length;
    }
    return output;
  }
}
