// Configuration definitions for the Public Access system.  These objects centralise
// labels, move definitions and constants so that they can be referenced from
// various parts of the code base.  Keeping strings here avoids a lot of
// hard‑coded values sprinkled throughout templates and scripts.

export const PAConfig = {};

/**
 * System ID.  All settings and flags should be namespaced under this key.
 */
PAConfig.ID = 'publicaccess';

/**
 * Mapping of the five core abilities to their human‑readable labels.  The
 * order here is used when rendering the sheet and dialogs.  The values are
 * localisable – ideally the keys are stable and the labels are pulled
 * through Foundry's localisation framework, but for this example they are
 * plain strings.
 */
PAConfig.ABILITIES = {
  vitality: 'Vitality',
  composure: 'Composure',
  reason: 'Reason',
  presence: 'Presence',
  sensitivity: 'Sensitivity'
};

/**
 * The list of phases used by the phase tracker.  Cycling through this list
 * should follow the sequence described in the Public Access rules.
 */
PAConfig.PHASES = ['dawn', 'day', 'dusk', 'night'];

/**
 * Default lengths for the Key of the Child and Key of Desolation tracks.  If
 * the arrays stored on the actor are shorter or longer than these values
 * they will be truncated/padded in the actor's prepareData method.
 */
PAConfig.KEY_LENGTHS = {
  child: 5,
  desolation: 5
};

/**
 * Definitions for the basic moves.  Each move entry defines a label,
 * description and the result text for each of the four outcome tiers.  In
 * practice these strings would be quite long and descriptive; here they are
 * succinct placeholders.  Additional moves can be added to this object and
 * will automatically be available on the sheet.
 */
PAConfig.MOVES = {
  day: {
    key: 'day',
    label: 'Day Move',
    description: 'Confront risk during the daylight hours.',
    results: {
      miss: 'You stumble and things get worse.',
      weak: 'You succeed but at a cost.',
      strong: 'You succeed without complication.',
      crit: 'You exceed expectations with spectacular flair.'
    }
  },
  night: {
    key: 'night',
    label: 'Night Move',
    description: 'Face risk in the dead of night.',
    results: {
      miss: 'The darkness overwhelms you.',
      weak: 'You scrape by but pay a price.',
      strong: 'You pull through unharmed.',
      crit: 'You shine a light on the truth.'
    }
  },
  meddling: {
    key: 'meddling',
    label: 'Meddling Move',
    description: 'Search for clues and uncover secrets.',
    results: {
      miss: 'You find something unexpected and dangerous.',
      weak: 'You find a clue but attract trouble.',
      strong: 'You secure a clue without incident.',
      crit: 'You uncover more than you were looking for.'
    }
  },
  nostalgic: {
    key: 'nostalgic',
    label: 'Nostalgic Move',
    description: 'Share an intimate moment of nostalgia.',
    results: {
      miss: 'Your reminiscence brings you pain.',
      weak: 'You gain insight but feel exposed.',
      strong: 'You feel renewed and connected.',
      crit: 'The past guides you toward the future.'
    }
  },
  answer: {
    key: 'answer',
    label: 'Answer a Question',
    description: 'Put together clues to answer a Mystery question.',
    results: {
      miss: 'Your theory falls apart.',
      weak: 'You reach a tenuous conclusion.',
      strong: 'You present a convincing theory.',
      crit: 'You nail it and reveal the truth.'
    }
  }
};

/**
 * Helper that returns the tier string based on a numerical result.  The total
 * of the roll determines the tier: 6 or less is a miss, 7–9 is a weak hit,
 * 10–11 is a strong hit and 12 or higher is a critical.  This function
 * returns the corresponding key for use with move.result texts.
 *
 * @param {number} total The total rolled value including modifiers.
 * @returns {string} One of 'miss', 'weak', 'strong' or 'crit'.
 */
PAConfig.tierFromTotal = function(total) {
  if (total <= 6) return 'miss';
  if (total <= 9) return 'weak';
  if (total <= 11) return 'strong';
  return 'crit';
};

export default PAConfig;