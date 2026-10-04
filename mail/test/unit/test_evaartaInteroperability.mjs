/* MPL-2.0 */
import {strict as Assert} from "node:assert";
import {encodeWire,decodeWire} from "../modules/EvaartaWireCodec.sys.mjs";
import {nextAttachmentChunks} from "../modules/EvaartaAttachmentAck.sys.mjs";
add_task(async function testWireRoundTrip(){const value={projectId:"p1",events:["e1","e2"]};Assert.deepEqual(decodeWire(encodeWire(value)),value);});
add_task(async function testAttachmentResume(){Assert.deepEqual(nextAttachmentChunks(5,[0,2,4]),[1,3]);});
