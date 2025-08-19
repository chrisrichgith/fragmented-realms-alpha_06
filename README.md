# Fragmented Realms

Fragmented Realms ist ein browserbasiertes Multiplayer-Rollenspiel, das eine zentrale Chat-Lobby mit einem rundenbasierten RPG-Erlebnis kombiniert. Spieler können interagieren, Gruppen bilden und gemeinsam Abenteuer erleben.

## Aktueller Stand & Implementierte Features

### Core-System
- **Benutzerverwaltung:** Vollständiges System für Registrierung und Login mit Benutzername/E-Mail und Passwort. Passwörter werden sicher gehasht.
- **Echtzeit-Chat:** Ein globaler Chat für alle eingeloggten Spieler, inklusive Systemnachrichten für wichtige Ereignisse (Login, Logout, etc.).
- **Online-Liste:** Zeigt alle aktuell eingeloggten Spieler an.
- **Ressourcen-System:** Spieler erhalten automatisch Ressourcen (Gold, Holz, Erz, Kristall), während sie online sind.
- **Ressourcen-Transfer:** Spieler können Ressourcen an andere Spieler senden.
- **Admin-Panel:** Ein einfaches Verwaltungs-Panel für Administratoren, um Benutzerdaten, Ressourcen und freigeschaltete Spiele zu verwalten.

### RPG-System
- **Charaktererstellung:** Spieler können einen Charakter mit Namen, Geschlecht und Klasse erstellen. Die Klasse bestimmt die Basis-Attribute und das Aussehen.
- **Gruppensystem:**
    - Spieler mit einem erstellten Charakter können andere Spieler in eine Gruppe einladen.
    - Die Gruppen-UI im Hauptmenü zeigt alle Mitglieder und den Anführer an.
- **Anführer-gesteuerter Spielfluss:**
    - Nur der Gruppenanführer startet das RPG und betritt die Weltkarte.
    - Andere Gruppenmitglieder warten in der Lobby, bis der Anführer einen Kampf initiiert.
    - Der Anführer kann Orte auf der Karte erkunden und Quests annehmen.
- **Synchronisierter Kampfstart:**
    - Wenn der Anführer eine Quest annimmt, wird über den Server ein Kampf für die gesamte Gruppe gestartet.
    - Alle Spieler der Gruppe (Anführer und wartende Mitglieder) werden automatisch zum Kampfbildschirm weitergeleitet.
- **Standortbasierte Kämpfe:** Die Kampfkarte und die Art der Gegner hängen von dem Ort ab, an dem die Quest angenommen wurde.
- **Rundenbasiertes Kampfsystem (Grundgerüst):**
    - Der Server kontrolliert den gesamten Kampfablauf (Rundenreihenfolge, HP, Aktionen).
    - Der Client (`battle.js`) zeigt den vom Server gesendeten Zustand an.
    - Spieler können nur agieren, wenn sie an der Reihe sind.
    - Eine grundlegende "Angriff"-Aktion für Spieler ist implementiert.

## Nächste Schritte & Offene To-Do's

### Kampfsystem-Erweiterungen
- **Gegner-KI:** Gegner führen aktuell keine Aktionen aus. Es muss eine Logik implementiert werden, damit Gegner die Spieler angreifen können.
- **Fähigkeiten & Zauber:** Spieler können bisher nur normal angreifen. Das System muss erweitert werden, um klassenspezifische Fähigkeiten und Zauber zu ermöglichen.
- **Zielauswahl:** Aktuell wird automatisch das erste lebende Ziel angegriffen. Spieler sollten ihr Ziel selbst auswählen können.
- **Items im Kampf:** Die "Taktik-Items" sind bisher nur Platzhalter und haben keine Funktion.
- **Sieg- & Niederlagen-Bedingungen:**
    - Nach einem Sieg sollten Belohnungen (XP, Ressourcen) vergeben werden.
    - Eine Niederlage sollte Konsequenzen haben.
    - Nach Kampfende müssen die Spieler zurück zur Weltkarte oder ins Hauptmenü geleitet werden.

### Weltkarten-Interaktivität
- Die Orts-Aktionen neben "Quest" (z.B. Handeln, Rasten, Erkunden) sind noch nicht implementiert.

### RPG-Fortschritt
- **Level-Up:** Das Level-Up-System ist serverseitig vorbereitet, aber es gibt keine UI für den Spieler, um einen Level-Up durchzuführen.
- **Belohnungen:** Es gibt noch keine Belohnungen (XP, Items) für gewonnene Kämpfe.

### UI/UX & Sonstiges
- **UI-Verbesserungen:** Besonders der Kampfbildschirm ist noch sehr rudimentär und kann grafisch und funktional stark verbessert werden.
- **Speichern/Laden:** Die API zum Speichern und Laden von Spielständen existiert, ist aber noch nicht in die Benutzeroberfläche des Spiels integriert.
- **Fehlerbehandlung:** Die Rückmeldungen an den Benutzer bei Fehlern oder ungültigen Aktionen können verbessert werden.
