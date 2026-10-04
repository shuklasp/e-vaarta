/* MPL-2.0 */
export const ACCESSIBILITY_MODE=Object.freeze({KEYBOARD:"keyboard",SCREEN_READER:"screen-reader",REFLOW:"reflow",TEXT_SCALE:"text-scale",HIGH_CONTRAST:"high-contrast",REDUCED_MOTION:"reduced-motion",TOUCH:"touch",SWITCH:"switch"});
export function createAccessibilityProfile({modes=[],textScale=1,reducedMotion=false}={}){return Object.freeze({modes:[...new Set(modes)],textScale,reducedMotion});}
export function accessibilityContract(){return Object.freeze({keyboard:true,screenReader:true,reflow:true,textScale:true,highContrast:true,reducedMotion:true,accessibleForms:true,accessibleExport:true});}
