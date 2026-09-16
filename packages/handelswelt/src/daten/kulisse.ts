/*
 * ERZEUGT — nicht von Hand ändern.
 *
 * Erzeugt aus einer Vorlage, die bewusst ausserhalb dieses Repos liegt —
 * zusammen mit dem Erzeuger und der Zuordnung echter Marken auf Decknamen.
 *
 * Warengruppen, Größen und Preislagen stammen aus Regalfotos und sind echt.
 * Die Namen sind es nicht, und aus welchem Laden die Fotos stammen, steht hier
 * nicht — siehe die Notiz `demo-daten-keine-echten-marken`.
 */

/*
 * Alles, was NICHT Lisas Kategorie ist.
 *
 * Nur die Warengruppen und ihre Artikelzahl — keine Marken, keine
 * Artikelnamen, keine Kennzahlen. Der Agent soll auf eine Frage außerhalb
 * seiner Kategorie ehrlich antworten können („Kartoffelchips liegen bei
 * Knabberartikel, das ist nicht meine Kategorie"). Dass Chips Knabberartikel
 * sind, weiß er selbst; welche Warengruppen es bei Nordkorb gibt, nicht.
 * Das ist der Grund `nicht_zustaendig`.
 */

export interface Warengruppe {
  readonly gruppe: string;
  /** Wie viele Artikel Nordkorb in dieser Gruppe führt. */
  readonly artikel: number;
}

export const KULISSE: readonly Warengruppe[] = [
  {
    "gruppe": "Alkoholische Getränke",
    "artikel": 11
  },
  {
    "gruppe": "Asia-Würzmittel",
    "artikel": 1
  },
  {
    "gruppe": "Asiatische Küche",
    "artikel": 1
  },
  {
    "gruppe": "Baby & Kind",
    "artikel": 17
  },
  {
    "gruppe": "Babynahrung",
    "artikel": 12
  },
  {
    "gruppe": "Backen",
    "artikel": 15
  },
  {
    "gruppe": "Backen & Kochen",
    "artikel": 1
  },
  {
    "gruppe": "Backen & Zucker",
    "artikel": 8
  },
  {
    "gruppe": "Backmischungen",
    "artikel": 3
  },
  {
    "gruppe": "Backwaren",
    "artikel": 23
  },
  {
    "gruppe": "Backzutaten",
    "artikel": 2
  },
  {
    "gruppe": "Beilagen",
    "artikel": 3
  },
  {
    "gruppe": "Bier",
    "artikel": 9
  },
  {
    "gruppe": "Bier & Radler",
    "artikel": 1
  },
  {
    "gruppe": "Brot & Backwaren",
    "artikel": 19
  },
  {
    "gruppe": "Brotaufstrich",
    "artikel": 9
  },
  {
    "gruppe": "Brotaufstriche",
    "artikel": 1
  },
  {
    "gruppe": "Cider",
    "artikel": 1
  },
  {
    "gruppe": "Dekoration",
    "artikel": 1
  },
  {
    "gruppe": "Desserts",
    "artikel": 1
  },
  {
    "gruppe": "Dressings & Saucen",
    "artikel": 1
  },
  {
    "gruppe": "Eier",
    "artikel": 6
  },
  {
    "gruppe": "Essig & Öl",
    "artikel": 2
  },
  {
    "gruppe": "Feinkost",
    "artikel": 6
  },
  {
    "gruppe": "Feinkost & Antipasti",
    "artikel": 6
  },
  {
    "gruppe": "Feinkost & Dips",
    "artikel": 2
  },
  {
    "gruppe": "Feinkostsuppen",
    "artikel": 4
  },
  {
    "gruppe": "Fertiggerichte",
    "artikel": 14
  },
  {
    "gruppe": "Fisch",
    "artikel": 13
  },
  {
    "gruppe": "Fisch & Feinkost",
    "artikel": 2
  },
  {
    "gruppe": "Fisch & Meeresfrüchte",
    "artikel": 11
  },
  {
    "gruppe": "Fix-Produkte",
    "artikel": 2
  },
  {
    "gruppe": "Fleisch & Wurst",
    "artikel": 117
  },
  {
    "gruppe": "Frische Kräuter",
    "artikel": 5
  },
  {
    "gruppe": "Frische Pasta",
    "artikel": 6
  },
  {
    "gruppe": "Frühstück",
    "artikel": 31
  },
  {
    "gruppe": "Garten",
    "artikel": 6
  },
  {
    "gruppe": "Garten & Beleuchtung",
    "artikel": 2
  },
  {
    "gruppe": "Garten & Elektro",
    "artikel": 1
  },
  {
    "gruppe": "Garten & Freizeit",
    "artikel": 2
  },
  {
    "gruppe": "Garten & Pflanzen",
    "artikel": 1
  },
  {
    "gruppe": "Garten & Terrasse",
    "artikel": 1
  },
  {
    "gruppe": "Garten & Zubehör",
    "artikel": 2
  },
  {
    "gruppe": "Gebäck",
    "artikel": 4
  },
  {
    "gruppe": "Gebäck & Kuchen",
    "artikel": 4
  },
  {
    "gruppe": "Gesichtspflege",
    "artikel": 5
  },
  {
    "gruppe": "Getränke",
    "artikel": 54
  },
  {
    "gruppe": "Gewürze & Fixprodukte",
    "artikel": 5
  },
  {
    "gruppe": "Gewürze & Kräuter",
    "artikel": 6
  },
  {
    "gruppe": "Gewürze & Salz",
    "artikel": 3
  },
  {
    "gruppe": "Gewürze & Saucen",
    "artikel": 3
  },
  {
    "gruppe": "Gewürze & Würzmittel",
    "artikel": 1
  },
  {
    "gruppe": "Grill & Garten",
    "artikel": 2
  },
  {
    "gruppe": "Grill & Zubehör",
    "artikel": 1
  },
  {
    "gruppe": "Grill-Zubehör",
    "artikel": 6
  },
  {
    "gruppe": "Grillen & Zubehör",
    "artikel": 3
  },
  {
    "gruppe": "Haarpflege",
    "artikel": 13
  },
  {
    "gruppe": "Haushalt",
    "artikel": 14
  },
  {
    "gruppe": "Haushalt & Glas",
    "artikel": 2
  },
  {
    "gruppe": "Haushalt & Hygiene",
    "artikel": 4
  },
  {
    "gruppe": "Haushalt & Küche",
    "artikel": 2
  },
  {
    "gruppe": "Haushalt & Reinigung",
    "artikel": 3
  },
  {
    "gruppe": "Haushaltsgeräte",
    "artikel": 3
  },
  {
    "gruppe": "Heimwerken",
    "artikel": 1
  },
  {
    "gruppe": "Hülsenfrüchte & Samen",
    "artikel": 3
  },
  {
    "gruppe": "Hygiene",
    "artikel": 17
  },
  {
    "gruppe": "Kaffee",
    "artikel": 36
  },
  {
    "gruppe": "Kakao",
    "artikel": 3
  },
  {
    "gruppe": "Käse",
    "artikel": 67
  },
  {
    "gruppe": "Kekse & Gebäck",
    "artikel": 32
  },
  {
    "gruppe": "Knabberartikel",
    "artikel": 22
  },
  {
    "gruppe": "Kochen",
    "artikel": 1
  },
  {
    "gruppe": "Konserven",
    "artikel": 37
  },
  {
    "gruppe": "Konserven & Antipasti",
    "artikel": 2
  },
  {
    "gruppe": "Konserven & Eingelegtes",
    "artikel": 2
  },
  {
    "gruppe": "Konserven & Eingemachtes",
    "artikel": 1
  },
  {
    "gruppe": "Konserven & Eintöpfe",
    "artikel": 8
  },
  {
    "gruppe": "Konserven & Feinkost",
    "artikel": 5
  },
  {
    "gruppe": "Konserven & Fleisch",
    "artikel": 1
  },
  {
    "gruppe": "Konserven & Saucen",
    "artikel": 7
  },
  {
    "gruppe": "Körperpflege",
    "artikel": 19
  },
  {
    "gruppe": "Kosmetik",
    "artikel": 5
  },
  {
    "gruppe": "Küche & Haushalt",
    "artikel": 2
  },
  {
    "gruppe": "Kuchen & Gebäck",
    "artikel": 1
  },
  {
    "gruppe": "Küchengeräte",
    "artikel": 3
  },
  {
    "gruppe": "Kühlkost",
    "artikel": 9
  },
  {
    "gruppe": "Mehl & Backzutaten",
    "artikel": 1
  },
  {
    "gruppe": "Milchalternativen",
    "artikel": 6
  },
  {
    "gruppe": "Milchersatzprodukte",
    "artikel": 3
  },
  {
    "gruppe": "Milchgetränke",
    "artikel": 1
  },
  {
    "gruppe": "Milchprodukte",
    "artikel": 87
  },
  {
    "gruppe": "Mundpflege",
    "artikel": 1
  },
  {
    "gruppe": "Nahrungsergänzung",
    "artikel": 2
  },
  {
    "gruppe": "Nudeln & Pasta",
    "artikel": 19
  },
  {
    "gruppe": "Nüsse & Trockenfrüchte",
    "artikel": 12
  },
  {
    "gruppe": "Obst & Gemüse",
    "artikel": 69
  },
  {
    "gruppe": "Öle & Essig",
    "artikel": 6
  },
  {
    "gruppe": "Öle & Fette",
    "artikel": 10
  },
  {
    "gruppe": "Pflanzendrinks",
    "artikel": 2
  },
  {
    "gruppe": "Reinigungsmittel",
    "artikel": 19
  },
  {
    "gruppe": "Reis & Getreide",
    "artikel": 8
  },
  {
    "gruppe": "Reis- & Maiswaffeln",
    "artikel": 4
  },
  {
    "gruppe": "Säfte & Getränke",
    "artikel": 4
  },
  {
    "gruppe": "Salat & Frische",
    "artikel": 2
  },
  {
    "gruppe": "Saucen",
    "artikel": 1
  },
  {
    "gruppe": "Saucen & Dips",
    "artikel": 8
  },
  {
    "gruppe": "Saucen & Dressings",
    "artikel": 7
  },
  {
    "gruppe": "Saucen & Ketchup",
    "artikel": 1
  },
  {
    "gruppe": "Saucen & Pesto",
    "artikel": 2
  },
  {
    "gruppe": "Saucen & Würzmittel",
    "artikel": 4
  },
  {
    "gruppe": "Sekt & Champagner",
    "artikel": 4
  },
  {
    "gruppe": "Sekt & Prosecco",
    "artikel": 5
  },
  {
    "gruppe": "Sekt & Schaumwein",
    "artikel": 13
  },
  {
    "gruppe": "Snacks",
    "artikel": 8
  },
  {
    "gruppe": "Snacks & Chips",
    "artikel": 8
  },
  {
    "gruppe": "Snacks & Fertiggerichte",
    "artikel": 2
  },
  {
    "gruppe": "Snacks & Kekse",
    "artikel": 1
  },
  {
    "gruppe": "Snacks & Knabberartikel",
    "artikel": 4
  },
  {
    "gruppe": "Snacks & Knabbereien",
    "artikel": 6
  },
  {
    "gruppe": "Snacks & Nüsse",
    "artikel": 9
  },
  {
    "gruppe": "Sonnenschutz",
    "artikel": 8
  },
  {
    "gruppe": "Spirituosen",
    "artikel": 18
  },
  {
    "gruppe": "Spirituosen & Aperitif",
    "artikel": 3
  },
  {
    "gruppe": "Spirituosen & Likör",
    "artikel": 3
  },
  {
    "gruppe": "Süße Mahlzeiten",
    "artikel": 1
  },
  {
    "gruppe": "Süßwaren",
    "artikel": 14
  },
  {
    "gruppe": "Süßwaren & Bonbons",
    "artikel": 3
  },
  {
    "gruppe": "Süßwaren & Snacks",
    "artikel": 3
  },
  {
    "gruppe": "Tee",
    "artikel": 20
  },
  {
    "gruppe": "Tiefkühl",
    "artikel": 99
  },
  {
    "gruppe": "Trockenfrüchte",
    "artikel": 2
  },
  {
    "gruppe": "Vegane Fleischalternativen",
    "artikel": 1
  },
  {
    "gruppe": "Vegane Produkte",
    "artikel": 4
  },
  {
    "gruppe": "Vegetarische Produkte",
    "artikel": 1
  },
  {
    "gruppe": "Waschmittel",
    "artikel": 20
  },
  {
    "gruppe": "Waschmittel & Reinigung",
    "artikel": 4
  },
  {
    "gruppe": "Wein",
    "artikel": 56
  },
  {
    "gruppe": "Wein & Sekt",
    "artikel": 1
  },
  {
    "gruppe": "Zahnpflege",
    "artikel": 4
  },
  {
    "gruppe": "Zucker & Süßungsmittel",
    "artikel": 5
  }
];
