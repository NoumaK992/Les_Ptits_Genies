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
  },

  // =====================================================================
  // RÉSERVE ÉTENDUE (listes ajoutées). Les identifiants sont stables :
  // ne jamais renuméroter une liste existante, toujours ajouter à la suite.
  // =====================================================================

  // --- NIVEAU DÉBUTANT (suite) : mots courants et concrets ---
  {
    id: "deb_11", niveau: "debutant",
    mots: ["carotte", "poireau", "chou", "navet", "radis", "cerise"],
    intrus: "cerise", point_commun: "Ce sont des légumes",
    distracteurs_qcm: ["Ce sont des fruits", "Ce sont des fleurs", "Ce sont des céréales"]
  },
  {
    id: "deb_12", niveau: "debutant",
    mots: ["bras", "jambe", "main", "pied", "tête", "chapeau"],
    intrus: "chapeau", point_commun: "Ce sont des parties du corps",
    distracteurs_qcm: ["Ce sont des vêtements", "Ce sont des outils", "Ce sont des animaux"]
  },
  {
    id: "deb_13", niveau: "debutant",
    mots: ["voiture", "camion", "moto", "bus", "trottinette", "sous-marin"],
    intrus: "sous-marin", point_commun: "Ce sont des véhicules à roues",
    distracteurs_qcm: ["Ce sont des véhicules qui volent", "Ce sont des bateaux", "Ce sont des véhicules sans moteur"]
  },
  {
    id: "deb_14", niveau: "debutant",
    mots: ["requin", "dauphin", "baleine", "poulpe", "méduse", "lapin"],
    intrus: "lapin", point_commun: "Ce sont des animaux qui vivent dans la mer",
    distracteurs_qcm: ["Ce sont des animaux de la ferme", "Ce sont des oiseaux", "Ce sont des insectes"]
  },
  {
    id: "deb_15", niveau: "debutant",
    mots: ["janvier", "février", "mars", "avril", "mai", "dimanche"],
    intrus: "dimanche", point_commun: "Ce sont des mois de l'année",
    distracteurs_qcm: ["Ce sont des jours de la semaine", "Ce sont des saisons", "Ce sont des fêtes"]
  },
  {
    id: "deb_16", niveau: "debutant",
    mots: ["cahier", "trousse", "cartable", "classeur", "règle", "casserole"],
    intrus: "casserole", point_commun: "Ce sont des fournitures scolaires",
    distracteurs_qcm: ["Ce sont des ustensiles de cuisine", "Ce sont des jouets", "Ce sont des outils de jardin"]
  },
  {
    id: "deb_17", niveau: "debutant",
    mots: ["poêle", "louche", "fouet", "passoire", "râpe", "oreiller"],
    intrus: "oreiller", point_commun: "Ce sont des ustensiles de cuisine",
    distracteurs_qcm: ["Ce sont des objets de la chambre", "Ce sont des outils de bricolage", "Ce sont des fournitures scolaires"]
  },
  {
    id: "deb_18", niveau: "debutant",
    mots: ["football", "basket", "handball", "volley", "rugby", "natation"],
    intrus: "natation", point_commun: "Ce sont des sports de ballon",
    distracteurs_qcm: ["Ce sont des sports nautiques", "Ce sont des sports de raquette", "Ce sont des sports d'hiver"]
  },
  {
    id: "deb_19", niveau: "debutant",
    mots: ["boulanger", "médecin", "pompier", "facteur", "coiffeur", "parapluie"],
    intrus: "parapluie", point_commun: "Ce sont des métiers",
    distracteurs_qcm: ["Ce sont des objets", "Ce sont des animaux", "Ce sont des lieux"]
  },
  {
    id: "deb_20", niveau: "debutant",
    mots: ["cuisine", "salon", "chambre", "salle de bain", "grenier", "plage"],
    intrus: "plage", point_commun: "Ce sont des pièces de la maison",
    distracteurs_qcm: ["Ce sont des meubles", "Ce sont des magasins", "Ce sont des lieux de vacances"]
  },
  {
    id: "deb_21", niveau: "debutant",
    mots: ["eau", "lait", "jus d'orange", "sirop", "thé", "pain"],
    intrus: "pain", point_commun: "Ce sont des boissons",
    distracteurs_qcm: ["Ce sont des desserts", "Ce sont des légumes", "Ce sont des plats salés"]
  },
  {
    id: "deb_22", niveau: "debutant",
    mots: ["pigeon", "moineau", "aigle", "hibou", "perroquet", "hamster"],
    intrus: "hamster", point_commun: "Ce sont des oiseaux",
    distracteurs_qcm: ["Ce sont des poissons", "Ce sont des insectes", "Ce sont des animaux qui vivent sous terre"]
  },
  {
    id: "deb_23", niveau: "debutant",
    mots: ["cochon", "mouton", "chèvre", "canard", "dindon", "loup"],
    intrus: "loup", point_commun: "Ce sont des animaux de la ferme",
    distracteurs_qcm: ["Ce sont des animaux sauvages", "Ce sont des animaux de la mer", "Ce sont des oiseaux"]
  },
  {
    id: "deb_24", niveau: "debutant",
    mots: ["rose", "tulipe", "marguerite", "coquelicot", "tournesol", "champignon"],
    intrus: "champignon", point_commun: "Ce sont des fleurs",
    distracteurs_qcm: ["Ce sont des arbres", "Ce sont des légumes", "Ce sont des fruits"]
  },
  {
    id: "deb_25", niveau: "debutant",
    mots: ["gâteau", "glace", "tarte", "crêpe", "compote", "frites"],
    intrus: "frites", point_commun: "Ce sont des desserts",
    distracteurs_qcm: ["Ce sont des plats salés", "Ce sont des boissons", "Ce sont des légumes"]
  },
  {
    id: "deb_26", niveau: "debutant",
    mots: ["ballon", "poupée", "toupie", "puzzle", "peluche", "brosse à dents"],
    intrus: "brosse à dents", point_commun: "Ce sont des jouets",
    distracteurs_qcm: ["Ce sont des objets de toilette", "Ce sont des fournitures scolaires", "Ce sont des vêtements"]
  },
  {
    id: "deb_27", niveau: "debutant",
    mots: ["savon", "shampoing", "dentifrice", "serviette", "baignoire", "cartable"],
    intrus: "cartable", point_commun: "On les trouve dans la salle de bain",
    distracteurs_qcm: ["On les trouve dans la cuisine", "On les trouve dans une salle de classe", "On les trouve dans le jardin"]
  },
  {
    id: "deb_28", niveau: "debutant",
    mots: ["pluie", "neige", "vent", "orage", "brouillard", "tabouret"],
    intrus: "tabouret", point_commun: "Ce sont des mots de la météo",
    distracteurs_qcm: ["Ce sont des meubles", "Ce sont des sports", "Ce sont des sentiments"]
  },
  {
    id: "deb_29", niveau: "debutant",
    mots: ["deux", "cinq", "huit", "onze", "vingt", "jaune"],
    intrus: "jaune", point_commun: "Ce sont des nombres",
    distracteurs_qcm: ["Ce sont des couleurs", "Ce sont des lettres de l'alphabet", "Ce sont des jours"]
  },
  {
    id: "deb_30", niveau: "debutant",
    mots: ["école", "mairie", "boulangerie", "piscine", "gare", "forêt"],
    intrus: "forêt", point_commun: "Ce sont des lieux qu'on trouve en ville",
    distracteurs_qcm: ["Ce sont des lieux de la nature", "Ce sont des pièces de la maison", "Ce sont des pays"]
  },
  {
    id: "deb_31", niveau: "debutant",
    mots: ["joie", "peur", "colère", "tristesse", "surprise", "chaussure"],
    intrus: "chaussure", point_commun: "Ce sont des émotions",
    distracteurs_qcm: ["Ce sont des couleurs", "Ce sont des objets", "Ce sont des métiers"]
  },
  {
    id: "deb_32", niveau: "debutant",
    mots: ["renard", "cerf", "sanglier", "écureuil", "hérisson", "chameau"],
    intrus: "chameau", point_commun: "Ce sont des animaux de la forêt",
    distracteurs_qcm: ["Ce sont des animaux du désert", "Ce sont des animaux de la mer", "Ce sont des animaux de la ferme"]
  },
  {
    id: "deb_33", niveau: "debutant",
    mots: ["sable", "coquillage", "parasol", "vague", "mouette", "luge"],
    intrus: "luge", point_commun: "On les trouve à la plage",
    distracteurs_qcm: ["On les trouve à la montagne en hiver", "On les trouve dans une cuisine", "On les trouve à l'école"]
  },
  {
    id: "deb_34", niveau: "debutant",
    mots: ["ski", "bonnet", "écharpe", "bonhomme de neige", "moufles", "maillot de bain"],
    intrus: "maillot de bain", point_commun: "On les associe à l'hiver",
    distracteurs_qcm: ["On les associe à l'été", "Ce sont des fruits", "Ce sont des métiers"]
  },
  {
    id: "deb_35", niveau: "debutant",
    mots: ["chaton", "chiot", "poussin", "veau", "agneau", "taureau"],
    intrus: "taureau", point_commun: "Ce sont des bébés animaux",
    distracteurs_qcm: ["Ce sont des animaux adultes", "Ce sont des oiseaux", "Ce sont des animaux sauvages"]
  },
  {
    id: "deb_36", niveau: "debutant",
    mots: ["nez", "bouche", "joue", "front", "menton", "genou"],
    intrus: "genou", point_commun: "Ce sont des parties du visage",
    distracteurs_qcm: ["Ce sont des parties de la jambe", "Ce sont des organes à l'intérieur du corps", "Ce sont des vêtements"]
  },
  {
    id: "deb_37", niveau: "debutant",
    mots: ["stylo", "feutre", "craie", "pastel", "crayon", "gomme"],
    intrus: "gomme", point_commun: "On les utilise pour écrire ou dessiner",
    distracteurs_qcm: ["On les utilise pour effacer", "On les utilise pour couper", "On les utilise pour mesurer"]
  },
  {
    id: "deb_38", niveau: "debutant",
    mots: ["croissant", "baguette", "brioche", "pain au chocolat", "chausson aux pommes", "camembert"],
    intrus: "camembert", point_commun: "On les achète à la boulangerie",
    distracteurs_qcm: ["On les achète chez le boucher", "On les achète chez le fromager", "On les achète à la pharmacie"]
  },
  {
    id: "deb_39", niveau: "debutant",
    mots: ["botte", "sandale", "pantoufle", "tong", "chaussure", "gant"],
    intrus: "gant", point_commun: "On les porte aux pieds",
    distracteurs_qcm: ["On les porte sur la tête", "On les porte aux mains", "On les porte autour du cou"]
  },
  {
    id: "deb_40", niveau: "debutant",
    mots: ["casquette", "bonnet", "chapeau", "casque", "béret", "chaussette"],
    intrus: "chaussette", point_commun: "On les porte sur la tête",
    distracteurs_qcm: ["On les porte aux pieds", "On les porte aux mains", "Ce sont des bijoux"]
  },
  {
    id: "deb_41", niveau: "debutant",
    mots: ["réfrigérateur", "four", "lave-linge", "aspirateur", "télévision", "balai"],
    intrus: "balai", point_commun: "Ce sont des appareils électriques",
    distracteurs_qcm: ["Ce sont des meubles", "Ce sont des outils de jardin", "Ce sont des objets en bois"]
  },
  {
    id: "deb_42", niveau: "debutant",
    mots: ["toit", "mur", "porte", "fenêtre", "cheminée", "trottoir"],
    intrus: "trottoir", point_commun: "Ce sont des parties d'une maison",
    distracteurs_qcm: ["Ce sont des meubles", "Ce sont des parties d'une voiture", "Ce sont des pièces de la maison"]
  },
  {
    id: "deb_43", niveau: "debutant",
    mots: ["volant", "roue", "pneu", "phare", "portière", "voile"],
    intrus: "voile", point_commun: "Ce sont des parties d'une voiture",
    distracteurs_qcm: ["Ce sont des parties d'un bateau", "Ce sont des parties du corps", "Ce sont des outils"]
  },
  {
    id: "deb_44", niveau: "debutant",
    mots: ["manchot", "ours blanc", "phoque", "morse", "renard polaire", "lion"],
    intrus: "lion", point_commun: "Ce sont des animaux des pays très froids",
    distracteurs_qcm: ["Ce sont des animaux du désert", "Ce sont des animaux de la ferme", "Ce sont des insectes"]
  },
  {
    id: "deb_45", niveau: "debutant",
    mots: ["feu", "soleil", "four", "radiateur", "bouillotte", "glaçon"],
    intrus: "glaçon", point_commun: "Ce sont des choses qui donnent de la chaleur",
    distracteurs_qcm: ["Ce sont des choses qui donnent du froid", "Ce sont des choses molles", "Ce sont des aliments"]
  },
  {
    id: "deb_46", niveau: "debutant",
    mots: ["voilier", "canoë", "paquebot", "kayak", "pédalo", "train"],
    intrus: "train", point_commun: "Ce sont des moyens de transport sur l'eau",
    distracteurs_qcm: ["Ce sont des véhicules qui roulent sur des rails", "Ce sont des véhicules qui volent", "Ce sont des véhicules qui roulent sur la route"]
  },
  {
    id: "deb_47", niveau: "debutant",
    mots: ["père", "mère", "sœur", "frère", "oncle", "voisin"],
    intrus: "voisin", point_commun: "Ce sont des membres de la famille",
    distracteurs_qcm: ["Ce sont des métiers", "Ce sont des personnes de l'école", "Ce sont des noms d'animaux"]
  },
  {
    id: "deb_48", niveau: "debutant",
    mots: ["lait", "fromage", "yaourt", "beurre", "crème", "œuf"],
    intrus: "œuf", point_commun: "Ce sont des produits laitiers",
    distracteurs_qcm: ["Ce sont des viandes", "Ce sont des céréales", "Ce sont des fruits"]
  },
  {
    id: "deb_49", niveau: "debutant",
    mots: ["tronc", "branche", "feuille", "racine", "écorce", "plume"],
    intrus: "plume", point_commun: "Ce sont des parties d'un arbre",
    distracteurs_qcm: ["Ce sont des parties d'un oiseau", "Ce sont des parties d'un poisson", "Ce sont des parties du corps humain"]
  },
  {
    id: "deb_50", niveau: "debutant",
    mots: ["courir", "sauter", "manger", "dormir", "chanter", "maison"],
    intrus: "maison", point_commun: "Ce sont des verbes (des actions)",
    distracteurs_qcm: ["Ce sont des noms d'objets", "Ce sont des couleurs", "Ce sont des adjectifs"]
  },
  {
    id: "deb_51", niveau: "debutant",
    mots: ["do", "ré", "mi", "fa", "sol", "tambour"],
    intrus: "tambour", point_commun: "Ce sont des notes de musique",
    distracteurs_qcm: ["Ce sont des instruments de musique", "Ce sont des lettres de l'alphabet", "Ce sont des couleurs"]
  },

  // --- NIVEAU INTERMÉDIAIRE (suite) : vocabulaire scolaire ---
  {
    id: "int_11", niveau: "intermediaire",
    mots: ["Mercure", "Vénus", "Mars", "Jupiter", "Saturne", "Lune"],
    intrus: "Lune", point_commun: "Ce sont des planètes du système solaire",
    distracteurs_qcm: ["Ce sont des étoiles", "Ce sont des satellites naturels", "Ce sont des constellations"]
  },
  {
    id: "int_12", niveau: "intermediaire",
    mots: ["Afrique", "Asie", "Europe", "Amérique", "Océanie", "Atlantique"],
    intrus: "Atlantique", point_commun: "Ce sont des continents",
    distracteurs_qcm: ["Ce sont des océans", "Ce sont des pays", "Ce sont des mers"]
  },
  {
    id: "int_13", niveau: "intermediaire",
    mots: ["océan Pacifique", "océan Atlantique", "océan Indien", "océan Arctique", "océan Austral", "mer Méditerranée"],
    intrus: "mer Méditerranée", point_commun: "Ce sont des océans",
    distracteurs_qcm: ["Ce sont des mers", "Ce sont des fleuves", "Ce sont des continents"]
  },
  {
    id: "int_14", niveau: "intermediaire",
    mots: ["baleine", "dauphin", "phoque", "orque", "lamantin", "requin"],
    intrus: "requin", point_commun: "Ce sont des mammifères marins",
    distracteurs_qcm: ["Ce sont des poissons", "Ce sont des reptiles", "Ce sont des crustacés"]
  },
  {
    id: "int_15", niveau: "intermediaire",
    mots: ["serpent", "lézard", "tortue", "crocodile", "iguane", "grenouille"],
    intrus: "grenouille", point_commun: "Ce sont des reptiles",
    distracteurs_qcm: ["Ce sont des amphibiens", "Ce sont des mammifères", "Ce sont des insectes"]
  },
  {
    id: "int_16", niveau: "intermediaire",
    mots: ["cœur", "poumon", "foie", "estomac", "rein", "coude"],
    intrus: "coude", point_commun: "Ce sont des organes à l'intérieur du corps",
    distracteurs_qcm: ["Ce sont des os", "Ce sont des articulations", "Ce sont des muscles"]
  },
  {
    id: "int_17", niveau: "intermediaire",
    mots: ["fémur", "tibia", "crâne", "côte", "vertèbre", "biceps"],
    intrus: "biceps", point_commun: "Ce sont des os",
    distracteurs_qcm: ["Ce sont des muscles", "Ce sont des organes", "Ce sont des articulations"]
  },
  {
    id: "int_18", niveau: "intermediaire",
    mots: ["mathématiques", "français", "histoire", "anglais", "technologie", "récréation"],
    intrus: "récréation", point_commun: "Ce sont des matières enseignées au collège",
    distracteurs_qcm: ["Ce sont des moments de la journée", "Ce sont des métiers", "Ce sont des lieux de l'école"]
  },
  {
    id: "int_19", niveau: "intermediaire",
    mots: ["cube", "sphère", "cylindre", "pyramide", "cône", "cercle"],
    intrus: "cercle", point_commun: "Ce sont des solides (des formes en volume)",
    distracteurs_qcm: ["Ce sont des figures planes", "Ce sont des unités de mesure", "Ce sont des nombres"]
  },
  {
    id: "int_20", niveau: "intermediaire",
    mots: ["mètre", "kilomètre", "centimètre", "millimètre", "décimètre", "kilogramme"],
    intrus: "kilogramme", point_commun: "Ce sont des unités de longueur",
    distracteurs_qcm: ["Ce sont des unités de masse", "Ce sont des unités de durée", "Ce sont des unités de contenance"]
  },
  {
    id: "int_21", niveau: "intermediaire",
    mots: ["seconde", "minute", "heure", "semaine", "siècle", "litre"],
    intrus: "litre", point_commun: "Ce sont des unités de durée",
    distracteurs_qcm: ["Ce sont des unités de longueur", "Ce sont des unités de contenance", "Ce sont des unités de masse"]
  },
  {
    id: "int_22", niveau: "intermediaire",
    mots: ["virgule", "point", "guillemets", "deux-points", "point d'exclamation", "accent"],
    intrus: "accent", point_commun: "Ce sont des signes de ponctuation",
    distracteurs_qcm: ["Ce sont des accents", "Ce sont des lettres", "Ce sont des chiffres"]
  },
  {
    id: "int_23", niveau: "intermediaire",
    mots: ["terrain", "terrestre", "enterrer", "territoire", "atterrir", "terrible"],
    intrus: "terrible", point_commun: "Ce sont des mots de la famille de « terre »",
    distracteurs_qcm: ["Ce sont des mots de la famille de « terreur »", "Ce sont tous des verbes", "Ce sont tous des adjectifs"]
  },
  {
    id: "int_24", niveau: "intermediaire",
    mots: ["dentiste", "dentaire", "dentifrice", "édenté", "dentition", "danseur"],
    intrus: "danseur", point_commun: "Ce sont des mots de la famille de « dent »",
    distracteurs_qcm: ["Ce sont des mots de la famille de « danse »", "Ce sont tous des métiers", "Ce sont tous des verbes"]
  },
  {
    id: "int_25", niveau: "intermediaire",
    mots: ["infirmier", "chirurgien", "pharmacien", "kinésithérapeute", "dentiste", "architecte"],
    intrus: "architecte", point_commun: "Ce sont des métiers de la santé",
    distracteurs_qcm: ["Ce sont des métiers du bâtiment", "Ce sont des métiers de l'école", "Ce sont des métiers du sport"]
  },
  {
    id: "int_26", niveau: "intermediaire",
    mots: ["maçon", "plombier", "électricien", "charpentier", "couvreur", "fleuriste"],
    intrus: "fleuriste", point_commun: "Ce sont des métiers du bâtiment",
    distracteurs_qcm: ["Ce sont des métiers de la santé", "Ce sont des métiers du commerce", "Ce sont des métiers de la mer"]
  },
  {
    id: "int_27", niveau: "intermediaire",
    mots: ["Paris", "Rome", "Madrid", "Berlin", "Lisbonne", "Marseille"],
    intrus: "Marseille", point_commun: "Ce sont des capitales de pays européens",
    distracteurs_qcm: ["Ce sont des villes françaises", "Ce sont des pays", "Ce sont des fleuves"]
  },
  {
    id: "int_28", niveau: "intermediaire",
    mots: ["Lyon", "Toulouse", "Bordeaux", "Lille", "Nantes", "Bruxelles"],
    intrus: "Bruxelles", point_commun: "Ce sont des villes de France",
    distracteurs_qcm: ["Ce sont des capitales européennes", "Ce sont des régions", "Ce sont des fleuves"]
  },
  {
    id: "int_29", niveau: "intermediaire",
    mots: ["Maroc", "Sénégal", "Égypte", "Kenya", "Cameroun", "Pérou"],
    intrus: "Pérou", point_commun: "Ce sont des pays d'Afrique",
    distracteurs_qcm: ["Ce sont des pays d'Amérique du Sud", "Ce sont des pays d'Asie", "Ce sont des capitales"]
  },
  {
    id: "int_30", niveau: "intermediaire",
    mots: ["montagne", "colline", "plateau", "vallée", "plaine", "rivière"],
    intrus: "rivière", point_commun: "Ce sont des formes de relief",
    distracteurs_qcm: ["Ce sont des cours d'eau", "Ce sont des climats", "Ce sont des villes"]
  },
  {
    id: "int_31", niveau: "intermediaire",
    mots: ["lac", "étang", "mer", "océan", "mare", "désert"],
    intrus: "désert", point_commun: "Ce sont des étendues d'eau",
    distracteurs_qcm: ["Ce sont des formes de relief", "Ce sont des étendues de sable", "Ce sont des cours d'eau qui coulent"]
  },
  {
    id: "int_32", niveau: "intermediaire",
    mots: ["Préhistoire", "Antiquité", "Moyen Âge", "Temps modernes", "Époque contemporaine", "pyramide"],
    intrus: "pyramide", point_commun: "Ce sont les grandes périodes de l'histoire",
    distracteurs_qcm: ["Ce sont des monuments", "Ce sont des civilisations", "Ce sont des pays"]
  },
  {
    id: "int_33", niveau: "intermediaire",
    mots: ["château fort", "chevalier", "donjon", "seigneur", "pont-levis", "gratte-ciel"],
    intrus: "gratte-ciel", point_commun: "On les associe au Moyen Âge",
    distracteurs_qcm: ["On les associe à la Préhistoire", "On les associe à l'Antiquité", "On les associe à l'époque actuelle"]
  },
  {
    id: "int_34", niveau: "intermediaire",
    mots: ["pharaon", "pyramide", "momie", "hiéroglyphe", "sphinx", "igloo"],
    intrus: "igloo", point_commun: "On les associe à l'Égypte antique",
    distracteurs_qcm: ["On les associe aux peuples du Grand Nord", "On les associe au Moyen Âge", "On les associe à la Préhistoire"]
  },
  {
    id: "int_35", niveau: "intermediaire",
    mots: ["flûte", "clarinette", "trompette", "saxophone", "hautbois", "tambour"],
    intrus: "tambour", point_commun: "Ce sont des instruments à vent",
    distracteurs_qcm: ["Ce sont des instruments à cordes", "Ce sont des instruments à percussion", "Ce sont des instruments à clavier"]
  },
  {
    id: "int_36", niveau: "intermediaire",
    mots: ["batterie", "xylophone", "triangle", "cymbales", "djembé", "violon"],
    intrus: "violon", point_commun: "Ce sont des instruments à percussion",
    distracteurs_qcm: ["Ce sont des instruments à cordes", "Ce sont des instruments à vent", "Ce sont des formes géométriques"]
  },
  {
    id: "int_37", niveau: "intermediaire",
    mots: ["peinture", "sculpture", "dessin", "gravure", "photographie", "roman"],
    intrus: "roman", point_commun: "Ce sont des arts visuels",
    distracteurs_qcm: ["Ce sont des genres littéraires", "Ce sont des genres musicaux", "Ce sont des sports"]
  },
  {
    id: "int_38", niveau: "intermediaire",
    mots: ["conte", "fable", "roman", "poème", "nouvelle", "chapitre"],
    intrus: "chapitre", point_commun: "Ce sont des genres de textes",
    distracteurs_qcm: ["Ce sont des parties d'un livre", "Ce sont des personnages", "Ce sont des signes de ponctuation"]
  },
  {
    id: "int_39", niveau: "intermediaire",
    mots: ["couverture", "page", "sommaire", "titre", "dos", "lecteur"],
    intrus: "lecteur", point_commun: "Ce sont des parties d'un livre",
    distracteurs_qcm: ["Ce sont des métiers du livre", "Ce sont des genres de textes", "Ce sont des personnages"]
  },
  {
    id: "int_40", niveau: "intermediaire",
    mots: ["sorcière", "ogre", "fée", "lutin", "dragon", "astronaute"],
    intrus: "astronaute", point_commun: "Ce sont des personnages de contes merveilleux",
    distracteurs_qcm: ["Ce sont des personnages de science-fiction", "Ce sont des métiers réels", "Ce sont des animaux réels"]
  },
  {
    id: "int_41", niveau: "intermediaire",
    mots: ["noix", "noisette", "amande", "noix de cajou", "châtaigne", "abricot"],
    intrus: "abricot", point_commun: "Ce sont des fruits à coque",
    distracteurs_qcm: ["Ce sont des fruits à noyau", "Ce sont des légumes", "Ce sont des céréales"]
  },
  {
    id: "int_42", niveau: "intermediaire",
    mots: ["lion", "tigre", "guépard", "panthère", "lynx", "loup"],
    intrus: "loup", point_commun: "Ce sont des félins",
    distracteurs_qcm: ["Ce sont des canidés", "Ce sont des rongeurs", "Ce sont des herbivores"]
  },
  {
    id: "int_43", niveau: "intermediaire",
    mots: ["crapaud", "salamandre", "triton", "rainette", "grenouille", "lézard"],
    intrus: "lézard", point_commun: "Ce sont des amphibiens",
    distracteurs_qcm: ["Ce sont des reptiles", "Ce sont des poissons", "Ce sont des insectes"]
  },
  {
    id: "int_44", niveau: "intermediaire",
    mots: ["énergie solaire", "énergie éolienne", "énergie hydraulique", "géothermie", "biomasse", "charbon"],
    intrus: "charbon", point_commun: "Ce sont des énergies renouvelables",
    distracteurs_qcm: ["Ce sont des énergies fossiles", "Ce sont des métaux", "Ce sont des matériaux de construction"]
  },
  {
    id: "int_45", niveau: "intermediaire",
    mots: ["vue", "ouïe", "odorat", "goût", "toucher", "mémoire"],
    intrus: "mémoire", point_commun: "Ce sont les cinq sens",
    distracteurs_qcm: ["Ce sont des émotions", "Ce sont des organes", "Ce sont des qualités"]
  },
  {
    id: "int_46", niveau: "intermediaire",
    mots: ["blé", "maïs", "riz", "orge", "avoine", "lentille"],
    intrus: "lentille", point_commun: "Ce sont des céréales",
    distracteurs_qcm: ["Ce sont des légumineuses", "Ce sont des fruits", "Ce sont des légumes feuilles"]
  },
  {
    id: "int_47", niveau: "intermediaire",
    mots: ["clavier", "souris", "écran", "imprimante", "webcam", "cartable"],
    intrus: "cartable", point_commun: "Ce sont des appareils qu'on branche à un ordinateur",
    distracteurs_qcm: ["Ce sont des fournitures scolaires", "Ce sont des appareils de cuisine", "Ce sont des instruments de musique"]
  },
  {
    id: "int_48", niveau: "intermediaire",
    mots: ["bois", "laine", "coton", "pierre", "cuir", "nylon"],
    intrus: "nylon", point_commun: "Ce sont des matériaux d'origine naturelle",
    distracteurs_qcm: ["Ce sont des matériaux synthétiques", "Ce sont des métaux", "Ce sont des liquides"]
  },
  {
    id: "int_49", niveau: "intermediaire",
    mots: ["ski", "snowboard", "luge", "patinage", "biathlon", "surf"],
    intrus: "surf", point_commun: "Ce sont des sports d'hiver",
    distracteurs_qcm: ["Ce sont des sports nautiques", "Ce sont des sports de combat", "Ce sont des sports de raquette"]
  },
  {
    id: "int_50", niveau: "intermediaire",
    mots: ["judo", "karaté", "boxe", "escrime", "lutte", "aviron"],
    intrus: "aviron", point_commun: "Ce sont des sports de combat",
    distracteurs_qcm: ["Ce sont des sports nautiques", "Ce sont des sports d'équipe", "Ce sont des sports de raquette"]
  },
  {
    id: "int_51", niveau: "intermediaire",
    mots: ["métro", "tramway", "autobus", "train", "téléphérique", "trottinette"],
    intrus: "trottinette", point_commun: "Ce sont des transports en commun",
    distracteurs_qcm: ["Ce sont des véhicules individuels", "Ce sont des véhicules qui volent", "Ce sont des véhicules sans moteur"]
  },

  // --- NIVEAU PROFESSIONNEL (suite) : vocabulaire riche, catégories fines, grammaire ---
  {
    id: "pro_11", niveau: "professionnel",
    mots: ["impossible", "inutile", "invisible", "incapable", "imprévu", "important"],
    intrus: "important", point_commun: "Ils commencent par un préfixe qui exprime le contraire (in-/im-)",
    distracteurs_qcm: ["Ils se terminent tous par le suffixe -ble", "Ce sont des verbes à l'infinitif", "Ce sont des noms communs"]
  },
  {
    id: "pro_12", niveau: "professionnel",
    mots: ["relire", "refaire", "réécrire", "recommencer", "revoir", "regretter"],
    intrus: "regretter", point_commun: "Ils contiennent le préfixe re- qui marque la répétition",
    distracteurs_qcm: ["Ils contiennent un préfixe qui marque le contraire", "Ce sont des noms communs", "Ce sont des verbes du 3e groupe"]
  },
  {
    id: "pro_13", niveau: "professionnel",
    mots: ["rapidement", "doucement", "lentement", "gentiment", "simplement", "monument"],
    intrus: "monument", point_commun: "Ce sont des adverbes de manière en -ment",
    distracteurs_qcm: ["Ce sont des noms communs en -ment", "Ce sont des adjectifs", "Ce sont des verbes"]
  },
  {
    id: "pro_14", niveau: "professionnel",
    mots: ["lavable", "buvable", "lisible", "mangeable", "jetable", "table"],
    intrus: "table", point_commun: "Ce sont des adjectifs formés avec un suffixe qui veut dire « qui peut être… »",
    distracteurs_qcm: ["Ce sont des noms communs", "Ce sont des verbes", "Ce sont des adverbes"]
  },
  {
    id: "pro_15", niveau: "professionnel",
    mots: ["maisonnette", "fillette", "camionnette", "tartelette", "jardinet", "assiette"],
    intrus: "assiette", point_commun: "Ce sont des noms formés avec un suffixe diminutif (qui veut dire « petit »)",
    distracteurs_qcm: ["Ce sont des noms formés avec un préfixe", "Ce sont des adjectifs", "Ce sont des noms d'objets de cuisine"]
  },
  {
    id: "pro_16", niveau: "professionnel",
    mots: ["je", "tu", "il", "nous", "vous", "mon"],
    intrus: "mon", point_commun: "Ce sont des pronoms personnels sujets",
    distracteurs_qcm: ["Ce sont des déterminants possessifs", "Ce sont des prépositions", "Ce sont des adverbes"]
  },
  {
    id: "pro_17", niveau: "professionnel",
    mots: ["le", "une", "des", "ce", "ses", "lui"],
    intrus: "lui", point_commun: "Ce sont des déterminants",
    distracteurs_qcm: ["Ce sont des pronoms", "Ce sont des prépositions", "Ce sont des conjonctions"]
  },
  {
    id: "pro_18", niveau: "professionnel",
    mots: ["à", "de", "pour", "sans", "sous", "mais"],
    intrus: "mais", point_commun: "Ce sont des prépositions",
    distracteurs_qcm: ["Ce sont des conjonctions de coordination", "Ce sont des adverbes", "Ce sont des déterminants"]
  },
  {
    id: "pro_19", niveau: "professionnel",
    mots: ["chanter", "danser", "jouer", "parler", "marcher", "finir"],
    intrus: "finir", point_commun: "Ce sont des verbes du 1er groupe",
    distracteurs_qcm: ["Ce sont des verbes du 2e groupe", "Ce sont des verbes du 3e groupe", "Ce sont des noms communs"]
  },
  {
    id: "pro_20", niveau: "professionnel",
    mots: ["grandir", "rougir", "choisir", "réussir", "obéir", "partir"],
    intrus: "partir", point_commun: "Ce sont des verbes du 2e groupe",
    distracteurs_qcm: ["Ce sont des verbes du 1er groupe", "Ce sont des verbes du 3e groupe", "Ce sont des verbes pronominaux"]
  },
  {
    id: "pro_21", niveau: "professionnel",
    mots: ["table", "maison", "fleur", "voiture", "chanson", "arbre"],
    intrus: "arbre", point_commun: "Ce sont des noms féminins",
    distracteurs_qcm: ["Ce sont des noms masculins", "Ce sont des adjectifs", "Ce sont des verbes"]
  },
  {
    id: "pro_22", niveau: "professionnel",
    mots: ["courage", "bonheur", "liberté", "patience", "amitié", "fauteuil"],
    intrus: "fauteuil", point_commun: "Ce sont des noms abstraits",
    distracteurs_qcm: ["Ce sont des noms concrets", "Ce sont des adjectifs", "Ce sont des verbes"]
  },
  {
    id: "pro_23", niveau: "professionnel",
    mots: ["effroi", "terreur", "frayeur", "angoisse", "épouvante", "colère"],
    intrus: "colère", point_commun: "Ce sont des synonymes de « peur »",
    distracteurs_qcm: ["Ce sont des synonymes de « colère »", "Ce sont des synonymes de « joie »", "Ce sont des synonymes de « tristesse »"]
  },
  {
    id: "pro_24", niveau: "professionnel",
    mots: ["affirmer", "déclarer", "murmurer", "chuchoter", "répondre", "écouter"],
    intrus: "écouter", point_commun: "Ce sont des verbes de parole",
    distracteurs_qcm: ["Ce sont des verbes de mouvement", "Ce sont des verbes de perception", "Ce sont des verbes d'état"]
  },
  {
    id: "pro_25", niveau: "professionnel",
    mots: ["sauter", "glisser", "ramper", "nager", "grimper", "réfléchir"],
    intrus: "réfléchir", point_commun: "Ce sont des verbes de mouvement",
    distracteurs_qcm: ["Ce sont des verbes de parole", "Ce sont des verbes d'état", "Ce sont des verbes de pensée"]
  },
  {
    id: "pro_26", niveau: "professionnel",
    mots: ["généreux", "honnête", "loyal", "bienveillant", "patient", "hypocrite"],
    intrus: "hypocrite", point_commun: "Ce sont des qualités (adjectifs mélioratifs)",
    distracteurs_qcm: ["Ce sont des défauts (adjectifs péjoratifs)", "Ce sont des noms communs", "Ce sont des adverbes"]
  },
  {
    id: "pro_27", niveau: "professionnel",
    mots: ["comparaison", "métaphore", "personnification", "hyperbole", "anaphore", "alexandrin"],
    intrus: "alexandrin", point_commun: "Ce sont des figures de style",
    distracteurs_qcm: ["Ce sont des types de vers", "Ce sont des genres théâtraux", "Ce sont des types de rimes"]
  },
  {
    id: "pro_28", niveau: "professionnel",
    mots: ["strophe", "vers", "rime", "quatrain", "sonnet", "réplique"],
    intrus: "réplique", point_commun: "Ce sont des mots du vocabulaire de la poésie",
    distracteurs_qcm: ["Ce sont des mots du vocabulaire du théâtre", "Ce sont des mots du vocabulaire du journalisme", "Ce sont des figures de style"]
  },
  {
    id: "pro_29", niveau: "professionnel",
    mots: ["scène", "acte", "tirade", "didascalie", "monologue", "paragraphe"],
    intrus: "paragraphe", point_commun: "Ce sont des mots du vocabulaire du théâtre",
    distracteurs_qcm: ["Ce sont des mots du vocabulaire de la poésie", "Ce sont des signes de ponctuation", "Ce sont des genres de romans"]
  },
  {
    id: "pro_30", niveau: "professionnel",
    mots: ["fusion", "solidification", "vaporisation", "condensation", "sublimation", "dissolution"],
    intrus: "dissolution", point_commun: "Ce sont des changements d'état de la matière",
    distracteurs_qcm: ["Ce sont des mélanges", "Ce sont des unités de mesure", "Ce sont des sources d'énergie"]
  },
  {
    id: "pro_31", niveau: "professionnel",
    mots: ["bouche", "œsophage", "estomac", "intestin grêle", "côlon", "trachée"],
    intrus: "trachée", point_commun: "Ce sont des organes de l'appareil digestif",
    distracteurs_qcm: ["Ce sont des organes de l'appareil respiratoire", "Ce sont des organes de l'appareil circulatoire", "Ce sont des os du squelette"]
  },
  {
    id: "pro_32", niveau: "professionnel",
    mots: ["chevreuil", "koala", "bison", "gazelle", "lama", "hyène"],
    intrus: "hyène", point_commun: "Ce sont des animaux herbivores",
    distracteurs_qcm: ["Ce sont des animaux carnivores", "Ce sont des animaux omnivores", "Ce sont des animaux insectivores"]
  },
  {
    id: "pro_33", niveau: "professionnel",
    mots: ["poule", "tortue", "crocodile", "saumon", "autruche", "chauve-souris"],
    intrus: "chauve-souris", point_commun: "Ce sont des animaux ovipares (ils pondent des œufs)",
    distracteurs_qcm: ["Ce sont des animaux vivipares", "Ce sont des mammifères", "Ce sont des animaux à plumes"]
  },
  {
    id: "pro_34", niveau: "professionnel",
    mots: ["escargot", "ver de terre", "pieuvre", "araignée", "méduse", "hippocampe"],
    intrus: "hippocampe", point_commun: "Ce sont des invertébrés (animaux sans colonne vertébrale)",
    distracteurs_qcm: ["Ce sont des vertébrés", "Ce sont des mammifères", "Ce sont des insectes"]
  },
  {
    id: "pro_35", niveau: "professionnel",
    mots: ["Brésil", "Argentine", "Chili", "Pérou", "Colombie", "Mexique"],
    intrus: "Mexique", point_commun: "Ce sont des pays d'Amérique du Sud",
    distracteurs_qcm: ["Ce sont des pays d'Amérique du Nord", "Ce sont des pays d'Afrique", "Ce sont des pays d'Europe"]
  },
  {
    id: "pro_36", niveau: "professionnel",
    mots: ["Tokyo", "Pékin", "Le Caire", "Ottawa", "Canberra", "Sydney"],
    intrus: "Sydney", point_commun: "Ce sont des capitales",
    distracteurs_qcm: ["Ce sont les plus grandes villes de leur pays", "Ce sont des villes d'Asie", "Ce sont des pays"]
  },
  {
    id: "pro_37", niveau: "professionnel",
    mots: ["Alpes", "Pyrénées", "Himalaya", "Andes", "Rocheuses", "Sahara"],
    intrus: "Sahara", point_commun: "Ce sont des chaînes de montagnes",
    distracteurs_qcm: ["Ce sont des déserts", "Ce sont des fleuves", "Ce sont des océans"]
  },
  {
    id: "pro_38", niveau: "professionnel",
    mots: ["Nil", "Amazone", "Mississippi", "Danube", "Gange", "Baïkal"],
    intrus: "Baïkal", point_commun: "Ce sont des fleuves",
    distracteurs_qcm: ["Ce sont des lacs", "Ce sont des mers", "Ce sont des montagnes"]
  },
  {
    id: "pro_39", niveau: "professionnel",
    mots: ["imprimerie", "boussole", "télescope", "machine à vapeur", "téléphone", "Amérique"],
    intrus: "Amérique", point_commun: "Ce sont des inventions humaines",
    distracteurs_qcm: ["Ce sont des découvertes géographiques", "Ce sont des éléments naturels", "Ce sont des monuments"]
  },
  {
    id: "pro_40", niveau: "professionnel",
    mots: ["tour Eiffel", "arc de Triomphe", "Mont-Saint-Michel", "château de Versailles", "pont du Gard", "Colisée"],
    intrus: "Colisée", point_commun: "Ce sont des monuments situés en France",
    distracteurs_qcm: ["Ce sont des monuments situés en Italie", "Ce sont des monuments situés en Égypte", "Ce sont des musées"]
  },
  {
    id: "pro_41", niveau: "professionnel",
    mots: ["Monet", "Picasso", "Van Gogh", "Renoir", "Cézanne", "Mozart"],
    intrus: "Mozart", point_commun: "Ce sont des peintres célèbres",
    distracteurs_qcm: ["Ce sont des compositeurs", "Ce sont des écrivains", "Ce sont des scientifiques"]
  },
  {
    id: "pro_42", niveau: "professionnel",
    mots: ["Beethoven", "Bach", "Chopin", "Vivaldi", "Debussy", "Molière"],
    intrus: "Molière", point_commun: "Ce sont des compositeurs de musique",
    distracteurs_qcm: ["Ce sont des peintres", "Ce sont des écrivains", "Ce sont des inventeurs"]
  },
  {
    id: "pro_43", niveau: "professionnel",
    mots: ["Victor Hugo", "Jules Verne", "La Fontaine", "Charles Perrault", "Alexandre Dumas", "Isaac Newton"],
    intrus: "Isaac Newton", point_commun: "Ce sont des écrivains français",
    distracteurs_qcm: ["Ce sont des scientifiques", "Ce sont des peintres", "Ce sont des compositeurs"]
  },
  {
    id: "pro_44", niveau: "professionnel",
    mots: ["Marie Curie", "Louis Pasteur", "Galilée", "Albert Einstein", "Charles Darwin", "Claude Monet"],
    intrus: "Claude Monet", point_commun: "Ce sont des scientifiques célèbres",
    distracteurs_qcm: ["Ce sont des peintres", "Ce sont des écrivains", "Ce sont des explorateurs"]
  },
  {
    id: "pro_45", niveau: "professionnel",
    mots: ["gramme", "kilogramme", "tonne", "milligramme", "quintal", "hectare"],
    intrus: "hectare", point_commun: "Ce sont des unités de masse",
    distracteurs_qcm: ["Ce sont des unités d'aire (de surface)", "Ce sont des unités de longueur", "Ce sont des unités de contenance"]
  },
  {
    id: "pro_46", niveau: "professionnel",
    mots: ["carré", "rectangle", "losange", "parallélogramme", "trapèze", "pentagone"],
    intrus: "pentagone", point_commun: "Ce sont des quadrilatères (figures à quatre côtés)",
    distracteurs_qcm: ["Ce sont des triangles", "Ce sont des solides", "Ce sont des figures à cinq côtés"]
  },
  {
    id: "pro_47", niveau: "professionnel",
    mots: ["deux", "trois", "cinq", "sept", "onze", "neuf"],
    intrus: "neuf", point_commun: "Ce sont des nombres premiers",
    distracteurs_qcm: ["Ce sont des nombres impairs", "Ce sont des multiples de trois", "Ce sont des nombres pairs"]
  },
  {
    id: "pro_48", niveau: "professionnel",
    mots: ["cumulus", "cirrus", "stratus", "nimbus", "cumulonimbus", "cyclone"],
    intrus: "cyclone", point_commun: "Ce sont des types de nuages",
    distracteurs_qcm: ["Ce sont des types de vents", "Ce sont des types de précipitations", "Ce sont des types de climats"]
  },
  {
    id: "pro_49", niveau: "professionnel",
    mots: ["tropical", "polaire", "désertique", "tempéré", "équatorial", "volcanique"],
    intrus: "volcanique", point_commun: "Ce sont des types de climats",
    distracteurs_qcm: ["Ce sont des types de relief", "Ce sont des types de roches", "Ce sont des types de nuages"]
  },
  {
    id: "pro_50", niveau: "professionnel",
    mots: ["mélancolie", "chagrin", "nostalgie", "désespoir", "peine", "allégresse"],
    intrus: "allégresse", point_commun: "Ce sont des mots qui expriment la tristesse",
    distracteurs_qcm: ["Ce sont des mots qui expriment la joie", "Ce sont des mots qui expriment la colère", "Ce sont des mots qui expriment la peur"]
  },
  {
    id: "pro_51", niveau: "professionnel",
    mots: ["bouillir", "griller", "rôtir", "frire", "mijoter", "éplucher"],
    intrus: "éplucher", point_commun: "Ce sont des façons de faire cuire un aliment",
    distracteurs_qcm: ["Ce sont des façons de découper un aliment", "Ce sont des façons de conserver un aliment", "Ce sont des noms d'ustensiles"]
  },
  {
    id: "pro_52", niveau: "professionnel",
    mots: ["sprint", "saut en hauteur", "lancer du javelot", "marathon", "saut à la perche", "plongeon"],
    intrus: "plongeon", point_commun: "Ce sont des disciplines de l'athlétisme",
    distracteurs_qcm: ["Ce sont des disciplines de natation", "Ce sont des sports d'équipe", "Ce sont des sports de combat"]
  },
  {
    id: "pro_53", niveau: "professionnel",
    mots: ["processeur", "carte mère", "disque dur", "mémoire vive", "ventilateur", "navigateur"],
    intrus: "navigateur", point_commun: "Ce sont des composants matériels d'un ordinateur",
    distracteurs_qcm: ["Ce sont des logiciels", "Ce sont des réseaux sociaux", "Ce sont des fournitures de bureau"]
  },
  {
    id: "pro_54", niveau: "professionnel",
    mots: ["souris", "rat", "hamster", "écureuil", "castor", "lapin"],
    intrus: "lapin", point_commun: "Ce sont des rongeurs",
    distracteurs_qcm: ["Ce sont des carnivores", "Ce sont des marsupiaux", "Ce sont des reptiles"]
  }
];
