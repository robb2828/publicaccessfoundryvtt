/**
 * MoveItem is a lightweight wrapper around the core Item class.  It exists
 * primarily to provide a type for moves stored in compendia and to future
 * proof any automation that might live on moves in a later release.  At
 * present there is no additional behaviour beyond standard Item methods.
 */
export class MoveItem extends Item {
  /**
   * Return the human‑readable label for this move.  If a label is defined in
   * the item name or system data, use that; otherwise fall back to the
   * embedded name.
   */
  get label() {
    return this.system?.label || this.name;
  }
}