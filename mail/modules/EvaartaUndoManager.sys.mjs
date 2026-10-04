export class EvaartaUndoManager {
  constructor(limit = 100) {
    this.limit = Math.max(1, limit);
    this.undoStack = [];
    this.redoStack = [];
  }
  record(mutation) {
    this.undoStack.push(mutation);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack = [];
  }
  undo() {
    const mutation = this.undoStack.pop() || null;
    if (mutation) this.redoStack.push(mutation);
    return mutation;
  }
  redo() {
    const mutation = this.redoStack.pop() || null;
    if (mutation) this.undoStack.push(mutation);
    return mutation;
  }
  clear() { this.undoStack = []; this.redoStack = []; }
}
