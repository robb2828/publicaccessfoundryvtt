import PAConfig from './config.js';
import { LatchkeyActor } from './actor/actor.js';
import { LatchkeySheet } from './sheets/latchkey-sheet.js';
import { MoveRoll } from './rolls/move-roll.js';
import { AnswerQuestionDialog } from './apps/answer-question.js';
import { PhaseTracker } from './apps/phase-tracker.js';

/*
 * Entry point for the Public Access system.  Registers custom actor and sheet
 * classes, initialises system settings and defines a handful of helper
 * utilities used across the system.  Also wires up chat message actions such
 * as turning a key.
 */

Hooks.once('init', async function() {
  console.log('Public Access | Initialising system');

  // Create namespace on game to expose config and utils
  game.pa = {
    PAConfig,
    utils: {}
  };

  // Register system settings
  registerSettings();

  // Register our custom actor class.  We only have one actor type, so
  // overriding the documentClass globally is acceptable.
  CONFIG.Actor.documentClass = LatchkeyActor;

  // #region agent log
  try {
    fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'publicaccess.js:pre-register',message:'Before sheet registration',data:{configId:PAConfig.ID,hasLatchkeySheet:!!LatchkeySheet},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // Register our actor sheet for both types so the sheet opens regardless of
    // whether the actor was created as "latchkey" or "character" (default in UI).
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(PAConfig.ID, LatchkeySheet, { types: ['latchkey', 'character'], makeDefault: true });
    fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'publicaccess.js:post-register',message:'After sheet registration',data:{},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  } catch (e) {
    fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'publicaccess.js:register-error',message:'Sheet registration threw',data:{error:String(e),stack:e?.stack},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    throw e;
  }
  const sheetClasses = typeof CONFIG?.Actor?.sheetClasses !== 'undefined' ? Object.keys(CONFIG.Actor.sheetClasses) : [];
  const typesForPublicaccess = typeof CONFIG?.Actor?.sheetClasses?.[PAConfig.ID] !== 'undefined' ? Object.keys(CONFIG.Actor.sheetClasses[PAConfig.ID]) : [];
  fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'publicaccess.js:registry-state',message:'Sheet registry after register',data:{sheetClasses,typesForPublicaccess},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Provide utility functions
  game.pa.utils.promptAbility = promptAbility;
  game.pa.utils.promptAdvantage = promptAdvantage;
  game.pa.utils.requestTurnKey = requestTurnKey;

  // Provide UI helpers
  game.pa.utils.openAnswerDialog = actor => {
    const dlg = new AnswerQuestionDialog(actor);
    dlg.render(true);
    return dlg;
  };
  game.pa.utils.openPhaseTracker = () => {
    const app = new PhaseTracker();
    app.render(true);
    return app;
  };
});

// #region agent log
Hooks.on('renderApplication', (app, _element, _data) => {
  const doc = app.document ?? app.object;
  const isActor = doc?.documentName === 'Actor' || app.actor != null;
  if (!isActor) return;
  const actor = app.actor ?? app.object;
  fetch('http://127.0.0.1:7244/ingest/500dc1ef-7276-42a2-91d0-660fde5646b9',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'20a726'},body:JSON.stringify({sessionId:'20a726',location:'publicaccess.js:renderApplication',message:'Actor sheet rendered',data:{actorType:actor?.type,actorId:actor?.id,sheetClass:app.constructor?.name,isActorSheet:app instanceof ActorSheet},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
});
// #endregion

/**
 * Register configurable settings for this system.  Currently only one
 * setting is exposed, controlling whether corner items become sticky once
 * marked.  Additional settings can be added here as needed.
 */
function registerSettings() {
  game.settings.register(PAConfig.ID, 'cornerSticky', {
    name: 'Corner Items Are Sticky',
    hint: 'If enabled, players cannot unmark a corner item once it has been marked (only the GM can).',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(PAConfig.ID, 'phase', {
    name: 'Current Phase',
    scope: 'world',
    config: false,
    type: String,
    default: 'dawn'
  });
}

/**
 * Prompt the user to choose one of the actor's abilities.  Returns the
 * selected key or null if the prompt was cancelled.
 *
 * @param {Actor} actor The actor from which abilities are drawn.
 * @returns {Promise<string|null>}
 */
async function promptAbility(actor) {
  return new Promise(resolve => {
    const buttons = {};
    for (const [key, label] of Object.entries(PAConfig.ABILITIES)) {
      buttons[key] = {
        label,
        callback: () => resolve(key)
      };
    }
    const d = new Dialog({
      title: 'Choose Ability',
      content: '<p>Select the ability used for this roll.</p>',
      buttons,
      default: 'presence',
      close: () => resolve(null)
    });
    d.render(true);
  });
}

/**
 * Prompt for advantage or disadvantage.  Presents a dialog with three
 * mutually exclusive choices: normal, advantage or disadvantage.  Returns
 * an object with two boolean flags.
 *
 * @returns {Promise<{advantage: boolean, disadvantage: boolean}>}
 */
async function promptAdvantage() {
  return new Promise(resolve => {
    const d = new Dialog({
      title: 'Advantage/Disadvantage',
      content: '<p>Roll normally, with advantage (take highest two) or disadvantage (take lowest two)?</p>',
      buttons: {
        normal: {
          label: 'Normal',
          callback: () => resolve({ advantage: false, disadvantage: false })
        },
        advantage: {
          label: 'Advantage',
          callback: () => resolve({ advantage: true, disadvantage: false })
        },
        disadvantage: {
          label: 'Disadvantage',
          callback: () => resolve({ advantage: false, disadvantage: true })
        }
      },
      default: 'normal',
      close: () => resolve({ advantage: false, disadvantage: false })
    });
    d.render(true);
  });
}

/**
 * Prompt the user to choose which key track to mark when turning a key.
 * Once a track is selected, marks the first unmarked box on that track.  If
 * all boxes are filled on both tracks, nothing happens.  The result of the
 * original roll is then bumped up one tier if possible and a follow‑up
 * message is posted to chat summarising the new outcome.
 *
 * @param {LatchkeyActor} actor The actor turning a key.
 * @param {Object} opts Additional context, such as the reason for the key
 *   turn.  Currently unused but reserved for future use.
 */
async function requestTurnKey(actor, opts = {}) {
  // Determine which tracks still have space
  const system = actor.system;
  const tracks = {};
  for (const track of ['child', 'desolation']) {
    const arr = system.keys[track];
    const hasSpace = Array.isArray(arr) && arr.some(v => !v);
    if (hasSpace) tracks[track] = track;
  }
  if (!Object.keys(tracks).length) {
    ui.notifications.warn('No keys available to turn.');
    return;
  }
  return new Promise(resolve => {
    const buttons = {};
    for (const track of Object.keys(tracks)) {
      const label = track === 'child' ? 'Key of the Child' : 'Key of Desolation';
      buttons[track] = {
        label,
        callback: async () => {
          const success = await actor.markKey(track);
          if (success) {
            ui.notifications.info(`${actor.name} turns the ${label}.`);
            resolve(track);
          } else {
            resolve(null);
          }
        }
      };
    }
    const d = new Dialog({
      title: 'Turn a Key',
      content: '<p>Select which key you wish to turn to change the outcome.</p>',
      buttons,
      default: Object.keys(tracks)[0],
      close: () => resolve(null)
    });
    d.render(true);
  });
}

// Chat message hook: attach listener for the turn key button after the card
Hooks.on('renderChatMessage', (message, html, data) => {
  html.find('.pa-turn-key').each((_, elem) => {
    elem.addEventListener('click', async event => {
      event.preventDefault();
      const button = event.currentTarget;
      // Identify the actor from the data attribute on the card
      const card = button.closest('.pa-chat-card');
      const actorId = card?.dataset?.actorId;
      if (!actorId) return;
      const actor = game.actors.get(actorId);
      if (!actor) return;
      // Turn a key
      const track = await game.pa.utils.requestTurnKey(actor, { reason: 'turnKeyButton' });
      if (!track) return;
      // Retrieve flags from the original roll to compute new tier
      const flags = message.flags?.publicaccess;
      if (!flags) return;
      const { moveKey, ability, total } = flags;
      // Increase total to next tier boundary
      let newTier;
      const t = PAConfig.tierFromTotal(total);
      if (t === 'miss') newTier = 'weak';
      else if (t === 'weak') newTier = 'strong';
      else if (t === 'strong') newTier = 'crit';
      else newTier = 'crit';
      const move = PAConfig.MOVES[moveKey] || {};
      const resultText = move.results ? move.results[newTier] : '';
      // Compose follow‑up message
      const content = `<div class="pa-chat-key-turn"><p><strong>${actor.name}</strong> turns a key, changing the outcome from ${t} to ${newTier}.</p><p>${resultText}</p></div>`;
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content
      });
    });
  });
});