# 🏭 Wareneingang & Einlagerung — Prozess-Demo (Lager & Logistik)

Lieferavis per EDI, Wareneingangsbuchung in S/4, Qualitätsprüfung, Einlagerung oder Sperrbestand mit Lieferantenreklamation.

Eigenständige, interaktive Demo-App aus dem Rawkeep-Portfolio
**„Prozess-Modellierung als Service"** — gedacht als Startbasis zum Ausbauen.
Live-Version: <https://rawkeep.com/demos/prozesse/warehouse-inbound.html>

## Starten

Kein Build, kein Server, keine externen Requests:

```bash
open index.html          # oder Doppelklick — läuft direkt per file://
# alternativ: python3 -m http.server 8080
```

## Struktur

| Datei | Zweck |
|-------|-------|
| `index.html` | Markup der App |
| `styles.css` | Design (rawkeep-Tokens — anpassbar) |
| `data.js` | **Das Prozessmodell** (`window.PROCESS`): Schritte, Übergänge, Layout, KPIs |
| `app.js` | Rendering (SVG-Diagramm) + deterministische Simulation |
| `exports/warehouse-inbound.n8n.json` | n8n-Workflow — in n8n importierbar (Workflows → Import from File) |
| `exports/warehouse-inbound.bpmn` | BPMN 2.0 — öffnet in SAP Signavio, Camunda Modeler, bpmn.io |

## Ausbauen

Der Prozess lebt in `data.js`. Schritt-Typen: `START`, `END`, `TASK` (manuell),
`SERVICE` (automatisiert), `APPROVAL` (Human-in-the-Loop), `DECISION`
(exklusives Gateway — der **erste** Übergang ist der Happy Path). Neue Schritte:
Eintrag in `steps` (mit `x`/`y` fürs Diagramm) + Übergänge in `transitions` —
`app.js` rendert und simuliert automatisch.

Modelliert & generiert mit der Prozess-Engine aus
[`Rawkeep/sap-agent`](https://github.com/Rawkeep/sap-agent)
(`process_modeling`: Validierung, Simulation, n8n-/BPMN-/App-Export). Größere
Modelländerungen dort pflegen und neu exportieren — oder ab hier frei von Hand
weiterentwickeln.

---
© Rawkeep · <https://rawkeep.com>
