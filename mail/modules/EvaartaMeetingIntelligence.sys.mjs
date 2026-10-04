/* MPL-2.0 */
export function extractActions(transcript){const lines=String(transcript??"").split(/\r?\n/);return lines.filter(l=>/\b(action|todo|to-do|will|need to|deadline|by)\b/i.test(l)).map((text,i)=>({id:`action-${i+1}`,text:text.trim(),sourceLine:i+1,provenance:{kind:"transcript",line:i+1}}));}
export function meetingSummary({transcript,decisions=[],actions=[]}={}){return {schema:"evaarta.meeting.v1",summary:String(transcript??"").split(/\s+/).slice(0,80).join(" "),decisions,actions:actions.length?actions:extractActions(transcript)};}
