/**
 * Custom Actor document for Public Access.  This class encapsulates
 * behaviours unique to latchkey characters such as clamping ability scores,
 * padding key tracks and enforcing condition limits.  It also exposes
 * convenience methods used by the sheet and roll logic.
 */
import PAConfig from '../config.js';

export class LatchkeyActor extends Actor {
  /**
   * Prepare actor system data.  Called by Foundry once per update.
   */
  prepareData() {
    super.prepareData();
    const system = this.system;

    // Ensure abilities exist and fall within the valid range [-3, 3]
    system.abilities = system.abilities || {};
    for (const abil of Object.keys(PAConfig.ABILITIES)) {
      let val = Number(system.abilities[abil]);
      if (isNaN(val)) val = 0;
      // clamp
      val = Math.max(-3, Math.min(3, val));
      system.abilities[abil] = val;
    }

    // Conditions: ensure an array of strings and enforce a maximum length of 3
    if (!Array.isArray(system.conditions)) system.conditions = [];
    system.conditions = system.conditions.map(c => String(c));
    // The actual enforcement of the limit occurs in sheet logic, not here.

    // XP: boxes (0–6)
    if (!system.xp || typeof system.xp.boxes !== 'number') {
      system.xp = { boxes: 0 };
    } else {
      system.xp.boxes = Math.max(0, Math.min(6, system.xp.boxes));
    }

    // Keys: ensure child and desolation tracks of appropriate length and boolean values
    system.keys = system.keys || {};
    for (const track of ['child', 'desolation']) {
      const length = PAConfig.KEY_LENGTHS[track] || 5;
      let arr = system.keys[track];
      if (!Array.isArray(arr)) arr = [];
      arr = arr.map(v => !!v);
      // pad or truncate
      while (arr.length < length) arr.push(false);
      if (arr.length > length) arr = arr.slice(0, length);
      system.keys[track] = arr;
    }
  }

  /**
   * Mark the next available box on a key track.  If no boxes are available
   * returns false.  Otherwise updates the actor and returns true.
   *
   * @param {string} track One of "child" or "desolation".
   * @returns {Promise<boolean>} Whether a box was successfully marked.
   */
  async markKey(track) {
    const system = this.system;
    const arr = system.keys[track];
    if (!Array.isArray(arr)) return false;
    const idx = arr.findIndex(v => !v);
    if (idx === -1) return false;
    arr[idx] = true;
    await this.update({ [`system.keys.${track}`]: arr });
    return true;
  }

  /**
   * Attempt to add a new condition.  Returns false if the actor already has
   * three conditions, true otherwise.  The sheet will use this to decide
   * whether to prompt for turning a key instead.
   *
   * @param {string} condition The condition string to append.
   * @returns {Promise<boolean>} Whether the condition was added.
   */
  async addCondition(condition = '') {
    const system = this.system;
    if (system.conditions.length >= 3) return false;
    const newList = system.conditions.concat([condition]);
    await this.update({ 'system.conditions': newList });
    return true;
  }

  /**
   * Remove a condition at a given index.
   *
   * @param {number} index The index in the conditions array to remove.
   */
  async removeCondition(index) {
    const system = this.system;
    if (index < 0 || index >= system.conditions.length) return;
    const newList = system.conditions.slice();
    newList.splice(index, 1);
    await this.update({ 'system.conditions': newList });
  }
}