import PAConfig from '../config.js';
import { MoveRoll } from '../rolls/move-roll.js';

/**
 * Custom sheet for latchkey actors.  This sheet presents the identity, abilities,
 * conditions, XP, keys, corner items and move buttons using an intuitive
 * layout inspired by the Public Access character sheet.  It wires up
 * interactive elements to call helper methods on the actor and global
 * utilities defined in the system entry point.
 */
export class LatchkeySheet extends ActorSheet {
  constructor(...args) {
    super(...args);
    // #region agent log
    const actor = this.actor ?? this.object;
    fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'latchkey-sheet.js:constructor',message:'LatchkeySheet constructed',data:{actorId:actor?.id,actorType:actor?.type,actorName:actor?.name},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['publicaccess', 'sheet', 'actor'],
      template: 'systems/publicaccess/module/templates/actor/latchkey-sheet.hbs',
      width: 800,
      height: 900,
      tabs: []
    });
  }

  /** @override */
  async getData(options) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'latchkey-sheet.js:getData',message:'getData called',data:{actorType:this.actor?.type},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const data = await super.getData(options);
    data.config = PAConfig;
    data.pa = PAConfig;
    // Pass actor system data for the template; add defaults so template never sees undefined
    const system = this.actor.system || {};
    data.system = system.identity
      ? system
      : foundry.utils.mergeObject({ identity: { firstName: '', surname: '', style: '', takesYouBack: ['', '', ''], latchkeyMoveText: '' } }, system);
    // Pull corner items out of embedded items
    data.cornerItems = this.actor.items.filter(i => i.type === 'corner-item');
    // Generate an array of booleans for XP boxes (6 total).  Boxes up to
    // system.xp.boxes are considered checked.
    const xpCount = Number(system.xp?.boxes) || 0;
    data.xpBoxes = Array.from({ length: 6 }, (_, i) => i < xpCount);

    // Build a list of moves to display on the sheet, excluding the special
    // 'answer' move which is handled via a separate dialog.
    data.moveList = Object.entries(PAConfig.MOVES)
      .filter(([k, v]) => k !== 'answer')
      .map(([k, v]) => ({ key: k, label: v.label }));
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'latchkey-sheet.js:getData-return',message:'getData returning',data:{hasSystem:!!data.system},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Only attach listeners if the sheet is editable
    if (!this.options.editable) return;
    // Add condition
    html.find('.condition-add').on('click', ev => this._onAddCondition(ev));
    // Delete condition
    html.find('.condition-delete').on('click', ev => {
      const index = Number(ev.currentTarget.dataset.index);
      this._onRemoveCondition(index);
    });
    // Roll move buttons
    html.find('.pa-roll-move').on('click', ev => {
      const moveKey = ev.currentTarget.dataset.moveKey;
      this._onRollMove(moveKey);
    });
    // Corner item interactions
    html.find('.corner-add').on('click', () => this._onAddCornerItem());
    html.find('.corner-delete').on('click', ev => {
      const id = ev.currentTarget.dataset.itemId;
      this._onDeleteCornerItem(id);
    });
    html.find('.corner-mark-toggle').on('click', ev => {
      const id = ev.currentTarget.dataset.itemId;
      this._onToggleCornerMark(id);
    });

    // Answer a Question button
    html.find('.pa-answer-question').on('click', ev => {
      if (game.pa?.utils?.openAnswerDialog) {
        game.pa.utils.openAnswerDialog(this.actor);
      }
    });
  }

  /**
   * Add a blank condition entry.  If the actor already has three conditions
   * then attempt to invoke the Turn Key workflow instead of adding.
   */
  async _onAddCondition(event) {
    const added = await this.actor.addCondition('');
    if (!added) {
      // Trigger Turn Key prompt since we cannot add more conditions
      if (game.pa?.utils?.requestTurnKey) {
        game.pa.utils.requestTurnKey(this.actor, { reason: 'conditionOverflow' });
      }
    }
  }

  /** Remove a condition by index. */
  async _onRemoveCondition(index) {
    await this.actor.removeCondition(index);
    this.render();
  }

  /**
   * Handler for move roll buttons.  Prompts the user to choose an ability and
   * whether they wish to roll with advantage or disadvantage and then
   * performs the roll.
   */
  async _onRollMove(moveKey) {
    // Ask the user which ability to roll with
    if (!game.pa?.utils?.promptAbility) return;
    const ability = await game.pa.utils.promptAbility(this.actor);
    if (!ability) return;
    // Ask about advantage/disadvantage
    const opts = await game.pa.utils.promptAdvantage();
    await MoveRoll.roll(this.actor, ability, opts, moveKey);
  }

  /**
   * Prompt the user to create a new corner item.  The name will default to
   * "Unnamed Item" if the user cancels.
   */
  async _onAddCornerItem() {
    const result = await Dialog.prompt({
      title: 'Add Corner Item',
      content: '<p>Name your new item:</p><input type="text" name="name" value=""/>',
      label: 'Add',
      callback: html => html.querySelector('input[name=name]').value.trim() || 'Unnamed Item',
      rejectClose: false
    });
    if (!result) return;
    await this.actor.createEmbeddedDocuments('Item', [
      {
        name: result,
        type: 'corner-item',
        system: { marked: false, note: '' }
      }
    ]);
    this.render();
  }

  /** Delete a corner item by id. */
  async _onDeleteCornerItem(id) {
    await this.actor.deleteEmbeddedDocuments('Item', [id]);
    this.render();
  }

  /** Toggle the marked state on a corner item. */
  async _onToggleCornerMark(id) {
    const item = this.actor.items.get(id);
    if (!item) return;
    const sticky = game.settings.get(PAConfig.ID, 'cornerSticky');
    // If the item is marked and sticky is true then players cannot unmark
    if (item.system.marked && sticky && !game.user.isGM) return;
    await item.update({ 'system.marked': !item.system.marked });
    this.render();
  }
}