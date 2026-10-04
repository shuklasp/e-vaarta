/* MPL-2.0 */
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const EVAARTA_FRAME_VERSION = 1;

export function encodeFrame(message) {
  const body = JSON.stringify({ version: EVAARTA_FRAME_VERSION, message });
  const bytes = textEncoder.encode(body);
  const frame = new Uint8Array(4 + bytes.length);
  new DataView(frame.buffer).setUint32(0, bytes.length);
  frame.set(bytes, 4);
  return frame;
}

export function decodeFrames(buffer) {
  const frames = [];
  let offset = 0;
  while (buffer.length - offset >= 4) {
    const length = new DataView(buffer.buffer, buffer.byteOffset + offset, 4).getUint32(0);
    if (buffer.length - offset - 4 < length) break;
    const json = textDecoder.decode(buffer.subarray(offset + 4, offset + 4 + length));
    const parsed = JSON.parse(json);
    if (parsed.version !== EVAARTA_FRAME_VERSION) {
      throw new Error("unsupported e-Vaarta transport frame version");
    }
    frames.push(parsed.message);
    offset += 4 + length;
  }
  return { frames, remainder: buffer.slice(offset) };
}

export class EvaartaNativePeerTransport {
  constructor({ channelFactory, clock = () => Date.now() }) {
    this.channelFactory = channelFactory;
    this.clock = clock;
  }

  async send(peer, envelope) {
    const channel = await this.channelFactory.connect(peer);
    try {
      await channel.write(encodeFrame(envelope));
      return { status: "accepted", sentAt: this.clock() };
    } finally {
      await channel.close?.();
    }
  }
}

export class EvaartaPeerDiscoveryBeacon {
  constructor({ actorId, fingerprint, port, transports = [] }) {
    this.actorId = actorId;
    this.fingerprint = fingerprint;
    this.port = port;
    this.transports = [...new Set(transports)];
  }

  toJSON() {
    return {
      protocol: "e-vaarta",
      version: 1,
      actorId: this.actorId,
      fingerprint: this.fingerprint,
      port: this.port,
      transports: this.transports,
    };
  }
}
