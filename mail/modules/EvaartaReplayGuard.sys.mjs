/* MPL-2.0 */
export class EvaartaReplayGuard { constructor(max=10000){this.max=max;this.ids=new Set();} seen(id){return this.ids.has(id);} accept(id){if(this.ids.has(id))return false;this.ids.add(id);if(this.ids.size>this.max)this.ids.delete(this.ids.values().next().value);return true;} }
