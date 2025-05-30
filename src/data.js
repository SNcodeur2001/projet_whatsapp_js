import { getRandomColor } from "./utils";

// ===== DONNÉES GLOBALES =====
export let contacts = [
  {
    id: 1,
    nom: "Mapathé Ndiaye (vous)",
    telephone: "+221781562041",
    email: "mapathe@example.com", // Ajout email
    password: "123456",           // Ajout mot de passe
    dernierMessage: "hello",
    heure: "14:30",
    archive: false,
    avatarColor: 'bg-blue-500', // Ajout de la couleur
  },
  {
    id: 2,
    nom: "Marie Martin",
    telephone: "+33987654321",
     email: "martin@example.com", // Ajout email
    password: "1234567", 
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

// ===== ÉTAT DE L'AUTHENTIFICATION =====
export const authState = {
  isAuthenticated: false,
  currentUser: null
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

// Fonction d'authentification
export function login(email, password) {
  const user = contacts.find(
    contact => contact.email === email && contact.password === password
  );

  if (user) {
    authState.isAuthenticated = true;
    authState.currentUser = user;
    return true;
  }
  return false;
}

// Fonction de déconnexion
export function logout() {
  authState.isAuthenticated = false;
  authState.currentUser = null;
  return true;
}

// Ajouter ces nouvelles fonctions
export const messages = {
  contacts: {}, // Messages des contacts
  groups: {}    // Messages des groupes
};

// Fonction pour envoyer un message
export function sendMessage(type, id, content) {
  const now = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = {
    id: Date.now(),
    content,
    time: now,
    sender: 1, // ID de l'utilisateur actuel (vous)
    type: 'text'
  };

  // Initialiser le tableau de messages si nécessaire
  if (type === "contact" && !messages.contacts[id]) {
    messages.contacts[id] = [];
  } else if (type === "group" && !messages.groups[id]) {
    messages.groups[id] = [];
  }

  // Ajouter le message
  if (type === "contact") {
    messages.contacts[id].push(message);
    
    // Mettre à jour le dernier message dans le contact
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.dernierMessage = content;
      contact.heure = now;
    }
  } else if (type === "group") {
    messages.groups[id].push(message);
    
    // Mettre à jour le dernier message dans le groupe
    const group = groupes.find(g => g.id === id);
    if (group) {
      group.dernierMessage = content;
      group.heure = now;
    }
  }

  return true;
}

export function sendBroadcastMessage(selectedContactIds, message) {
  const now = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  selectedContactIds.forEach(id => {
    // Créer le message pour chaque contact
    if (!messages.contacts[id]) {
      messages.contacts[id] = [];
    }

    const broadcastMessage = {
      id: Date.now(),
      content: `[Diffusion] ${message}`,
      time: now,
      sender: 1,
      type: 'text'
    };

    messages.contacts[id].push(broadcastMessage);

    // Mettre à jour le dernier message du contact
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.dernierMessage = `[Diffusion] ${message}`;
      contact.heure = now;
    }
  });

  return true;
}
