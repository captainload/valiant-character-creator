// Valiant Adventures RPG - Core Data & Rules Reference
// Powered by the Mutants & Masterminds 3E / Valiant Adventures System

const VALIANT_DATA = {
  abilities: {
    STR: {
      name: "Strength (STR)",
      short: "STR",
      costPerRank: 2,
      description: "Strength measures raw physical power and muscle. It determines how much weight you can lift and carry, the damage you inflict with unarmed close combat attacks and thrown objects, and your modifier for Athletics checks. In the Valiant universe, characters like Aric of Dacia (in the X-O Manowar armor) or Bloodshot's nanite-enhanced musculature boast superhuman Strength ranks."
    },
    STA: {
      name: "Stamina (STA)",
      short: "STA",
      costPerRank: 2,
      description: "Stamina represents physical health, vigor, toughness, and endurance. It provides your base Toughness defense against physical damage and your Fortitude defense against poisons, toxins, diseases, radiation, and exhaustion. Soldiers infused with Project Rising Spirit nanites have immense Stamina, enabling rapid cellular regeneration."
    },
    AGL: {
      name: "Agility (AGL)",
      short: "AGL",
      costPerRank: 2,
      description: "Agility encompasses coordination, balance, nimbleness, and whole-body speed. It governs your base Dodge defense against ranged attacks, your initiative in combat, and your checks with Acrobatics and Stealth. Ninjas like Ninjak (Colin King) and agile psiots rely on exceptional Agility to evade fire and maneuver through dense urban warzones."
    },
    DEX: {
      name: "Dexterity (DEX)",
      short: "DEX",
      costPerRank: 2,
      description: "Dexterity measures hand-eye coordination, fine motor control, manual precision, and accuracy with ranged weaponry. It forms the foundation for your ranged attack checks (Ranged Combat skill), Sleight of Hand, and piloting land, sea, or air machinery via Vehicles. Expert marksmen and archers like Obadiah Archer rely on supreme Dexterity."
    },
    FGT: {
      name: "Fighting (FGT)",
      short: "FGT",
      costPerRank: 2,
      description: "Fighting represents hand-to-hand combat prowess, martial arts training, tactical melee positioning, and close-quarters defense. It determines your Parry defense against melee attacks and your base attack bonus for close combat. Masters of ancient and modern martial disciplines like Ninjak and Eternal Warrior possess master-class Fighting."
    },
    INT: {
      name: "Intellect (INT)",
      short: "INT",
      costPerRank: 2,
      description: "Intellect covers reasoning ability, technical knowledge, deductive logic, memory, and cognitive horsepower. It modifies checks for Expertise (science, tactics, history), Investigation, Technology, and Treatment. Super-geniuses like Toyo Harada, Livewire (Amanda McKee), and MI-6 tech analysts possess stratospheric Intellect."
    },
    AWE: {
      name: "Awareness (AWE)",
      short: "AWE",
      costPerRank: 2,
      description: "Awareness reflects common sense, intuitive perception, spiritual clarity, and instinct. It establishes your base Will defense against mental control, fear, and psionic manipulation, as well as your modifier for Insight and Perception. Mystics tied to the Deadside like Shadowman (Jack Boniface) rely deeply on Awareness."
    },
    PRE: {
      name: "Presence (PRE)",
      short: "PRE",
      costPerRank: 2,
      description: "Presence measures force of personality, persuasion, leadership, intimidation, and raw charisma. It modifies Deception, Intimidation, and Persuasion checks. Whether commanding military legions, intimidating criminal syndicates, or inspiring fellow psiots, high Presence can change the course of an entire campaign without throwing a punch."
    }
  },

  defenses: {
    Dodge: {
      name: "Dodge",
      ability: "AGL",
      costPerRank: 1,
      description: "Your active defense against ranged attacks, area hazards, and explosive shrapnel. Governed naturally by Agility, you can spend Power Points to increase your Dodge rank beyond your base Agility to slip through hail-of-bullets combat encounters."
    },
    Parry: {
      name: "Parry",
      ability: "FGT",
      costPerRank: 1,
      description: "Your active defense against close combat and melee attacks. Governed naturally by Fighting, additional ranks reflect parrying blades, blocking strikes, and deflective martial maneuvers."
    },
    Fortitude: {
      name: "Fortitude",
      ability: "STA",
      costPerRank: 1,
      description: "Your resistance against physiological hazards: biological plagues, toxins, nanite disruptors, radiation, suffocation, and extreme physical strain. Governed by Stamina."
    },
    Toughness: {
      name: "Toughness",
      ability: "STA",
      costPerRank: 1,
      description: "Your direct resistance against physical injury and blunt trauma. When struck by a damaging attack, you roll 1d20 + Toughness against DC (15 + Damage Rank). Stamina provides base Toughness; armor and defensive powers (such as Protection or Force Fields) boost this defense."
    },
    Will: {
      name: "Will",
      ability: "AWE",
      costPerRank: 1,
      description: "Your mental fortitude and resolve against psionic intrusion, mind control, fear, sensory overload, and supernatural afflictions from the Deadside. Governed by Awareness."
    }
  },

  skills: {
    "Acrobatics": {
      ability: "AGL",
      description: "Perform flips, navigate tightropes, tumble across obstacles, cushion long falls, and break free from pin holds. In combat, characters with the Agile Feint advantage can use Acrobatics to mislead and off-balance opponents."
    },
    "Athletics": {
      ability: "STR",
      description: "Covering rigorous physical exertion including sprinting, leaping, scaling sheer vertical cliffs, swimming raging currents, and throwing heavy objects or fallen vehicles."
    },
    "Close Combat": {
      ability: "FGT",
      isSpecialty: true,
      description: "Specialized melee expertise with a specific weapon or combat style (e.g. Close Combat: Swords, Close Combat: Unarmed, Close Combat: Nanite Claws). Adds directly to attack rolls made with that chosen weapon group."
    },
    "Deception": {
      ability: "PRE",
      description: "Misleading others through lying, disguises, fast-talk, double-speak, espionage infiltration, or feinting during tactical combat maneuvers."
    },
    "Expertise": {
      ability: "INT",
      isSpecialty: true,
      description: "Specialized fields of scholarly, technical, or professional knowledge (e.g. Expertise: Science, Expertise: Psionics, Expertise: History, Expertise: Military Tactics, Expertise: Streetwise, Expertise: Deadside Lore)."
    },
    "Insight": {
      ability: "AWE",
      description: "Evaluating motives, detecting lies, sensing psionic distress, reading body language, or predicting tactical ambushes before they strike."
    },
    "Intimidation": {
      ability: "PRE",
      description: "Overwhelming others through menace, interrogation, sheer physical terror, or psychological warfare. In combat, can be used to demoralize an adversary into losing actions."
    },
    "Investigation": {
      ability: "INT",
      description: "Finding clues at crime scenes, analyzing ballistics, conducting surveillance, profiling adversaries, and sifting through classified databases."
    },
    "Perception": {
      ability: "AWE",
      description: "Noticing visual details, distant sounds, faint odors, hidden traps, or stealthed infiltrators. Opposes enemy Stealth checks."
    },
    "Persuasion": {
      ability: "PRE",
      description: "Winning over targets through reasoned diplomacy, negotiation, emotional rapport, inspiring allies, or mediating volatile political disputes."
    },
    "Ranged Combat": {
      ability: "DEX",
      isSpecialty: true,
      description: "Specialized training with a specific ranged weapon category (e.g. Ranged Combat: Firearms, Ranged Combat: Bows, Ranged Combat: Shuriken, Ranged Combat: Energy Blasts). Adds directly to ranged attack rolls."
    },
    "Sleight of Hand": {
      ability: "DEX",
      description: "Pickpocketing, palming contraband, slipping out of handcuffs, concealing small gadgets, and manipulating locks or delicate mechanism pins."
    },
    "Stealth": {
      ability: "AGL",
      description: "Moving silently, blending into shadows, avoiding electronic sensors, and executing covert infiltrations into high-security facilities."
    },
    "Technology": {
      ability: "INT",
      description: "Inventing, repairing, hacking, hotwiring, and deciphering electronic systems, cybernetics, computer mainframes, and advanced alien technology."
    },
    "Treatment": {
      ability: "INT",
      description: "Diagnosing wounds, performing field surgery, stabilizing dying operatives, treating exotic poisons, and managing medical emergencies."
    },
    "Vehicles": {
      ability: "DEX",
      description: "Piloting high-performance motorbikes, military helicopters, combat submarines, automated aircraft, and extraterrestrial vessels under combat duress."
    }
  },

  advantages: {
    "Accurate Attack": {
      category: "Combat",
      ranks: 1,
      description: "Trade effect rank for an equal bonus on your attack check (up to -5 to effect for +5 to attack), allowing you to pinpoint vulnerable targets."
    },
    "Agile Feint": {
      category: "Combat",
      ranks: 1,
      description: "Use your Acrobatics skill rank in place of Deception when executing combat feints to catch opponents flat-footed."
    },
    "All-out Attack": {
      category: "Combat",
      ranks: 1,
      description: "Trade active defense (Dodge or Parry) for an equal bonus to your attack roll (up to -5 defense for +5 attack), throwing caution to the wind for a devastating strike."
    },
    "Artificer": {
      category: "Skill",
      ranks: 1,
      description: "Use Expertise: Magic/Deadside to craft temporary mystic talismans, charms, and relics imbued with supernatural powers."
    },
    "Assessment": {
      category: "Skill",
      ranks: 1,
      description: "Make an Insight check as a free action to gauge an opponent's relative combat capabilities, attack bonus, or defenses compared to your own."
    },
    "Attractive": {
      category: "General",
      ranks: 2,
      description: "Gain a +2 circumstance bonus per rank on Deception and Persuasion checks involving targets who may be susceptible to your physical charm."
    },
    "Benefit": {
      category: "General",
      ranks: 10,
      description: "Represents societal advantages such as Wealth, Diplomatic Immunity, Security Clearance, Alternate Identity, Corporate CEO, or High Status."
    },
    "Blind-Fight": {
      category: "Combat",
      ranks: 1,
      description: "Reduce penalties for fighting in total darkness, heavy smoke, or against concealed adversaries to minimal levels."
    },
    "Chokehold": {
      category: "Combat",
      ranks: 1,
      description: "Pinning an opponent allows you to suffocate them, forcing Fortitude checks against incapacitation every round."
    },
    "Close Attack": {
      category: "Combat",
      ranks: 10,
      description: "Gain a +1 bonus to all close attack rolls per rank, up to the campaign's Power Level limits."
    },
    "Connected": {
      category: "General",
      ranks: 1,
      description: "Call upon government, corporate, or underworld contacts with a Persuasion check to obtain vital favors, gear, or intelligence."
    },
    "Contacts": {
      category: "Skill",
      ranks: 1,
      description: "Make an initial Investigation check in a new city or network in minutes rather than hours through established informants."
    },
    "Daze": {
      category: "Combat",
      ranks: 1,
      description: "Use Deception or Intimidation in combat to cause an adversary to become dazed for one round, limiting them to a single standard action."
    },
    "Defensive Attack": {
      category: "Combat",
      ranks: 1,
      description: "Trade attack bonus for an active defense bonus (up to -5 attack for +5 Dodge or Parry)."
    },
    "Defensive Roll": {
      category: "Combat",
      ranks: 5,
      description: "Gain +1 active Toughness defense per rank against physical damage while conscious and not vulnerable or defenseless."
    },
    "Diehard": {
      category: "General",
      ranks: 1,
      description: "Automatically stabilize when dying at the start of each round, refusing to succumb to fatal bodily trauma."
    },
    "Eidetic Memory": {
      category: "General",
      ranks: 1,
      description: "Recall anything you have ever experienced with crystalline precision, granting +5 to recall checks."
    },
    "Equipment": {
      category: "General",
      ranks: 20,
      description: "Provides 5 Equipment Points (EP) per rank to purchase weapons, vehicles, body armor, and headquarters."
    },
    "Evasion": {
      category: "Combat",
      ranks: 2,
      description: "Gain +2 circumstance bonus per rank to Dodge checks made to avoid area attacks, explosions, and hazards."
    },
    "Extraordinary Effort": {
      category: "Fortune",
      ranks: 1,
      description: "Gain the benefits of two extra effort applications simultaneously when pushing yourself to the absolute brink."
    },
    "Fascinate": {
      category: "Skill",
      ranks: 1,
      description: "Captivate an audience using an interaction skill (Persuasion, Intimidation, Deception), rendering them spellbound and distracted."
    },
    "Fast Work": {
      category: "Skill",
      ranks: 1,
      description: "Complete routine skill tasks (like hacking, repairs, or lockpicking) in half the ordinary required time."
    },
    "Favored Environment": {
      category: "Combat",
      ranks: 1,
      description: "Gain a +2 bonus to attack checks or active defense when battling in a chosen environment (e.g. Underwater, Urban Rooftops, The Deadside, Aerial Flight)."
    },
    "Favored Foe": {
      category: "Combat",
      ranks: 5,
      description: "Gain a +1 circumstance bonus per rank on checks to deceive, intimidate, notice, or track a specific category of opponents (e.g. Psiots, Nanite cyborgs, Aliens, Cultists)."
    },
    "Fearless": {
      category: "General",
      ranks: 1,
      description: "Completely immune to fear effects, intimidation checks, and supernatural terror."
    },
    "Hide in Plain Sight": {
      category: "Skill",
      ranks: 1,
      description: "Use the Stealth skill to hide even while being actively observed, vanishing like a ghost into shadows or crowds."
    },
    "Improved Aim": {
      category: "Combat",
      ranks: 1,
      description: "Doubles the bonuses granted when taking the Aim action before firing a ranged attack."
    },
    "Improved Critical": {
      category: "Combat",
      ranks: 4,
      description: "Increase the critical threat range of a chosen attack by 1 per rank (e.g., scoring critical hits on rolls of 19-20, 18-20)."
    },
    "Improved Defense": {
      category: "Combat",
      ranks: 1,
      description: "Gain an extra +2 circumstance bonus to active defenses when executing the Defend combat action."
    },
    "Improved Initiative": {
      category: "Combat",
      ranks: 5,
      description: "Gain a +4 bonus per rank on your combat Initiative checks, reacting with split-second reflexes."
    },
    "Inspire": {
      category: "Fortune",
      ranks: 5,
      description: "Spend a Hero Point to grant allies a +1 bonus per rank (max +5) on all checks for one turn."
    },
    "Instant Up": {
      category: "Combat",
      ranks: 1,
      description: "Stand up from a prone or knocked-down position as a free action without expending movement."
    },
    "Interpose": {
      category: "Combat",
      ranks: 1,
      description: "Once per round, move up to your full speed to jump in the path of an attack targeting an adjacent ally, taking the blow yourself."
    },
    "Inventor": {
      category: "Skill",
      ranks: 1,
      description: "Design and build temporary high-tech prototypes, power gadgets, and technological counter-measures using Technology."
    },
    "Jack-of-all-Trades": {
      category: "Skill",
      ranks: 1,
      description: "Use any skill untrained, even advanced technical or specialized skills that normally require formal training."
    },
    "Languages": {
      category: "General",
      ranks: 10,
      description: "Fluent in additional spoken and written languages (1 additional language for rank 1, doubling with higher ranks or polyglot)."
    },
    "Leadership": {
      category: "Fortune",
      ranks: 1,
      description: "Spend a Hero Point to remove dazed, fatigued, or stunned conditions from a nearby teammate."
    },
    "Luck": {
      category: "Fortune",
      ranks: 5,
      description: "Gain extra re-roll points per gaming session that function just like Hero Points for re-rolling d20s."
    },
    "Move-by Action": {
      category: "Combat",
      ranks: 1,
      description: "Carry out a standard action in the middle of your movement, moving before and after the action seamlessly."
    },
    "Power Attack": {
      category: "Combat",
      ranks: 1,
      description: "Trade attack bonus for an equal bonus to your damage or effect rank (up to -5 to attack for +5 to effect), delivering a bone-shattering blow."
    },
    "Precise Attack": {
      category: "Combat",
      ranks: 4,
      description: "Ignore penalties for cover or concealment with close or ranged attacks depending on the selected category."
    },
    "Quick Draw": {
      category: "Combat",
      ranks: 1,
      description: "Draw, holster, or switch weapons as a free action rather than a move action."
    },
    "Ranged Attack": {
      category: "Combat",
      ranks: 10,
      description: "Gain a +1 bonus per rank on all ranged attack rolls, staying within campaign Power Level limits."
    },
    "Redirect": {
      category: "Combat",
      ranks: 1,
      description: "When an enemy misses you with a close combat attack, use a Deception trick to cause the attack to hit another adjacent foe."
    },
    "Ritualist": {
      category: "Skill",
      ranks: 1,
      description: "Cast complex occult rituals, wardings, and summonings from the Deadside using the Expertise: Magic skill."
    },
    "Second Chance": {
      category: "General",
      ranks: 3,
      description: "Gain an automatic re-roll on hazard checks of a chosen category (e.g. Mind Control, Falling, Radiation, Poison)."
    },
    "Seize Initiative": {
      category: "Fortune",
      ranks: 1,
      description: "Spend a Hero Point to immediately take the very first turn at the top of the combat initiative order."
    },
    "Set-up": {
      category: "Combat",
      ranks: 2,
      description: "Transfer the combat benefits of your successful Feint or Intimidation checks to an ally so they can exploit the vulnerability."
    },
    "Startle": {
      category: "Combat",
      ranks: 1,
      description: "Use the Intimidation skill to feint in combat, rendering your adversary vulnerable for your next strike."
    },
    "Takedown": {
      category: "Combat",
      ranks: 2,
      description: "If you render a minion incapacitated with a close attack, you immediately get a free extra attack on another minion within reach."
    },
    "Taunt": {
      category: "Skill",
      ranks: 1,
      description: "Use Deception in combat to demoralize an adversary, provoking them into rash mistakes and penalties."
    },
    "Teamwork": {
      category: "Combat",
      ranks: 1,
      description: "Provide a +5 bonus (instead of +2) when successfully performing the Team Attack or Aid actions with an ally."
    },
    "Throwing Mastery": {
      category: "Combat",
      ranks: 5,
      description: "Increase the damage or distance of thrown weapons and improvised projectiles by +1 rank per advantage rank."
    },
    "Tracking": {
      category: "Skill",
      ranks: 1,
      description: "Follow faint footprints, scent trails, nanite residue, or psionic footprints using the Perception skill at normal movement speed."
    },
    "Uncanny Dodge": {
      category: "Combat",
      ranks: 1,
      description: "You retain your active Dodge and Parry defense even when caught surprised, flat-footed, or attacked from hiding."
    },
    "Well-Informed": {
      category: "Skill",
      ranks: 1,
      description: "Make an immediate free Investigation or Perception check whenever encountering a notable person, faction, or situation to recall dossier details."
    }
  },

  powerEffects: {
    "Affliction": {
      type: "Attack",
      action: "Standard",
      range: "Close",
      duration: "Instant",
      baseCost: 1,
      description: "Imposes debilitating conditions on the target (e.g. Dazed/Stunned/Incapacitated or Fatigued/Exhausted/Paralyzed). Target rolls a defense check (usually Fortitude or Will) against DC (10 + Rank). Typical of psionic mental blasts, nerve strikes, or tranquilizer gas."
    },
    "Blast (Damage: Ranged)": {
      type: "Attack",
      action: "Standard",
      range: "Ranged",
      duration: "Instant",
      baseCost: 2,
      description: "A ranged projectile, energy beam, or telekinetic strike that inflicts harm. Target rolls Toughness against DC (15 + Rank). Examples: X-O Manowar's energy blasts, Bloodshot's high-caliber railgun bursts, psionic telekinetic darts."
    },
    "Burrowing": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 1,
      description: "Tunnel through earth, rock, reinforced concrete, or steel at your movement speed rank. Essential for subterranean operatives and seismic manipulators."
    },
    "Comprehend": {
      type: "Sensory",
      action: "None",
      range: "Personal",
      duration: "Continuous",
      baseCost: 2,
      description: "Understand, speak, read, and decipher any human language, alien dialects, machine code, or communicate telepathically with animals and spirits of the Deadside."
    },
    "Concealment": {
      type: "Sensory",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 2,
      description: "Total invisibility or stealth against specific sensory types (normal visual, infrared thermal, radar, acoustic, or mental detection). Standard for Ninjak's stealth cloaking suit."
    },
    "Create": {
      type: "Control",
      action: "Standard",
      range: "Ranged",
      duration: "Sustained",
      baseCost: 2,
      description: "Generate solid objects composed of psionic force, hardened hard-light, ice, or nanite lattices. Objects possess Toughness equal to the effect rank."
    },
    "Damage (Melee)": {
      type: "Attack",
      action: "Standard",
      range: "Close",
      duration: "Instant",
      baseCost: 1,
      description: "Delivers direct physical, thermal, or energy damage in hand-to-hand combat (punches, plasma blades, nanite blades). Target rolls Toughness against DC (15 + Rank)."
    },
    "Deflect": {
      type: "Defense",
      action: "Standard",
      range: "Ranged",
      duration: "Instant",
      baseCost: 1,
      description: "Actively parry, swat away, or bounce ranged attacks aimed at yourself or allies using an energy shield, blade, or psionic barrier."
    },
    "Duplication": {
      type: "Control",
      action: "Standard",
      range: "Close",
      duration: "Sustained",
      baseCost: 3,
      description: "Spawn identical autonomous copies of yourself who share your abilities and skills to overwhelm adversaries through sheer numbers."
    },
    "Elongation": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 1,
      description: "Stretch, extend, or contort your limbs, fingers, or entire body across substantial distances, striking and grabbing targets from afar."
    },
    "Enhanced Trait": {
      type: "General",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 2,
      description: "Temporarily or superhumanly amplify an ability, defense, or skill (e.g. Enhanced Strength via powered armor or psionic adrenaline surge). Cost matches the trait boosted."
    },
    "Environment": {
      type: "Control",
      action: "Standard",
      range: "Ranged",
      duration: "Sustained",
      baseCost: 1,
      description: "Alter ambient conditions across a designated radius: produce blinding light, suppress temperature to freezing, create blistering heat, or reduce visibility with dense fog."
    },
    "Flight": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 2,
      description: "Soar through the air at high speeds under personal or technological power. Ranks determine speed (Rank 1 = 4 MPH; Rank 6 = 120 MPH; Rank 10 = 2,000 MPH Mach 3; Rank 15 = Sub-orbital). Hallmark of the X-O Manowar armor and airborne psiots like Faith Herbert."
    },
    "Growth": {
      type: "General",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 2,
      description: "Increase physical size, gaining corresponding bonuses to Strength, Stamina, mass, and reach while suffering modest penalties to stealth and active dodge."
    },
    "Healing": {
      type: "Defense",
      action: "Standard",
      range: "Close",
      duration: "Instant",
      baseCost: 2,
      description: "Accelerate recovery from wounds, remove damage conditions, and revive dying allies. Powered by psionic energy, nanite transfusions, or mystic Deadside blessings."
    },
    "Illusion": {
      type: "Control",
      action: "Standard",
      range: "Ranged",
      duration: "Sustained",
      baseCost: 2,
      description: "Deceive senses by manifesting lifelike visual, auditory, tactile, or olfactory illusions that can confound enemy security forces and drones."
    },
    "Immortality": {
      type: "Defense",
      action: "None",
      range: "Personal",
      duration: "Permanent",
      baseCost: 2,
      description: "Return from death after being slain. The higher your rank, the faster your resurrection takes place (from days down to minutes or seconds). The hallmark of the Eternal Warrior (Gilad Anni-Padda)."
    },
    "Immunity": {
      type: "Defense",
      action: "None",
      range: "Personal",
      duration: "Permanent",
      baseCost: 1,
      description: "Absolute invulnerability to specific hazards (e.g. Aging, Suffocation, Radiation, Toxins, Cold, Heat, or Psionic Mental Control)."
    },
    "Insubstantial": {
      type: "General",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 5,
      description: "Transform into a gaseous vapor, liquid form, particle swarm, or completely intangible spirit form able to drift through solid walls and ignore physical attacks."
    },
    "Leaping": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Instant",
      baseCost: 1,
      description: "Propel yourself across vast vertical and horizontal distances in single superhuman bounds, leaping over skyscrapers and city blocks."
    },
    "Mind Reading": {
      type: "Sensory",
      action: "Standard",
      range: "Perception",
      duration: "Sustained",
      baseCost: 2,
      description: "Probe target consciousness to glean surface thoughts, buried memories, confidential passwords, or deepest subconscious fears. Hallmark psiot ability."
    },
    "Morph": {
      type: "General",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 5,
      description: "Alter physical appearance into specific human forms, any humanoid shape, or entirely different species with pinpoint cellular fidelity."
    },
    "Move Object": {
      type: "Control",
      action: "Standard",
      range: "Ranged",
      duration: "Sustained",
      baseCost: 2,
      description: "Telekinesis! Lift, throw, squeeze, and manipulate physical matter at a distance without physical contact, using your effect rank as effective Strength."
    },
    "Movement": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 2,
      description: "Specialized movement modes: Wall-crawling, Water-walking, Safe Fall, Permeate, Dimension Travel (into the Deadside), or Time Travel."
    },
    "Nanite Swarm / Control": {
      type: "Control",
      action: "Standard",
      range: "Perception",
      duration: "Sustained",
      baseCost: 2,
      description: "Bloodshot & Livewire signature: Interface with, hack, commandeer, and reprogram electronic devices, wireless networks, and cybernetics remotely."
    },
    "Nullify": {
      type: "Attack",
      action: "Standard",
      range: "Ranged",
      duration: "Instant",
      baseCost: 1,
      description: "Disrupt and shut down powers of a specific descriptor (e.g. Nullify Psionics, Nullify Technology, Nullify Magic). Opposed check against power rank."
    },
    "Protection": {
      type: "Defense",
      action: "None",
      range: "Personal",
      duration: "Permanent",
      baseCost: 1,
      description: "Adds directly to your Toughness defense against harm, representing armor plating, dense subcutaneous nanite weave, or protective psionic aura."
    },
    "Quickness": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 1,
      description: "Perform routine, mental, or physical tasks at astonishing speeds (e.g. read an entire library in seconds, assemble machinery in the blink of an eye)."
    },
    "Regeneration": {
      type: "Defense",
      action: "None",
      range: "Personal",
      duration: "Permanent",
      baseCost: 1,
      description: "Recover from wounds and bruised conditions every few rounds or every turn automatically. The signature ability of Bloodshot's nanite bloodstream."
    },
    "Remote Sensing": {
      type: "Sensory",
      action: "Free",
      range: "Rank",
      duration: "Sustained",
      baseCost: 2,
      description: "Project your vision, hearing, or mental senses into distant locations without physically being present, acting as an untouchable spy."
    },
    "Senses": {
      type: "Sensory",
      action: "None",
      range: "Personal",
      duration: "Permanent",
      baseCost: 1,
      description: "Superhuman sensory inputs: Darkvision, Infrared, Radio communication sense, Danger Sense, Microscopic vision, Psionic Awareness, or Deadside Sight."
    },
    "Shrinking": {
      type: "General",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 2,
      description: "Reduce physical stature to insect or microscopic scale, gaining significant bonuses to Stealth and active defense while reducing carrying capacity."
    },
    "Speed": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 1,
      description: "Sprint across land or water at superhuman velocities, tearing across highways, breaking sound barriers, and running up walls."
    },
    "Summon": {
      type: "Control",
      action: "Standard",
      range: "Close",
      duration: "Sustained",
      baseCost: 2,
      description: "Conjure loyal allies, spectral entities from the Deadside, autonomous robotic combat drones, or nanite constructs to fight alongside you."
    },
    "Swimming": {
      type: "Movement",
      action: "Free",
      range: "Personal",
      duration: "Sustained",
      baseCost: 1,
      description: "Propel yourself underwater at high marine speeds, slicing through oceanic depths effortlessly."
    },
    "Teleport": {
      type: "Movement",
      action: "Move",
      range: "Rank",
      duration: "Instant",
      baseCost: 2,
      description: "Instantly vanish and reappear across vast distances, crossing miles or the globe instantaneously through quantum folding or psionic transversion."
    },
    "Transform": {
      type: "Control",
      action: "Standard",
      range: "Close",
      duration: "Sustained",
      baseCost: 2,
      description: "Transmute one physical substance or object into another (e.g. Lead to Gold, Water to Steam, Solid steel to brittle glass)."
    },
    "Weaken": {
      type: "Attack",
      action: "Standard",
      range: "Close",
      duration: "Instant",
      baseCost: 1,
      description: "Drain or deplete a target's ability scores, defenses, or power ranks through bio-drainage, psionic shock, or metabolic toxins."
    }
  },

  modifiers: {
    extras: [
      { name: "Affects Insubstantial", costPerRank: 1, isFlat: true, description: "Effect functions at full effectiveness against insubstantial, gaseous, or ethereal targets." },
      { name: "Area (Burst / Cone / Line)", costPerRank: 1, isFlat: false, description: "Effect hits all targets within an area radius without requiring an individual attack roll. Targets roll Dodge for half effect." },
      { name: "Attack", costPerRank: 0, isFlat: true, description: "Turns a personal or beneficial effect into an offensive attack against an unwilling target." },
      { name: "Contagious", costPerRank: 1, isFlat: false, description: "The effect spreads from the initial target to anyone who comes into physical contact with them." },
      { name: "Cumulative", costPerRank: 1, isFlat: false, description: "Successive hits add to and worsen the condition on the target rather than simply replacing it." },
      { name: "Homing", costPerRank: 1, isFlat: true, description: "Missed ranged attacks automatically attempt another attack check on subsequent rounds." },
      { name: "Impervious", costPerRank: 1, isFlat: false, description: "Defense automatically ignores any attack with damage rank equal to or less than half your Impervious rank." },
      { name: "Increased Range", costPerRank: 1, isFlat: false, description: "Upgrades range from Close to Ranged, or from Ranged to Perception range." },
      { name: "Multiattack", costPerRank: 1, isFlat: false, description: "Rapid-fire attack: can spray an area, suppress an opponent, or deliver concentrated single-target bursts that deal increased damage." },
      { name: "Penetrating", costPerRank: 1, isFlat: false, description: "Overcomes an equal rank of enemy Impervious defense." },
      { name: "Precise", costPerRank: 1, isFlat: true, description: "Allows fine, delicate control over the effect (e.g. picking a lock with telekinesis or shaping blasts)." },
      { name: "Reaction", costPerRank: 3, isFlat: false, description: "Effect triggers automatically as an instant reaction to an external stimulus without using your action." },
      { name: "Selective", costPerRank: 1, isFlat: false, description: "Choose which targets inside an Area effect are struck and which are spared harmlessly." },
      { name: "Subtle", costPerRank: 1, isFlat: true, description: "The power is undetectable by normal sensory perception (undetectable sound, invisible beam, concealed psychic strike)." },
      { name: "Sustained (from Continuous/Permanent)", costPerRank: 0, isFlat: true, description: "Alters the base duration according to rule specifications." }
    ],
    flaws: [
      { name: "Activation", costPerRank: -1, isFlat: true, description: "Requires a move action (-1 pt) or standard action (-2 pts) to power up or deploy before use." },
      { name: "Concentration", costPerRank: -1, isFlat: false, description: "Requires your standard action every round to maintain the effect." },
      { name: "Diminished Range", costPerRank: -1, isFlat: true, description: "Reduces the short, medium, and long range increments of the power." },
      { name: "Distracting", costPerRank: -1, isFlat: false, description: "Using this power makes you Vulnerable (halving your active Dodge and Parry defenses) until your next turn." },
      { name: "Fades", costPerRank: -1, isFlat: false, description: "Power loses 1 rank of effectiveness each time it is used until recharged." },
      { name: "Feedback", costPerRank: -1, isFlat: false, description: "Attacks against your manifested construct or projected sensory link deal damage directly to your own body." },
      { name: "Grab-Based", costPerRank: -1, isFlat: false, description: "Requires successfully grappling or pinning the target before this power can be applied." },
      { name: "Inaccurate", costPerRank: -1, isFlat: true, description: "Suffers a -2 attack roll penalty per rank to hit targets." },
      { name: "Limited", costPerRank: -1, isFlat: false, description: "Power only functions under specific conditions or against restricted target types (e.g. only against metal, only at night)." },
      { name: "Noticeable", costPerRank: -1, isFlat: true, description: "Power leaves obvious, blatant traces or glowing supernatural signs that give away your presence." },
      { name: "Quirk", costPerRank: -1, isFlat: true, description: "A minor flaw or nuisance restriction costing -1 point total." },
      { name: "Reduced Range", costPerRank: -1, isFlat: false, description: "Downgrades range: Perception to Ranged, or Ranged to Close." },
      { name: "Removable (Device / Gear)", costPerRank: -1, isFlat: true, description: "Power is housed in an item that can be disarmed or removed (Easily Removable = -2 PP per 5 PP; Removable = -1 PP per 5 PP)." },
      { name: "Side Effect", costPerRank: -1, isFlat: false, description: "Failing your check or using the power triggers an automatic negative backlash on yourself." },
      { name: "Tiring", costPerRank: -1, isFlat: false, description: "Using the power inflicts a level of fatigue on you unless you expend a Hero Point to prevent it." },
      { name: "Unreliable", costPerRank: -1, isFlat: false, description: "Requires a d20 roll of 11+ to function, or has only 5 limited uses before requiring re-arming." }
    ]
  },

  gearCatalog: [
    { name: "Heavy Pistol", category: "Weapons", costEP: 8, description: "Damage 4 (Ranged, Ballistic). Standard sidearm for covert operatives and Rising Spirit personnel." },
    { name: "Assault Rifle", category: "Weapons", costEP: 15, description: "Damage 5 (Ranged, Ballistic, Multiattack). Military-grade automatic rifle." },
    { name: "Sniper Rifle", category: "Weapons", costEP: 11, description: "Damage 5 (Ranged, Ballistic, Critical 19-20). Long-range precision rifle." },
    { name: "Submachine Gun", category: "Weapons", costEP: 12, description: "Damage 4 (Ranged, Ballistic, Multiattack). Compact high-rate-of-fire firearm." },
    { name: "Combat Knife / Katana", category: "Weapons", costEP: 4, description: "Damage 3 (Strength-based, Slashing, Critical 19-20). Precision razor-edged melee weapon favored by Ninjak." },
    { name: "Stun Gun / Taser", category: "Weapons", costEP: 5, description: "Affliction 5 (Dazed/Stunned/Incapacitated; Fortitude DC 15)." },
    { name: "Frag Grenades (x5)", category: "Weapons", costEP: 15, description: "Damage 5 (Ranged, Burst Area, Ballistic). Explosive anti-personnel ordnance." },
    { name: "Undercover Armored Vest", category: "Armor", costEP: 2, description: "Protection 2 (Subtle). Concealable ballistic weave armor." },
    { name: "Tactical Body Armor", category: "Armor", costEP: 4, description: "Protection 4. High-impact Kevlar plate carrier worn by frontline operators." },
    { name: "Riot Shield", category: "Armor", costEP: 3, description: "+2 active Parry defense against close strikes and frontal cover bonus." },
    { name: "Smartphone / Commlink", category: "Gadgets", costEP: 2, description: "Encrypted wireless voice, video, GPS navigation, and satellite datalink." },
    { name: "Night Vision Goggles", category: "Gadgets", costEP: 1, description: "Senses 1 (Darkvision). Allows clear sight in zero ambient lighting." },
    { name: "Lockpick & Bypass Kit", category: "Gadgets", costEP: 1, description: "Tools for Sleight of Hand and Technology checks against security locks." },
    { name: "Field Medical Kit", category: "Gadgets", costEP: 1, description: "Essential pharmaceuticals and trauma supplies granting +2 to Treatment checks." },
    { name: "Tactical Motorcycle", category: "Vehicles", costEP: 10, description: "Size: Medium, Strength 1, Speed 6 (120 MPH), Defense 10, Toughness 8." },
    { name: "Armored SUV", category: "Vehicles", costEP: 14, description: "Size: Huge, Strength 6, Speed 5 (60 MPH), Defense 8, Toughness 10, Impervious Toughness 4." },
    { name: "Safehouse / Base", category: "Headquarters", costEP: 10, description: "Size: Large, Toughness 10, Features: Communications, Computer Mainframe, Concealed, Living Space, Security System." }
  ],

  tables: {
    measurements: [
      { rank: -5, mass: "1.5 lbs", distance: "6 inches", time: "1/8 second", volume: "1/8 c. ft." },
      { rank: -4, mass: "3 lbs", distance: "1 foot", time: "1/4 second", volume: "1/4 c. ft." },
      { rank: -3, mass: "6 lbs", distance: "3 feet", time: "1/2 second", volume: "1/2 c. ft." },
      { rank: -2, mass: "12 lbs", distance: "6 feet", time: "1 second", volume: "1 c. ft." },
      { rank: -1, mass: "25 lbs", distance: "15 feet", time: "3 seconds", volume: "2 c. ft." },
      { rank: 0, mass: "50 lbs", distance: "30 feet", time: "6 seconds (1 round)", volume: "4 c. ft." },
      { rank: 1, mass: "100 lbs", distance: "60 feet", time: "12 seconds", volume: "8 c. ft." },
      { rank: 2, mass: "200 lbs", distance: "120 feet", time: "30 seconds", volume: "15 c. ft." },
      { rank: 3, mass: "400 lbs", distance: "250 feet", time: "1 minute", volume: "30 c. ft." },
      { rank: 4, mass: "800 lbs", distance: "500 feet", time: "2 minutes", volume: "60 c. ft." },
      { rank: 5, mass: "1600 lbs", distance: "900 feet", time: "4 minutes", volume: "125 c. ft." },
      { rank: 6, mass: "3200 lbs (1.6 tons)", distance: "1800 feet", time: "8 minutes", volume: "250 c. ft." },
      { rank: 7, mass: "3 tons", distance: "1/2 mile", time: "15 minutes", volume: "500 c. ft." },
      { rank: 8, mass: "6 tons", distance: "1 mile", time: "30 minutes", volume: "1000 c. ft." },
      { rank: 9, mass: "12 tons", distance: "2 miles", time: "1 hour", volume: "2000 c. ft." },
      { rank: 10, mass: "25 tons", distance: "4 miles", time: "2 hours", volume: "4000 c. ft." },
      { rank: 11, mass: "50 tons", distance: "8 miles", time: "4 hours", volume: "8000 c. ft." },
      { rank: 12, mass: "100 tons", distance: "16 miles", time: "8 hours", volume: "16,000 c. ft." },
      { rank: 13, mass: "200 tons", distance: "30 miles", time: "16 hours", volume: "32,000 c. ft." },
      { rank: 14, mass: "400 tons", distance: "60 miles", time: "1 day", volume: "64,000 c. ft." },
      { rank: 15, mass: "800 tons", distance: "120 miles", time: "2 days", volume: "125,000 c. ft." },
      { rank: 16, mass: "1,600 tons", distance: "250 miles", time: "4 days", volume: "250,000 c. ft." },
      { rank: 17, mass: "3,200 tons", distance: "500 miles", time: "1 week", volume: "500,000 c. ft." },
      { rank: 18, mass: "6,000 tons", distance: "1,000 miles", time: "2 weeks", volume: "1,000,000 c. ft." },
      { rank: 19, mass: "12,000 tons", distance: "2,000 miles", time: "1 month", volume: "2,000,000 c. ft." },
      { rank: 20, mass: "25,000 tons", distance: "4,000 miles", time: "2 months", volume: "4,000,000 c. ft." }
    ],

    benchmarks: [
      { dc: 0, difficulty: "Routine", example: "Notice something in plain sight; jump over a small puddle" },
      { dc: 5, difficulty: "Very Easy", example: "Climb a ladder; drive along a clear highway" },
      { dc: 10, difficulty: "Easy", example: "Notice someone skulking behind a car; apply first aid" },
      { dc: 15, difficulty: "Moderate", example: "Disarm an ordinary alarm system; recall obscure news event" },
      { dc: 20, difficulty: "Hard", example: "Pick a military padlock; leap across an alleyway between rooftops" },
      { dc: 25, difficulty: "Very Hard", example: "Infiltrate a guarded corporate compound; hack a secure firewall" },
      { dc: 30, difficulty: "Formidable", example: "Decipher alien Shanhara encryption; jump between moving subway trains" },
      { dc: 35, difficulty: "Heroic", example: "Outsmart Toyo Harada's psionic mental traps; disarm a dirty bomb in seconds" },
      { dc: 40, difficulty: "Superhuman", example: "Directly resist the Deadside's ancient necromantic entities" }
    ],

    damageTrack: [
      { condition: "Bruised / -1 Penalty", trigger: "Fail Toughness by 1-4", effect: "-1 circumstance penalty to future Toughness checks. Penalties are cumulative." },
      { condition: "Dazed", trigger: "Fail Toughness by 5-9", effect: "Target is limited to a single standard action and cannot take move actions on their next turn, plus suffers -1 Toughness penalty." },
      { condition: "Staggered", trigger: "Fail Toughness by 10-14", effect: "Target is Dazed and Hindered. A second Staggered result immediately results in Incapacitation." },
      { condition: "Incapacitated", trigger: "Fail Toughness by 15+", effect: "Target is unconscious, defenseless, and completely out of the fight." },
      { condition: "Dying", trigger: "Lethal damage while Incapacitated", effect: "Target must roll Fortitude each round to avoid succumbing to death." }
    ]
  },

  archetypes: [
    {
      name: "Nanite Soldier (Bloodshot Archetype)",
      concept: "Enhanced super-soldier injected with billions of microscopic nanites.",
      pl: 10,
      abilities: { STR: 4, STA: 5, AGL: 3, DEX: 4, FGT: 7, INT: 1, AWE: 3, PRE: 1 },
      defenses: { Dodge: 4, Parry: 3, Fortitude: 5, Toughness: 5, Will: 5 },
      skills: {
        "Athletics": 4,
        "Close Combat": 3,
        "Deception": 2,
        "Insight": 3,
        "Intimidation": 7,
        "Investigation": 3,
        "Perception": 5,
        "Ranged Combat": 6,
        "Stealth": 4,
        "Technology": 3,
        "Treatment": 2,
        "Vehicles": 4
      },
      advantages: [
        { name: "All-out Attack", rank: 1 },
        { name: "Diehard", rank: 1 },
        { name: "Equipment", rank: 4 },
        { name: "Fearless", rank: 1 },
        { name: "Improved Critical", rank: 2 },
        { name: "Improved Initiative", rank: 1 },
        { name: "Power Attack", rank: 1 },
        { name: "Quick Draw", rank: 1 },
        { name: "Takedown", rank: 2 },
        { name: "Uncanny Dodge", rank: 1 }
      ],
      powers: [
        {
          name: "Nanite Cellular Regeneration",
          effect: "Regeneration",
          ranks: 10,
          details: "Heals 1 damage condition every round automatically.",
          cost: 10
        },
        {
          name: "Nanite Armor Weave",
          effect: "Protection",
          ranks: 4,
          details: "Impervious 4. Subcutaneous nanite hardening.",
          cost: 8
        },
        {
          name: "Technopathic Synapse",
          effect: "Nanite Swarm / Control",
          ranks: 6,
          details: "Remote electronic interface and sensory tap.",
          cost: 12
        },
        {
          name: "Nanite Threat Sensors",
          effect: "Senses",
          ranks: 4,
          details: "Infrared vision, Radio sense, Danger sense.",
          cost: 4
        }
      ],
      gear: [
        { name: "Assault Rifle", category: "Weapons", costEP: 15, description: "Damage 5 (Ranged, Multiattack)." },
        { name: "Heavy Pistol", category: "Weapons", costEP: 8, description: "Damage 4 (Ranged)." },
        { name: "Combat Knife / Katana", category: "Weapons", costEP: 4, description: "Damage 3 (Str-based, Crit 19-20)." }
      ]
    },
    {
      name: "Armored Champion (X-O Manowar Archetype)",
      concept: "Visigoth warrior bonded with sentient extraterrestrial Class-Class Shanhara armor.",
      pl: 10,
      abilities: { STR: 2, STA: 3, AGL: 2, DEX: 2, FGT: 6, INT: 1, AWE: 2, PRE: 2 },
      defenses: { Dodge: 5, Parry: 2, Fortitude: 5, Toughness: 7, Will: 6 },
      skills: {
        "Acrobatics": 2,
        "Athletics": 6,
        "Close Combat": 4,
        "Insight": 4,
        "Intimidation": 6,
        "Perception": 4,
        "Ranged Combat": 6
      },
      advantages: [
        { name: "All-out Attack", rank: 1 },
        { name: "Close Attack", rank: 2 },
        { name: "Diehard", rank: 1 },
        { name: "Fearless", rank: 1 },
        { name: "Interpose", rank: 1 },
        { name: "Power Attack", rank: 1 },
        { name: "Takedown", rank: 1 }
      ],
      powers: [
        {
          name: "Shanhara Energy Blast",
          effect: "Blast (Damage: Ranged)",
          ranks: 10,
          details: "Plasma energy beam from armored gauntlets.",
          cost: 20
        },
        {
          name: "Orbital Flight",
          effect: "Flight",
          ranks: 10,
          details: "2,000 MPH Mach 3 atmospheric and space flight.",
          cost: 20
        },
        {
          name: "Alien Exoskeleton",
          effect: "Protection",
          ranks: 8,
          details: "Impervious 8. Shanhara living armor hull.",
          cost: 16
        },
        {
          name: "Enhanced Musculature",
          effect: "Enhanced Trait",
          ranks: 8,
          details: "Enhanced Strength +8 (Lifting 25+ tons).",
          cost: 16
        },
        {
          name: "Life Support System",
          effect: "Immunity",
          ranks: 10,
          details: "Immunity: Life Support (Vacuum, Suffocation, Radiation, Toxins).",
          cost: 10
        }
      ],
      gear: []
    },
    {
      name: "Harbinger Renegade (Psiot Archetype)",
      concept: "Awakened psiot possessing immense telekinetic and telepathic prowess.",
      pl: 10,
      abilities: { STR: 0, STA: 2, AGL: 2, DEX: 3, FGT: 2, INT: 3, AWE: 5, PRE: 3 },
      defenses: { Dodge: 6, Parry: 4, Fortitude: 4, Toughness: 8, Will: 7 },
      skills: {
        "Acrobatics": 2,
        "Deception": 4,
        "Insight": 8,
        "Investigation": 4,
        "Perception": 6,
        "Persuasion": 6,
        "Ranged Combat": 5,
        "Technology": 3
      },
      advantages: [
        { name: "Assessment", rank: 1 },
        { name: "Defensive Roll", rank: 2 },
        { name: "Eidetic Memory", rank: 1 },
        { name: "Extraordinary Effort", rank: 1 },
        { name: "Improved Initiative", rank: 1 },
        { name: "Inspire", rank: 2 },
        { name: "Luck", rank: 2 },
        { name: "Teamwork", rank: 1 },
        { name: "Well-Informed", rank: 1 }
      ],
      powers: [
        {
          name: "Telekinetic Force Ram",
          effect: "Blast (Damage: Ranged)",
          ranks: 10,
          details: "Raw concussive kinetic force blast.",
          cost: 20
        },
        {
          name: "Kinetic Barrier",
          effect: "Protection",
          ranks: 6,
          details: "Sustained psychic force field.",
          cost: 6
        },
        {
          name: "Telepathic Mind Tap",
          effect: "Mind Reading",
          ranks: 8,
          details: "Perception range telepathic consciousness probe.",
          cost: 16
        },
        {
          name: "Psiot Flight",
          effect: "Flight",
          ranks: 5,
          details: "60 MPH telekinetic personal levitation.",
          cost: 10
        },
        {
          name: "Psionic Awareness",
          effect: "Senses",
          ranks: 3,
          details: "Detect Psiots (Ranged, Acute, Extended).",
          cost: 3
        }
      ],
      gear: [
        { name: "Smartphone / Commlink", category: "Gadgets", costEP: 2, description: "Encrypted wireless." }
      ]
    },
    {
      name: "Master Infiltrator (Ninjak Archetype)",
      concept: "Billionaire tech operative, martial master, and MI-6 freelancer.",
      pl: 10,
      abilities: { STR: 3, STA: 3, AGL: 5, DEX: 5, FGT: 9, INT: 4, AWE: 4, PRE: 2 },
      defenses: { Dodge: 5, Parry: 3, Fortitude: 5, Toughness: 4, Will: 6 },
      skills: {
        "Acrobatics": 8,
        "Athletics": 6,
        "Close Combat": 4,
        "Deception": 4,
        "Expertise": 4,
        "Insight": 6,
        "Intimidation": 4,
        "Investigation": 7,
        "Perception": 6,
        "Ranged Combat": 5,
        "Sleight of Hand": 4,
        "Stealth": 10,
        "Technology": 6,
        "Vehicles": 4
      },
      advantages: [
        { name: "Accurate Attack", rank: 1 },
        { name: "Agile Feint", rank: 1 },
        { name: "Benefit", rank: 4 },
        { name: "Close Attack", rank: 2 },
        { name: "Defensive Roll", rank: 3 },
        { name: "Equipment", rank: 6 },
        { name: "Evasion", rank: 2 },
        { name: "Hide in Plain Sight", rank: 1 },
        { name: "Improved Critical", rank: 2 },
        { name: "Improved Initiative", rank: 2 },
        { name: "Move-by Action", rank: 1 },
        { name: "Power Attack", rank: 1 },
        { name: "Quick Draw", rank: 1 },
        { name: "Takedown", rank: 2 },
        { name: "Uncanny Dodge", rank: 1 }
      ],
      powers: [
        {
          name: "Hex-Weave Stealth Suit",
          effect: "Concealment",
          ranks: 4,
          details: "Visual Concealment (Removable Device).",
          cost: 6
        },
        {
          name: "Smart-Grip Wall Running",
          effect: "Movement",
          ranks: 2,
          details: "Wall-crawling 2.",
          cost: 4
        },
        {
          name: "Cowl Sensor Suite",
          effect: "Senses",
          ranks: 4,
          details: "Infrared, Low-light, Radio, Tracking.",
          cost: 4
        }
      ],
      gear: [
        { name: "Combat Knife / Katana", category: "Weapons", costEP: 4, description: "Damage 3 (Str-based, Crit 19-20)." },
        { name: "Tactical Body Armor", category: "Armor", costEP: 4, description: "Protection 4." },
        { name: "Tactical Motorcycle", category: "Vehicles", costEP: 10, description: "Speed 6, Defense 10, Toughness 8." },
        { name: "Lockpick & Bypass Kit", category: "Gadgets", costEP: 1, description: "+2 to bypass locks." }
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VALIANT_DATA;
}
