import PAConfig from '../config.js';

/**
 * A small application that displays the current phase of play and allows the
 * GM or authorised players to advance to the next phase.  The phase
 * persists as a world setting and cycles through the Dawn → Day → Dusk →
 * Night loop.  Additional automation (such as handling tapes) can be built
 * atop this simple manager.
 */
export class PhaseTracker extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'phase-tracker',
      title: 'Phase Tracker',
      template: 'systems/publicaccess/module/templates/apps/phase-tracker.hbs',
      classes: ['publicaccess', 'phase-tracker'],
      width: 300,
      height: 'auto',
      top: 100,
      left: 100,
      resizable: true
    });
  }

  getData(options = {}) {
    const current = game.settings.get(PAConfig.ID, 'phase') || 'dawn';
    const phaseList = PAConfig.PHASES.map(p => ({ name: p, current: p === current }));
    return {
      currentPhase: current,
      phaseList
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.phase-next').on('click', () => this._advancePhase());
  }

  async _advancePhase() {
    const current = game.settings.get(PAConfig.ID, 'phase') || 'dawn';
    const idx = PAConfig.PHASES.indexOf(current);
    const next = PAConfig.PHASES[(idx + 1) % PAConfig.PHASES.length];
    await game.settings.set(PAConfig.ID, 'phase', next);
    this.render();
    ui.notifications.info(`Phase advances to ${next}.`);
  }
}