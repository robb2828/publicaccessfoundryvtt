import { MoveRoll } from '../rolls/move-roll.js';
import PAConfig from '../config.js';

/**
 * A simple dialog for resolving the Answer a Question move.  The user is
 * prompted to input the complexity of the question and the number of clues
 * being used.  The modifier is calculated as clues minus complexity and a
 * roll is performed.  This does not currently reference or update any
 * Mystery journal data.
 */
export class AnswerQuestionDialog extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'answer-question-dialog',
      classes: ['publicaccess', 'dialog'],
      template: 'systems/publicaccess/module/templates/apps/answer-question.hbs',
      title: 'Answer a Question',
      width: 350,
      height: 'auto',
      resizable: true
    });
  }

  getData(options = {}) {
    return {
      actor: this.actor,
      abilities: PAConfig.ABILITIES
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.roll-answer').on('click', async ev => {
      const form = html[0].querySelector('form');
      const clues = Number(form.elements['clues'].value) || 0;
      const complexity = Number(form.elements['complexity'].value) || 0;
      const modifier = clues - complexity;
      await MoveRoll.rollAnswer(this.actor, modifier);
      this.close();
    });
  }
}