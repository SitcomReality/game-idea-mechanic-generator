import mechanics from './taxonomy/mechanics.js';
import narrativeTheme from './taxonomy/narrativeTheme.js';
import settingContext from './taxonomy/settingContext.js';
import gameEconomy from './taxonomy/gameEconomy.js';
import progression from './taxonomy/progression.js';
import ui from './taxonomy/ui.js';
import socialMultiplayer from './taxonomy/socialMultiplayer.js';

// Load the taxonomy data by combining imports
export function loadTaxonomy() {
  // Combine the imported taxonomy parts into a single object
  // Using Promise.resolve to keep the async signature expected by main.js
  return Promise.resolve({
    "Mechanic": mechanics,
    "Narrative Theme": narrativeTheme,
    "Setting/Context": settingContext,
    "Game Economy": gameEconomy,
    "Progression": progression,
    "UI": ui,
    "Social/Multiplayer": socialMultiplayer
  });
}