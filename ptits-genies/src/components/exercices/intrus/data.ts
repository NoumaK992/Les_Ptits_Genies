export interface IntrusData {
  id: string;
  niveau: "debutant" | "intermediaire" | "professionnel";
  mots: string[];
  intrus: string;
  point_commun: string;
  distracteurs_qcm: string[];
}

export const LISTES_INTRUS: IntrusData[] = [
  // --- NIVEAU DÉBUTANT (Très concret, 1 seul point commun évident) ---
  {
    id: "deb_1",
    niveau: "debutant",
    mots: ["pomme", "banane", "poire", "stylo", "fraise", "orange"],
    intrus: "stylo",
    point_commun: "Ce sont des fruits",
    distracteurs_qcm: ["Ce sont des légumes", "Ce sont des couleurs", "Ce sont des animaux"]
  },
  {
    id: "deb_2",
    niveau: "debutant",
    mots: ["chien", "chat", "voiture", "vache", "cheval", "poule"],
    intrus: "voiture",
    point_commun: "Ce sont des animaux",
    distracteurs_qcm: ["Ce sont des moyens de transport", "Ce sont des meubles", "Ce sont des jouets"]
  },
  {
    id: "deb_3",
    niveau: "debutant",
    mots: ["pantalon", "t-shirt", "chaussettes", "vélo", "manteau", "robe"],
    intrus: "vélo",
    point_commun: "Ce sont des vêtements",
    distracteurs_qcm: ["Ce sont des moyens de transport", "Ce sont des fruits", "Ce sont des meubles"]
  },
  {
    id: "deb_4",
    niveau: "debutant",
    mots: ["table", "chaise", "lit", "armoire", "nuage", "canapé"],
    intrus: "nuage",
    point_commun: "Ce sont des meubles",
    distracteurs_qcm: ["Ce sont des animaux", "Ce sont des vêtements", "Ce sont des éléments de la nature"]
  },
  {
    id: "deb_5",
    niveau: "debutant",
    mots: ["bleu", "rouge", "jaune", "chien", "vert", "orange"],
    intrus: "chien",
    point_commun: "Ce sont des couleurs",
    distracteurs_qcm: ["Ce sont des formes", "Ce sont des animaux", "Ce sont des émotions"]
  },
  {
    id: "deb_6",
    niveau: "debutant",
    mots: ["soleil", "lune", "étoile", "nuage", "planète", "ordinateur"],
    intrus: "ordinateur",
    point_commun: "On les trouve dans le ciel",
    distracteurs_qcm: ["On les trouve dans la mer", "On les trouve dans la maison", "Ce sont des plantes"]
  },
  {
    id: "deb_7",
    niveau: "debutant",
    mots: ["carré", "triangle", "rond", "rectangle", "oiseau", "losange"],
    intrus: "oiseau",
    point_commun: "Ce sont des formes géométriques",
    distracteurs_qcm: ["Ce sont des lettres", "Ce sont des animaux", "Ce sont des couleurs"]
  },
  {
    id: "deb_8",
    niveau: "debutant",
    mots: ["lundi", "mardi", "mercredi", "janvier", "jeudi", "vendredi"],
    intrus: "janvier",
    point_commun: "Ce sont des jours de la semaine",
    distracteurs_qcm: ["Ce sont des mois de l'année", "Ce sont des saisons", "Ce sont des fêtes"]
  },
  {
    id: "deb_9",
    niveau: "debutant",
    mots: ["avion", "hélicoptère", "fusée", "bateau", "montgolfière", "navette"],
    intrus: "bateau",
    point_commun: "Ce sont des engins volants",
    distracteurs_qcm: ["Ce sont des engins qui vont sur l'eau", "Ce sont des engins terrestres", "Ce sont des jouets"]
  },
  {
    id: "deb_10",
    niveau: "debutant",
    mots: ["marteau", "tournevis", "pince", "scie", "fourchette", "clé"],
    intrus: "fourchette",
    point_commun: "Ce sont des outils",
    distracteurs_qcm: ["Ce sont des couverts", "Ce sont des instruments de musique", "Ce sont des fournitures scolaires"]
  },

  // --- NIVEAU INTERMÉDIAIRE (Catégories plus fines, intrus au hasard lié par le son ou une sous-catégorie) ---
  {
    id: "int_1",
    niveau: "intermediaire",
    mots: ["guitare", "violon", "violoncelle", "harpe", "flûte", "contrebasse"],
    intrus: "flûte",
    point_commun: "Ce sont des instruments à cordes",
    distracteurs_qcm: ["Ce sont des instruments à vent", "Ce sont des instruments de percussion", "Ce sont des familles d'instruments"]
  },
  {
    id: "int_2",
    niveau: "intermediaire",
    mots: ["chêne", "sapin", "hêtre", "buisson", "bouleau", "érable"],
    intrus: "buisson",
    point_commun: "Ce sont des arbres",
    distracteurs_qcm: ["Ce sont des fleurs", "Ce sont des plantes aquatiques", "Ce sont des fruits des bois"]
  },
  {
    id: "int_3",
    niveau: "intermediaire",
    mots: ["tennis", "badminton", "ping-pong", "football", "squash", "pelote basque"],
    intrus: "football",
    point_commun: "Ce sont des sports de raquette",
    distracteurs_qcm: ["Ce sont des sports d'équipe", "Ce sont des sports de combat", "Ce sont des sports de précision"]
  },
  {
    id: "int_4",
    niveau: "intermediaire",
    mots: ["mouche", "moustique", "abeille", "guêpe", "libellule", "araignée"],
    intrus: "araignée",
    point_commun: "Ce sont des insectes (6 pattes)",
    distracteurs_qcm: ["Ce sont des arachnides (8 pattes)", "Ce sont des oiseaux", "Ce sont des amphibiens"]
  },
  {
    id: "int_5",
    niveau: "intermediaire",
    mots: ["laitue", "épinard", "carotte", "mâche", "roquette", "cresson"],
    intrus: "carotte",
    point_commun: "Ce sont des légumes feuilles",
    distracteurs_qcm: ["Ce sont des légumes racines", "Ce sont des fruits", "Ce sont des légumes fruits"]
  },
  {
    id: "int_6",
    niveau: "intermediaire",
    mots: ["rhinocéros", "hippopotame", "éléphant", "girafe", "zèbre", "kangourou"],
    intrus: "kangourou",
    point_commun: "Ce sont des animaux de la savane africaine",
    distracteurs_qcm: ["Ce sont des animaux des pôles", "Ce sont des marsupiaux d'Océanie", "Ce sont des animaux domestiques"]
  },
  {
    id: "int_7",
    niveau: "intermediaire",
    mots: ["Seine", "Loire", "Garonne", "Rhône", "Rhin", "Léman"],
    intrus: "Léman",
    point_commun: "Ce sont des fleuves de France",
    distracteurs_qcm: ["Ce sont des lacs", "Ce sont des océans", "Ce sont des mers"]
  },
  {
    id: "int_8",
    niveau: "intermediaire",
    mots: ["piano", "trompette", "accordéon", "clarinette", "brouette", "orgue"],
    intrus: "brouette",
    point_commun: "Ce sont des instruments de musique",
    distracteurs_qcm: ["Ce sont des outils de jardin", "Ce sont des mots finissant en -ette", "Ce sont des moyens de transport"]
  },
  {
    id: "int_9",
    niveau: "intermediaire",
    mots: ["France", "Espagne", "Italie", "Japon", "Allemagne", "Belgique"],
    intrus: "Japon",
    point_commun: "Ce sont des pays d'Europe",
    distracteurs_qcm: ["Ce sont des pays d'Asie", "Ce sont des capitales", "Ce sont des pays d'Amérique"]
  },
  {
    id: "int_10",
    niveau: "intermediaire",
    mots: ["or", "argent", "cuivre", "fer", "plastique", "aluminium"],
    intrus: "plastique",
    point_commun: "Ce sont des métaux",
    distracteurs_qcm: ["Ce sont des minéraux", "Ce sont des matériaux de synthèse", "Ce sont des tissus"]
  },

  // --- NIVEAU PROFESSIONNEL (Abstrait, nuances grammaticales, synonymes) ---
  {
    id: "pro_1",
    niveau: "professionnel",
    mots: ["être", "paraître", "sembler", "devenir", "courir", "rester"],
    intrus: "courir",
    point_commun: "Ce sont des verbes d'état",
    distracteurs_qcm: ["Ce sont des verbes d'action", "Ce sont des verbes pronominaux", "Ce sont des auxiliaires"]
  },
  {
    id: "pro_2",
    niveau: "professionnel",
    mots: ["content", "joyeux", "satisfait", "gai", "rieur", "fâché"],
    intrus: "fâché",
    point_commun: "Ce sont des synonymes de l'émotion de joie",
    distracteurs_qcm: ["Ce sont des antonymes", "Ce sont des paronymes", "Ce sont des noms communs"]
  },
  {
    id: "pro_3",
    niveau: "professionnel",
    mots: ["ignorant", "lâche", "jaloux", "bagarreur", "envieux", "courageux"],
    intrus: "courageux",
    point_commun: "Ce sont des défauts (adjectifs péjoratifs)",
    distracteurs_qcm: ["Ce sont des qualités (adjectifs mélioratifs)", "Ce sont des verbes conjugués", "Ce sont des noms propres"]
  },
  {
    id: "pro_4",
    niveau: "professionnel",
    mots: ["mais", "ou", "et", "donc", "car", "avec"],
    intrus: "avec",
    point_commun: "Ce sont des conjonctions de coordination",
    distracteurs_qcm: ["Ce sont des prépositions", "Ce sont des adverbes", "Ce sont des pronoms relatifs"]
  },
  {
    id: "pro_5",
    niveau: "professionnel",
    mots: ["beau", "grand", "fort", "petit", "gentil", "vite"],
    intrus: "vite",
    point_commun: "Ce sont des adjectifs qualificatifs",
    distracteurs_qcm: ["Ce sont des adverbes invariables", "Ce sont des déterminants", "Ce sont des prépositions"]
  },
  {
    id: "pro_6",
    niveau: "professionnel",
    mots: ["chocolat", "chantilly", "caramel", "pistache", "vanille", "salé"],
    intrus: "salé",
    point_commun: "Ce sont des parfums / saveurs sucrées",
    distracteurs_qcm: ["Ce sont des goûts amers", "Ce sont des épices piquantes", "Ce sont des textures"]
  },
  {
    id: "pro_7",
    niveau: "professionnel",
    mots: ["virement", "chèque", "espèce", "carte bleue", "portefeuille", "prélèvement"],
    intrus: "portefeuille",
    point_commun: "Ce sont des moyens de paiement",
    distracteurs_qcm: ["Ce sont des contenants d'argent", "Ce sont des devises", "Ce sont des documents bancaires"]
  },
  {
    id: "pro_8",
    niveau: "professionnel",
    mots: ["démocratie", "république", "monarchie", "oligarchie", "anarchie", "département"],
    intrus: "département",
    point_commun: "Ce sont des systèmes ou régimes politiques",
    distracteurs_qcm: ["Ce sont des découpages territoriaux", "Ce sont des partis politiques", "Ce sont des lois constitutionnelles"]
  },
  {
    id: "pro_9",
    niveau: "professionnel",
    mots: ["demain", "autrefois", "aujourd'hui", "hiver", "immédiatement", "auparavant"],
    intrus: "hiver",
    point_commun: "Ce sont des adverbes de temps",
    distracteurs_qcm: ["Ce sont des noms désignant des saisons", "Ce sont des prépositions de lieu", "Ce sont des adjectifs temporels"]
  },
  {
    id: "pro_10",
    niveau: "professionnel",
    mots: ["sonate", "symphonie", "concerto", "opéra", "requiem", "sculpture"],
    intrus: "sculpture",
    point_commun: "Ce sont des genres musicaux classiques",
    distracteurs_qcm: ["Ce sont des arts plastiques", "Ce sont des styles d'architecture", "Ce sont des formes de poésie"]
  }
];
