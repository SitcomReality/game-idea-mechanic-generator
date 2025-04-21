// This module loads word lists from the data directory

export async function getWordlists() {
  // In a real application, you would fetch these from files or a server
  // For now, we'll return hardcoded wordlists
  
  return {
    "Mechanics": [
      {
        text: "Wall Running",
        description: "Players can run along vertical surfaces for a limited time",
        tags: ["Mechanic.Player Controlled Character.PC Abilities.Movement"]
      },
      {
        text: "Time Manipulation",
        description: "Ability to slow down, speed up, or rewind time",
        tags: ["Mechanic.Player Controlled Character.PC Abilities.Magic/Special Powers"]
      },
      {
        text: "Resource Gathering",
        description: "Collecting materials from the environment to use for crafting or building",
        tags: ["Mechanic.Game Economy.Crafting"]
      },
      {
        text: "Grappling Hook",
        description: "Tool that allows players to swing across gaps or climb to heights",
        tags: ["Mechanic.Player Controlled Character.PC Abilities.Movement"]
      },
      {
        text: "Cover System",
        description: "Ability to take cover behind objects to avoid damage",
        tags: ["Mechanic.Combat.Specific Combat Mechanics.Cover"]
      },
      {
        text: "Day/Night Cycle",
        description: "Game world transitions between day and night, affecting gameplay",
        tags: ["Mechanic.Game Environment.Weather & Day/Night"]
      },
      {
        text: "Permadeath",
        description: "When a character dies, they stay dead and the player must start over",
        tags: ["Mechanic.Progression"]
      },
      {
        text: "Base Building",
        description: "Creating and upgrading a home base with various facilities",
        tags: ["Mechanic.Building.Base Building"]
      },
      {
        text: "Skill Trees",
        description: "Branching paths of abilities that players can unlock as they level up",
        tags: ["Mechanic.Progression.Skill Tree"]
      },
      {
        text: "Stealth Takedowns",
        description: "Quietly eliminating enemies without alerting others",
        tags: ["Mechanic.Player Controlled Character.PC Abilities.Stealth"]
      }
    ],
    "Themes": [
      {
        text: "Betrayal",
        description: "Narrative focusing on treachery and broken trust",
        tags: ["Narrative Theme"]
      },
      {
        text: "Man vs. Nature",
        description: "Conflict between humans and the natural world",
        tags: ["Narrative Theme.Survival"]
      },
      {
        text: "Corporate Dystopia",
        description: "World controlled by powerful corporations at the expense of humanity",
        tags: ["Narrative Theme.Political Corruption"]
      },
      {
        text: "Redemption",
        description: "Character journey from wrongdoing to forgiveness or atonement",
        tags: ["Narrative Theme"]
      },
      {
        text: "Isolation",
        description: "Themes of loneliness and being cut off from others",
        tags: ["Narrative Theme.Horror.Psychological"]
      },
      {
        text: "Post-War Recovery",
        description: "Rebuilding society after a devastating conflict",
        tags: ["Narrative Theme.War"]
      },
      {
        text: "Corruption of Power",
        description: "How authority and influence can corrupt those who wield it",
        tags: ["Narrative Theme.Political Corruption"]
      },
      {
        text: "Lost Civilization",
        description: "Discovering and exploring the remains of a fallen society",
        tags: ["Narrative Theme.Exploration"]
      },
      {
        text: "Memory and Identity",
        description: "Exploration of self, memory, and personal history",
        tags: ["Narrative Theme.Mystery"]
      },
      {
        text: "Sacrifice",
        description: "Giving up something valuable for a greater cause",
        tags: ["Narrative Theme"]
      }
    ],
    "Settings": [
      {
        text: "Abandoned Space Station",
        description: "Derelict facility floating in space, possibly with dangerous secrets",
        tags: ["Setting/Context.Location.Space"]
      },
      {
        text: "Medieval Kingdom",
        description: "Feudal realm with castles, knights, and possibly magic",
        tags: ["Setting/Context.Narrative Setting.Fantasy.High Fantasy", "Setting/Context.Narrative Setting.Historical.Medieval"]
      },
      {
        text: "Cyberpunk Metropolis",
        description: "High-tech, low-life urban environment with neon and corporations",
        tags: ["Setting/Context.Narrative Setting.Science Fiction.Cyberpunk", "Setting/Context.Location.Urban"]
      },
      {
        text: "Post-Apocalyptic Wasteland",
        description: "World after a catastrophic event has destroyed civilization",
        tags: ["Setting/Context.Narrative Setting.Science Fiction.Post-Apocalyptic"]
      },
      {
        text: "Underground Civilization",
        description: "Society that exists beneath the surface, with its own rules and culture",
        tags: ["Setting/Context.Location.Underground"]
      },
      {
        text: "Floating Islands",
        description: "Chunks of land suspended in the sky, possibly connected by bridges or traversed by airships",
        tags: ["Setting/Context.Narrative Setting.Fantasy.High Fantasy"]
      },
      {
        text: "Victorian London",
        description: "19th century city with fog, gas lamps, and class division",
        tags: ["Setting/Context.Narrative Setting.Historical.Victorian", "Setting/Context.Location.Urban"]
      },
      {
        text: "Dense Rainforest",
        description: "Lush jungle environment with exotic plants and animals",
        tags: ["Setting/Context.Location.Wilderness"]
      },
      {
        text: "Arctic Research Station",
        description: "Isolated facility in a frozen wasteland, cut off from the world",
        tags: ["Setting/Context.Location.Wilderness"]
      },
      {
        text: "Alternate Timeline 1940s",
        description: "Historical setting with different technological or political developments",
        tags: ["Setting/Context.Narrative Setting.Historical.World War Era"]
      }
    ],
    "Systems": [
      {
        text: "Faction Reputation",
        description: "Track player standing with different groups in the game world",
        tags: ["Social/Multiplayer"]
      },
      {
        text: "Dynamic Weather",
        description: "Weather changes that affect gameplay mechanics and visuals",
        tags: ["Mechanic.Game Environment.Weather & Day/Night"]
      },
      {
        text: "Hunger/Thirst Meters",
        description: "Survival needs that must be satisfied regularly",
        tags: ["Mechanic.Player Controlled Character.PC Stats/Resources"]
      },
      {
        text: "Sanity System",
        description: "Mental health meter that affects perception and abilities",
        tags: ["Mechanic.Player Controlled Character.PC Stats/Resources"]
      },
      {
        text: "Morality System",
        description: "Tracks player choices on a good/evil or similar spectrum",
        tags: ["Mechanic.Progression"]
      },
      {
        text: "Procedural Quest Generation",
        description: "Automatically created missions based on templates and variables",
        tags: ["Mechanic.Game Environment.Procedurally Generated"]
      },
      {
        text: "Crafting System",
        description: "Creating items from gathered materials",
        tags: ["Mechanic.Game Economy.Crafting"]
      },
      {
        text: "NPC Schedules",
        description: "Non-player characters follow daily routines and activities",
        tags: ["Mechanic.NPCs.NPC AI.Schedules"]
      },
      {
        text: "Relationship Building",
        description: "Developing bonds with NPCs that affect gameplay",
        tags: ["Mechanic.NPCs.NPC AI.Reactions.To Player Actions"]
      },
      {
        text: "Dynamic Economy",
        description: "Market prices that fluctuate based on supply and demand",
        tags: ["Mechanic.Game Economy.Trading"]
      }
    ]
  };
}

