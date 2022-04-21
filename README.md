# Stadtverkehr Lübeck - DataMining (in progress)
Bereits David Kriesel hat mit seinem [BahnMining](https://www.dkriesel.com/blog/2019/1229_video_und_folien_meines_36c3-vortrags_bahnmining) für Wellen geschlagen als er den Bahnverkehr über die API der Deutschen Bahn analysiert hat. Auf der Basis seines Projekts erfolgt eine Untersuchung des Stadverkehrs Lübeck mithilfe der NAH.SH HAFAS-API.

## Datenquellen
- Alle Haltestellen:
https://www.sv-luebeck.de/extern/fahrplan/autocomplete/get_locations.php?term=
- nah.sh HAFAS Endpoint:
https://github.com/juliuste/nahsh-hafas

# Wo geht die Reise hin?
Vor der eigentlichen Datenanalyse habe ich mir bestimmte Ziele gesetzt, die ich gerne analysieren würde:
- Verteilung der Haltestellen
- Verteilung der Bedienfrequenzen
- Ungleichverteilung
- Bus Geschwindigkeit (Polling Rate jede Minute notwendig)
- Taktdichte mit Servicegrad verbinden
  - Relation zu sozioökonomischen Größen (https://bekanntmachungen.luebeck.de/dokumente/d/1171/inline)
- Verspätung an Haltestellen
- Summierte Verspätungen über das Jahr (Wie viele Menschenleben kostet uns das?)

# Initialisierung
.env Datei
```
STORAGE=/path/to/storage
```

## aktuellen Datensatz speichern
```sh
node main.js
```

## cronjob (jede Minute)
```
* * * * * node /path/to/svHLtracking/main.js 2>&1 >> /path/to/log.log
```
## regular expressions
| name | regex |
| --- | --- |
| geo-data | ```"latitude":(\d{2,}\.\d{3,}), "longitude":(\d{2,}\.\d{3,})``` |

# Referenzen
| Quelle | Link |
| ------ | ---- |
| BahnMining - Pünktlichkeit ist eine Zier | [dkriesel.com](https://www.dkriesel.com/blog/2019/1229_video_und_folien_meines_36c3-vortrags_bahnmining) |
| Analyse der ÖPNV-Versorgung mittels offener Fahrplandaten | [doi.org](https://doi.org/10.26084/12dfns-p026) |
