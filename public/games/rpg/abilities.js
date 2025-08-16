const ABILITIES = {
    "Krieger": {
        "Schwerthieb": {
            name: "Schwerthieb",
            description: "Standardangriff mit hoher Präzision.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 1.0 },
            cost: 0
        },
        "Schildstoß": {
            name: "Schildstoß",
            description: "Verursacht Schaden und kann Gegner zurückstoßen.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 0.6 },
            effects: [{ name: "knockback", chance: 0.5 }],
            cost: 15
        },
        "Wirbelangriff": {
            name: "Wirbelangriff",
            description: "Trifft mehrere Gegner im Umkreis.",
            type: "attack",
            target: "multi-enemy",
            damage: { type: "physical", multiplier: 0.7 },
            cost: 25
        },
        "Berserkerwut": {
            name: "Berserkerwut",
            description: "Temporärer Schadensboost, verringert Verteidigung.",
            type: "buff",
            target: "self",
            effects: [
                { name: "increase_damage", value: 0.3, duration: 3 },
                { name: "decrease_defense", value: 0.2, duration: 3 }
            ],
            cost: 20
        },
        "Schildblock": {
            name: "Schildblock",
            description: "Reduziert eingehenden Schaden.",
            type: "defense",
            target: "self",
            effects: [{ name: "damage_reduction", value: 0.5, duration: 1 }],
            cost: 10
        },
        "Standhaftigkeit": {
            name: "Standhaftigkeit",
            description: "Verhindert Zurückstoßen oder Kontrollverlust.",
            type: "buff",
            target: "self",
            effects: [{ name: "control_immunity", duration: 4 }],
            cost: 15
        },
        "Rüstungshärtung": {
            name: "Rüstungshärtung",
            description: "Temporär erhöht physische Resistenz.",
            type: "buff",
            target: "self",
            effects: [{ name: "increase_defense", value: 0.4, duration: 3 }],
            cost: 20
        },
        "Wachposten": {
            name: "Wachposten",
            description: "Zieht Aggro von Verbündeten.",
            type: "utility",
            target: "self",
            effects: [{ name: "taunt", duration: 3 }],
            cost: 10
        },
        "Schutzwall": {
            name: "Schutzwall",
            description: "Stellt sich zwischen Gegner und Verbündete.",
            type: "defense",
            target: "group-ally",
            effects: [{ name: "protect", duration: 1 }],
            cost: 30
        }
    },
    "Heiler": {
        "Lichtberührung": {
            name: "Lichtberührung",
            description: "Schnelle Einzelheilung.",
            type: "heal",
            target: "single-ally",
            healing: { multiplier: 1.2 },
            cost: 15
        },
        "Lebensstrom": {
            name: "Lebensstrom",
            description: "Heilung über Zeit für eine Gruppe.",
            type: "heal",
            target: "group-ally",
            effects: [{ name: "heal_over_time", value: 0.4, duration: 3 }],
            cost: 30
        },
        "Wiederherstellung": {
            name: "Wiederherstellung",
            description: "Stellt große Mengen Lebenspunkte wieder her.",
            type: "heal",
            target: "single-ally",
            healing: { multiplier: 2.5 },
            cost: 40
        },
        "Erweckung": {
            name: "Erweckung",
            description: "Belebt gefallene Verbündete.",
            type: "utility",
            target: "single-ally-dead",
            effects: [{ name: "revive", health_percent: 0.5 }],
            cost: 100
        },
        "Segensschild": {
            name: "Segensschild",
            description: "Magische Barriere gegen Schaden.",
            type: "defense",
            target: "single-ally",
            effects: [{ name: "absorb_shield", value: 100, duration: 3 }],
            cost: 25
        },
        "Reinheit": {
            name: "Reinheit",
            description: "Entfernt negative Effekte.",
            type: "utility",
            target: "single-ally",
            effects: [{ name: "cleanse" }],
            cost: 20
        },
        "Manaregen": {
            name: "Manaregen",
            description: "Stellt Magieenergie wieder her.",
            type: "support",
            target: "group-ally",
            effects: [{ name: "mana_over_time", value: 20, duration: 3 }],
            cost: 50
        },
        "Heilige Präsenz": {
            name: "Heilige Präsenz",
            description: "Erhöht Verteidigung und Regeneration der Gruppe.",
            type: "buff",
            target: "group-ally",
            effects: [
                { name: "increase_defense", value: 0.15, duration: 4 },
                { name: "heal_over_time", value: 0.2, duration: 4 }
            ],
            cost: 45
        }
    },
    "Magier": {
        "Feuerball": {
            name: "Feuerball",
            description: "Flächenschaden mit Verbrennungseffekt.",
            type: "attack",
            target: "multi-enemy",
            damage: { type: "magic", multiplier: 0.8 },
            effects: [{ name: "burn", damage: 10, duration: 2, chance: 0.7 }],
            cost: 30
        },
        "Frostlanze": {
            name: "Frostlanze",
            description: "Verlangsamt Gegner.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "magic", multiplier: 0.9 },
            effects: [{ name: "slow", value: 0.5, duration: 2 }],
            cost: 20
        },
        "Blitzschlag": {
            name: "Blitzschlag",
            description: "Hoher Einzelzielschaden.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "magic", multiplier: 1.5 },
            cost: 40
        },
        "Arkane Explosion": {
            name: "Arkane Explosion",
            description: "Massiver Flächenschaden.",
            type: "attack",
            target: "multi-enemy",
            damage: { type: "magic", multiplier: 1.2 },
            cost: 60
        },
        "Zeitverzerrung": {
            name: "Zeitverzerrung",
            description: "Verlangsamt Gegnerbewegung.",
            type: "control",
            target: "multi-enemy",
            effects: [{ name: "slow", value: 0.3, duration: 3 }],
            cost: 35
        },
        "Magisches Siegel": {
            name: "Magisches Siegel",
            description: "Versiegelt Fähigkeiten des Gegners.",
            type: "control",
            target: "single-enemy",
            effects: [{ name: "silence", duration: 2 }],
            cost: 30
        },
        "Magische Barriere": {
            name: "Magische Barriere",
            description: "Absorbiert Schaden.",
            type: "defense",
            target: "self",
            effects: [{ name: "absorb_shield", value: 150, duration: 4 }],
            cost: 25
        },
        "Teleport": {
            name: "Teleport",
            description: "Flieht aus gefährlichen Situationen.",
            type: "utility",
            target: "self",
            effects: [{ name: "escape" }],
            cost: 50
        }
    },
    "Schurke": {
        "Meucheln": {
            name: "Meucheln",
            description: "Kritischer Schaden bei Überraschung.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 1.2, bonus_multiplier_stealth: 2.0 },
            cost: 20
        },
        "Giftklinge": {
            name: "Giftklinge",
            description: "Verursacht Schaden über Zeit.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 0.5 },
            effects: [{ name: "poison", damage: 15, duration: 3 }],
            cost: 25
        },
        "Schattenhieb": {
            name: "Schattenhieb",
            description: "Durchdringt Rüstung.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 1.0, ignores_defense: 0.5 },
            cost: 30
        },
        "Kettenangriff": {
            name: "Kettenangriff",
            description: "Springt zwischen mehreren Gegnern.",
            type: "attack",
            target: "multi-enemy-chain",
            damage: { type: "physical", multiplier: 0.7 },
            chains: 3,
            cost: 35
        },
        "Ausweichen": {
            name: "Ausweichen",
            description: "Erhöht Chance, Angriffen zu entgehen.",
            type: "defense",
            target: "self",
            effects: [{ name: "increase_dodge", value: 0.5, duration: 2 }],
            cost: 15
        },
        "Nebeltritt": {
            name: "Nebeltritt",
            description: "Teleportiert in Schatten.",
            type: "utility",
            target: "self",
            effects: [{ name: "shadow_step" }],
            cost: 20
        },
        "Unsichtbarkeit": {
            name: "Unsichtbarkeit",
            description: "Versteckt sich für kurze Zeit.",
            type: "stealth",
            target: "self",
            effects: [{ name: "stealth", duration: 3 }],
            cost: 40
        },
        "Schattenmantel": {
            name: "Schattenmantel",
            description: "Verringert Entdeckungsradius.",
            type: "stealth",
            target: "self",
            effects: [{ name: "stealth_passive", value: 0.5 }],
            cost: 0
        }
    },
    "Bogenschütze": {
        "Durchdringender Pfeil": {
            name: "Durchdringender Pfeil",
            description: "Trifft mehrere Gegner in Linie.",
            type: "attack",
            target: "multi-enemy-line",
            damage: { type: "physical", multiplier: 0.9 },
            cost: 25
        },
        "Schnellschuss": {
            name: "Schnellschuss",
            description: "Mehrere Pfeile in kurzer Zeit.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 0.6 },
            hits: 3,
            cost: 30
        },
        "Explosivpfeil": {
            name: "Explosivpfeil",
            description: "Flächenschaden.",
            type: "attack",
            target: "multi-enemy",
            damage: { type: "physical", multiplier: 0.8 },
            cost: 35
        },
        "Giftpfeil": {
            name: "Giftpfeil",
            description: "Verursacht Schaden über Zeit.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 0.4 },
            effects: [{ name: "poison", damage: 12, duration: 3 }],
            cost: 20
        },
        "Rückzugsschuss": {
            name: "Rückzugsschuss",
            description: "Schießt und springt zurück.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "physical", multiplier: 0.7 },
            effects: [{ name: "retreat" }],
            cost: 25
        },
        "Tarnnetz": {
            name: "Tarnnetz",
            description: "Verlangsamt Gegner und verbirgt Position.",
            type: "control",
            target: "area",
            effects: [
                { name: "slow", value: 0.4, duration: 4 },
                { name: "stealth_area", duration: 4 }
            ],
            cost: 30
        },
        "Adlerblick": {
            name: "Adlerblick",
            description: "Erhöht Sichtweite und Zielgenauigkeit.",
            type: "buff",
            target: "self",
            effects: [{ name: "increase_accuracy", value: 0.2, duration: 4 }],
            cost: 15
        },
        "Sperrfeuer": {
            name: "Sperrfeuer",
            description: "Unterdrückt Gegnerbewegung.",
            type: "control",
            target: "area",
            effects: [{ name: "suppress", duration: 2 }],
            cost: 40
        }
    },
    "Arkaner Komponist": {
        "Synergie": {
            name: "Synergie",
            description: "Löst Synergieeffekte aus die erhöhten Schaden verursachen.",
            type: "attack",
            target: "single-enemy",
            damage: { type: "magic", multiplier: 1.0 },
            cost: 30,
            requires: { synergy: true }
        },
        "Harmonie": {
            name: "Harmonie",
            description: "Erhöht Werte der Gruppe.",
            type: "buff",
            target: "group-ally",
            effects: [{ name: "increase_all_stats", value: 0.1, duration: 4 }],
            cost: 40
        },
        "Rhythmus der Regeneration": {
            name: "Rhythmus der Regeneration",
            description: "Stellt Lebenspunkte über Zeit wieder her.",
            type: "heal",
            target: "group-ally",
            effects: [{ name: "heal_over_time", value: 0.5, duration: 3 }],
            cost: 35
        },
        "Klangschild": {
            name: "Klangschild",
            description: "Absorbiert magischen Schaden.",
            type: "defense",
            target: "group-ally",
            effects: [{ name: "absorb_shield_magic", value: 120, duration: 3 }],
            cost: 30
        },
        "Stillezone": {
            name: "Stillezone",
            description: "Verhindert Zauberwirken im Umkreis.",
            type: "control",
            target: "area",
            effects: [{ name: "silence_area", duration: 2 }],
            cost: 45
        },
        "Tempoverzerrung": {
            name: "Tempoverzerrung",
            description: "Verlangsamt oder beschleunigt Bewegungen.",
            type: "control",
            target: "area",
            effects: [{ name: "tempo_warp", value: 0.4, duration: 3 }],
            cost: 35
        }
    }
};
