const RPG_CLASSES = {
    "Krieger": {
        description: "Stark und widerstandsfähig, ein Meister des Nahkampfes.",
        stats: { strength: 8, dexterity: 4, intelligence: 3 },
        img: { male: '/images/RPG/Charakter/Krieger_m_p.png', female: '/images/RPG/Charakter/Krieger_w_p.png' },
        abilities: {
            "Schwerthieb": { name: "Schwerthieb", type: "Angriff", target: "Einzel", cost: 0, cooldown: 0, value: "100% Waffenschaden", effect: "+10% Trefferchance" },
            "Schildstoß": { name: "Schildstoß", type: "Angriff", target: "Einzel", cost: 15, cooldown: 2, value: "50% Waffenschaden", effect: "Stößt zurück (50% Chance)" },
            "Wirbelangriff": { name: "Wirbelangriff", type: "Angriff", target: "AoE (Nahkampf)", cost: 30, cooldown: 3, value: "75% Waffenschaden" },
            "Berserkerwut": { name: "Berserkerwut", type: "Buff", target: "Selbst", cost: 20, cooldown: 4, duration: 3, effect: "+25% Schaden, -25% Rüstung" },
            "Schildblock": { name: "Schildblock", type: "Verteidigung", target: "Selbst", cost: 10, cooldown: 1, effect: "Reduziert nächsten physischen Schaden um 50%" },
            "Standhaftigkeit": { name: "Standhaftigkeit", type: "Buff", target: "Selbst", cost: 15, cooldown: 5, duration: 3, effect: "Immun gegen Zurückstoßen" },
            "Rüstungshärtung": { name: "Rüstungshärtung", type: "Buff", target: "Selbst", cost: 20, cooldown: 4, duration: 3, effect: "+30% Physische Resistenz" },
            "Wachposten": { name: "Wachposten", type: "Unterstützung", target: "Selbst", cost: 10, cooldown: 2, effect: "Erhöht Aggro" },
            "Schutzwall": { name: "Schutzwall", type: "Unterstützung", target: "Verbündeter", cost: 25, cooldown: 3, effect: "Leitet nächsten Angriff auf Verbündeten auf sich selbst um" }
        }
    },
    "Heiler": {
        description: "Ein heiliger Kleriker, der Verbündete heilt und schützt.",
        stats: { strength: 3, dexterity: 4, intelligence: 8 },
        img: { male: '/images/RPG/Charakter/Heiler_m_p.png', female: '/images/RPG/Charakter/Heiler_w_p.png' },
        abilities: {
            "Lichtberührung": { name: "Lichtberührung", type: "Heilung", target: "Einzel", cost: 15, cooldown: 0, value: "50 + 120% INT" },
            "Lebensstrom": { name: "Lebensstrom", type: "Heilung", target: "Gruppe", cost: 35, cooldown: 3, duration: 3, value: "20 + 50% INT pro Runde" },
            "Wiederherstellung": { name: "Wiederherstellung", type: "Heilung", target: "Einzel", cost: 40, cooldown: 4, value: "150 + 200% INT" },
            "Erweckung": { name: "Erweckung", type: "Heilung", target: "Gefallener Verbündeter", cost: 60, cooldown: 5, effect: "Belebt mit 30% Leben wieder" },
            "Segensschild": { name: "Segensschild", type: "Schutz", target: "Einzel", cost: 20, cooldown: 3, effect: "Absorbiert 100 Schaden" },
            "Reinheit": { name: "Reinheit", type: "Unterstützung", target: "Einzel", cost: 25, cooldown: 2, effect: "Entfernt 1 negativen Effekt" },
            "Manaregen": { name: "Manaregen", type: "Unterstützung", target: "Gruppe", cost: 30, cooldown: 5, duration: 3, effect: "Stellt 10 Mana pro Runde wieder her" },
            "Heilige Präsenz": { name: "Heilige Präsenz", type: "Buff", target: "Gruppe", cost: 40, cooldown: 5, duration: 3, effect: "+15% Verteidigung, +10 HP Regeneration" }
        }
    },
    "Magier": {
        description: "Beherrscht die arkanen Künste, um Feinde aus der Ferne zu vernichten.",
        stats: { strength: 2, dexterity: 5, intelligence: 8 },
        img: { male: '/images/RPG/Charakter/Magier_m_p.png', female: '/images/RPG/Charakter/Magier_w_p.png' },
        abilities: {
            "Feuerball": { name: "Feuerball", type: "Zauber (Angriff)", target: "AoE", cost: 30, cooldown: 2, value: "80 + 150% INT", duration: 2, effect: "Verbrennung (10 Schaden/Runde)" },
            "Frostlanze": { name: "Frostlanze", type: "Zauber (Angriff)", target: "Einzel", cost: 20, cooldown: 1, value: "60 + 100% INT", effect: "Verlangsamt Gegner (30%)" },
            "Blitzschlag": { name: "Blitzschlag", type: "Zauber (Angriff)", target: "Einzel", cost: 40, cooldown: 3, value: "120 + 250% INT" },
            "Arkane Explosion": { name: "Arkane Explosion", type: "Zauber (Angriff)", target: "AoE (Selbst)", cost: 50, cooldown: 4, value: "150 + 200% INT" },
            "Zeitverzerrung": { name: "Zeitverzerrung", type: "Kontrolle", target: "AoE", cost: 35, cooldown: 5, duration: 2, effect: "Verlangsamt alle Gegner (50%)" },
            "Magisches Siegel": { name: "Magisches Siegel", type: "Kontrolle", target: "Einzel", cost: 30, cooldown: 4, duration: 2, effect: "Versiegelt eine Fähigkeit" },
            "Magische Barriere": { name: "Magische Barriere", type: "Verteidigung", target: "Selbst", cost: 25, cooldown: 3, effect: "Absorbiert 150 magischen Schaden" },
            "Teleport": { name: "Teleport", type: "Verteidigung", cost: 20, cooldown: 3, effect: "Entfernt sich aus dem Nahkampf" }
        }
    },
    "Schurke": {
        description: "Ein listiger Kämpfer, der aus den Schatten zuschlägt.",
        stats: { strength: 4, dexterity: 8, intelligence: 3 },
        img: { male: '/images/RPG/Charakter/Schurke_m_p.png', female: '/images/RPG/Charakter/Schurke_w_p.png' },
        abilities: {
            "Meucheln": { name: "Meucheln", type: "Angriff", target: "Einzel", cost: 20, cooldown: 2, value: "150% Waffenschaden", effect: "+100% Schaden bei Unsichtbarkeit" },
            "Giftklinge": { name: "Giftklinge", type: "Angriff", target: "Einzel", cost: 15, cooldown: 1, duration: 3, value: "20% Waffenschaden/Runde" },
            "Schattenhieb": { name: "Schattenhieb", type: "Angriff", target: "Einzel", cost: 25, cooldown: 2, value: "80% Waffenschaden", effect: "Ignoriert 50% der Rüstung" },
            "Kettenangriff": { name: "Kettenangriff", type: "Angriff", target: "Multi (3)", cost: 30, cooldown: 3, value: "70% Waffenschaden/Treffer" },
            "Ausweichen": { name: "Ausweichen", type: "Verteidigung", target: "Selbst", cost: 15, cooldown: 3, duration: 2, effect: "+30% Ausweichchance" },
            "Nebeltritt": { name: "Nebeltritt", type: "Verteidigung", cost: 20, cooldown: 4, effect: "Teleportiert hinter einen Gegner" },
            "Unsichtbarkeit": { name: "Unsichtbarkeit", type: "Tarnung", target: "Selbst", cost: 25, cooldown: 5, duration: 2, effect: "Wird unsichtbar" },
            "Schattenmantel": { name: "Schattenmantel", type: "Tarnung", target: "Selbst", cost: 10, cooldown: 0, effect: "Passiv: Schwerer zu entdecken" }
        }
    },
    "Bogenschütze": {
        description: "Ein Meisterschütze mit Pfeil und Bogen.",
        stats: { strength: 4, dexterity: 8, intelligence: 3 },
        img: { male: '/images/RPG/Charakter/Archer_m_p.png', female: '/images/RPG/Charakter/Archer_w_p.png' },
        abilities: {
            "Durchdringender Pfeil": { name: "Durchdringender Pfeil", type: "Angriff", target: "Linie", cost: 25, cooldown: 2, value: "120% Waffenschaden" },
            "Schnellschuss": { name: "Schnellschuss", type: "Angriff", target: "Einzel", cost: 30, cooldown: 3, effect: "Schießt 3 Pfeile mit je 60% Waffenschaden" },
            "Explosivpfeil": { name: "Explosivpfeil", type: "Angriff", target: "AoE", cost: 35, cooldown: 3, value: "80% Waffenschaden" },
            "Giftpfeil": { name: "Giftpfeil", type: "Angriff", target: "Einzel", cost: 15, cooldown: 1, duration: 3, value: "25% Waffenschaden/Runde" },
            "Rückzugsschuss": { name: "Rückzugsschuss", type: "Verteidigung", target: "Einzel", cost: 20, cooldown: 3, value: "70% Waffenschaden", effect: "Springt eine Einheit zurück" },
            "Tarnnetz": { name: "Tarnnetz", type: "Verteidigung", target: "AoE", cost: 15, cooldown: 4, duration: 3, effect: "Verlangsamt Gegner im Netz (40%)" },
            "Adlerblick": { name: "Adlerblick", type: "Unterstützung", target: "Selbst", cost: 10, cooldown: 0, effect: "Passiv: +10% Trefferchance" },
            "Sperrfeuer": { name: "Sperrfeuer", type: "Unterstützung", target: "AoE", cost: 40, cooldown: 5, effect: "Verhindert Bewegung (1 Runde)" }
        }
    },
    "Arkaner Komponist": {
        description: "Magischer Taktgeber mit Klangzaubern.",
        stats: { strength: 1, dexterity: 7, intelligence: 7 },
        img: { male: '/images/RPG/Charakter/arkaner_m_p.png', female: '/images/RPG/Charakter/arkaner_w_p.png' },
        abilities: {
            "Synergie": { name: "Synergie", type: "Angriff", target: "Passiv", effect: "Chance auf zusätzlichen Schaden nach Aktionen von Verbündeten" },
            "Harmonie": { name: "Harmonie", type: "Unterstützung", target: "Gruppe", cost: 30, cooldown: 3, duration: 3, effect: "+10% auf alle Basisattribute" },
            "Rhythmus der Regeneration": { name: "Rhythmus der Regeneration", type: "Unterstützung", target: "Gruppe", cost: 35, cooldown: 4, duration: 3, value: "15 + 40% INT pro Runde" },
            "Klangschild": { name: "Klangschild", type: "Kontrolle", target: "Gruppe", cost: 40, cooldown: 5, effect: "Absorbiert 80 magischen Schaden" },
            "Stillezone": { name: "Stillezone", type: "Kontrolle", target: "AoE", cost: 45, cooldown: 5, duration: 2, effect: "Verhindert Zauberwirken" },
            "Tempoverzerrung": { name: "Tempoverzerrung", type: "Kontrolle", target: "AoE", cost: 30, cooldown: 4, duration: 2, effect: "Wahlweise: Gegner -30% / Verbündete +30% Tempo" }
        }
    }
};
