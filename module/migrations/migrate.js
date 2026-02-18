/**
 * Migration script for Public Access.  This file provides a place to define
 * migrations that run when the system version is bumped.  It is not
 * currently used but exists to satisfy the system plan and can be extended
 * in future releases.
 */
export async function migrateWorld() {
  // Example: iterate over all latchkey actors and add missing fields
  for (const actor of game.actors) {
    if (actor.type !== 'latchkey') continue;
    // Put migration code here.  For now, there is nothing to migrate.
  }
  console.log('Public Access | Migration complete');
}

Hooks.on('ready', async function() {
  // Compare stored schema version with current version and run migrations if needed.
  // This skeleton does not implement version tracking.  Add migration calls here
  // when updating the system.
});