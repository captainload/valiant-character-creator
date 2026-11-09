// Valiant Adventures RPG - Official Core Rules Reference & Trait Data
// Verbatim from the Valiant Adventures Hero's Handbook (Green Ronin Publishing / Mutants & Masterminds 3E Engine)

const VALIANT_DATA = {
  "abilities": {
    "STR": {
      "name": "Strength (STR)",
      "short": "STR",
      "costPerRank": 2,
      "type": "Physical",
      "description": "Strength is muscle power and the capacity to apply it. Your Strength Rank applies to the Damage you deal with your close combat attacks, how far you can jump and throw things, and your ability to lift and break things. It also serves as the key Ability for Athletics skill checks."
    },
    "STA": {
      "name": "Stamina (STA)",
      "short": "STA",
      "costPerRank": 2,
      "type": "Physical",
      "description": "Stamina is health, endurance, and resilience. Your Stamina Rank applies to your Toughness and Fortitude Defenses, resisting physical hazards like disease and poison, and recovering from damage and injury. Stamina is essential for staying conscious and surviving devastating trauma."
    },
    "AGL": {
      "name": "Agility (AGL)",
      "short": "AGL",
      "costPerRank": 2,
      "type": "Physical",
      "description": "Agility is grace, speed, and overall physical coordination. Your Agility Rank applies to your Dodge Defense against ranged attacks, your Initiative rank in combat turns, and Checks for feats of gross body coordination like Acrobatics and Stealth."
    },
    "DEX": {
      "name": "Dexterity (DEX)",
      "short": "DEX",
      "costPerRank": 2,
      "type": "Physical",
      "description": "Dexterity is hand-eye coordination, precision, aim, and manual dexterity. Your Dexterity Rank applies to Attack Checks for Ranged Attacks, Piloting, Driving, Sleight of Hand, Thievery, and Checks for feats of fine motor control."
    },
    "FGT": {
      "name": "Fighting (FGT)",
      "short": "FGT",
      "costPerRank": 2,
      "type": "Mental",
      "description": "Fighting is the Ability to attack and defend yourself in close combat, unarmed and with weapons. Your Fighting Rank applies to Attack Checks for Close Attacks and your Parry Defense against Close Attacks."
    },
    "INT": {
      "name": "Intellect (INT)",
      "short": "INT",
      "costPerRank": 2,
      "type": "Mental",
      "description": "Intellect covers reasoning, education, and the ability to learn new things quickly. Your Intellect Rank applies to Checks to solve problems, recall information, or work with technology, modifying Computers, Electronics, Expertise, Investigation, Mechanics, Occult, and Treatment."
    },
    "AWE": {
      "name": "Awareness (AWE)",
      "short": "AWE",
      "costPerRank": 2,
      "type": "Mental",
      "description": "Awareness is common sense, intuition, perception, and self-awareness. Your Awareness Rank applies to your Will Defense and Checks to get a 'gut feeling' about people or situations, modifying Insight and Perception checks."
    },
    "PRE": {
      "name": "Presence (PRE)",
      "short": "PRE",
      "costPerRank": 2,
      "type": "Mental",
      "description": "Presence is the force of personality, persuasiveness, charm, menace, and leadership ability. Your Presence Rank applies to Checks to convince or intimidate others or to impress people, modifying Deception, Intimidation, and Persuasion."
    }
  },
  "defenses": {
    "Dodge": {
      "name": "Dodge",
      "ability": "AGL",
      "costPerRank": 1,
      "description": "Active Defense against ranged attacks, hazards, and area explosions. Governed by Agility. Dodge Defense + Toughness cannot exceed 2 × Power Level."
    },
    "Parry": {
      "name": "Parry",
      "ability": "FGT",
      "costPerRank": 1,
      "description": "Active Defense against close combat attacks and melee strikes. Governed by Fighting. Parry Defense + Toughness cannot exceed 2 × Power Level."
    },
    "Fortitude": {
      "name": "Fortitude",
      "ability": "STA",
      "costPerRank": 1,
      "description": "Resistance against physiological hazards such as poison, disease, radiation, suffocation, and extreme fatigue. Governed by Stamina. Fortitude + Will cannot exceed 2 × Power Level."
    },
    "Toughness": {
      "name": "Toughness",
      "ability": "STA",
      "costPerRank": 1,
      "description": "Direct resistance against physical Damage and trauma. Resists Damage checks against DC (15 + Damage Rank). Governed by Stamina and augmented by Protection or Force Fields."
    },
    "Will": {
      "name": "Will",
      "ability": "AWE",
      "costPerRank": 1,
      "description": "Resistance against mental, spiritual, and psionic hazards such as mind control, illusions, fear, and supernatural afflictions from the Deadside. Governed by Awareness."
    }
  },
  "skills": {
    "Acrobatics": {
      "ability": "AGL",
      "trainedOnly": true,
      "description": "You can balance, flip, tumble, and perform other acrobatic maneuvers. A successful DC 10 Acrobatics Check lets you move over or around obstacles or narrow ledges at Speed -1, or full Speed with two Degrees of Success. A DC 20 Acrobatics Check lets you take the Stand Action without becoming Hindered."
    },
    "Athletics": {
      "ability": "STR",
      "trainedOnly": false,
      "description": "You're skilled in athletic feats like climbing, jumping, riding, and swimming. A DC 10 Check accomplishes basic climbing or swimming in normal conditions. You can increase running Speed Rank by +1 for one Round with a DC 15 Check. Jumping DC equals meters jumped × 6 (standing) or meters jumped × 3 (running)."
    },
    "Close Combat": {
      "ability": "FGT",
      "trainedOnly": false,
      "repeatable": true,
      "description": "You're trained with a particular type of Close Combat—such as unarmed strikes, grappling, or swords—giving you a Bonus to Attack Checks with it equal to your Skill Rank. You can choose different specialties (e.g. Unarmed, Swords, Knives, Nanite Blades) as separate skills."
    },
    "Computers": {
      "ability": "INT",
      "trainedOnly": true,
      "description": "You're skilled with computer programming and software. Covers writing programs and hacking. Checks range from DC 10 for simple code to DC 30 or more for hacking into the most advanced, hardened, and protected military systems."
    },
    "Deception": {
      "ability": "PRE",
      "trainedOnly": false,
      "description": "You are skilled at acting, fast-talk, misdirection, manipulation, and lies. Opposed by target's Deception or Insight Check. Can also be used to Feint in combat as a Standard Action against an opponent's Deception or Insight; if successful, the target is Vulnerable against your next attack."
    },
    "Driving": {
      "ability": "DEX",
      "trainedOnly": true,
      "description": "You're skilled in driving ground vehicles, from motorcycles to military transports, under hazardous and combat conditions. Regular driving is a Routine Check (DC 10). Evasive maneuvers, high-speed chases, and stunt maneuvers range from DC 15 to DC 30."
    },
    "Electronics": {
      "ability": "INT",
      "trainedOnly": true,
      "description": "You are skilled in building, wiring, and modifying electronic equipment, from sensors and commlinks to advanced security systems and cybernetics. Checks range from DC 10 for basic wiring to DC 25+ for alien or prototype electronic technology."
    },
    "Escape Artist": {
      "ability": "AGL",
      "trainedOnly": true,
      "description": "You can slip out of ropes, handcuffs, manacles, and pins. Slipping handcuffs is DC 20, ropes DC 15. In combat, you can make an Escape Artist Check opposed by your opponent's Grab rank or Athletics check to escape from a grab or pin hold."
    },
    "Expertise": {
      "ability": "INT",
      "trainedOnly": false,
      "repeatable": true,
      "description": "Covers specialized knowledge, professional skills, and hobbies. Examples include: Science, Tactics, Business, History, Streetwise, Engineering, Medicine, and Deadside Lore. Can be taken multiple times with a different specialty for each. DC is 10 for easy, 15 for basic, 20-30 for difficult questions."
    },
    "Insight": {
      "ability": "AWE",
      "trainedOnly": false,
      "description": "You can tell someone's true intentions by paying attention to body language, inflection, and intuition. Read a social situation with DC 20 Insight Check. Avoid deception or detect odd behavior, mind control, or possession opposed by Deception or against DC (10 + Effect Rank)."
    },
    "Intimidation": {
      "ability": "PRE",
      "trainedOnly": false,
      "description": "You know how to use threats to get others to do what you want. Opposed by target's Intimidation, Insight, or Will. In combat, you can Demoralize an opponent as a Standard Action: if successful, target is Impaired until end of your next Round (Disabled with four Degrees of Success)."
    },
    "Investigation": {
      "ability": "INT",
      "trainedOnly": true,
      "description": "You know how to search for clues, gather information through interviews, watch suspects, and analyze evidence. Searching an area is DC 10 to 25. Analyzing collected clues is DC 15. Gathering community intelligence or underworld rumors takes an hour (DC 10 for rumors, DC 20 for classified secrets)."
    },
    "Mechanics": {
      "ability": "INT",
      "trainedOnly": true,
      "description": "Skilled in repairing, building, and working with mechanical devices. Operating unfamiliar devices is DC 10 to 25. Building simple machines is DC 15 (2 hours); complex devices or vehicles require DC 30+ and days of labor. Repairing reduces the DC by 5."
    },
    "Occult": {
      "ability": "INT",
      "trainedOnly": true,
      "description": "You have studied occult and arcane secrets, theory, lore, and knowledge of magic. Make Occult checks like Expertise dealing with magical effects, relics, demons, and the mystical geography of the Deadside."
    },
    "Perception": {
      "ability": "AWE",
      "trainedOnly": false,
      "description": "You're trained in noticing things. Opposes target's Stealth or Sleight of Hand. Noticing subtle details is DC 10; concealed traps or doors DC 20+. Distractions apply a Penalty Die. Detail perception requires two Degrees of Success. Routine Perception equals 10 + Perception bonus."
    },
    "Persuasion": {
      "ability": "PRE",
      "trainedOnly": false,
      "description": "You're skilled in getting people to like or agree with you through social graces, charm, and diplomacy. Shifts NPC attitude towards Helpful: DC 10 for Friendly, DC 20 for Indifferent, DC 30 for Unfriendly, DC 40 for Hostile."
    },
    "Piloting": {
      "ability": "DEX",
      "trainedOnly": true,
      "description": "You're skilled in piloting aircraft, drones, helicopters, jets, and spacecraft. Routine operation requires no check. Combat dogfighting, storm navigation, and supersonic maneuvers range from DC 15 to DC 30."
    },
    "Ranged Combat": {
      "ability": "DEX",
      "trainedOnly": false,
      "repeatable": true,
      "description": "You're trained with a particular type of Ranged Attack—such as firearms, energy blasts, bows, or throwing—giving you a Bonus to Attack Checks equal to your Skill Rank. You can choose different specialties (e.g. Firearms, Bows, Shuriken, Energy Blasts) as separate skills."
    },
    "Sleight of Hand": {
      "ability": "DEX",
      "trainedOnly": true,
      "description": "Manual trickery, picking pockets, palming items, and concealing objects. Opposed by observer's Perception check. Taking an item unseen from someone's person requires a successful check opposed by their Perception or Insight."
    },
    "Stealth": {
      "ability": "AGL",
      "trainedOnly": false,
      "description": "Moving silently and blending into shadows or cover. Opposed by Perception. You cannot hide while being directly observed without cover, distraction, or the Hide in Plain Sight advantage. Moving faster than your normal speed incurs penalties."
    },
    "Thievery": {
      "ability": "DEX",
      "trainedOnly": true,
      "description": "Burglary, lockpicking, and disabling security systems. Bypassing basic home locks is DC 10; commercial electronic keypads DC 20; military-grade vault mechanisms DC 40. Concealing tampering signs increases the DC by +5."
    },
    "Treatment": {
      "ability": "INT",
      "trainedOnly": true,
      "description": "Diagnose illness and treat bodily trauma. Remove a Dazed or Stunned Condition or stabilize a Dying character with a DC 15 Check. Grant patient +2 to +5 bonus on Resistance Checks against toxins or disease with a check against the hazard's DC."
    }
  },
  "advantages": {
    "Accurate Attack": {
      "type": "Combat",
      "ranks": 1,
      "description": "When you make an accurate attack, you can take a Penalty of up to -5 on the Effect Rank of the attack and add the same number (up to +5) to your Attack Check Modifier."
    },
    "All-Out Attack": {
      "type": "Combat",
      "ranks": 1,
      "description": "When you make an all-out attack, you can take a Penalty of up to -5 to your Dodge and Parry Defenses and add the same number (up to +5) to your Attack Check Modifier, rather than the usual -2/+2."
    },
    "Alternate Feint": {
      "type": "Combat",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Alternate Trait (e.g. Acrobatics, Intimidation, Agility)",
      "description": "When you take the Feint Action, you can make the Check using the Bonus of a Trait other than your Attack or Deception Bonus, chosen when you gain this Advantage (e.g. Acrobatics, Intimidation, Expertise). Each alternate Trait is a separate Advantage."
    },
    "Alternate Overwhelm": {
      "type": "Combat",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Substitute Condition Set (from Affliction)",
      "description": "Choose a substitute Condition you can impose for each Degree of Success with an Overwhelm Action from the Affliction effect lists. Each additional set of Conditions is a separate Advantage."
    },
    "Assessment": {
      "type": "General",
      "ranks": 5,
      "description": "You can quickly size up an opponent's combat capabilities. Choose a target and have the GM make a secret Insight Check for you as a Free Action, opposed by target's Deception. Success reveals whether their attack and defense bonuses are higher, lower, or equal. Each additional Rank lets you assess an additional opponent per Turn."
    },
    "Beginner's Luck": {
      "type": "Fortune",
      "ranks": 1,
      "description": "By spending a Hero Point, you gain 5 temporary Ranks in one Skill of your choice that you currently have at 4 or fewer Ranks, including Skills you have no Ranks in, even if trained-only. Lasts for the duration of the Scene."
    },
    "Benefit": {
      "type": "General",
      "ranks": 10,
      "hasOptions": true,
      "optionLabel": "Benefit Category & Details",
      "benefitPresets": [
        {
          "label": "Wealth 1 (Well-off)",
          "rank": 1,
          "desc": "Modest financial security, luxury purchases without strain."
        },
        {
          "label": "Wealth 2 (Wealthy)",
          "rank": 2,
          "desc": "Substantial capital, private estate, high-end travel."
        },
        {
          "label": "Wealth 3 (Millionaire)",
          "rank": 3,
          "desc": "Multimillion-dollar portfolio, corporate stakes, private aircraft."
        },
        {
          "label": "Wealth 4 (Multi-Millionaire)",
          "rank": 4,
          "desc": "Deca-millions in resources, industrial manufacturing ties."
        },
        {
          "label": "Wealth 5 (Billionaire)",
          "rank": 5,
          "desc": "Top 0.001% global wealth (e.g. Toyo Harada, Colin King)."
        },
        {
          "label": "Security Clearance 1 (Local/State Police)",
          "rank": 1,
          "desc": "Access to municipal intelligence and police records."
        },
        {
          "label": "Security Clearance 2 (Federal / G.A.T.E.)",
          "rank": 2,
          "desc": "Access to domestic black-budget investigations."
        },
        {
          "label": "Security Clearance 3 (Top Secret / MI-6 / Rising Spirit)",
          "rank": 3,
          "desc": "Unrestricted access to classified black-ops files."
        },
        {
          "label": "Diplomatic Immunity",
          "rank": 1,
          "desc": "Exempt from foreign laws and prosecution outside native country."
        },
        {
          "label": "Alternate Identity",
          "rank": 1,
          "desc": "Complete official legal documentation for an alternate person."
        },
        {
          "label": "Cipher",
          "rank": 1,
          "desc": "Past erased from all government and public databases."
        },
        {
          "label": "Status (High Standing / Officer / Royalty)",
          "rank": 1,
          "desc": "High societal rank, aristocratic title, or senior command."
        }
      ],
      "description": "You have a significant social, legal, or financial benefit. Examples include Wealth, Diplomatic Immunity, Alternate Identity, Security Clearance, Cipher, or High Status. The larger the benefit, the more Ranks are required."
    },
    "Close Attack": {
      "type": "Combat",
      "ranks": 10,
      "description": "You gain a +1 Bonus per Rank on all Attack Checks for Close Attacks, up to the campaign's Power Level limits."
    },
    "Connected": {
      "type": "General",
      "ranks": 1,
      "description": "You have a network of connections who can do you favors. With a successful Persuasion Check against DC 10 to 25 (depending on favor), you can obtain emergency equipment, bail, intelligence, or confidential assistance."
    },
    "Contacts": {
      "type": "Skill",
      "ranks": 1,
      "description": "You have a network of informants. You can make an Investigation Check to gather information in minutes rather than hours through personal contacts."
    },
    "Counterattack": {
      "type": "Combat",
      "ranks": 1,
      "description": "If an opponent hits you with a Close Attack, you can use your Reaction to make an immediate Attack against them, before your Resistance Check against their attack's Effect."
    },
    "Daze": {
      "type": "Skill",
      "ranks": 2,
      "hasOptions": true,
      "optionLabel": "Skill used (Deception or Intimidation)",
      "description": "You can make a Deception or Intimidation Check as a Standard Action to make an opponent hesitate. Resisted by target's Deception, Intimidation, Insight, or Will. Success leaves target Dazed until end of your next Turn."
    },
    "Defensive Attack": {
      "type": "Combat",
      "ranks": 1,
      "description": "When you make a defensive attack, you can take a Penalty of up to -5 on your Attack Check Modifier and add the same number (up to +5) to your Dodge and Parry Defenses rather than the usual -2/+2."
    },
    "Defensive Roll": {
      "type": "Combat",
      "ranks": 5,
      "description": "You can avoid Damage through agility and rolling with a hit. You gain +1 Active Toughness Defense per Rank. You lose this bonus whenever you are Vulnerable or Defenseless."
    },
    "Dive for Cover": {
      "type": "Combat",
      "ranks": 2,
      "description": "When an ally is targeted with an Area Effect or Ranged Attack, you can use your Reaction to Command all allies able to hear you to immediately drop Prone. Rank 2 allows allies to move up to Speed - 2 before dropping Prone."
    },
    "Eidetic Memory": {
      "type": "General",
      "ranks": 1,
      "description": "You have perfect recall of everything you see, hear, or learn. Gain a Bonus Die on Checks to remember details and on Resistance Checks against Effects that alter memories."
    },
    "Equipment": {
      "type": "General",
      "ranks": 30,
      "description": "You have 5 Equipment Points (EP) per Rank to purchase weapons, vehicles, armor, and gear that are not superhuman powers."
    },
    "Evasion": {
      "type": "Combat",
      "ranks": 2,
      "description": "You gain a +2 Circumstance Bonus per Rank on Dodge Resistance Checks against Area Effects."
    },
    "Exploit Momentum": {
      "type": "Combat",
      "ranks": 1,
      "description": "When an opponent's Close Attack misses you, you can spend a Hero Point as a Reaction to make an immediate Trip or Overwhelm Action against that opponent."
    },
    "Exploit Weakness": {
      "type": "Combat",
      "ranks": 1,
      "description": "Spend a Hero Point to gain an automatic Critical Hit against an opponent whose weakness, complication, or pattern you have uncovered."
    },
    "Extraordinary Effort": {
      "type": "Fortune",
      "ranks": 1,
      "description": "When you push yourself using Extra Effort, you can gain two benefits from Extra Effort at the same time instead of just one."
    },
    "Fallen Inspiration": {
      "type": "Fortune",
      "ranks": 1,
      "description": "When an ally is Incapacitated in your presence, you gain an immediate Hero Point to avenge them or turn the tide."
    },
    "Fascinate": {
      "type": "Skill",
      "ranks": 1,
      "hasOptions": true,
      "optionLabel": "Interaction Skill (Persuasion, Deception, or Intimidation)",
      "description": "Captivate an audience using an interaction skill, rendering them Entranced while you maintain your focus."
    },
    "Favored Environment": {
      "type": "Combat",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Chosen Environment (e.g. Aquatic, Aerial, Urban, Deadside)",
      "description": "Gain a +2 Circumstance Bonus on your Attack Checks or Active Defenses when fighting in your chosen environment."
    },
    "Favored Foe": {
      "type": "Combat",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Chosen Foe Category (e.g. Psiots, Nanite soldiers, Armor Hunters, Undead)",
      "description": "Gain a +1 Circumstance Bonus per Rank on Checks to deceive, intimidate, notice, or track a specific category of opponents."
    },
    "Gadgets General": {
      "type": "General",
      "ranks": 5,
      "description": "Spend a Hero Point to pull out a temporary prototype or specialized electronic/mechanical tool just when needed."
    },
    "Hide in Plain Sight": {
      "type": "Skill",
      "ranks": 1,
      "description": "You can hide using Stealth even while being actively observed, vanishing like a shadow without needing cover."
    },
    "Improved Aim": {
      "type": "Combat",
      "ranks": 1,
      "description": "Doubles the bonuses granted when taking the Aim Action before a ranged attack (+10 when stationary, +4 when moving)."
    },
    "Improved Critical": {
      "type": "Combat",
      "ranks": 4,
      "hasOptions": true,
      "optionLabel": "Chosen Attack (e.g. Unarmed, Blast, Katana)",
      "description": "Increase the critical threat range of your chosen attack by 1 per Rank (e.g. 19-20 at Rank 1, 16-20 at Rank 4)."
    },
    "Improved Defense": {
      "type": "Combat",
      "ranks": 1,
      "description": "Gain an extra +2 Circumstance Bonus to active Dodge and Parry defenses when executing the Defend combat action."
    },
    "Improved Disarm": {
      "type": "Combat",
      "ranks": 1,
      "description": "Suffers no penalty when attempting a Disarm action, and target cannot attempt to disarm you if you fail."
    },
    "Improved Grab": {
      "type": "Combat",
      "ranks": 1,
      "description": "Make an unarmed attack check and immediately initiate a Grab as a Free Action on a hit."
    },
    "Improved Initiative": {
      "type": "Combat",
      "ranks": 5,
      "description": "Gain a +4 Bonus per Rank on your combat Initiative checks, reacting with split-second reflexes."
    },
    "Improved Overwhelm": {
      "type": "Combat",
      "ranks": 1,
      "description": "Gain a Bonus Die when attempting to Overwhelm an adversary in combat."
    },
    "Improved Smash": {
      "type": "Combat",
      "ranks": 1,
      "description": "Suffers no penalty when attacking an opponent's held weapon, gear, or object."
    },
    "Improved Trip": {
      "type": "Combat",
      "ranks": 1,
      "description": "Suffers no penalty when executing a Trip attack, and target cannot attempt to trip you if you fail."
    },
    "Improvised Tools": {
      "type": "Skill",
      "ranks": 1,
      "description": "Ignore all penalties for lacking proper tools when making Mechanics, Electronics, Thievery, or Treatment checks."
    },
    "Improvised Weapon": {
      "type": "Combat",
      "ranks": 1,
      "description": "Treat improvised weapons (chairs, pipes, stones) as normal weapons without attack penalty."
    },
    "Inspire": {
      "type": "Fortune",
      "ranks": 5,
      "description": "Spend a Hero Point to grant all nearby allies a +1 Bonus per Rank (max +5) on all checks for one turn."
    },
    "Instant Up": {
      "type": "Combat",
      "ranks": 1,
      "description": "Stand up from a Prone position as a Free Action without expending movement or becoming Hindered."
    },
    "Interpose": {
      "type": "Combat",
      "ranks": 1,
      "description": "Once per round, move up to your full speed to jump in front of an attack targeting an adjacent ally, taking the blow yourself."
    },
    "Inventor": {
      "type": "Skill",
      "ranks": 1,
      "description": "Design and build temporary high-tech prototypes, power gadgets, and technological counter-measures using Mechanics and Electronics."
    },
    "Jack-of-all-Trades": {
      "type": "Skill",
      "ranks": 1,
      "description": "Use any skill untrained, even advanced technical or specialized skills that normally require formal training."
    },
    "Languages": {
      "type": "General",
      "ranks": 10,
      "hasOptions": true,
      "optionLabel": "Additional Languages Known",
      "description": "Fluent in additional spoken and written languages (1 language at Rank 1, doubling with higher ranks or polyglot)."
    },
    "Leadership": {
      "type": "Fortune",
      "ranks": 1,
      "description": "Spend a Hero Point to remove a Dazed, Fatigued, or Stunned condition from an ally within communication range."
    },
    "Luck": {
      "type": "Fortune",
      "ranks": 5,
      "description": "Gain 1 extra re-roll point per Rank each session that functions just like a Hero Point for re-rolling d20s."
    },
    "Move-by Action": {
      "type": "Combat",
      "ranks": 1,
      "description": "Carry out a standard action in the middle of your movement, moving before and after the action seamlessly."
    },
    "Power Attack": {
      "type": "Combat",
      "ranks": 1,
      "description": "Trade attack check bonus for an equal bonus to damage or effect rank (up to -5 attack for +5 effect rank)."
    },
    "Precise Attack": {
      "type": "Combat",
      "ranks": 4,
      "hasOptions": true,
      "optionLabel": "Category (Close Cover, Close Concealment, Ranged Cover, Ranged Concealment)",
      "description": "Ignore penalties for cover or concealment with close or ranged attacks depending on the selected category."
    },
    "Ranged Attack": {
      "type": "Combat",
      "ranks": 10,
      "description": "Gain a +1 Bonus per Rank on all Ranged Attack checks, staying within campaign Power Level limits."
    },
    "Redirect": {
      "type": "Combat",
      "ranks": 1,
      "description": "When an enemy misses you with a close combat attack, use a Deception trick to cause the attack to strike another adjacent foe."
    },
    "Riposte": {
      "type": "Combat",
      "ranks": 1,
      "description": "When an opponent misses you with a close attack by two or more degrees of failure, you can use your Reaction to make an immediate counterstrike."
    },
    "Rush of Victory": {
      "type": "Fortune",
      "ranks": 1,
      "description": "When you render a major villain or worthy opponent Incapacitated, you immediately regain 1 spent Hero Point."
    },
    "Second Chance": {
      "type": "General",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Hazard Category (e.g. Mind Control, Falling, Radiation, Poison, Traps)",
      "description": "Gain an automatic re-roll on resistance checks against a chosen hazard category if the initial check fails."
    },
    "Seize Initiative": {
      "type": "Fortune",
      "ranks": 1,
      "description": "Spend a Hero Point to immediately take the very first turn at the top of the combat initiative order."
    },
    "Set-Up": {
      "type": "Combat",
      "ranks": 2,
      "description": "Transfer the combat benefits of your successful Feint or Intimidation check to an ally so they can exploit the opening."
    },
    "Skill Mastery": {
      "type": "Skill",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Chosen Skill for Mastery",
      "description": "Make Routine Checks with your chosen skill even under intense combat stress or life-threatening duress."
    },
    "Sleeper Hold": {
      "type": "Combat",
      "ranks": 1,
      "description": "When you have an opponent pinned or helpless in a grab, you can render them unconscious with a sleeper hold."
    },
    "Snap Shot": {
      "type": "Combat",
      "ranks": 1,
      "description": "Draw a ranged firearm or weapon and make an immediate attack as a single standard action."
    },
    "Split Attack": {
      "type": "Combat",
      "ranks": 2,
      "description": "Split your attack check between two adjacent targets within reach or range."
    },
    "Superiority": {
      "type": "Combat",
      "ranks": 1,
      "description": "Gain an additional circumstance bonus when attacking an opponent you have successfully flanked or caught off-balance."
    },
    "Tactical Advance": {
      "type": "Combat",
      "ranks": 1,
      "description": "Move between cover without drawing opportunity attacks or losing active defense bonuses."
    },
    "Takedown": {
      "type": "Combat",
      "ranks": 2,
      "description": "If you render a minion Incapacitated with an attack, you immediately get a free extra attack on another minion within reach."
    },
    "Teamwork": {
      "type": "Combat",
      "ranks": 1,
      "description": "Provide a +5 bonus (instead of +2) when successfully performing the Team Attack or Aid actions with an ally."
    },
    "Tracking": {
      "type": "Skill",
      "ranks": 1,
      "description": "Follow faint footprints, scent trails, nanite residue, or psionic signatures using the Perception skill at normal speed."
    },
    "Trance": {
      "type": "General",
      "ranks": 1,
      "description": "Enter a deep meditative state that slows bodily functions, reduces oxygen consumption tenfold, and aids psionic focus."
    },
    "Ultimate Effort": {
      "type": "Fortune",
      "ranks": 5,
      "hasOptions": true,
      "optionLabel": "Specific Check (e.g. Toughness, Aim, Athletics)",
      "description": "Spend a Hero Point to treat a d20 roll for a specific check as an automatic 20."
    },
    "Uncanny Dodge": {
      "type": "Combat",
      "ranks": 1,
      "description": "You retain your active Dodge and Parry defense even when caught surprised, flat-footed, or attacked from hiding."
    },
    "Up and At 'Em": {
      "type": "Combat",
      "ranks": 1,
      "description": "Remove the Stunned condition immediately at the start of your turn by taking a breath."
    },
    "Well-Informed": {
      "type": "Skill",
      "ranks": 1,
      "description": "Make an immediate free Investigation or Perception check whenever encountering a notable person, faction, or situation to recall dossier details."
    }
  },
  "powerEffects": {
    "Affliction": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 1,
      "description": "You can inflict various Conditions on a target (see Conditions, page 93). Resisted by Fortitude or Will against DC (10 + Rank). Failure 1: Dazed, Entranced, Fatigued, Hindered, Impaired, Prone, or Vulnerable. Failure 2: Compelled, Defenseless, Disabled, Exhausted, Immobile, Stunned, or Susceptible. Failure 3: Asleep, Controlled, Incapacitated, Paralyzed, Transformed, or Unaware.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Contagious",
        "Cumulative",
        "Extra Condition",
        "Homing",
        "Increased Range",
        "Multiattack",
        "Reaction",
        "Selective",
        "Sleep",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Aura": {
      "type": "Attack",
      "action": "None",
      "range": "Close",
      "duration": "Sustained",
      "baseCost": 3,
      "description": "Surround your body with an Affliction or Damage effect (acid, electricity, flames, spines). Anyone you touch or who touches you makes an immediate Resistance Check based on your Aura Rank.",
      "legalExtras": [
        "Affects Insubstantial",
        "Reaction",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Blast": {
      "type": "Attack",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Inflict Damage on a target by making a Ranged Attack Check against Dodge. Target resists with Toughness against DC (15 + Rank). Can represent plasma fire, nanite bullets, or telekinetic darts.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Homing",
        "Indirect",
        "Multiattack",
        "Penetrating",
        "Precise",
        "Ricochet",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Concealment": {
      "type": "Sensory",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Gain total Concealment from one or more senses. Rank 1 covers a single sense (scent, hearing). Rank 2 covers an entire sense type (all auditory). Rank 2 visual covers normal vision; Rank 4 covers all visual senses. Concealment 10 covers all sense types except tactile.",
      "hasOptions": true,
      "optionType": "sense_selector",
      "legalExtras": [
        "Affects Others",
        "Area (Burst / Cone / Line)",
        "Precise",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Limited to One Sense",
        "Limited Senses",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Create": {
      "type": "General",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Form solid objects out of solidified energy, hard light, nanites, or transmuted matter. Created objects have Volume Rank and Toughness equal to Effect Rank, and can support weight with Strength equal to Rank.",
      "legalExtras": [
        "Hardened",
        "Impervious",
        "Movable",
        "Precise",
        "Selective",
        "Stationary",
        "Subtle",
        "Tether"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Distracting",
        "Fades",
        "Feedback",
        "Independent",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Damage": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 1,
      "description": "Delivers physical, kinetic, or thermal injury in close combat. Make Close Attack Check vs. Parry. Target rolls Toughness check against DC (15 + Rank).",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Both Types",
        "Contagious",
        "Increased Range",
        "Multiattack",
        "Penetrating",
        "Precise",
        "Reaction",
        "Ricochet",
        "Selective",
        "Strength-Based",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Distracting",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Dazzle": {
      "type": "Attack",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Overwhelm one of the target's senses (usually vision or hearing) with bright flash or deafening sonic burst. Affliction effect targeting sensory awareness.",
      "legalExtras": [
        "Accurate",
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Extra Condition",
        "Multiattack",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Limited to One Sense",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Energy Control": {
      "type": "Control",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Generate, control, and project a Blast of a specific energy descriptor (electricity, fire, radiation, magnetism, psionic force). Can counter opposing energy effects.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Indirect",
        "Multiattack",
        "Penetrating",
        "Precise",
        "Ricochet",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Enhanced Trait": {
      "type": "General",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 2,
      "hasOptions": true,
      "optionType": "enhanced_trait_config",
      "description": "Superhumanly amplify an existing Trait (Ability, Defense, Skill, or Advantage). Cost matches the normal trait cost (Abilities 2 PP/rank; Defenses 1 PP/rank; Skills 0.5 PP/rank; Advantages 1 PP/rank).",
      "legalExtras": [
        "Affects Others",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Side Effect",
        "Sustained",
        "Tiring",
        "Unreliable"
      ]
    },
    "Feature": {
      "type": "General",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 1,
      "hasOptions": true,
      "optionType": "custom_feature_text",
      "description": "A minor superhuman or technological utility trait, such as internal compartment, glowing body, mimetic skin color, or internal clock.",
      "legalExtras": [
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Sustained",
        "Unreliable"
      ]
    },
    "Flight": {
      "type": "Movement",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Fly through the air or hover in place. Speed Rank equals Flight Rank (Rank 1 = 4 MPH; Rank 6 = 120 MPH; Rank 10 = 2,000 MPH Mach 3; Rank 15 = Suborbital).",
      "legalExtras": [
        "Affects Others",
        "Increased Mass",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Gliding",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Sustained",
        "Tiring",
        "Unreliable",
        "Wings"
      ]
    },
    "Force Field": {
      "type": "Defense",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 1,
      "description": "Surround your body with a protective energy field, granting Protection equal to Force Field Rank. You can turn it on or off as a Free Action.",
      "legalExtras": [
        "Affects Others",
        "Hardened",
        "Impervious",
        "Resistant",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Healing": {
      "type": "General",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Heal Damage Conditions by touching a voluntary or Incapacitated target. Make a Healing Check against DC 10. Success heals one degree of damage, with additional degrees healing more.",
      "legalExtras": [
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Effortless",
        "Energizing",
        "Increased Range",
        "Persistent",
        "Precise",
        "Repair",
        "Resurrection",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Empathic",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Source",
        "Tiring",
        "Unreliable"
      ]
    },
    "Illusion": {
      "type": "Control",
      "action": "Standard",
      "range": "Perception",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Generate realistic images, sounds, smells, or physical sensations. Observers make an Insight or Perception check against DC (10 + Illusion Rank) to see through the illusion.",
      "hasOptions": true,
      "optionType": "sense_selector",
      "legalExtras": [
        "Area (Burst / Cone / Line)",
        "Independent",
        "Precise",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Feedback",
        "Limited",
        "Limited to Minds",
        "Limited to One Sense",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Immortality": {
      "type": "Defense",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 2,
      "hasOptions": true,
      "optionType": "immortality_config",
      "description": "Recover from death! With 1 Rank, you recover in 30 days. Higher ranks reduce this time: Rank 5 (2 days), Rank 10 (2 hours), Rank 15 (3 minutes), Rank 19 (1 round), Rank 20 (end of round). Hallmarks of Gilad Anni-Padda (Eternal Warrior) and Armstrong.",
      "legalExtras": [
        "Reincarnation",
        "Total Recovery"
      ],
      "legalFlaws": [
        "Limited",
        "Noticeable",
        "Quirk",
        "Source"
      ]
    },
    "Immunity": {
      "type": "Defense",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 1,
      "hasOptions": true,
      "optionType": "immunity_config",
      "immunityOptions": [
        {
          "label": "Aging",
          "cost": 1
        },
        {
          "label": "Disease",
          "cost": 1
        },
        {
          "label": "Poison",
          "cost": 1
        },
        {
          "label": "Suffocation",
          "cost": 2
        },
        {
          "label": "Starvation and Thirst",
          "cost": 1
        },
        {
          "label": "Need for Sleep",
          "cost": 1
        },
        {
          "label": "Critical Hits",
          "cost": 2
        },
        {
          "label": "Environmental Cold",
          "cost": 1
        },
        {
          "label": "Environmental Heat",
          "cost": 1
        },
        {
          "label": "Radiation",
          "cost": 1
        },
        {
          "label": "Life Support (All environmental, toxins, suffocation, vacuum)",
          "cost": 10
        },
        {
          "label": "Mental Effects",
          "cost": 10
        },
        {
          "label": "Sensory Afflictions",
          "cost": 5
        },
        {
          "label": "Common Power Descriptor (e.g. Fire, Electricity)",
          "cost": 20
        }
      ],
      "description": "Immune to certain Effects or descriptors. You do not need to make Resistance Checks against them and suffer no harm from them.",
      "legalExtras": [
        "Affects Others",
        "Sustained"
      ],
      "legalFlaws": [
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Sustained",
        "Tiring",
        "Unreliable"
      ]
    },
    "Insubstantial": {
      "type": "General",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 5,
      "hasOptions": true,
      "optionType": "insubstantial_rank_config",
      "description": "Rank 1: Liquid or fluid form. Rank 2: Gaseous vapor or particle swarm. Rank 3: Energy form. Rank 4: Intangible incorporeal spirit form immune to all physical attacks.",
      "legalExtras": [
        "Affects Corporeal",
        "Affects Others",
        "Continuous",
        "Precise",
        "Reaction",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Invisibility": {
      "type": "Sensory",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 4,
      "description": "Vanish from sight, gaining Total Concealment from all visual senses. Attacks against you suffer -5 penalty and require a DC 10 flat check.",
      "legalExtras": [
        "Affects Others",
        "Precise",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Leaping": {
      "type": "Movement",
      "action": "Free",
      "range": "Personal",
      "duration": "Instant",
      "baseCost": 1,
      "description": "Leap great distances with a Move Action. Leaping Rank adds to your distance rank for long and high jumps without an Athletics check.",
      "legalExtras": [
        "Affects Others",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Mental Blast": {
      "type": "Attack",
      "action": "Standard",
      "range": "Perception",
      "duration": "Instant",
      "baseCost": 4,
      "description": "Attack target's mind directly with psychic force. Requires no attack roll, targeting any subject you can perceive. Resisted by Will Defense against DC (15 + Rank).",
      "legalExtras": [
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Multiattack",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Distracting",
        "Fades",
        "Limited",
        "Limited to Minds",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Mind Control": {
      "type": "Attack",
      "action": "Standard",
      "range": "Perception",
      "duration": "Instant",
      "baseCost": 4,
      "description": "Impose your will on others. An Affliction effect targeting Will Defense. Failure 1: Dazed. Failure 2: Compelled. Failure 3: Controlled. Hallmark of Toyo Harada and potent psiots.",
      "legalExtras": [
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Effortless",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Feedback",
        "Limited",
        "Limited to Minds",
        "Noticeable",
        "Quirk",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Mind Reading": {
      "type": "Sensory",
      "action": "Standard",
      "range": "Perception",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Read another character's mind. Make an Opposed Check using Mind Reading rank vs. target's Will Defense to glean surface thoughts, memories, or secrets.",
      "legalExtras": [
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Effortless",
        "Mental Link",
        "Sensory Link",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Feedback",
        "Limited",
        "Limited to Minds",
        "Noticeable",
        "Quirk",
        "Removable",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Morph": {
      "type": "General",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 5,
      "hasOptions": true,
      "optionType": "morph_config",
      "morphOptions": [
        {
          "label": "Single Alternate Appearance",
          "ranks": 1,
          "cost": 5
        },
        {
          "label": "Narrow Group (e.g. Any Human Male or Female)",
          "ranks": 2,
          "cost": 10
        },
        {
          "label": "Broad Group (e.g. Any Humanoid or Animal)",
          "ranks": 3,
          "cost": 15
        },
        {
          "label": "Anything / Any Form or Material",
          "ranks": 4,
          "cost": 20
        }
      ],
      "description": "Alter physical appearance at will. Gives a +20 Circumstance Bonus on Deception checks to disguise yourself.",
      "legalExtras": [
        "Both Types",
        "Continuous",
        "Precise",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Move Object": {
      "type": "Control",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Telekinesis! Move and manipulate objects at a distance without physical contact, using Effect Rank as effective Strength for lifting and throwing.",
      "legalExtras": [
        "Accurate",
        "Area (Burst / Cone / Line)",
        "Damaging",
        "Increased Mass",
        "Indirect",
        "Multiattack",
        "Precise",
        "Reaction",
        "Ricochet",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Feedback",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Movement": {
      "type": "Movement",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 2,
      "hasOptions": true,
      "optionType": "movement_modes_config",
      "movementModes": [
        {
          "label": "Wall-Crawling (Move on walls/ceilings at Speed -1)",
          "ranks": 1,
          "cost": 2
        },
        {
          "label": "Wall-Crawling 2 (Full speed on walls/ceilings)",
          "ranks": 2,
          "cost": 4
        },
        {
          "label": "Water-Walking (Walk across water surfaces)",
          "ranks": 1,
          "cost": 2
        },
        {
          "label": "Safe Fall (Take no damage from falls)",
          "ranks": 1,
          "cost": 2
        },
        {
          "label": "Permeate (Drift through solid barriers)",
          "ranks": 1,
          "cost": 2
        },
        {
          "label": "Dimension Travel: The Deadside",
          "ranks": 1,
          "cost": 2
        },
        {
          "label": "Environmental Adaptation (Specific environment)",
          "ranks": 1,
          "cost": 2
        },
        {
          "label": "Trackless (Leave no scent or footprints)",
          "ranks": 1,
          "cost": 2
        }
      ],
      "description": "Specialized movement modes: Wall-crawling, Water-walking, Safe Fall, Permeate, or Dimension Travel to the Deadside.",
      "legalExtras": [
        "Affects Others",
        "Continuous",
        "Reaction",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Nullify": {
      "type": "Attack",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Instant",
      "baseCost": 1,
      "hasOptions": true,
      "optionLabel": "Target Descriptor (e.g. Psionics, Technology, Magic)",
      "description": "Counter and shut down Powers of a particular descriptor. Make a Ranged Attack Check, then an Opposed Check vs. target power rank.",
      "legalExtras": [
        "Accurate",
        "Area (Burst / Cone / Line)",
        "Broad Descriptor",
        "Effortless",
        "Multiattack",
        "Precise",
        "Selective",
        "Simultaneous",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Obscure": {
      "type": "Sensory",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Create Total Concealment to one or more Sense Types in an area (dense fog, blackout field, sonic static).",
      "legalExtras": [
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Independent",
        "Limited",
        "Limited to One Sense",
        "Limited Senses",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Paralyze": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Touch attack that slows a target, even freezing them entirely in place. An Affliction effect targeting Fortitude or Will.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Increased Range",
        "Multiattack",
        "Reaction",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Protection": {
      "type": "Defense",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 1,
      "description": "Adds directly to your Toughness Defense against Damage, representing dense armor plating, nanite subcutaneous weave, or hardened muscle tissue.",
      "legalExtras": [
        "Affects Others",
        "Hardened",
        "Impervious",
        "Resistant",
        "Subtle",
        "Sustained"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Side Effect",
        "Sustained",
        "Tiring",
        "Unreliable"
      ]
    },
    "Quickness": {
      "type": "General",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 1,
      "description": "Think and act at incredible speed. Perform routine physical and mental tasks in fractions of normal time (Rank 6 = 60x speed; Rank 10 = 1,000x speed).",
      "legalExtras": [
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Mental Only",
        "Noticeable",
        "Physical Only",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Regeneration": {
      "type": "Defense",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 1,
      "description": "Heal Damage Conditions automatically over time. Heals 1 Damage condition every (10 / Rank) rounds. Hallmark of Bloodshot's nanite bloodstream.",
      "legalExtras": [
        "Persistent",
        "Sustained"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Source",
        "Sustained",
        "Tiring",
        "Unreliable"
      ]
    },
    "Resistance": {
      "type": "Defense",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 1,
      "hasOptions": true,
      "optionLabel": "Protected Descriptor / Hazard",
      "description": "Works like Immunity, granting a Bonus Die on Resistance Checks against a specific descriptor or hazard.",
      "legalExtras": [
        "Affects Others",
        "Sustained"
      ],
      "legalFlaws": [
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Sustained",
        "Tiring",
        "Unreliable"
      ]
    },
    "Senses": {
      "type": "Sensory",
      "action": "None",
      "range": "Personal",
      "duration": "Permanent",
      "baseCost": 1,
      "hasOptions": true,
      "optionType": "senses_builder",
      "sensesCatalog": [
        {
          "name": "Darkvision",
          "cost": 2,
          "desc": "See in total darkness without light source."
        },
        {
          "name": "Low-Light Vision",
          "cost": 1,
          "desc": "See in dim light as if bright sunlight."
        },
        {
          "name": "Infravision",
          "cost": 1,
          "desc": "See thermal patterns and body heat signatures."
        },
        {
          "name": "Ultravision",
          "cost": 1,
          "desc": "See ultraviolet spectrum patterns."
        },
        {
          "name": "Radio Sense",
          "cost": 1,
          "desc": "Detect and monitor radio waves and wireless signals."
        },
        {
          "name": "Danger Sense",
          "cost": 1,
          "desc": "Receive intuitive warning before ambushes or traps trigger."
        },
        {
          "name": "Distance Sense",
          "cost": 1,
          "desc": "Accurately judge distances with pinpoint accuracy."
        },
        {
          "name": "Time Sense",
          "cost": 1,
          "desc": "Always know the exact time down to the second."
        },
        {
          "name": "Direction Sense",
          "cost": 1,
          "desc": "Always know geographic orientation and direction."
        },
        {
          "name": "Microscopic Vision",
          "cost": 1,
          "desc": "Magnify small objects up to microscopic detail."
        },
        {
          "name": "Tracking Sense",
          "cost": 1,
          "desc": "Follow tracks or scent signatures at full movement speed."
        },
        {
          "name": "Mystical Awareness",
          "cost": 1,
          "desc": "Detect active magic and Deadside spiritual energy."
        },
        {
          "name": "Psionic Awareness",
          "cost": 1,
          "desc": "Detect active psionic powers and awakened psiots."
        }
      ],
      "description": "Superhuman sensory inputs: Darkvision, Infrared, Radio sense, Danger sense, Microscopic vision, or Psionic Awareness.",
      "legalExtras": [
        "Affects Others",
        "Sensory Link",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Limited",
        "Limited Senses",
        "Noticeable",
        "Quirk",
        "Removable",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Snare": {
      "type": "Attack",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Restrain a target with bonds of ice, webbing, steel cables, or hardened nanites. An Affliction effect targeting Dodge.",
      "legalExtras": [
        "Accurate",
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Multiattack",
        "Selective",
        "Subtle",
        "Tether"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Speed": {
      "type": "Movement",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 1,
      "description": "Sprint across land or water at superhuman velocities (Rank 1 = 4 MPH; Rank 7 = 500 MPH; Rank 10 = 2,000 MPH Mach 3).",
      "legalExtras": [
        "Affects Others",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Strike": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 1,
      "description": "Inflict Damage in close combat using a natural weapon, plasma blade, nanite spikes, or focused martial arts strike.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Both Types",
        "Multiattack",
        "Penetrating",
        "Precise",
        "Reaction",
        "Selective",
        "Strength-Based",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Distracting",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Stun": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Deliver a stunning shock, nerve pinch, or electrical jolt that overwhelms target consciousness without physical bloodletting.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Increased Range",
        "Multiattack",
        "Reaction",
        "Selective",
        "Sleep",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Suffocation": {
      "type": "Attack",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Render a target unable to breathe by collapsing airways, telekinetically squeezing lungs, or filling throat with vapor.",
      "legalExtras": [
        "Accurate",
        "Area (Burst / Cone / Line)",
        "Cumulative",
        "Multiattack",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Summon": {
      "type": "Control",
      "action": "Standard",
      "range": "Close",
      "duration": "Sustained",
      "baseCost": 2,
      "description": "Conjure a Minion to aid you: automated robotic drones, nanite entities, or summoned spirits from the Deadside.",
      "legalExtras": [
        "Active",
        "Horde",
        "Mental Link",
        "Multiple",
        "Sensory Link"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Distracting",
        "Fades",
        "Feedback",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Swimming": {
      "type": "Movement",
      "action": "Free",
      "range": "Personal",
      "duration": "Sustained",
      "baseCost": 1,
      "description": "Propel yourself underwater at high speed. Water Speed Rank equals Swimming Rank.",
      "legalExtras": [
        "Affects Others",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Teleport": {
      "type": "Movement",
      "action": "Free",
      "range": "Rank",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Move instantly from place to place without crossing the distance between. Teleport Rank determines maximum distance.",
      "legalExtras": [
        "Accurate",
        "Change Velocity",
        "Easy",
        "Extended",
        "Increased Mass",
        "Mental Link",
        "Portal",
        "Precise",
        "Subtle",
        "Turnabout"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Tether": {
      "type": "General",
      "action": "Standard",
      "range": "Ranged",
      "duration": "Sustained",
      "baseCost": 1,
      "description": "Create an energy line, cable, or web line tethering an object or target to you or an anchor point.",
      "legalExtras": [
        "Accurate",
        "Extra Lines",
        "Multiattack",
        "Selective",
        "Strength-Based",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Close Range",
        "Concentration",
        "Diminished Range",
        "Distracting",
        "Fades",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Reduced Range",
        "Removable",
        "Resistible",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Toxin": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Inject or deliver a biological venom, chemical paralytic, or bio-weapon. An Affliction effect targeting Fortitude.",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Contagious",
        "Cumulative",
        "Increased Range",
        "Multiattack",
        "Reaction",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Extra Resistance",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    },
    "Transform": {
      "type": "Attack",
      "action": "Standard",
      "range": "Close",
      "duration": "Instant",
      "baseCost": 2,
      "description": "Alter one physical substance or object into another (lead to gold, water to solid ice, metal to dust).",
      "legalExtras": [
        "Accurate",
        "Affects Insubstantial",
        "Area (Burst / Cone / Line)",
        "Continuous",
        "Increased Range",
        "Multiattack",
        "Reaction",
        "Selective",
        "Subtle"
      ],
      "legalFlaws": [
        "Activation",
        "Concentration",
        "Distracting",
        "Fades",
        "Grab-Based",
        "Inaccurate",
        "Limited",
        "Noticeable",
        "Quirk",
        "Removable",
        "Resistible",
        "Sense-Dependent",
        "Side Effect",
        "Tiring",
        "Unreliable"
      ]
    }
  },
  "modifiers": {
    "extras": [
      {
        "name": "Accurate",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Attack",
          "Teleport"
        ],
        "description": "+2 Attack Check bonus with this specific attack (or teleport to accurately described destination)."
      },
      {
        "name": "Active",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Summon"
        ],
        "description": "Summoned minions have the Controlled condition and a full set of actions each round."
      },
      {
        "name": "Affects Corporeal",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Insubstantial"
        ],
        "description": "Allows other effects to function normally on physical targets while you are Insubstantial."
      },
      {
        "name": "Affects Insubstantial",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Damage",
          "Blast",
          "Strike",
          "Affliction",
          "Aura",
          "Paralyze",
          "Stun",
          "Toxin",
          "Transform",
          "Energy Control",
          "Insubstantial"
        ],
        "description": "Effect functions at full effectiveness against intangible or incorporeal targets."
      },
      {
        "name": "Affects Others",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Concealment",
          "Enhanced Trait",
          "Flight",
          "Force Field",
          "Immunity",
          "Insubstantial",
          "Invisibility",
          "Leaping",
          "Movement",
          "Protection",
          "Resistance",
          "Senses",
          "Speed",
          "Swimming"
        ],
        "description": "Allows a Personal Range effect to be granted to another willing subject you touch."
      },
      {
        "name": "Area (Burst / Cone / Line)",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Blast",
          "Damage",
          "Dazzle",
          "Energy Control",
          "Illusion",
          "Mental Blast",
          "Mind Control",
          "Move Object",
          "Nullify",
          "Paralyze",
          "Snare",
          "Strike",
          "Stun",
          "Suffocation",
          "Toxin",
          "Transform"
        ],
        "description": "Targets everyone within the designated area (Burst 8m, Cone 16m, or Line 30m) without requiring an individual attack roll."
      },
      {
        "name": "Both Types",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Damage",
          "Strike",
          "Morph"
        ],
        "description": "Switch between Lethal and Non-Lethal damage, or between broad and narrow categories for Morph."
      },
      {
        "name": "Broad Descriptor",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Nullify"
        ],
        "description": "Nullify counters a broad descriptor (e.g. all magic, all psionics, all technology) rather than a single specific effect."
      },
      {
        "name": "Change Velocity",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Teleport"
        ],
        "description": "Match the speed and trajectory of your destination when teleporting."
      },
      {
        "name": "Concentration",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Attack",
          "Control"
        ],
        "description": "Continuous or sustained application of an instant effect while standard actions are spent."
      },
      {
        "name": "Contagious",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Damage",
          "Toxin"
        ],
        "description": "Effect spreads from initial target to anyone coming into direct physical contact with them."
      },
      {
        "name": "Continuous",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Insubstantial",
          "Morph",
          "Movement",
          "Transform"
        ],
        "description": "Effect remains active continuously until consciously dismissed or countered, even if you are unconscious."
      },
      {
        "name": "Cumulative",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Dazzle",
          "Mental Blast",
          "Mind Control",
          "Mind Reading",
          "Paralyze",
          "Snare",
          "Stun",
          "Suffocation",
          "Toxin"
        ],
        "description": "Successive failed resistance checks add to and worsen conditions rather than merely replacing them."
      },
      {
        "name": "Damaging",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Move Object"
        ],
        "description": "Allows Move Object to inflict damage with moved objects or directly via telekinetic force."
      },
      {
        "name": "Easy",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Teleport"
        ],
        "description": "Teleporting across Extended distances does not leave you Dazed or Vulnerable."
      },
      {
        "name": "Effortless",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Healing",
          "Mind Control",
          "Mind Reading",
          "Nullify"
        ],
        "description": "Retrying failed power checks requires no additional strain or extra effort."
      },
      {
        "name": "Energizing",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Healing"
        ],
        "description": "Healing removes Fatigued and Exhausted conditions from a subject."
      },
      {
        "name": "Extended",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Teleport"
        ],
        "description": "Teleport distance increases by 8 Distance Ranks when spending two move actions."
      },
      {
        "name": "Extra Condition",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Dazzle"
        ],
        "description": "Affliction imposes two conditions simultaneously at each degree of failure."
      },
      {
        "name": "Extra Lines",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Tether"
        ],
        "description": "Maintain one additional tether at a time for each rank taken."
      },
      {
        "name": "Hardened",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create",
          "Force Field",
          "Protection"
        ],
        "description": "Defense or created construct resists Penetrating attacks and critical hits."
      },
      {
        "name": "Homing",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Blast",
          "Damage"
        ],
        "description": "Missed ranged attack checks automatically attempt another attack check on subsequent rounds."
      },
      {
        "name": "Horde",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Summon"
        ],
        "description": "Summon all of your available minions simultaneously with a single standard action."
      },
      {
        "name": "Impervious",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create",
          "Force Field",
          "Protection"
        ],
        "description": "Automatically ignores any damage effect with rank equal to or less than half Impervious rank."
      },
      {
        "name": "Increased Mass",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Flight",
          "Move Object",
          "Teleport"
        ],
        "description": "Carry or teleport additional mass (+1 mass rank per application)."
      },
      {
        "name": "Increased Range",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Damage",
          "Healing",
          "Paralyze",
          "Stun",
          "Toxin",
          "Transform"
        ],
        "description": "Upgrades range one step (Close to Ranged, or Ranged to Perception)."
      },
      {
        "name": "Indirect",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Blast",
          "Damage",
          "Energy Control",
          "Move Object"
        ],
        "description": "Ranged attack can originate or arc from points and angles other than your line of sight."
      },
      {
        "name": "Mental Link",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Mind Reading",
          "Summon",
          "Teleport"
        ],
        "description": "Telepathic mental bond allowing continuous communication with your summoned minion or subject."
      },
      {
        "name": "Movable",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create"
        ],
        "description": "Created objects can be moved around telekinetically as if you had Move Object."
      },
      {
        "name": "Multiattack",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Blast",
          "Damage",
          "Dazzle",
          "Energy Control",
          "Mental Blast",
          "Move Object",
          "Paralyze",
          "Snare",
          "Strike",
          "Stun",
          "Suffocation",
          "Tether",
          "Toxin",
          "Transform"
        ],
        "description": "Rapid-fire attack: single target damage bonus (+2 or +5), suppressive fire, or multiple targets."
      },
      {
        "name": "Multiple",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Summon"
        ],
        "description": "Summon more than one minion (each application doubles the number of minions)."
      },
      {
        "name": "Penetrating",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Blast",
          "Damage",
          "Energy Control",
          "Strike"
        ],
        "description": "Damage overcomes an equal rank of enemy Impervious defense."
      },
      {
        "name": "Persistent",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Healing",
          "Regeneration"
        ],
        "description": "Heals conditions or recovers damage that normally cannot be cured naturally."
      },
      {
        "name": "Portal",
        "costPerRank": 2,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Teleport"
        ],
        "description": "Leaves open a 2-meter wide gateway for others to step through and teleport."
      },
      {
        "name": "Precise",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Concealment",
          "Create",
          "Damage",
          "Healing",
          "Illusion",
          "Move Object",
          "Nullify",
          "Strike",
          "Teleport"
        ],
        "description": "Delicate and fine control over the application, shape, or placement of the effect."
      },
      {
        "name": "Reaction",
        "costPerRank": 3,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Aura",
          "Damage",
          "Movement",
          "Paralyze",
          "Strike",
          "Stun",
          "Transform"
        ],
        "description": "Effect triggers automatically as an instant reaction to an external stimulus without an action."
      },
      {
        "name": "Reincarnation",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Immortality"
        ],
        "description": "When you return from death, it is in a brand-new body with entirely new traits."
      },
      {
        "name": "Repair",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Healing"
        ],
        "description": "Healing removes damage conditions from non-living objects and mechanical constructs."
      },
      {
        "name": "Resistant",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Force Field",
          "Protection"
        ],
        "description": "Grants bonus resistance against damage bypassing your Toughness."
      },
      {
        "name": "Resurrection",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Healing"
        ],
        "description": "Restore life to the dead if used within the time of death."
      },
      {
        "name": "Ricochet",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Blast",
          "Damage",
          "Energy Control",
          "Move Object"
        ],
        "description": "Attack bounces off solid surfaces to bypass cover and strike around corners."
      },
      {
        "name": "Selective",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Aura",
          "Blast",
          "Create",
          "Damage",
          "Dazzle",
          "Energy Control",
          "Healing",
          "Illusion",
          "Mental Blast",
          "Mind Control",
          "Move Object",
          "Nullify",
          "Obscure",
          "Paralyze",
          "Snare",
          "Strike",
          "Stun",
          "Suffocation",
          "Tether",
          "Toxin",
          "Transform"
        ],
        "description": "Choose exactly which targets within an area or aura are affected and which are spared."
      },
      {
        "name": "Sensory Link",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Mind Reading",
          "Senses",
          "Summon"
        ],
        "description": "Perceive the senses of the subject or minion remotely."
      },
      {
        "name": "Simultaneous",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Nullify"
        ],
        "description": "Nullifies all effects of a descriptor at once rather than just one."
      },
      {
        "name": "Sleep",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Stun"
        ],
        "description": "Third degree of failure leaves the target Asleep rather than Incapacitated."
      },
      {
        "name": "Stationary",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create"
        ],
        "description": "Created object is anchored immovably in place."
      },
      {
        "name": "Strength-Based",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Damage",
          "Strike",
          "Tether"
        ],
        "description": "Adds your Strength damage rank to the effects close combat rank."
      },
      {
        "name": "Subtle",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Power activation is undetectable to normal senses (1 PP = DC 20 Perception check to detect; 2 PP = completely undetectable)."
      },
      {
        "name": "Sustained",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Immunity",
          "Protection",
          "Regeneration",
          "Resistance"
        ],
        "description": "Converts a Permanent effect into a Sustained effect (allows using Extra Effort and turning it off)."
      },
      {
        "name": "Tether",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create",
          "Snare"
        ],
        "description": "Snared or created targets are physically anchored by a tethering line."
      },
      {
        "name": "Total Recovery",
        "costPerRank": 1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Immortality"
        ],
        "description": "When you recover from death, all damage conditions are completely removed immediately."
      },
      {
        "name": "Turnabout",
        "costPerRank": 1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Teleport"
        ],
        "description": "Teleport, take an action, and teleport back to your starting point in a single turn."
      }
    ],
    "flaws": [
      {
        "name": "Activation",
        "costPerRank": -1,
        "isFlat": true,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Requires a Move Action (-1 pt) or Standard Action (-2 pts) to activate before use."
      },
      {
        "name": "Close Range",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Blast",
          "Create",
          "Dazzle",
          "Energy Control",
          "Move Object",
          "Nullify",
          "Obscure",
          "Snare",
          "Suffocation",
          "Summon",
          "Tether"
        ],
        "description": "Downgrades a Ranged or Perception effect to Close range."
      },
      {
        "name": "Concentration",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Sustained Effects"
        ],
        "description": "Requires your Standard Action every round to maintain the effect."
      },
      {
        "name": "Diminished Range",
        "costPerRank": -1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Blast",
          "Dazzle",
          "Energy Control",
          "Move Object",
          "Nullify",
          "Snare",
          "Suffocation",
          "Tether"
        ],
        "description": "Reduces the short, medium, and long range increments of a ranged attack."
      },
      {
        "name": "Distracting",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Using this power renders you Vulnerable (halving active Dodge and Parry defenses)."
      },
      {
        "name": "Empathic",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Healing"
        ],
        "description": "Healer takes on damage conditions suffered by the patient."
      },
      {
        "name": "Extra Resistance",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Toxin"
        ],
        "description": "Target must first fail a Toughness check before having to resist with Fortitude."
      },
      {
        "name": "Fades",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Power loses 1 rank of effectiveness each time it is used until recharged."
      },
      {
        "name": "Feedback",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create",
          "Illusion",
          "Mind Control",
          "Mind Reading",
          "Move Object",
          "Summon"
        ],
        "description": "Attacks against your construct, illusion, or subject deal damage directly to your own body."
      },
      {
        "name": "Gliding",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Flight"
        ],
        "description": "You glide rather than truly fly; forward movement requires losing altitude."
      },
      {
        "name": "Grab-Based",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Damage",
          "Paralyze",
          "Strike",
          "Stun",
          "Transform"
        ],
        "description": "Requires successfully grappling/grabbing the target in close combat before effect is applied."
      },
      {
        "name": "Inaccurate",
        "costPerRank": -1,
        "isFlat": true,
        "isUniversal": false,
        "appliesTo": [
          "Affliction",
          "Blast",
          "Damage",
          "Dazzle",
          "Energy Control",
          "Move Object",
          "Nullify",
          "Paralyze",
          "Snare",
          "Strike",
          "Stun",
          "Suffocation",
          "Tether",
          "Toxin",
          "Transform"
        ],
        "description": "Suffers a -2 Attack Check penalty per rank with this specific attack."
      },
      {
        "name": "Independent",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Create",
          "Illusion",
          "Obscure"
        ],
        "description": "Sustained effect continues on its own with decreasing effectiveness without spending actions."
      },
      {
        "name": "Limited",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Power only functions under specific conditions or against restricted target types."
      },
      {
        "name": "Limited to Minds",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Illusion",
          "Mental Blast",
          "Mind Control",
          "Mind Reading"
        ],
        "description": "Effect creates hallucinations or targets thoughts in living minds; cannot affect mindless machines or undead."
      },
      {
        "name": "Limited to One Sense",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Concealment",
          "Dazzle",
          "Illusion",
          "Obscure"
        ],
        "description": "Effect only impedes or conceals a single specific sense instead of a sense type."
      },
      {
        "name": "Limited Senses",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Concealment",
          "Obscure",
          "Senses"
        ],
        "description": "Effect only applies to or detects a restricted set of senses."
      },
      {
        "name": "Mental Only",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Quickness"
        ],
        "description": "Quickness only applies to mental tasks like calculation, design, reading, or research."
      },
      {
        "name": "Noticeable",
        "costPerRank": -1,
        "isFlat": true,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Leaves obvious, blatant signs or glowing manifestations that reveal your presence/power."
      },
      {
        "name": "Physical Only",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Quickness"
        ],
        "description": "Quickness only applies to physical labor, manual tasks, and repetitive physical actions."
      },
      {
        "name": "Quirk",
        "costPerRank": -1,
        "isFlat": true,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "A minor nuisance flaw or minor operational restriction (-1 flat point)."
      },
      {
        "name": "Reduced Range",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Blast",
          "Create",
          "Dazzle",
          "Energy Control",
          "Move Object",
          "Nullify",
          "Obscure",
          "Snare",
          "Suffocation",
          "Tether"
        ],
        "description": "Downgrades range one step (Perception to Ranged, or Ranged to Close)."
      },
      {
        "name": "Removable",
        "costPerRank": -1,
        "isFlat": true,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Power is housed in an outside item or device that can be disarmed or removed."
      },
      {
        "name": "Resistible",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Adds a resistance check to an effect that normally doesnt allow one, or adds an extra check."
      },
      {
        "name": "Sense-Dependent",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Requires target to perceive the power with a specific sense to function."
      },
      {
        "name": "Side Effect",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Failing your check triggers an automatic negative backlash or hazard on yourself."
      },
      {
        "name": "Source",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Healing",
          "Immortality",
          "Regeneration"
        ],
        "description": "Power only replenishes or functions when you have access to a specific physical nourishment or environmental source."
      },
      {
        "name": "Sustained",
        "costPerRank": 0,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Enhanced Trait",
          "Feature",
          "Flight",
          "Force Field",
          "Immunity",
          "Protection",
          "Regeneration",
          "Resistance"
        ],
        "description": "Permanent effect made sustained, requiring continuous free actions and vulnerable when incapacitated."
      },
      {
        "name": "Tiring",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Using the power inflicts a level of fatigue on you unless a Hero Point is spent."
      },
      {
        "name": "Unreliable",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": true,
        "appliesTo": [
          "All Effects"
        ],
        "description": "Requires a d20 roll of 11+ to function, or has only 5 limited uses per scene."
      },
      {
        "name": "Wings",
        "costPerRank": -1,
        "isFlat": false,
        "isUniversal": false,
        "appliesTo": [
          "Flight"
        ],
        "description": "Flight is granted by wings that can be restrained, fouled, or trapped in narrow spaces."
      }
    ],
    "neutralizingPairs": [
      [
        "Increased Range",
        "Reduced Range"
      ],
      [
        "Increased Range",
        "Close Range"
      ],
      [
        "Subtle",
        "Noticeable"
      ],
      [
        "Accurate",
        "Inaccurate"
      ]
    ]
  },
  "archetypes": [
    {
      "name": "Battlesuit",
      "concept": "High-tech armored warrior wearing advanced next-generation weapons technology (like X-O Manowar or Armorines).",
      "pl": 10,
      "abilities": {
        "STR": 0,
        "STA": 1,
        "AGL": 1,
        "DEX": 2,
        "FGT": 2,
        "INT": 6,
        "AWE": 2,
        "PRE": 2
      },
      "defenses": {
        "Dodge": 8,
        "Parry": 6,
        "Fortitude": 8,
        "Toughness": 11,
        "Will": 8
      },
      "skills": {
        "Close Combat (Unarmed)": 4,
        "Electronics": 4,
        "Expertise (Engineering)": 4,
        "Mechanics": 6,
        "Perception": 2,
        "Ranged Combat (Weapons Array)": 8
      },
      "advantages": [
        {
          "name": "Benefit",
          "rank": 3,
          "option": "Wealth: Millionaire"
        },
        {
          "name": "Connected",
          "rank": 1
        },
        {
          "name": "Accurate Attack",
          "rank": 1
        },
        {
          "name": "Improved Initiative",
          "rank": 1
        },
        {
          "name": "Move-by Action",
          "rank": 1
        }
      ],
      "powers": [
        {
          "name": "Battlesuit Armor",
          "effect": "Protection",
          "ranks": 10,
          "cost": 10,
          "details": "Impervious 8. Removable Device.",
          "extras": [
            "Impervious"
          ],
          "flaws": [
            "Removable"
          ]
        },
        {
          "name": "Thruster Flight",
          "effect": "Flight",
          "ranks": 8,
          "cost": 14,
          "details": "500 MPH air and space flight. Removable Device.",
          "extras": [],
          "flaws": [
            "Removable"
          ]
        },
        {
          "name": "Plasma Cannon Array",
          "effect": "Blast",
          "ranks": 10,
          "cost": 18,
          "details": "Ranged Damage 10, Penetrating. Removable Device.",
          "extras": [
            "Penetrating"
          ],
          "flaws": [
            "Removable"
          ]
        },
        {
          "name": "Sensory Suite",
          "effect": "Senses",
          "ranks": 4,
          "cost": 3,
          "details": "Darkvision, Radio communication sense, Distance sense. Removable.",
          "extras": [],
          "flaws": [
            "Removable"
          ]
        }
      ],
      "gear": []
    },
    {
      "name": "Crimefighter",
      "concept": "Masked martial vigilante relying on peak human training, gadgetry, and covert stealth (like Ninjak / Colin King).",
      "pl": 10,
      "abilities": {
        "STR": 3,
        "STA": 3,
        "AGL": 5,
        "DEX": 5,
        "FGT": 9,
        "INT": 4,
        "AWE": 3,
        "PRE": 1
      },
      "defenses": {
        "Dodge": 8,
        "Parry": 4,
        "Fortitude": 5,
        "Toughness": 5,
        "Will": 6
      },
      "skills": {
        "Acrobatics": 6,
        "Athletics": 6,
        "Close Combat (Martial Arts)": 4,
        "Deception": 4,
        "Expertise (Streetwise)": 4,
        "Insight": 4,
        "Intimidation": 4,
        "Investigation": 8,
        "Perception": 6,
        "Ranged Combat (Throwing)": 6,
        "Stealth": 10,
        "Thievery": 6
      },
      "advantages": [
        {
          "name": "Accurate Attack",
          "rank": 1
        },
        {
          "name": "Agile Feint",
          "rank": 1
        },
        {
          "name": "Benefit",
          "rank": 4,
          "option": "Wealth: Multimillionaire"
        },
        {
          "name": "Defensive Roll",
          "rank": 3
        },
        {
          "name": "Equipment",
          "rank": 5
        },
        {
          "name": "Evasion",
          "rank": 2
        },
        {
          "name": "Hide in Plain Sight",
          "rank": 1
        },
        {
          "name": "Improved Critical",
          "rank": 2,
          "option": "Katana"
        },
        {
          "name": "Improved Initiative",
          "rank": 2
        },
        {
          "name": "Move-by Action",
          "rank": 1
        },
        {
          "name": "Power Attack",
          "rank": 1
        },
        {
          "name": "Quick Draw",
          "rank": 1
        },
        {
          "name": "Takedown",
          "rank": 2
        },
        {
          "name": "Uncanny Dodge",
          "rank": 1
        }
      ],
      "powers": [],
      "gear": [
        {
          "name": "Katana / Combat Knife",
          "category": "Weapons",
          "costEP": 4,
          "description": "Damage 3 (Strength-based, Slashing, Critical 19-20)."
        },
        {
          "name": "Tactical Body Armor",
          "category": "Armor",
          "costEP": 4,
          "description": "Protection 4 (Ballistic weave)."
        },
        {
          "name": "Tactical Motorcycle",
          "category": "Vehicles",
          "costEP": 10,
          "description": "Speed 6 (120 MPH), Defense 10, Toughness 8."
        },
        {
          "name": "Shuriken & Throwing Spikes",
          "category": "Weapons",
          "costEP": 3,
          "description": "Ranged Damage 1 (Multiattack)."
        },
        {
          "name": "Lockpick & Bypass Kit",
          "category": "Gadgets",
          "costEP": 1,
          "description": "Tools for Thievery checks against security locks."
        },
        {
          "name": "Field Medical Kit",
          "category": "Gadgets",
          "costEP": 1,
          "description": "+2 to Treatment checks."
        }
      ]
    },
    {
      "name": "Deadsider",
      "concept": "Haunted occult warrior bonded to shadow entities and the mystical realm of the Deadside (like Shadowman / Jack Boniface).",
      "pl": 10,
      "abilities": {
        "STR": 1,
        "STA": 3,
        "AGL": 2,
        "DEX": 2,
        "FGT": 6,
        "INT": 2,
        "AWE": 5,
        "PRE": 3
      },
      "defenses": {
        "Dodge": 6,
        "Parry": 3,
        "Fortitude": 5,
        "Toughness": 6,
        "Will": 7
      },
      "skills": {
        "Acrobatics": 4,
        "Athletics": 4,
        "Close Combat (Shadow Scythe)": 4,
        "Insight": 6,
        "Intimidation": 6,
        "Occult": 8,
        "Perception": 6,
        "Stealth": 6
      },
      "advantages": [
        {
          "name": "Diehard",
          "rank": 1
        },
        {
          "name": "Fearless",
          "rank": 1
        },
        {
          "name": "Improved Initiative",
          "rank": 1
        },
        {
          "name": "Ritualist",
          "rank": 1
        },
        {
          "name": "Startle",
          "rank": 1
        },
        {
          "name": "Uncanny Dodge",
          "rank": 1
        }
      ],
      "powers": [
        {
          "name": "Shadow Scythe",
          "effect": "Strike",
          "ranks": 8,
          "cost": 10,
          "details": "Damage 8 (Affects Insubstantial 2, Penetrating). Supernatural shadow weapon.",
          "extras": [
            "Affects Insubstantial",
            "Penetrating"
          ],
          "flaws": []
        },
        {
          "name": "Deadside Shroud",
          "effect": "Force Field",
          "ranks": 6,
          "cost": 6,
          "details": "Protection 6 against physical and mystical harm.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Deadside Sight",
          "effect": "Senses",
          "ranks": 4,
          "cost": 4,
          "details": "Darkvision, Mystical Awareness, Detect Spirits (Acute, Ranged).",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Shadow Step",
          "effect": "Teleport",
          "ranks": 5,
          "cost": 10,
          "details": "Step through the Deadside to emerge up to 900 feet away.",
          "extras": [],
          "flaws": []
        }
      ],
      "gear": []
    },
    {
      "name": "Energy Controller",
      "concept": "Master of raw energy, electricity, magnetism, or electromagnetic radiation (like Livewire / Amanda McKee).",
      "pl": 10,
      "abilities": {
        "STR": 0,
        "STA": 2,
        "AGL": 4,
        "DEX": 3,
        "FGT": 3,
        "INT": 4,
        "AWE": 2,
        "PRE": 2
      },
      "defenses": {
        "Dodge": 6,
        "Parry": 5,
        "Fortitude": 6,
        "Toughness": 8,
        "Will": 6
      },
      "skills": {
        "Computers": 6,
        "Electronics": 6,
        "Insight": 4,
        "Perception": 4,
        "Ranged Combat (Energy Blast)": 7,
        "Technology": 6
      },
      "advantages": [
        {
          "name": "Accurate Attack",
          "rank": 1
        },
        {
          "name": "All-Out Attack",
          "rank": 1
        },
        {
          "name": "Improved Initiative",
          "rank": 1
        },
        {
          "name": "Power Attack",
          "rank": 1
        },
        {
          "name": "Precise Attack",
          "rank": 1,
          "option": "Ranged Cover"
        }
      ],
      "powers": [
        {
          "name": "Electromagnetic Blast",
          "effect": "Blast",
          "ranks": 10,
          "cost": 20,
          "details": "Damage 10 (Ranged, Multiattack). High-voltage plasma or electrical burst.",
          "extras": [
            "Multiattack"
          ],
          "flaws": []
        },
        {
          "name": "Ion Barrier",
          "effect": "Force Field",
          "ranks": 8,
          "cost": 8,
          "details": "Protection 8, Sustained electromagnetic deflection shield.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Electromagnetic Levitation",
          "effect": "Flight",
          "ranks": 6,
          "cost": 12,
          "details": "120 MPH personal flight riding electromagnetic field lines.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Machine Interface",
          "effect": "Feature",
          "ranks": 2,
          "cost": 2,
          "details": "Interface with, transmit, and read wireless electronic data directly with consciousness.",
          "extras": [],
          "flaws": []
        }
      ],
      "gear": []
    },
    {
      "name": "Immortal",
      "concept": "Ageless ancient warrior seasoned by millennia of warfare who refuses to stay dead (like Gilad Anni-Padda / Eternal Warrior).",
      "pl": 10,
      "abilities": {
        "STR": 3,
        "STA": 4,
        "AGL": 2,
        "DEX": 2,
        "FGT": 9,
        "INT": 1,
        "AWE": 3,
        "PRE": 2
      },
      "defenses": {
        "Dodge": 6,
        "Parry": 2,
        "Fortitude": 6,
        "Toughness": 6,
        "Will": 7
      },
      "skills": {
        "Athletics": 6,
        "Close Combat (Weapons Master)": 5,
        "Expertise (History)": 6,
        "Expertise (Tactics)": 6,
        "Insight": 4,
        "Intimidation": 6,
        "Perception": 6,
        "Ranged Combat (Firearms & Bows)": 6,
        "Stealth": 4,
        "Survival": 6
      },
      "advantages": [
        {
          "name": "All-Out Attack",
          "rank": 1
        },
        {
          "name": "Close Attack",
          "rank": 2
        },
        {
          "name": "Diehard",
          "rank": 1
        },
        {
          "name": "Equipment",
          "rank": 4
        },
        {
          "name": "Fearless",
          "rank": 1
        },
        {
          "name": "Great Endurance",
          "rank": 1
        },
        {
          "name": "Improved Critical",
          "rank": 2,
          "option": "Battleaxe / Sword"
        },
        {
          "name": "Improved Initiative",
          "rank": 1
        },
        {
          "name": "Languages",
          "rank": 5,
          "option": "Polyglot: Ancient Sumerian, Latin, Greek, Visigoth, Old Norse"
        },
        {
          "name": "Power Attack",
          "rank": 1
        },
        {
          "name": "Takedown",
          "rank": 2
        },
        {
          "name": "Ultimate Effort",
          "rank": 1,
          "option": "Toughness Checks"
        }
      ],
      "powers": [
        {
          "name": "True Immortality",
          "effect": "Immortality",
          "ranks": 10,
          "cost": 20,
          "details": "Returns from death in 2 hours. Ageless and unkillable over time.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Ancient Constitution",
          "effect": "Immunity",
          "ranks": 3,
          "cost": 3,
          "details": "Immunity: Aging, Disease, Poison.",
          "extras": [],
          "flaws": []
        }
      ],
      "gear": [
        {
          "name": "Ancient Battleaxe / Sword",
          "category": "Weapons",
          "costEP": 4,
          "description": "Damage 3 (Strength-based, Slashing, Critical 19-20)."
        },
        {
          "name": "Tactical Assault Rifle",
          "category": "Weapons",
          "costEP": 15,
          "description": "Damage 5 (Ranged, Ballistic, Multiattack)."
        },
        {
          "name": "Heavy Combat Vest",
          "category": "Armor",
          "costEP": 2,
          "description": "Protection 2."
        }
      ]
    },
    {
      "name": "Mystic",
      "concept": "Scholar of the occult, practitioner of eldritch incantations and speaker with spirits (like Doctor Mirage or Punk Mambo).",
      "pl": 10,
      "abilities": {
        "STR": 0,
        "STA": 3,
        "AGL": 2,
        "DEX": 4,
        "FGT": 3,
        "INT": 6,
        "AWE": 7,
        "PRE": 4
      },
      "defenses": {
        "Dodge": 6,
        "Parry": 5,
        "Fortitude": 5,
        "Toughness": 5,
        "Will": 9
      },
      "skills": {
        "Deception": 4,
        "Insight": 6,
        "Investigation": 6,
        "Occult": 10,
        "Perception": 6,
        "Persuasion": 4,
        "Ranged Combat (Spells)": 6
      },
      "advantages": [
        {
          "name": "Artificer",
          "rank": 1
        },
        {
          "name": "Benefit",
          "rank": 1,
          "option": "Status: Renowned Parapsychologist"
        },
        {
          "name": "Connected",
          "rank": 1
        },
        {
          "name": "Eidetic Memory",
          "rank": 1
        },
        {
          "name": "Fearless",
          "rank": 1
        },
        {
          "name": "Ritualist",
          "rank": 1
        },
        {
          "name": "Trance",
          "rank": 1
        },
        {
          "name": "Well-Informed",
          "rank": 1
        }
      ],
      "powers": [
        {
          "name": "Eldritch Spells (Array)",
          "effect": "Blast",
          "ranks": 10,
          "cost": 22,
          "details": "Damage 10 (Ranged, Affects Insubstantial 2, Variable Descriptors).",
          "extras": [
            "Affects Insubstantial"
          ],
          "flaws": []
        },
        {
          "name": "Mystic Ward",
          "effect": "Force Field",
          "ranks": 6,
          "cost": 6,
          "details": "Protection 6 against physical and mystical harm.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Spirit Communion",
          "effect": "Senses",
          "ranks": 4,
          "cost": 4,
          "details": "Communicate with spirits of the deceased, Mystical Awareness, Darkvision.",
          "extras": [],
          "flaws": []
        }
      ],
      "gear": []
    },
    {
      "name": "Nano-Infused",
      "concept": "Super-soldier enhanced with millions of microscopic nanites granting instant regeneration and cybernetic control (like Bloodshot).",
      "pl": 10,
      "abilities": {
        "STR": 4,
        "STA": 3,
        "AGL": 4,
        "DEX": 4,
        "FGT": 8,
        "INT": 2,
        "AWE": 3,
        "PRE": 1
      },
      "defenses": {
        "Dodge": 6,
        "Parry": 2,
        "Fortitude": 7,
        "Toughness": 7,
        "Will": 6
      },
      "skills": {
        "Athletics": 4,
        "Close Combat (Unarmed)": 3,
        "Driving": 4,
        "Intimidation": 6,
        "Investigation": 4,
        "Perception": 4,
        "Ranged Combat (Guns)": 6,
        "Stealth": 4,
        "Treatment": 2
      },
      "advantages": [
        {
          "name": "All-Out Attack",
          "rank": 1
        },
        {
          "name": "Benefit",
          "rank": 1,
          "option": "Cipher (No Past Records)"
        },
        {
          "name": "Defensive Roll",
          "rank": 3
        },
        {
          "name": "Diehard",
          "rank": 1
        },
        {
          "name": "Equipment",
          "rank": 4
        },
        {
          "name": "Improved Critical",
          "rank": 2,
          "option": "Firearms"
        },
        {
          "name": "Improved Initiative",
          "rank": 1
        },
        {
          "name": "Power Attack",
          "rank": 1
        },
        {
          "name": "Quick Draw",
          "rank": 1
        },
        {
          "name": "Takedown",
          "rank": 2
        },
        {
          "name": "Uncanny Dodge",
          "rank": 1
        }
      ],
      "powers": [
        {
          "name": "Nanite Cellular Regeneration",
          "effect": "Regeneration",
          "ranks": 10,
          "cost": 10,
          "details": "Heals 1 damage condition every round automatically.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Subdermal Armor Weave",
          "effect": "Protection",
          "ranks": 4,
          "cost": 8,
          "details": "Impervious 4. Nanites harden against high-velocity ballistics.",
          "extras": [
            "Impervious"
          ],
          "flaws": []
        },
        {
          "name": "Nanite Technopathy",
          "effect": "Feature",
          "ranks": 2,
          "cost": 2,
          "details": "Interface with, reprogram, and commandeer electronic devices wirelessly.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Nanite Threat Sensors",
          "effect": "Senses",
          "ranks": 3,
          "cost": 3,
          "details": "Infrared vision, Radio sense, Danger sense.",
          "extras": [],
          "flaws": []
        }
      ],
      "gear": [
        {
          "name": "Assault Rifle",
          "category": "Weapons",
          "costEP": 15,
          "description": "Damage 5 (Ranged, Ballistic, Multiattack)."
        },
        {
          "name": "Heavy Pistol",
          "category": "Weapons",
          "costEP": 8,
          "description": "Damage 4 (Ranged, Ballistic)."
        },
        {
          "name": "Combat Knife",
          "category": "Weapons",
          "costEP": 4,
          "description": "Damage 3 (Strength-based, Slashing, Critical 19-20)."
        }
      ]
    },
    {
      "name": "Psiot",
      "concept": "Genetically unique human with an activated brain capable of telekinesis, telepathy, and mental manipulation (like Peter Stanchek or Faith).",
      "pl": 10,
      "abilities": {
        "STR": 0,
        "STA": 3,
        "AGL": 3,
        "DEX": 3,
        "FGT": 3,
        "INT": 3,
        "AWE": 6,
        "PRE": 3
      },
      "defenses": {
        "Dodge": 7,
        "Parry": 5,
        "Fortitude": 5,
        "Toughness": 7,
        "Will": 8
      },
      "skills": {
        "Acrobatics": 2,
        "Close Combat (Unarmed)": 2,
        "Deception": 4,
        "Insight": 6,
        "Investigation": 4,
        "Perception": 6,
        "Persuasion": 4,
        "Ranged Combat (Psionic Power)": 7
      },
      "advantages": [
        {
          "name": "Assessment",
          "rank": 1
        },
        {
          "name": "Defensive Roll",
          "rank": 2
        },
        {
          "name": "Extraordinary Effort",
          "rank": 1
        },
        {
          "name": "Improved Initiative",
          "rank": 1
        },
        {
          "name": "Inspire",
          "rank": 2
        },
        {
          "name": "Luck",
          "rank": 2
        },
        {
          "name": "Teamwork",
          "rank": 1
        },
        {
          "name": "Well-Informed",
          "rank": 1
        }
      ],
      "powers": [
        {
          "name": "Telekinetic Force Blast",
          "effect": "Blast",
          "ranks": 10,
          "cost": 20,
          "details": "Damage 10 (Ranged, Concussive kinetic force).",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Kinetic Companion Barrier",
          "effect": "Force Field",
          "ranks": 6,
          "cost": 7,
          "details": "Protection 6, Affects Others. Sustained telekinetic shield.",
          "extras": [
            "Affects Others"
          ],
          "flaws": []
        },
        {
          "name": "Telepathic Mind Probe",
          "effect": "Mind Reading",
          "ranks": 8,
          "cost": 16,
          "details": "Perception range telepathic scan to glean surface thoughts and memories.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Psiot Levitation / Flight",
          "effect": "Flight",
          "ranks": 5,
          "cost": 10,
          "details": "60 MPH telekinetic flight.",
          "extras": [],
          "flaws": []
        },
        {
          "name": "Psiot Awareness",
          "effect": "Senses",
          "ranks": 3,
          "cost": 3,
          "details": "Detect Psiots (Acute, Extended, Ranged).",
          "extras": [],
          "flaws": []
        }
      ],
      "gear": [
        {
          "name": "Commlink",
          "category": "Gadgets",
          "costEP": 2,
          "description": "Encrypted wireless communicator."
        }
      ]
    }
  ],
  "gearCatalog": [
    {
      "name": "Light Pistol",
      "category": "Weapons",
      "costEP": 6,
      "description": "Damage 3 (Ranged, Ballistic)."
    },
    {
      "name": "Heavy Pistol",
      "category": "Weapons",
      "costEP": 8,
      "description": "Damage 4 (Ranged, Ballistic). Standard sidearm for covert operatives."
    },
    {
      "name": "Assault Rifle",
      "category": "Weapons",
      "costEP": 15,
      "description": "Damage 5 (Ranged, Ballistic, Multiattack). Military-grade automatic rifle."
    },
    {
      "name": "Sniper Rifle",
      "category": "Weapons",
      "costEP": 11,
      "description": "Damage 5 (Ranged, Ballistic, Critical 19-20). Long-range precision rifle."
    },
    {
      "name": "Submachine Gun",
      "category": "Weapons",
      "costEP": 12,
      "description": "Damage 4 (Ranged, Ballistic, Multiattack). Compact rapid-fire firearm."
    },
    {
      "name": "Shotgun",
      "category": "Weapons",
      "costEP": 10,
      "description": "Damage 5 (Ranged, Ballistic, Scatter)."
    },
    {
      "name": "Combat Knife / Katana",
      "category": "Weapons",
      "costEP": 4,
      "description": "Damage 3 (Strength-based, Slashing, Critical 19-20)."
    },
    {
      "name": "Stun Gun / Taser",
      "category": "Weapons",
      "costEP": 5,
      "description": "Affliction 5 (Dazed/Stunned/Incapacitated; Fortitude DC 15)."
    },
    {
      "name": "Frag Grenades (x5)",
      "category": "Weapons",
      "costEP": 15,
      "description": "Damage 5 (Ranged, Burst Area, Ballistic)."
    },
    {
      "name": "Undercover Armored Vest",
      "category": "Armor",
      "costEP": 2,
      "description": "Protection 2 (Subtle). Concealable ballistic weave armor."
    },
    {
      "name": "Tactical Body Armor",
      "category": "Armor",
      "costEP": 4,
      "description": "Protection 4. High-impact Kevlar plate carrier."
    },
    {
      "name": "Riot Shield",
      "category": "Armor",
      "costEP": 3,
      "description": "+2 active Parry defense against close strikes and frontal cover bonus."
    },
    {
      "name": "Smartphone / Commlink",
      "category": "Gadgets",
      "costEP": 2,
      "description": "Encrypted wireless voice, video, GPS navigation, and satellite datalink."
    },
    {
      "name": "Night Vision Goggles",
      "category": "Gadgets",
      "costEP": 1,
      "description": "Senses 1 (Darkvision). Allows clear sight in zero ambient lighting."
    },
    {
      "name": "Lockpick & Bypass Kit",
      "category": "Gadgets",
      "costEP": 1,
      "description": "Tools for Thievery checks against security locks."
    },
    {
      "name": "Field Medical Kit",
      "category": "Gadgets",
      "costEP": 1,
      "description": "Trauma supplies granting +2 to Treatment checks."
    },
    {
      "name": "Tactical Motorcycle",
      "category": "Vehicles",
      "costEP": 10,
      "description": "Size: Medium, Strength 1, Speed 6 (120 MPH), Defense 10, Toughness 8."
    },
    {
      "name": "Armored SUV",
      "category": "Vehicles",
      "costEP": 14,
      "description": "Size: Huge, Strength 6, Speed 5 (60 MPH), Defense 8, Toughness 10, Impervious 4."
    },
    {
      "name": "Safehouse / Base",
      "category": "Headquarters",
      "costEP": 10,
      "description": "Size: Large, Toughness 10, Features: Communications, Computer Mainframe, Concealed, Living Space, Security System."
    }
  ],
  "backgroundPresets": {
    "motivations": [
      {
        "name": "Justice",
        "desc": "You are driven by an absolute commitment to right wrongs, hold villains accountable, and protect the innocent."
      },
      {
        "name": "Acceptance",
        "desc": "You fight to gain acceptance from a society that fears or mistrusts your extraordinary nature or psiot gifts."
      },
      {
        "name": "Doing Good",
        "desc": "You have immense power and feel a fundamental, selfless moral obligation to make the world a better place."
      },
      {
        "name": "Greed",
        "desc": "You are in it for personal wealth, lavish luxury, corporate contracts, or the finest things in life."
      },
      {
        "name": "Patriotism",
        "desc": "You believe deeply in your nation, government, or agency (e.g. G.A.T.E., MI-6, or Rising Spirit)."
      },
      {
        "name": "Recognition",
        "desc": "You crave fame, public adoration, headlines, social media clout, and heroic celebration."
      },
      {
        "name": "Responsibility",
        "desc": "Your gifts or training demand that you step up when crisis calls, because no one else can."
      },
      {
        "name": "Revenge",
        "desc": "Someone took everything from you—an agency, syndicate, or warlord—and you will not stop until they pay."
      },
      {
        "name": "Survival",
        "desc": "You are hunted by powerful factions like Project Rising Spirit or the Harbinger Foundation and fight to stay alive."
      },
      {
        "name": "Thrills",
        "desc": "Adrenaline is your lifeblood. You dive headfirst into superhuman conflicts for the sheer, intoxicating rush."
      },
      {
        "name": "Mercenary",
        "desc": "You are a professional. You take contracts, execute missions with tactical perfection, and collect your fee."
      }
    ],
    "complicationCategories": [
      {
        "name": "Enemy",
        "desc": "A recurring villain, hostile agency, or rival syndicate actively working against you (e.g. Project Rising Spirit)."
      },
      {
        "name": "Identity",
        "desc": "You must safeguard a secret civilian life, loved ones, or private profession from public discovery."
      },
      {
        "name": "Motivation",
        "desc": "Your core heroic drive forces you to intervene even when tactically disadvantageous or dangerous."
      },
      {
        "name": "Power Loss",
        "desc": "Certain circumstances (depleted battery, EMP, specialized anti-psiot dampener) shut down your abilities."
      },
      {
        "name": "Quirk",
        "desc": "An eccentric habit, strict behavioral oath, or personal taboo that complicates social or combat situations."
      },
      {
        "name": "Relationship",
        "desc": "A family member, spouse, teammate, or dependent who frequently ends up in danger or requires aid."
      },
      {
        "name": "Reputation",
        "desc": "You are infamous, feared as a rogue psiot, or regarded with deep suspicion by authorities."
      },
      {
        "name": "Responsibility",
        "desc": "Obligations to an organization, employer, family, or squad that dictate duties and emergency call-ins."
      },
      {
        "name": "Secret",
        "desc": "A dark truth from your past (such as false Rising Spirit implants, former crimes, or hidden heritage)."
      },
      {
        "name": "Temper",
        "desc": "You struggle with explosive anger or combat berserker fury when provoked."
      },
      {
        "name": "Weakness",
        "desc": "You suffer increased vulnerability or damage from a specific hazard (such as sonic attacks, cold, or electricity)."
      },
      {
        "name": "Addiction / Dependency",
        "desc": "You require regular chemical infusions, nanite protein feedings, or meditation to prevent degradation."
      },
      {
        "name": "Disability / Impairment",
        "desc": "A physical or sensory impairment you overcome with training or technological aids."
      },
      {
        "name": "Prejudice",
        "desc": "You face societal discrimination, anti-psiot hostility, or fear from ordinary human populations."
      },
      {
        "name": "Honor",
        "desc": "A strict martial code of conduct that forbids striking from behind, harming noncombatants, or breaking an oath."
      }
    ]
  },
  "tables": {
    "measurements": [
      {
        "rank": -5,
        "mass": "1.5 lbs",
        "distance": "6 inches",
        "time": "1/8 second",
        "volume": "1/8 c. ft.",
        "massMetric": "1.5 kg",
        "distanceMetric": "15 cm",
        "volumeMetric": "1 liter"
      },
      {
        "rank": -4,
        "mass": "3 lbs",
        "distance": "1 foot",
        "time": "1/4 second",
        "volume": "1/4 c. ft.",
        "massMetric": "3 kg",
        "distanceMetric": "30 cm",
        "volumeMetric": "2 liters"
      },
      {
        "rank": -3,
        "mass": "6 lbs",
        "distance": "3 feet",
        "time": "1/2 second",
        "volume": "1/2 c. ft.",
        "massMetric": "6 kg",
        "distanceMetric": "60 cm",
        "volumeMetric": "4 liters"
      },
      {
        "rank": -2,
        "mass": "12 lbs",
        "distance": "6 feet",
        "time": "1 second",
        "volume": "1 c. ft.",
        "massMetric": "12 kg",
        "distanceMetric": "1 m",
        "volumeMetric": "8 liters"
      },
      {
        "rank": -1,
        "mass": "25 lbs",
        "distance": "15 feet",
        "time": "3 seconds",
        "volume": "2 c. ft.",
        "massMetric": "25 kg",
        "distanceMetric": "2 m",
        "volumeMetric": "15 liters"
      },
      {
        "rank": 0,
        "mass": "50 lbs",
        "distance": "30 feet",
        "time": "6 seconds (1 round)",
        "volume": "4 c. ft.",
        "massMetric": "50 kg",
        "distanceMetric": "4 m",
        "volumeMetric": "30 liters"
      },
      {
        "rank": 1,
        "mass": "100 lbs",
        "distance": "60 feet",
        "time": "12 seconds",
        "volume": "8 c. ft.",
        "massMetric": "100 kg",
        "distanceMetric": "8 m",
        "volumeMetric": "60 liters"
      },
      {
        "rank": 2,
        "mass": "200 lbs",
        "distance": "120 feet",
        "time": "30 seconds",
        "volume": "15 c. ft.",
        "massMetric": "200 kg",
        "distanceMetric": "15 m",
        "volumeMetric": "120 liters"
      },
      {
        "rank": 3,
        "mass": "400 lbs",
        "distance": "250 feet",
        "time": "1 minute",
        "volume": "30 c. ft.",
        "massMetric": "400 kg",
        "distanceMetric": "30 m",
        "volumeMetric": "250 liters"
      },
      {
        "rank": 4,
        "mass": "800 lbs",
        "distance": "500 feet",
        "time": "2 minutes",
        "volume": "60 c. ft.",
        "massMetric": "800 kg",
        "distanceMetric": "60 m",
        "volumeMetric": "500 liters"
      },
      {
        "rank": 5,
        "mass": "1600 lbs",
        "distance": "900 feet",
        "time": "4 minutes",
        "volume": "125 c. ft.",
        "massMetric": "1.6 tonnes",
        "distanceMetric": "120 m",
        "volumeMetric": "1 m³"
      },
      {
        "rank": 6,
        "mass": "3200 lbs (1.6 tons)",
        "distance": "1800 feet",
        "time": "8 minutes",
        "volume": "250 c. ft.",
        "massMetric": "3.2 tonnes",
        "distanceMetric": "250 m",
        "volumeMetric": "2 m³"
      },
      {
        "rank": 7,
        "mass": "3 tons",
        "distance": "1/2 mile",
        "time": "15 minutes",
        "volume": "500 c. ft.",
        "massMetric": "6.4 tonnes",
        "distanceMetric": "500 m",
        "volumeMetric": "4 m³"
      },
      {
        "rank": 8,
        "mass": "6 tons",
        "distance": "1 mile",
        "time": "30 minutes",
        "volume": "1000 c. ft.",
        "massMetric": "12.5 tonnes",
        "distanceMetric": "1 km",
        "volumeMetric": "8 m³"
      },
      {
        "rank": 9,
        "mass": "12 tons",
        "distance": "2 miles",
        "time": "1 hour",
        "volume": "2000 c. ft.",
        "massMetric": "25 tonnes",
        "distanceMetric": "2 km",
        "volumeMetric": "15 m³"
      },
      {
        "rank": 10,
        "mass": "25 tons",
        "distance": "4 miles",
        "time": "2 hours",
        "volume": "4000 c. ft.",
        "massMetric": "50 tonnes",
        "distanceMetric": "4 km",
        "volumeMetric": "30 m³"
      },
      {
        "rank": 11,
        "mass": "50 tons",
        "distance": "8 miles",
        "time": "4 hours",
        "volume": "8000 c. ft.",
        "massMetric": "100 tonnes",
        "distanceMetric": "8 km",
        "volumeMetric": "60 m³"
      },
      {
        "rank": 12,
        "mass": "100 tons",
        "distance": "16 miles",
        "time": "8 hours",
        "volume": "16,000 c. ft.",
        "massMetric": "200 tonnes",
        "distanceMetric": "15 km",
        "volumeMetric": "120 m³"
      },
      {
        "rank": 13,
        "mass": "200 tons",
        "distance": "30 miles",
        "time": "16 hours",
        "volume": "32,000 c. ft.",
        "massMetric": "400 tonnes",
        "distanceMetric": "30 km",
        "volumeMetric": "250 m³"
      },
      {
        "rank": 14,
        "mass": "400 tons",
        "distance": "60 miles",
        "time": "1 day",
        "volume": "64,000 c. ft.",
        "massMetric": "800 tonnes",
        "distanceMetric": "60 km",
        "volumeMetric": "500 m³"
      },
      {
        "rank": 15,
        "mass": "800 tons",
        "distance": "120 miles",
        "time": "2 days",
        "volume": "125,000 c. ft.",
        "massMetric": "1,600 tonnes",
        "distanceMetric": "120 km",
        "volumeMetric": "1,000 m³"
      },
      {
        "rank": 16,
        "mass": "1,600 tons",
        "distance": "250 miles",
        "time": "4 days",
        "volume": "250,000 c. ft.",
        "massMetric": "3,200 tonnes",
        "distanceMetric": "250 km",
        "volumeMetric": "2,000 m³"
      },
      {
        "rank": 17,
        "mass": "3,200 tons",
        "distance": "500 miles",
        "time": "1 week",
        "volume": "500,000 c. ft.",
        "massMetric": "6,400 tonnes",
        "distanceMetric": "500 km",
        "volumeMetric": "4,000 m³"
      },
      {
        "rank": 18,
        "mass": "6,000 tons",
        "distance": "1,000 miles",
        "time": "2 weeks",
        "volume": "1,000,000 c. ft.",
        "massMetric": "12,500 tonnes",
        "distanceMetric": "1,000 km",
        "volumeMetric": "8,000 m³"
      },
      {
        "rank": 19,
        "mass": "12,000 tons",
        "distance": "2,000 miles",
        "time": "1 month",
        "volume": "2,000,000 c. ft.",
        "massMetric": "25,000 tonnes",
        "distanceMetric": "2,000 km",
        "volumeMetric": "15,000 m³"
      },
      {
        "rank": 20,
        "mass": "25,000 tons",
        "distance": "4,000 miles",
        "time": "2 months",
        "volume": "4,000,000 c. ft.",
        "massMetric": "50,000 tonnes",
        "distanceMetric": "4,000 km",
        "volumeMetric": "30,000 m³"
      }
    ],
    "plLimits": [
      {
        "pl": 5,
        "pp": 75,
        "atkEffect": 10,
        "defTough": 10,
        "fortWill": 10,
        "maxSkill": 15,
        "archetype": "Rookie / Gritty Street Level"
      },
      {
        "pl": 6,
        "pp": 90,
        "atkEffect": 12,
        "defTough": 12,
        "fortWill": 12,
        "maxSkill": 16,
        "archetype": "Street Vigilante / Gritty Scout"
      },
      {
        "pl": 7,
        "pp": 105,
        "atkEffect": 14,
        "defTough": 14,
        "fortWill": 14,
        "maxSkill": 17,
        "archetype": "Experienced Operative"
      },
      {
        "pl": 8,
        "pp": 120,
        "atkEffect": 16,
        "defTough": 16,
        "fortWill": 16,
        "maxSkill": 18,
        "archetype": "Masked Hero / Rising Spirit Agent"
      },
      {
        "pl": 9,
        "pp": 135,
        "atkEffect": 18,
        "defTough": 18,
        "fortWill": 18,
        "maxSkill": 19,
        "archetype": "Elite Psiot / Veteran Hero"
      },
      {
        "pl": 10,
        "pp": 150,
        "atkEffect": 20,
        "defTough": 20,
        "fortWill": 20,
        "maxSkill": 20,
        "archetype": "Standard Valiant Champion (Bloodshot, Ninjak)"
      },
      {
        "pl": 11,
        "pp": 165,
        "atkEffect": 22,
        "defTough": 22,
        "fortWill": 22,
        "maxSkill": 21,
        "archetype": "Major Power Hero / Heavyweight"
      },
      {
        "pl": 12,
        "pp": 180,
        "atkEffect": 24,
        "defTough": 24,
        "fortWill": 24,
        "maxSkill": 22,
        "archetype": "World-Class Power (Aric X-O, Toyo Harada)"
      },
      {
        "pl": 13,
        "pp": 195,
        "atkEffect": 26,
        "defTough": 26,
        "fortWill": 26,
        "maxSkill": 23,
        "archetype": "Continental Threat"
      },
      {
        "pl": 14,
        "pp": 210,
        "atkEffect": 28,
        "defTough": 28,
        "fortWill": 28,
        "maxSkill": 24,
        "archetype": "Global Phenomenon / Demigod"
      },
      {
        "pl": 15,
        "pp": 225,
        "atkEffect": 30,
        "defTough": 30,
        "fortWill": 30,
        "maxSkill": 25,
        "archetype": "Cosmic Entity / Armor Hunter Tier"
      }
    ],
    "combatManeuvers": [
      {
        "maneuver": "All-Out Attack",
        "action": "Standard",
        "modifier": "Trade up to -5 active defense (Dodge/Parry) for up to +5 on your attack check."
      },
      {
        "maneuver": "Defensive Attack",
        "action": "Standard",
        "modifier": "Trade up to -5 on your attack check for up to +5 to active defense (Dodge/Parry)."
      },
      {
        "maneuver": "Power Attack",
        "action": "Standard",
        "modifier": "Trade up to -5 attack check for up to +5 to damage effect rank."
      },
      {
        "maneuver": "Accurate Attack",
        "action": "Standard",
        "modifier": "Trade up to -5 damage effect rank for up to +5 to attack check."
      },
      {
        "maneuver": "Aim",
        "action": "Standard",
        "modifier": "Take standard action to aim; gain +5 circumstance bonus to your next ranged attack check (+2 if moving)."
      },
      {
        "maneuver": "Charge",
        "action": "Standard",
        "modifier": "Move up to your full speed in a straight line and make a close attack at a -2 penalty to attack."
      },
      {
        "maneuver": "Defend",
        "action": "Standard",
        "modifier": "Roll 1d20 + 10 for active defense against all attacks until your next turn (use whichever is higher)."
      },
      {
        "maneuver": "Demoralize",
        "action": "Standard",
        "modifier": "Roll Intimidation vs. target's Will or Insight. Success imposes Dazed or -2 penalty condition."
      },
      {
        "maneuver": "Disarm",
        "action": "Standard",
        "modifier": "Attack check vs. target's defense. Target rolls Strength or damage rank vs. attack roll to resist."
      },
      {
        "maneuver": "Feint",
        "action": "Standard",
        "modifier": "Roll Deception or Acrobatics vs. target's Insight or Perception. Success renders target Vulnerable."
      },
      {
        "maneuver": "Grab / Grapple",
        "action": "Standard",
        "modifier": "Make unarmed attack check vs. Dodge/Parry. Success forces target Dodge or Strength check vs. your STR or Grab rank."
      },
      {
        "maneuver": "Smash (Object)",
        "action": "Standard",
        "modifier": "Attack target's weapon or held equipment. Opposed roll against item Toughness to break it."
      },
      {
        "maneuver": "Trip",
        "action": "Standard",
        "modifier": "Close attack check vs. Dodge/Parry. Opposed Athletics/Acrobatics roll. Success knocks target Prone."
      },
      {
        "maneuver": "Team Attack",
        "action": "Standard",
        "modifier": "Two or more characters attack same target with similar attacks. Primary attacker gains +2 or +5 bonus."
      }
    ],
    "circumstances": [
      {
        "circumstance": "Cover (Partial)",
        "effect": "+2 circumstance bonus to active Dodge and Parry defenses against attacks."
      },
      {
        "circumstance": "Cover (Total)",
        "effect": "+5 circumstance bonus to active defenses; cannot be targeted directly without penetrating cover."
      },
      {
        "circumstance": "Concealment (Partial)",
        "effect": "Target has visual distortion, smoke, or dim lighting: -2 penalty to attacker's check."
      },
      {
        "circumstance": "Concealment (Total)",
        "effect": "Attacker is blind or target is completely invisible: -5 penalty to attack and target rolls DC 10 flat check to hit."
      },
      {
        "circumstance": "Prone Attacker",
        "effect": "-5 penalty on close attack rolls; cannot make ranged attacks without appropriate advantages."
      },
      {
        "circumstance": "Prone Defender",
        "effect": "-5 active defense vs. close attacks; +5 circumstance bonus to active defense vs. ranged attacks beyond 30 ft."
      },
      {
        "circumstance": "Surprise / Flat-Footed",
        "effect": "Target is Vulnerable (halved active defenses) and suffers -5 on Perception checks."
      },
      {
        "circumstance": "Vulnerable Condition",
        "effect": "Active defenses (Dodge and Parry) are halved (round down). Base toughness is unaffected."
      },
      {
        "circumstance": "Defenseless Condition",
        "effect": "Active defenses (Dodge and Parry) are treated as 0. Attackers gain +5 bonus to hit or automatic critical on close coup de grace."
      },
      {
        "circumstance": "Hindered Condition",
        "effect": "Target's movement speed is halved."
      },
      {
        "circumstance": "Immobile Condition",
        "effect": "Target has speed rank -5 and cannot move, but may still take standard actions."
      }
    ],
    "damageTrack": [
      {
        "condition": "Bruised / -1 Penalty",
        "trigger": "Fail Toughness by 1-4",
        "effect": "-1 circumstance penalty to future Toughness checks. Penalties are cumulative."
      },
      {
        "condition": "Dazed",
        "trigger": "Fail Toughness by 5-9",
        "effect": "Target is limited to a single standard action and cannot take move actions on their next turn, plus suffers -1 Toughness penalty."
      },
      {
        "condition": "Staggered",
        "trigger": "Fail Toughness by 10-14",
        "effect": "Target is Dazed and Hindered. A second Staggered result immediately results in Incapacitation."
      },
      {
        "condition": "Incapacitated",
        "trigger": "Fail Toughness by 15+",
        "effect": "Target is unconscious, defenseless, and completely out of the fight."
      },
      {
        "condition": "Dying",
        "trigger": "Lethal damage while Incapacitated",
        "effect": "Target must roll Fortitude each round to avoid succumbing to death."
      }
    ],
    "benchmarks": [
      {
        "dc": 0,
        "difficulty": "Routine",
        "example": "Notice something in plain sight; jump over a small puddle"
      },
      {
        "dc": 5,
        "difficulty": "Very Easy",
        "example": "Climb a ladder; drive along a clear highway"
      },
      {
        "dc": 10,
        "difficulty": "Easy",
        "example": "Notice someone skulking behind a car; apply first aid"
      },
      {
        "dc": 15,
        "difficulty": "Moderate",
        "example": "Disarm an ordinary alarm system; recall obscure news event"
      },
      {
        "dc": 20,
        "difficulty": "Hard",
        "example": "Pick a military padlock; leap across an alleyway between rooftops"
      },
      {
        "dc": 25,
        "difficulty": "Very Hard",
        "example": "Infiltrate a guarded corporate compound; hack a secure firewall"
      },
      {
        "dc": 30,
        "difficulty": "Formidable",
        "example": "Decipher alien Shanhara encryption; jump between moving subway trains"
      },
      {
        "dc": 35,
        "difficulty": "Heroic",
        "example": "Outsmart Toyo Harada's psionic mental traps; disarm a dirty bomb in seconds"
      },
      {
        "dc": 40,
        "difficulty": "Superhuman",
        "example": "Directly resist the Deadside's ancient necromantic entities"
      }
    ],
    "materialToughness": [
      {
        "material": "Paper, Cloth, Cardboard",
        "toughness": 0,
        "examples": "Documents, clothing, cardboard boxes"
      },
      {
        "material": "Glass, Ice",
        "toughness": 1,
        "examples": "Window glass, car windshields, sheet ice"
      },
      {
        "material": "Rope, Canvas, Heavy Leather",
        "toughness": 2,
        "examples": "Climbing rope, ballistic tarps, heavy armor"
      },
      {
        "material": "Wood, Drywall, Light Plastics",
        "toughness": 3,
        "examples": "Interior doors, drywall partitions, wooden furniture"
      },
      {
        "material": "Hardwood, Dense Brick",
        "toughness": 5,
        "examples": "Reinforced wood, masonry walls, asphalt pavement"
      },
      {
        "material": "Cast Iron, Sheet Metal",
        "toughness": 7,
        "examples": "Fire escapes, manhole covers, car doors, light safes"
      },
      {
        "material": "Reinforced Concrete",
        "toughness": 8,
        "examples": "Bunker walls, bridge pillars, bank vaults"
      },
      {
        "material": "Solid Structural Steel",
        "toughness": 10,
        "examples": "I-beams, armored vehicle plating, high-security bulkheads"
      },
      {
        "material": "Super-Alloy / Titanium",
        "toughness": 12,
        "examples": "Submarine hulls, military blast doors, aerospace shields"
      },
      {
        "material": "Alien Metal / Shanhara Weave",
        "toughness": 15,
        "examples": "X-O Manowar armor hull, Armor Hunter relics, psionic barriers"
      }
    ],
    "interactionAttitudes": [
      {
        "attitude": "Hostile",
        "dcAdjustment": "+10 DC",
        "description": "Target actively seeks to harm, betray, or ruin you. Will take risks to foil you."
      },
      {
        "attitude": "Unfriendly",
        "dcAdjustment": "+5 DC",
        "description": "Target wishes you ill, refuses to cooperate, and misleads or obstructs if convenient."
      },
      {
        "attitude": "Indifferent",
        "dcAdjustment": "+0 DC",
        "description": "Target doesn't care either way; views you pragmatically or as a professional contact."
      },
      {
        "attitude": "Friendly",
        "dcAdjustment": "-5 DC",
        "description": "Target wishes you well, offers minor favors or discounts, and shares routine information."
      },
      {
        "attitude": "Helpful",
        "dcAdjustment": "-10 DC",
        "description": "Target is a trusted ally, will take substantial personal risks to protect and assist you."
      }
    ],
    "traitCosts": [
      {
        "trait": "Abilities",
        "cost": "2 PP per +1 rank",
        "details": "Purchased for Strength, Agility, Fighting, Awareness, Stamina, Dexterity, Intellect, and Presence. Base rank is 0 (average human)."
      },
      {
        "trait": "Defenses",
        "cost": "1 PP per +1 rank",
        "details": "Purchased for Dodge, Parry, Fortitude, and Will to boost defense values above ability modifier limits. Toughness is boosted by Protection or Defensive Roll."
      },
      {
        "trait": "Skills",
        "cost": "1 PP per 2 ranks (0.5 PP / rank)",
        "details": "Adds bonus to d20 skill checks. Purchased in pairs (1 PP grants 2 ranks across any skills). Subject to PL skill caps (PL + 10)."
      },
      {
        "trait": "Advantages",
        "cost": "1 PP per rank",
        "details": "Special combat capabilities, social benefits, fortune maneuvers, or skill enhancements. Ranked advantages can be taken multiple times."
      },
      {
        "trait": "Powers",
        "cost": "Base Cost / rank + Extras - Flaws (min 1 PP)",
        "details": "Effects cost between 1 and 4+ PP per rank depending on base power. Extras increase cost by +1 to +5 PP/rank; Flaws decrease cost by -1 to -3 PP/rank."
      },
      {
        "trait": "Alternate Effects (Arrays)",
        "cost": "1 PP flat (2 PP flat for Dynamic)",
        "details": "Secondary power effects slotted under a primary effect. Share the primary effect's power points and cannot normally be used simultaneously."
      },
      {
        "trait": "Equipment",
        "cost": "1 PP per 5 EP",
        "details": "Purchased via the Equipment advantage. 1 PP gives 5 Equipment Points (EP) spent on standard weapons, armor, vehicles, and headquarters."
      },
      {
        "trait": "Removable Devices",
        "cost": "-1 PP discount per 5 PP",
        "details": "Flaw applied to powers accessible only via an item that can be removed in combat with an action (e.g. battlesuit, helm, harness)."
      },
      {
        "trait": "Easily Removable Devices",
        "cost": "-2 PP discount per 5 PP",
        "details": "Flaw applied to powers accessible only via an item that can be disarmed or snatched in combat (e.g. handheld weapon, wand, ring)."
      }
    ]
  }
};
