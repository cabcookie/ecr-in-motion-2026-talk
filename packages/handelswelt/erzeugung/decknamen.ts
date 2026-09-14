/**
 * Die Zuordnungsliste: echte Marke → Deckname.
 *
 * Warum es sie gibt: Der Vortrag nennt keine echten Hersteller und Produkte.
 * Wiedererkennbar dürfen sie bleiben — wer merci kennt, soll Hallbach Selection
 * erkennen. Was echt bleibt, sind Warengruppen, Größen und Preislagen; daher
 * kommt die Glaubwürdigkeit, nicht aus den Namen.
 *
 * Die Vorlage ist `packages/docs/demo/product-catalog/script/Store_Assortment.json`
 * — 1.494 Produkte aus 92 Regalfotos.
 *
 * ACHTUNG für `30wz` (Repo auf Veröffentlichung prüfen): Diese Datei IST der
 * Decoder. Sie steht hier, weil die Zuordnung nachvollziehbar sein soll und
 * nicht in einem Kopf. Ob sie in ein öffentliches Repo gehört, ist eine eigene
 * Entscheidung — die Vorlage mit den echten Marken liegt ohnehin schon im Repo.
 */

/** Echte Marke → Deckmarke. Nur Marken aus Lisas Kategorie brauchen einen. */
export const MARKEN: Readonly<Record<string, string>> = {
  // Der Hersteller aus dem Szenario. Steht so schon in den Folien.
  Storck: 'Hallbach',
  Knoppers: 'Hallbach',
  // Die beiden Eigenmarken der Kette — Einstieg und Premium.
  Choceur: 'Chocorée',
  'Moser Roth': 'Berghoff',
  // Die übrigen Häuser.
  Ferrero: 'Torretta',
  Kinder: 'Bambini',
  Milka: 'Almgold',
  Mars: 'Vega',
  Snickers: 'Nussberg',
  Balisto: 'Korngold',
  'Nestlé': 'Helvetia',
};

/**
 * Artikelnamen, die eine Marke *im Namen* tragen und deshalb einzeln umbenannt
 * werden müssen. Beschreibende Namen („Alpenmilch Schokolade") bleiben, wie sie
 * sind — sie benennen die Ware, nicht das Haus.
 */
export const ARTIKEL: Readonly<Record<string, string>> = {
  // Hallbach (Storck)
  'Merci Finest Selection': 'Selection Fein',
  'Merci Crocant': 'Selection Crocant',
  'Merci Lovelies': 'Selection Petits',
  Knoppers: 'Waffelschnitte',
  'Knoppers NussRiegel': 'Nussriegel',
  'Knoppers NussRiegel Dark': 'Nussriegel Zartbitter',
  'Knoppers KokosRiegel': 'Kokosriegel',
  'Knoppers Goodies': 'Häppchen',
  Toffifee: 'Karamellknopf',
  'Toffifee Weiße Schokolade': 'Karamellknopf Weiß',
  Chocs: 'Täfelchen',
  'Mint Chocs': 'Täfelchen Minze',

  // Torretta / Bambini (Ferrero / Kinder)
  Giotto: 'Tondo',
  'Kinder Riegel': 'Riegel',
  Yogurette: 'Fruttella',
  duplo: 'Duetto',
  'Kinder Schokolade': 'Schokolade',
  Hanuta: 'Nusstafel',
  'Kinder Bueno': 'Doppio',
  'Kinder Cards': 'Carte',
  'Kinder Country': 'Korn',
  'Kinder Schoko-Bons': 'Schoko-Eier',
  'Kinder FUN': 'Mix',

  // Vega (Mars)
  "M&M's Peanuts": 'Buntlinsen Erdnuss',
  Snickers: 'Riegel',
  'Balisto Joghurt-Beeren-Mix': 'Joghurt-Beere',
  'Balisto Schokoriegel': 'Korn',

  // Almgold (Milka)
  'Milka Tafelschokolade': 'Tafel',
  'Milka MMMAX': 'Maxi',

  // Helvetia (Nestlé)
  'Choco Crossies': 'Knusperkreuz',

  // Eigenmarken: Namen, die ein fremdes Haus zitieren
  'Riesen Schoko Küsse': 'Schokoküsse groß',
  'Mini Schoko Küsse': 'Schokoküsse mini',
  'Choco Changer': 'Choco Wandel',
  'Milch Mäuse Classic': 'Milchperlen Classic',
  'Milch Mäuse Caramel': 'Milchperlen Caramel',
  'Milch Mäuse Erdbeere': 'Milchperlen Erdbeere',
};

/**
 * Alle echten Markennamen aus der Vorlage — nicht zum Umbenennen, sondern zum
 * Prüfen: Keiner davon darf im erzeugten Sortiment oder in der Kulisse
 * auftauchen. Das ist die eigentliche Zusage dieses Tickets, und sie wird
 * gemessen statt behauptet.
 *
 * Kurze und mehrdeutige Namen stehen bewusst nicht drin („Z", „Green", „Asia",
 * „Edition", „Palette", „Bistro", „Farmer", „River", „Regent", „Gourmet"): Sie
 * sind gewöhnliche Wörter, und eine Prüfung darauf schlüge überall an.
 */
export const NICHT_ERLAUBT: readonly string[] = [
  'Storck', 'Knoppers', 'Choceur', 'Moser Roth', 'Ferrero', 'Kinder', 'Milka',
  'Mars', 'Snickers', 'Balisto', 'Nestlé', 'Merci', 'merci', 'Toffifee',
  'Giotto', 'Yogurette', 'duplo', 'Duplo', 'Hanuta', 'Bueno', 'Nutella',
  'Haribo', 'HARIBO', 'Maoam', 'Nimm2', 'Trolli', "Werther's", 'Riesen',
  'Oreo', 'Leibniz', 'Bahlsen', 'Lambertz', 'De Beukelaer', 'Prinzen Rolle',
  'Pringles', 'Pom-Bär', 'POM-BÄR', 'Lorenz', 'Saltletts', 'Crunchips',
  'funny-frisch', 'Chipsfrisch', 'Sondey', 'Biscotto', 'Belmonda', 'GutBio',
  'Sun Snacks', 'ALDI', 'Aldi', 'Lacura', 'Tandil', 'Milsani', 'Gardenline',
  'GARDENLINE', 'Knusperone', 'Barissimo', 'Quellbrunn', 'Goldähren',
  'Trader Joe', 'Sweet Land', 'Sweet Valley', 'Sweet Elite', 'Snack Day',
  'Snack Fun', 'Snack Time', 'Hustin', 'immerfrisch', 'Süssli', 'Süßli',
  'Kellogg', 'Corny', 'Dr. Oetker', 'Coca-Cola', 'Fanta', 'Sprite', 'Mirinda',
  'Red Bull', 'Jacobs', 'Starbucks', 'Teekanne', 'Meßmer', 'Lipton',
  'Kerrygold', 'Philadelphia', 'Leerdammer', 'Géramont', 'Exquisa', 'Bresso',
  'Danone', 'Ehrmann', 'Müller', 'Zott', 'Weihenstephan', 'Alpro', 'Oatly',
  'Rügenwalder', 'Gutfried', 'Herta', 'Wagner', 'iglo', 'Langnese', 'Magnum',
  'Mövenpick', 'Barilla', 'Mirácoli', 'Knorr', 'Kühne', 'Heinz', 'Rama',
  'Nivea', 'NIVEA', 'Labello', 'Schauma', 'Schwarzkopf', 'Persil', 'Perwoll',
  'Pril', 'Lenor', 'Pampers', 'Always', 'Carefree', 'blend-a-med', 'AXE',
  'Head & Shoulders', 'Dr. Beckmann', 'Bad Reichenhaller', 'Grafschafter',
  'Ben’s Original', "Ben's Original", 'Valensina', 'Gerolsteiner',
  'Volvic', 'Perrier', 'San Benedetto', 'Veltins', 'Jever', 'Paulaner',
  'Gösser', 'Diebels', "Beck's", 'Aperol', 'Meggle', 'Bauer', 'Arla',
  'Old Amsterdam', 'Bergader', 'Patros', 'Le Rustique', 'Brunch', 'Valess',
  'Vossko', 'Nissin', 'Zespri', 'Pink Lady', 'Alete', 'Mamia', 'Eurodont',
  'Dentitex', 'Coppenrath', 'Spiegelau', 'Monster', 'Powerade', 'Fuze Tea',
  'Mezzo Mix', 'Diamant', 'ORO di Parma', 'Oro di Parma',
];
