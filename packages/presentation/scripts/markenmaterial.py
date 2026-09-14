#!/usr/bin/env python3
"""
Markenmaterial von AWS ins Web-Verzeichnis holen: Schrift und Logo.

    python3 scripts/markenmaterial.py

Schrift und Logo gehören Amazon und liegen deshalb nicht im Repository.
Wer das Repo klont und dieses Skript nicht laufen lässt, bekommt die
Ersatzschrift — die @font-face-Regeln laufen dann ins Leere und der
Fallback-Stack greift. Das ist Absicht, nicht ein Fehler.

Gewandelt wird nach WOFF2, so wie aws.amazon.com die Schrift ausliefert:
aus 640 kB TTF werden rund 200 kB.
"""
from pathlib import Path
from fontTools.ttLib import TTFont

HIER = Path(__file__).resolve().parent
MARKE = HIER.parent.parent / "brand-material"
QUELLE = MARKE / "Amazon Ember"
ZIEL = HIER.parent / "public" / "brand" / "fonts"

# Weiß, weil die Bühne dunkel ist. Einfarbig ist laut Dokumentation die
# einzige zugelassene Anwendung.
LOGO_QUELLE = MARKE / "Logos__AWS" / "SVG" / "AWS_logo_RGB_1c_White.svg"
LOGO_ZIEL = HIER.parent / "public" / "brand" / "aws-logo.svg"

# Nur was die Folien wirklich brauchen. Kursiv kommt im Vortrag nicht vor.
DATEIEN = [
    "AmazonEmberDisplay_Rg.ttf",
    "AmazonEmberDisplay_Md.ttf",
    "AmazonEmberDisplay_Bd.ttf",
    "AmazonEmberMono_Rg.ttf",
    "AmazonEmberMono_Bd.ttf",
]


def main() -> int:
    if not MARKE.is_dir():
        print(f"Kein Markenmaterial unter {MARKE} — Ersatzschrift, kein Logo.")
        return 0

    ZIEL.mkdir(parents=True, exist_ok=True)
    for name in DATEIEN:
        quelle = QUELLE / name
        if not quelle.is_file():
            print(f"  fehlt: {name}")
            continue
        ziel = ZIEL / (quelle.stem + ".woff2")
        font = TTFont(quelle)
        font.flavor = "woff2"
        font.save(ziel)
        print(f"  {name}  →  {ziel.name}  ({ziel.stat().st_size // 1024} kB)")

    if LOGO_QUELLE.is_file():
        LOGO_ZIEL.write_bytes(LOGO_QUELLE.read_bytes())
        print(f"  {LOGO_QUELLE.name}  →  {LOGO_ZIEL.name}")
    else:
        print(f"  fehlt: {LOGO_QUELLE.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
