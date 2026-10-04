/* MPL-2.0 */
import { strict as Assert } from "node:assert";
import { encodeFrame, decodeFrames, EvaartaAttachmentAssembler, createAttachmentTransfer } from "../modules/EvaartaNativeTransport.sys.mjs";

add_task(async function testNativeTransportFrames() {
  const frame = encodeFrame({ type: "ping", value: 1 });
  const { frames, remainder } = decodeFrames(frame);
  Assert.deepEqual(frames, [{ type: "ping", value: 1 }]);
  Assert.equal(remainder.length, 0);
});

add_task(async function testAttachmentChunkRoundTrip() {
  const source = new Uint8Array(700000);
  source.forEach((_, i) => source[i] = i % 251);
  const transfer = createAttachmentTransfer({ attachmentId: "a1", bytes: source });
  const assembler = new EvaartaAttachmentAssembler({ attachmentId: "a1", total: transfer.total });
  for (const chunk of transfer.chunks) Assert.equal(assembler.add(chunk), chunk.index === transfer.total - 1);
  Assert.deepEqual(assembler.assemble(), source);
});
