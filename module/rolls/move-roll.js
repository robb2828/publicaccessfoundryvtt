import PAConfig from '../config.js';

/**
 * Helper class to perform move rolls.  It encapsulates the advantage and
 * disadvantage logic, calculates the appropriate tier from the total and
 * renders a chat card using the designated template.  The result is
 * delivered via ChatMessage and includes flags to facilitate later actions
 * such as turning a key.
 */
export class MoveRoll {
  /**
   * Perform a move roll for an actor.
   *
   * @param {Actor} actor The actor performing the roll.
   * @param {string} ability One of the keys from PAConfig.ABILITIES.
   * @param {Object} opts Options to control the roll.
   * @param {boolean} opts.advantage Whether to roll with advantage (3d6 keep highest 2).
   * @param {boolean} opts.disadvantage Whether to roll with disadvantage (3d6 keep lowest 2).
   * @param {string} moveKey The key of the move definition from PAConfig.MOVES.
   */
  static async roll(actor, ability, { advantage = false, disadvantage = false } = {}, moveKey) {
    // Determine the dice formula based on advantage/disadvantage flags.
    let formula = '2d6';
    if (advantage && !disadvantage) formula = '3d6kh2';
    else if (disadvantage && !advantage) formula = '3d6kl2';
    // Append the ability modifier
    const mod = Number(actor.system.abilities[ability]) || 0;
    const roll = await new Roll(`${formula}+${mod}`).roll({ async: true });
    // Compute tier
    const total = roll.total;
    const tier = PAConfig.tierFromTotal(total);
    // Fetch move data from config
    const move = PAConfig.MOVES[moveKey] || {};
    const resultText = move.results ? move.results[tier] : '';
    // Compile chat card data
    const templateData = {
      actor,
      ability,
      moveKey,
      move,
      rollData: {
        formula: roll.formula,
        total,
        terms: roll.dice[0]?.results || [],
        mod
      },
      tier,
      resultText,
      flags: {
        publicaccess: {
          moveKey,
          ability,
          total,
          tier,
          advantage,
          disadvantage
        }
      }
    };
    // Render the chat card HTML using the Handlebars template
    const html = await renderTemplate('systems/publicaccess/module/templates/chat/move-card.hbs', templateData);
    // Send to chat
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: html,
      flags: templateData.flags
    });
    return roll;
  }

  /**
   * Roll for the Answer a Question move.  This move uses a modifier equal to
   * the number of clues incorporated minus the question complexity.  There is
   * never advantage or disadvantage on this roll.  The moveKey is fixed to
   * 'answer'.
   *
   * @param {Actor} actor The actor performing the roll.
   * @param {number} modifier The integer modifier applied to 2d6.
   */
  static async rollAnswer(actor, modifier) {
    const formula = `2d6+${modifier}`;
    const roll = await new Roll(formula).roll({ async: true });
    const total = roll.total;
    const tier = PAConfig.tierFromTotal(total);
    const move = PAConfig.MOVES['answer'] || {};
    const resultText = move.results ? move.results[tier] : '';
    const templateData = {
      actor,
      ability: null,
      moveKey: 'answer',
      move,
      rollData: {
        formula: roll.formula,
        total,
        mod: modifier,
        terms: roll.dice[0]?.results || []
      },
      tier,
      resultText,
      flags: {
        publicaccess: {
          moveKey: 'answer',
          ability: null,
          total,
          tier,
          advantage: false,
          disadvantage: false
        }
      }
    };
    const html = await renderTemplate('systems/publicaccess/module/templates/chat/move-card.hbs', templateData);
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: html, flags: templateData.flags });
    return roll;
  }
}