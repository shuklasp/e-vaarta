/* MPL-2.0 */
export const CALENDAR_PROVIDER=Object.freeze({CALDAV:"caldav",EXCHANGE:"exchange",GOOGLE:"google",LOCAL:"local"});
export const CALENDAR_OPERATION=Object.freeze({LIST:"list",GET:"get",CREATE:"create",UPDATE:"update",DELETE:"delete",FREE_BUSY:"free-busy",RSVP:"rsvp"});
export function createCalendarAdapter({id,provider,capabilities=[],credentialRef=null}={}){return Object.freeze({schema:"evaarta.calendar-adapter.v1",id,provider,capabilities:[...new Set(capabilities)],credentialRef,canonicalState:"local-calendar-model"});}
export function calendarRequest({adapter,operation,eventId=null,payload=null}={}){if(!adapter?.capabilities?.includes(operation))return {allowed:false,reason:"unsupported-operation"};return {allowed:true,provider:adapter.provider,operation,eventId,payload};}
export function normalizeCalendarEvent({provider,externalId,title,start,end,timezone="UTC",attendees=[],recurrence=null}={}){return {schema:"evaarta.external-calendar-event.v1",provider,externalId,title,start,end,timezone,attendees,recurrence,provenance:{provider,externalId}};}
export function mergeFreeBusy(sources=[]){return sources.flat().sort((a,b)=>new Date(a.start)-new Date(b.start)).reduce((out,item)=>{const prev=out[out.length-1];if(prev&&new Date(item.start)<=new Date(prev.end)){if(new Date(item.end)>new Date(prev.end))prev.end=item.end;}else out.push({...item});return out;},[]);}
