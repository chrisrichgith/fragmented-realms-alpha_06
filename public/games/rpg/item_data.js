const TACTIC_ITEMS = {
    "Altar": {
        name: "Altar",
        description: "Verstärkt Heil- und Schutzzauber.",
        effects: [
            {
                class: "Heiler",
                ability: "Lichtberührung",
                property: "value",
                modifier: { type: "percentage", value: 25 } // +25% healing
            },
            {
                class: "Heiler",
                ability: "Segensschild",
                property: "value", // Assuming the effect "Absorbiert X Schaden" can be parsed
                modifier: { type: "flat", value: 50 } // Absorbs 50 more damage
            }
        ]
    },
    "Arkan": {
        name: "Arkane Quelle",
        description: "Reduziert die Manakosten von mächtigen Zaubern.",
        effects: [
            {
                class: "Magier",
                ability: "Feuerball",
                property: "cost",
                modifier: { type: "flat", value: -10 } // Costs 10 less mana
            },
            {
                class: "Magier",
                ability: "Arkane Explosion",
                property: "cost",
                modifier: { type: "flat", value: -15 }
            }
        ]
    },
    "Dunkelwolke": {
        name: "Dunkelwolke",
        description: "Verbessert die Tarnfähigkeiten von Schurken.",
        effects: [
            {
                class: "Schurke",
                ability: "Unsichtbarkeit",
                property: "duration",
                modifier: { type: "flat", value: 1 } // Lasts 1 round longer
            },
            {
                class: "Schurke",
                ability: "Meucheln",
                property: "value",
                modifier: { type: "percentage", value: 15 } // +15% damage
            }
        ]
    },
    "Fass": {
        name: "Fass",
        description: "Ein robustes Fass, das als Deckung oder Waffe dienen kann. Erhöht die Verteidigung.",
        effects: [
            {
                class: "All", // Affects all classes
                ability: null, // Global stat change, not ability-specific
                property: "stats.dexterity", // A way to denote changing a base stat
                modifier: { type: "flat", value: -2 } // -2 DEX (less agile)
            },
            {
                class: "All",
                property: "stats.strength",
                modifier: { type: "flat", value: 2 } // +2 STR (more sturdy/strong)
            }
        ]
    },
    "Schildwall": {
        name: "Schildwall",
        description: "Verstärkt defensive Fähigkeiten von Kriegern.",
        effects: [
            {
                class: "Krieger",
                ability: "Schildblock",
                property: "cooldown",
                modifier: { type: "flat", value: -1 } // Reduces cooldown by 1 round
            },
            {
                class: "Krieger",
                ability: "Rüstungshärtung",
                property: "duration",
                modifier: { type: "flat", value: 2 } // Lasts 2 rounds longer
            }
        ]
    },
    "Turm": {
        name: "Wachturm",
        description: "Verbessert die Reichweite und Präzision von Bogenschützen.",
        effects: [
            {
                class: "Bogenschütze",
                ability: "Durchdringender Pfeil",
                property: "value",
                modifier: { type: "percentage", value: 20 } // +20% damage
            },
            {
                class: "Bogenschütze",
                ability: "Adlerblick",
                property: "effect", // Modifying the passive effect
                modifier: { type: "flat", value: 5 } // +5% additional hit chance
            }
        ]
    }
};
