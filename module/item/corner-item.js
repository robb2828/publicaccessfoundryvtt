/**
 * CornerItem represents an item stowed away in the Latchkey's Corner of the
 * House.  When marked it can grant advantage on a move roll.  This class
 * exposes convenience accessors for the marked flag and a toggle method.
 */
export class CornerItem extends Item {
  /**
   * Whether the item has been marked for use.  Marked items cannot normally
   * be unmarked by players (see system setting to override).
   */
  get marked() {
    return !!(this.system?.marked);
  }

  /**
   * Toggle the marked status of the item.  This will flip the boolean and
   * persist the change.  It does not enforce stickiness; the sheet will
   * respect the system setting for whether players can unmark an item.
   */
  async toggleMarked() {
    const newState = !this.marked;
    await this.update({ 'system.marked': newState });
  }
}