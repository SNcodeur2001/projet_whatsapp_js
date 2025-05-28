import { getRandomColor } from "./utils";

// ===== DONNÉES GLOBALES =====
export let contacts = [
  {
    id: 1,
    nom: "Mapathé Ndiaye (vous)",
    telephone: "+221781562041",
    dernierMessage: "hello",
    heure: "14:30",
    archive: false,
    avatarColor: 'bg-blue-500', // Ajout de la couleur
  },
  {
    id: 2,
    nom: "Marie Martin",
    telephone: "+33987654321",
    dernierMessage: "",
    heure: "12:15",
    archive: false,
  },
];

export let groupes = [
  {
    id: 1,
    nom: "Famille",
    description: "Groupe familial",
    membres: [
      { id: 1, role: "admin" },
      { id: 2, role: "member" }
    ],
    dernierMessage: "",
    heure: "16:45",
    archive: false,
    avatarColor: 'bg-green-500', // Ajout de la couleur
  },
];

// ===== ÉTAT DE L'APPLICATION =====
export let appState = {
  currentView: "discussions",
  selectedGroup: null,
  selectedDiscussion: null,
};

// ===== FONCTIONS DE MUTATION =====
// Ajouter cette fonction utilitaire
function getNextNameWithNumber(baseName) {
  // Filtre les contacts qui commencent par le même nom de base
  const similarNames = contacts
    .map((c) => c.nom)
    .filter((name) => name === baseName || name.match(new RegExp(`^${baseName}\\s+\\d+$`)));

  if (similarNames.length === 0) {
    return baseName;
  }

  // Trouve le plus grand numéro utilisé
  const numbers = similarNames.map((name) => {
    const match = name.match(/\d+$/);
    return match ? parseInt(match[0]) : 1;
  });

  const maxNumber = Math.max(...numbers, 1);
  return `${baseName} ${maxNumber + 1}`;
}

export function addContact(contactData) {
  const existingContact = contacts.find(c => c.telephone === contactData.telephone);
  if (existingContact) {
    throw new Error("Un contact avec ce numéro existe déjà");
  }

  const uniqueName = getNextNameWithNumber(contactData.nom);

  const newContact = {
    ...contactData,
    nom: uniqueName,
    id: Date.now(),
    archive: false,
    avatarColor: getRandomColor(), // Ajouter une couleur fixe
    heure: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // Supprimez la photo s'il y en a une
  delete newContact.photo;

  contacts.push(newContact);
  return newContact;
}

export function addGroup(groupData) {
  if (!groupData.membres || groupData.membres.length < 2) {
    throw new Error("Un groupe doit avoir au moins 2 membres");
  }

  const membresAvecRoles = [
    { id: 1, role: "admin" }, // Mapathé Ndiaye (vous) comme admin
    ...groupData.membres
      .filter(id => id !== 1) // Exclure l'admin s'il était dans la liste
      .map(id => ({ id, role: "member" }))
  ];

  const newGroup = {
    ...groupData,
    id: Date.now(),
    membres: membresAvecRoles,
    archive: false,
    avatarColor: getRandomColor(), // Ajouter une couleur fixe
    heure: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  
  groupes.push(newGroup);
  return newGroup;
}

export function updateState(newState) {
  Object.assign(appState, newState);
}
