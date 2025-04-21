// This module loads word lists from the data directory
// Simulating loading from a hierarchical file structure

export async function getWordlists() {
  // In a real application, you would dynamically load these from files/directories
  // matching the taxonomy structure.
  // For now, we return a hardcoded hierarchical structure.
  // The '_terms' key holds the list of terms for that specific node.
  return {
    "Mechanic": {
      "Player Controlled Character": {
        "PC Abilities": {
          "Movement": {
            "_terms": [
              { text: "Wall Running", description: "Players can run along vertical surfaces for a limited time" },
              { text: "Grappling Hook", description: "Tool that allows players to swing across gaps or climb to heights" }
            ]
          },
          "Stealth": {
            "_terms": [
              { text: "Stealth Takedowns", description: "Quietly eliminating enemies without alerting others" }
            ]
          },
          "Magic/Special Powers": {
            "_terms": [
              { text: "Time Manipulation", description: "Ability to slow down, speed up, or rewind time" }
            ]
          }
        },
        "PC Stats/Resources": {
          "_terms": [
             { text: "Hunger/Thirst Meters", description: "Survival needs that must be satisfied regularly" },
             { text: "Sanity System", description: "Mental health meter that affects perception and abilities" }
          ]
        }
      },
      "NPCs": {
        "NPC AI": {
          "Schedules": {
            "_terms": [
              { text: "NPC Schedules", description: "Non-player characters follow daily routines and activities" }
            ]
          },
          "Reactions": {
            "To Player Actions": {
               _terms: [
                 { text: "Relationship Building", description: "Developing bonds with NPCs that affect gameplay" }
               ]
            }
          }
        }
      },
      "Combat": {
        "Specific Combat Mechanics": {
          "Cover": {
            "_terms": [
              { text: "Cover System", description: "Ability to take cover behind objects to avoid damage" }
            ]
          }
        }
      },
      "Game Environment": {
        "Weather & Day/Night": {
          "_terms": [
            { text: "Day/Night Cycle", description: "Game world transitions between day and night, affecting gameplay" },
            { text: "Dynamic Weather", description: "Weather changes that affect gameplay mechanics and visuals" }
          ]
        },
         "Procedurally Generated": {
            _terms: [
              { text: "Procedural Quest Generation", description: "Automatically created missions based on templates and variables" }
            ]
         }
      },
      "Building": {
        "Base Building": {
          "_terms": [
            { text: "Base Building", description: "Creating and upgrading a home base with various facilities" }
          ]
        }
      },
      "Game Economy": {
        "Crafting": {
          "_terms": [
            { text: "Resource Gathering", description: "Collecting materials from the environment to use for crafting or building" },
            { text: "Crafting System", description: "Creating items from gathered materials" }
          ]
        },
        "Trading": {
           _terms: [
             { text: "Dynamic Economy", description: "Market prices that fluctuate based on supply and demand" }
           ]
        }
      },
      "Progression": {
         "_terms": [
            { text: "Permadeath", description: "When a character dies, they stay dead and the player must start over" },
            { text: "Morality System", description: "Tracks player choices on a good/evil or similar spectrum" }
         ],
         "Skill Tree": {
            "_terms": [
              { text: "Skill Trees", description: "Branching paths of abilities that players can unlock as they level up" }
            ]
         }
      }
    },
    "Narrative Theme": {
       "_terms": [
           { text: "Betrayal", description: "Narrative focusing on treachery and broken trust" },
           { text: "Redemption", description: "Character journey from wrongdoing to forgiveness or atonement" },
           { text: "Sacrifice", description: "Giving up something valuable for a greater cause" }
       ],
       "Horror": {
           "Psychological": {
               "_terms": [
                   { text: "Isolation", description: "Themes of loneliness and being cut off from others" }
               ]
           }
       },
       "Political Corruption": {
           "_terms": [
               { text: "Corporate Dystopia", description: "World controlled by powerful corporations at the expense of humanity" },
               { text: "Corruption of Power", description: "How authority and influence can corrupt those who wield it" }
           ]
       },
       "War": {
           "_terms": [
               { text: "Post-War Recovery", description: "Rebuilding society after a devastating conflict" }
           ]
       },
       "Exploration": {
           "_terms": [
               { text: "Lost Civilization", description: "Discovering and exploring the remains of a fallen society" }
           ]
       },
       "Survival": {
           "_terms": [
                { text: "Man vs. Nature", description: "Conflict between humans and the natural world" }
           ]
       },
       "Mystery": {
           "_terms": [
                { text: "Memory and Identity", description: "Exploration of self, memory, and personal history" }
           ]
       }
    },
    "Setting/Context": {
      "Narrative Setting": {
        "Science Fiction": {
          "Cyberpunk": {
            "_terms": [
              { text: "Cyberpunk Metropolis", description: "High-tech, low-life urban environment with neon and corporations" }
            ]
          },
          "Post-Apocalyptic": {
            "_terms": [
              { text: "Post-Apocalyptic Wasteland", description: "World after a catastrophic event has destroyed civilization" }
            ]
          }
        },
        "Fantasy": {
          "High Fantasy": {
            "_terms": [
              { text: "Medieval Kingdom", description: "Feudal realm with castles, knights, and possibly magic" },
              { text: "Floating Islands", description: "Chunks of land suspended in the sky, possibly connected by bridges or traversed by airships" }
            ]
          }
        },
        "Historical": {
          "Medieval": {
            "_terms": [
              // Medieval Kingdom is already listed under High Fantasy, avoiding duplicates unless context differs significantly
            ]
          },
          "Victorian": {
            "_terms": [
              { text: "Victorian London", description: "19th century city with fog, gas lamps, and class division" }
            ]
          },
          "World War Era": {
            "_terms": [
              { text: "Alternate Timeline 1940s", description: "Historical setting with different technological or political developments" }
            ]
          }
        }
      },
      "Location": {
        "Space": {
          "_terms": [
            { text: "Abandoned Space Station", description: "Derelict facility floating in space, possibly with dangerous secrets" }
          ]
        },
        "Urban": {
            "_terms": [
              // Cyberpunk Metropolis and Victorian London are already listed under specific settings
            ]
        },
        "Underground": {
          "_terms": [
            { text: "Underground Civilization", description: "Society that exists beneath the surface, with its own rules and culture" }
          ]
        },
        "Wilderness": {
            "_terms": [
                { text: "Dense Rainforest", description: "Lush jungle environment with exotic plants and animals" },
                { text: "Arctic Research Station", description: "Isolated facility in a frozen wasteland, cut off from the world" }
            ]
        }
      }
    },
    "Social/Multiplayer": {
        _terms: [
             { text: "Faction Reputation", description: "Track player standing with different groups in the game world" }
        ]
    },
    "Systems": {
      // Note: Some terms previously under "Systems" are now integrated into more specific Mechanic categories.
      // This section can hold overarching system concepts if needed.
    }
  };
}