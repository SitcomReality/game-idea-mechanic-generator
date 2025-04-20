// Load the taxonomy data
export async function fetchTaxonomy() {
  // In a real application, you would fetch this from a server
  // For now, we'll return a hardcoded taxonomy

  return {
    "Mechanic": {
      "Player Controlled Character": {
        "PC Abilities": {
          "Movement": {},
          "Combat": {},
          "Social": {},
          "Stealth": {},
          "Magic/Special Powers": {}
        },
        "PC Stats/Resources": {
          "Hit Points": {},
          "Energy/Mana": {},
          "Stamina": {},
          "Experience Points": {},
          "RPG-Style Stats": {
            "Strength": {},
            "Dexterity": {},
            "Constitution": {},
            "Intelligence": {},
            "Wisdom": {},
            "Charisma": {}
          }
        }
      },
      "NPCs": {
        "NPC Abilities": {
          "Combat": {},
          "Social": {},
          "Support": {}
        },
        "NPC Stats/Resources": {
          "Hit Points": {},
          "Energy/Mana": {},
          "Morale": {}
        },
        "NPC AI": {
          "Goals/Drives/Needs": {},
          "Schedules": {},
          "Reactions": {
            "To Player Actions": {},
            "To Environment": {},
            "To Other NPCs": {}
          }
        },
        "NPC Spawn Conditions": {}
      },
      "Combat": {
        "Real-time": {},
        "Turn-based": {},
        "Tactical": {},
        "Specific Combat Mechanics": {
          "Aiming/Targeting": {},
          "Cover": {},
          "Weapon Types": {},
          "Damage Types": {},
          "Status Effects": {}
        }
      },
      "Game Environment": {
        "Discrete Levels": {
          "Multi-Level": {},
          "One Room": {}
        },
        "Open World Sandbox": {
          "Instances/Dungeons": {},
          "Procedurally Generated": {},
          "Hand-crafted": {}
        },
        "Weather & Day/Night": {},
        "Destructible Environment": {},
        "Construction": {}
      },
      "Inventory": {
        "Grid-based": {},
        "Slot-based": {},
        "Weight-based": {},
        "Unlimited": {}
      },
      "Building": {
        "Base Building": {},
        "City Building": {},
        "Vehicle Construction": {}
      },
      "Management": {
        "Resource Management": {},
        "City/Colony Management": {},
        "Team Management": {}
      },
      "Card-Based": {
        "Deckbuilding": {},
        "Hand Management": {},
        "Card Drafting": {}
      }
    },
    "Narrative Theme": {
      "Romance": {},
      "Horror": {
        "Psychological": {},
        "Survival": {},
        "Cosmic": {}
      },
      "Mystery": {},
      "Political Corruption": {},
      "War": {},
      "Coming of Age": {},
      "Revenge": {},
      "Exploration": {},
      "Survival": {}
    },
    "Setting/Context": {
      "Narrative Setting": {
        "Science Fiction": {
          "Near Future": {},
          "Cyberpunk": {},
          "Space Opera": {},
          "Post-Apocalyptic": {}
        },
        "Fantasy": {
          "High Fantasy": {},
          "Low Fantasy": {},
          "Urban Fantasy": {},
          "Dark Fantasy": {}
        },
        "Historical": {
          "Medieval": {},
          "Renaissance": {},
          "Victorian": {},
          "World War Era": {}
        },
        "Contemporary": {}
      },
      "Location": {
        "Urban": {},
        "Rural": {},
        "Wilderness": {},
        "Space": {},
        "Underground": {},
        "Underwater": {}
      }
    },
    "Game Economy": {
      "Currency Systems": {},
      "Crafting": {},
      "Trading": {},
      "Loot Systems": {}
    },
    "Progression": {
      "Level-Based": {},
      "Skill Tree": {},
      "Equipment-Based": {},
      "Story Milestones": {}
    },
    "UI": {
      "HUD Elements": {},
      "Menu Systems": {},
      "Map/Navigation": {}
    },
    "Social/Multiplayer": {
      "Cooperative": {},
      "Competitive": {},
      "MMO Features": {},
      "Shared World": {}
    }
  };
}

