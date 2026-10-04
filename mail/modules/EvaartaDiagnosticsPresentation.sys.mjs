/* MPL-2.0 */
export function presentDiagnostics(result){return{healthy:Boolean(result?.healthy),errors:result?.counts?.errors||0,warnings:result?.counts?.warnings||0,issues:result?.issues||[]}}