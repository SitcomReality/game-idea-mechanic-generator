const mechanics = {
  "Player Controlled Character": {
    "PC Abilities": {
      "Movement": {
        "Walking/Running": {},
        "Jumping": {},
        "Climbing": {},
        "Swimming": {},
        "Flying": {},
        "Teleportation": {},
        "Dashing/Dodging": {},
        "Wall-running": {},
        "Grappling": {},
        "Swinging": {},
        "Vehicles": {},
        "Mounts": {}
      },
      "Combat": {
        "Melee": {
          "Light/Heavy Attacks": {},
          "Combo System": {},
          "Blocking": {},
          "Parrying": {},
          "Special Moves": {},
          "Weapon Types": {}
        },
        "Ranged": {
          "Aiming": {},
          "Charging Shots": {},
          "Ammunition Types": {},
          "Weapon Types": {},
          "Weapon Modifications": {}
        },
        "Area of Effect": {},
        "Status Effects": {},
        "Stealth Attacks": {},
        "Finishing Moves": {}
      },
      "Social": {
        "Dialogue Choices": {},
        "Persuasion": {},
        "Intimidation": {},
        "Bartering": {},
        "Relationship Building": {},
        "Reputation Systems": {}
      },
      "Stealth": {
        "Hiding": {},
        "Distraction": {},
        "Silent Takedowns": {},
        "Sound Detection": {},
        "Line of Sight": {},
        "Disguises": {}
      },
      "Magic/Special Powers": {
        "Elemental": {},
        "Time Manipulation": {},
        "Mind Control": {},
        "Summoning": {},
        "Transformation": {},
        "Healing": {},
        "Telekinesis": {},
        "Illusion": {},
        "Reality Manipulation": {}
      },
      "Survival": {
        "Hunger/Thirst": {},
        "Temperature": {},
        "Stamina Management": {},
        "Resource Gathering": {},
        "Crafting": {},
        "Shelter Building": {}
      },
      "Traversal Tools": {
        "Hookshot/Grapple": {},
        "Jetpack": {},
        "Portals": {},
        "Parachute/Glider": {},
        "Ziplines": {}
      }
    },
    "PC Stats/Resources": {
      "Hit Points": {
        "Regeneration": {},
        "Shields/Armor": {},
        "Temporary HP": {},
        "Multiple Health Bars": {}
      },
      "Energy/Mana": {
        "Regeneration": {},
        "Consumption": {},
        "Capacity Upgrades": {}
      },
      "Stamina": {
        "Depletion": {},
        "Recovery": {},
        "Endurance Training": {}
      },
      "Experience Points": {
        "Level Up Mechanics": {},
        "Skill Points": {},
        "Ability Unlocks": {}
      },
      "RPG-Style Stats": {
        "Strength": {},
        "Dexterity": {},
        "Constitution": {},
        "Intelligence": {},
        "Wisdom": {},
        "Charisma": {},
        "Luck": {},
        "Perception": {}
      },
      "Status Effects": {
        "Buffs": {},
        "Debuffs": {},
        "Temporary States": {},
        "Persistent Conditions": {}
      },
      "Reputation/Karma": {
        "Faction Standings": {},
        "Morality Systems": {},
        "NPC Reactions": {}
      }
    },
    "Character Customization": {
      "Appearance": {
        "Body Type": {},
        "Face": {},
        "Hair": {},
        "Skin": {},
        "Voice": {}
      },
      "Classes/Archetypes": {
        "Warrior": {},
        "Mage": {},
        "Rogue": {},
        "Support": {},
        "Hybrid": {},
        "Custom": {}
      },
      "Backgrounds/Origin": {},
      "Specializations": {},
      "Skill Loadouts": {}
    }
  },
  "NPCs": {
    "NPC Abilities": {
      "Combat": {
        "Basic Attacks": {},
        "Special Attacks": {},
        "Area Attacks": {},
        "Boss Mechanics": {}
      },
      "Social": {
        "Dialogue": {},
        "Trade": {},
        "Quests": {},
        "Relationships": {}
      },
      "Support": {
        "Healing": {},
        "Buffing": {},
        "Resource Provision": {},
        "Information": {}
      },
      "Movement": {
        "Patrolling": {},
        "Pursuit": {},
        "Evasion": {},
        "Formation": {}
      }
    },
    "NPC Stats/Resources": {
      "Hit Points": {
        "Normal": {},
        "Elite": {},
        "Boss": {}
      },
      "Energy/Mana": {},
      "Morale": {
        "Retreat Behavior": {},
        "Surrender": {},
        "Berserk": {}
      },
      "Level/Power": {
        "Scaling": {},
        "Tiers": {}
      }
    },
    "NPC AI": {
      "Goals/Drives/Needs": {
        "Survival": {},
        "Combat": {},
        "Resource Gathering": {},
        "Social Interaction": {},
        "Protection": {},
        "Territory": {},
        "Curiosity": {}
      },
      "Schedules": {
        "Day/Night Cycle": {},
        "Work Routines": {},
        "Leisure Activities": {},
        "Weather Response": {}
      },
      "Reactions": {
        "To Player Actions": {
          "Hostility Triggers": {},
          "Fear Responses": {},
          "Assistance": {},
          "Memory": {}
        },
        "To Environment": {
          "Hazards": {},
          "Resources": {},
          "Weather": {},
          "Light/Dark": {}
        },
        "To Other NPCs": {
          "Faction Relations": {},
          "Group Behavior": {},
          "Hierarchy": {},
          "Competition": {}
        }
      },
      "Behavior Trees": {},
      "Pathfinding": {},
      "Group Tactics": {},
      "Learning/Adaptation": {}
    },
    "NPC Spawn Conditions": {
      "Time-based": {},
      "Location-based": {},
      "Player Level": {},
      "Player Actions": {},
      "Story Progression": {},
      "Random Encounters": {}
    },
    "NPC Types": {
      "Enemies": {
        "Minions": {},
        "Elites": {},
        "Bosses": {},
        "Mini-bosses": {}
      },
      "Allies": {
        "Companions": {},
        "Followers": {},
        "Mounts": {},
        "Pets": {},
        "Temporary": {}
      },
      "Neutral": {
        "Merchants": {},
        "Quest Givers": {},
        "Trainers": {},
        "Information Sources": {},
        "Ambient": {}
      },
      "Wildlife": {
        "Predators": {},
        "Prey": {},
        "Ambient": {},
        "Resource": {}
      }
    }
  },
  "Combat": {
    "Real-time": {
      "Action Combat": {},
      "Hack and Slash": {},
      "Shooter": {},
      "Soulslike": {}
    },
    "Turn-based": {
      "Traditional": {},
      "Phase-based": {},
      "Action Points": {},
      "Initiative Order": {},
      "Simultaneous": {}
    },
    "Tactical": {
      "Grid-based": {},
      "Free Movement": {},
      "Cover System": {},
      "Flanking": {},
      "Elevation": {},
      "Zone Control": {}
    },
    "Specific Combat Mechanics": {
      "Aiming/Targeting": {
        "Auto-aim": {},
        "Manual Aim": {},
        "Lock-on": {},
        "Tab Targeting": {},
        "Area Targeting": {}
      },
      "Cover": {
        "Snap-to-cover": {},
        "Dynamic Cover": {},
        "Cover Destruction": {},
        "Partial Cover": {}
      },
      "Weapon Types": {
        "Melee Weapons": {},
        "Ranged Weapons": {},
        "Magical Implements": {},
        "Improvised Weapons": {},
        "Vehicles as Weapons": {}
      },
      "Damage Types": {
        "Physical": {},
        "Elemental": {},
        "Magic": {},
        "Status Effect": {},
        "Environmental": {},
        "True/Pure": {}
      },
      "Status Effects": {
        "Damage Over Time": {},
        "Crowd Control": {},
        "Buffs/Debuffs": {},
        "Transformations": {},
        "Resource Effects": {}
      },
      "Combo Systems": {
        "Button Combinations": {},
        "Timing-based": {},
        "Chain Attacks": {},
        "Tag-team Combos": {}
      }
    },
    "Health Systems": {
      "Regenerating": {},
      "Medkit/Potion": {},
      "Segmented": {},
      "Realistic Damage": {},
      "Permadeath": {}
    }
  },
  "Game Environment": {
    "Discrete Levels": {
      "Multi-Level": {
        "Linear": {},
        "Branching Paths": {},
        "Hub and Spoke": {}
      },
      "One Room": {
        "Wave-based": {},
        "Arena": {},
        "Puzzle Room": {}
      },
      "Level Selection": {
        "World Map": {},
        "Menu-based": {},
        "In-game Hub": {}
      }
    },
    "Open World Sandbox": {
      "Instances/Dungeons": {
        "Procedural": {},
        "Fixed": {},
        "Phased": {}
      },
      "Procedurally Generated": {
        "Terrain": {},
        "Resource Distribution": {},
        "Encounters": {},
        "Buildings/Structures": {}
      },
      "Hand-crafted": {
        "Points of Interest": {},
        "Landmarks": {},
        "Environmental Storytelling": {},
        "Secret Areas": {}
      },
      "Traversal Systems": {
        "Fast Travel": {},
        "Mounts": {},
        "Vehicles": {},
        "Teleportation": {},
        "Parkour": {}
      }
    },
    "Weather & Day/Night": {
      "Visual Effects": {},
      "Gameplay Impact": {},
      "Dynamic Changes": {},
      "Seasonal": {}
    },
    "Destructible Environment": {
      "Building Destruction": {},
      "Terrain Deformation": {},
      "Physics-based": {},
      "Persistent": {},
      "Gameplay Advantage": {}
    },
    "Construction": {
      "Building Placement": {},
      "Modular Construction": {},
      "Free-form Building": {},
      "Blueprint System": {},
      "Structural Integrity": {}
    },
    "Hazards & Obstacles": {
      "Traps": {},
      "Environmental Dangers": {},
      "Puzzles": {},
      "Navigation Challenges": {},
      "Weather Hazards": {}
    }
  },
  "Inventory": {
    "Grid-based": {
      "Tetris-style": {},
      "Item Rotation": {},
      "Auto-sort": {}
    },
    "Slot-based": {
      "Limited Slots": {},
      "Upgradable": {},
      "Equipment Slots": {}
    },
    "Weight-based": {
      "Encumbrance": {},
      "Weight Limits": {},
      "Item Weights": {}
    },
    "Unlimited": {
      "Categorized": {},
      "Searchable": {},
      "Favorites": {}
    },
    "Item Management": {
      "Stacking": {},
      "Sorting": {},
      "Filtering": {},
      "Junk Selling": {},
      "Auto-loot": {}
    },
    "Container Systems": {
      "Chests/Storage": {},
      "Banks": {},
      "Shared Storage": {},
      "Cloud Storage": {}
    }
  },
  "Building": {
    "Base Building": {
      "Defense Systems": {},
      "Resource Generation": {},
      "Expansion": {},
      "Customization": {},
      "NPC Inhabitants": {},
      "Raids/Attacks": {}
    },
    "City Building": {
      "Population Management": {},
      "Zoning": {},
      "Infrastructure": {},
      "Services": {},
      "Economy": {},
      "Growth": {}
    },
    "Vehicle Construction": {
      "Component Assembly": {},
      "Performance Tuning": {},
      "Aesthetics": {},
      "Functional Modules": {}
    },
    "Building Materials": {
      "Resource Requirements": {},
      "Durability": {},
      "Aesthetic Options": {},
      "Special Properties": {}
    }
  },
  "Management": {
    "Resource Management": {
      "Collection": {},
      "Allocation": {},
      "Conversion": {},
      "Storage": {},
      "Supply Chains": {}
    },
    "City/Colony Management": {
      "Population Needs": {},
      "Happiness": {},
      "Production": {},
      "Defense": {},
      "Expansion": {}
    },
    "Team Management": {
      "Party Composition": {},
      "Skill Synergies": {},
      "Equipment": {},
      "Relationship Dynamics": {},
      "Training/Development": {}
    },
    "Time Management": {
      "Day/Night Cycle": {},
      "Scheduling": {},
      "Time Limits": {},
      "Seasons": {}
    },
    "Business Management": {
      "Profit/Loss": {},
      "Customer Satisfaction": {},
      "Competition": {},
      "Marketing": {},
      "Staff": {}
    }
  },
  "Card-Based": {
    "Deckbuilding": {
      "Limited Card Pool": {},
      "Drafting": {},
      "Synergies": {},
      "Archetypes": {},
      "Meta Evolution": {}
    },
    "Hand Management": {
      "Card Drawing": {},
      "Discard Mechanics": {},
      "Hand Size Limits": {},
      "Mulligans": {}
    },
    "Card Drafting": {
      "Booster Draft": {},
      "Cube Draft": {},
      "Winston Draft": {},
      "Rotisserie Draft": {}
    },
    "Card Types": {
      "Creatures/Units": {},
      "Spells/Actions": {},
      "Equipment/Items": {},
      "Resources/Mana": {},
      "Land/Territory": {}
    }
  },
  "Physics": {
    "Rigid Body": {},
    "Soft Body": {},
    "Fluid Dynamics": {},
    "Ragdoll": {},
    "Gravity Manipulation": {},
    "Force Fields": {},
    "Object Interaction": {}
  },
  "Puzzle Mechanics": {
    "Block Pushing": {},
    "Pattern Matching": {},
    "Logic Gates": {},
    "Environmental Interaction": {},
    "Combination Locks": {},
    "Physics Puzzles": {},
    "Color/Symbol Puzzles": {}
  },
  "Rhythm & Music": {
    "Beat Matching": {},
    "Note Highways": {},
    "Free-form Expression": {},
    "Instrument Simulation": {},
    "Dynamic Music": {}
  },
  "Sports": {
    "Team Sports": {},
    "Individual Sports": {},
    "Fantasy Sports": {},
    "Physics-based Sports": {},
    "Extreme Sports": {}
  },
  "Racing": {
    "Track Racing": {},
    "Open World": {},
    "Arcade": {},
    "Simulation": {},
    "Vehicle Customization": {}
  },
  "Stealth": {
    "Vision Cones": {},
    "Noise Detection": {},
    "Cover System": {},
    "Disguises": {},
    "Distraction Mechanics": {}
  },
  "Roguelike Elements": {
    "Procedural Generation": {},
    "Permadeath": {},
    "Progression Reset": {},
    "Meta Progression": {},
    "Run Diversity": {}
  }
};

export default mechanics;

