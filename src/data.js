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
  currentUser: null,
  currentUserData: null
};

// Structure des utilisateurs
export const users = {
  // Mapathé
  "mapathe@example.com": {
    id: 1,
    nom: "Mapathé Ndiaye",
    email: "mapathe@example.com",
    telephone: "+221781562041",
    password: "123456",
    contacts: [
      {
        id: 2,
        nom: "Marie Martin",
        telephone: "+33987654321",
        email: "martin@example.com",
        dernierMessage: "",
        heure: "",
        archive: false,
        avatarColor: 'bg-pink-500',
      }
    ],
    groupes: [], // Les groupes de l'utilisateur
  },
  // Marie
  "martin@example.com": {
    id: 2,
    nom: "Marie Martin",
    email: "martin@example.com",
    telephone: "+33987654321",
    password: "1234567",
    contacts: [
      {
        id: 1,
        nom: "Mapathé Ndiaye",
        telephone: "+221781562041",
        email: "mapathe@example.com",
        dernierMessage: "",
        heure: "",
        archive: false,
        avatarColor: 'bg-blue-500',
      }
    ],
    groupes: [], // Les groupes de l'utilisateur
  }
};

// Structure des conversations
export const conversations = {
  // Clé: combinaison des IDs des deux utilisateurs (plus petit en premier)
  "1_2": {
    messages: [],
    participants: [1, 2]
  }
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
    authState.currentUserData = users[user.email];
    return { success: true, user };
  }

  return { success: false, error: "Email/Téléphone ou mot de passe incorrect" };
}

// Fonction de déconnexion
export function logout() {
  authState.isAuthenticated = false;
  authState.currentUser = null;
  return true;
}

// Structure des messages
export const messages = {
  conversations: {} // stockera les conversations entre deux utilisateurs
};

// Une seule déclaration de sendMessage
export function sendMessage(type, id, content) {
  const senderId = authState.currentUser.id;
  const now = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = {
    id: Date.now(),
    content,
    time: now,
    sender: senderId,
    recipient: id,
    type: 'text',
    status: 'sent'
  };

  // Initialiser la conversation si nécessaire
  const conversationId = `${Math.min(senderId, id)}_${Math.max(senderId, id)}`;
  if (!messages.conversations[conversationId]) {
    messages.conversations[conversationId] = {
      messages: [],
      participants: [senderId, id]
    };
  }

  // Ajouter le message à la conversation
  messages.conversations[conversationId].messages.push(message);

  // Mettre à jour le dernier message pour les deux participants
  const currentUserContact = users[authState.currentUser.email].contacts
    .find(c => c.id === id);
  if (currentUserContact) {
    currentUserContact.dernierMessage = `Vous : ${content}`;
    currentUserContact.heure = now;
  }

  // Mettre à jour pour le destinataire
  Object.values(users).forEach(user => {
    if (user.id === id) {
      const senderContact = user.contacts.find(c => c.id === senderId);
      if (senderContact) {
        senderContact.dernierMessage = content;
        senderContact.heure = now;
        senderContact.unreadCount = (senderContact.unreadCount || 0) + 1;
      }
    }
  });

  return true;
}

// Ajouter après la fonction sendMessage
export function sendBroadcastMessage(recipientIds, content) {
  const senderId = authState.currentUser.id;
  const now = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Pour chaque destinataire
  recipientIds.forEach(recipientId => {
    const conversationId = [senderId, recipientId].sort((a, b) => a - b).join('_');
    
    const message = {
      id: Date.now(),
      content,
      time: now,
      sender: senderId,
      recipient: recipientId,
      type: 'text',
      status: 'sent',
      isBroadcast: true // Marquer comme message de diffusion
    };

    // Initialiser la conversation si nécessaire
    if (!messages.conversations[conversationId]) {
      messages.conversations[conversationId] = {
        messages: [],
        participants: [senderId, recipientId]
      };
    }

    // Ajouter le message à la conversation
    messages.conversations[conversationId].messages.push(message);

    // Mettre à jour pour le destinataire
    for (const email in users) {
      const user = users[email];
      if (user.id === recipientId) {
        const senderContact = user.contacts.find(c => c.id === senderId);
        if (senderContact) {
          senderContact.dernierMessage = `[Diffusion] ${content}`;
          senderContact.heure = now;
          senderContact.unreadCount = (senderContact.unreadCount || 0) + 1;
        }
        break;
      }
    }
  });

  // Mettre à jour pour l'expéditeur
  const senderUser = users[authState.currentUser.email];
  if (senderUser) {
    recipientIds.forEach(recipientId => {
      const recipientContact = senderUser.contacts.find(c => c.id === recipientId);
      if (recipientContact) {
        recipientContact.dernierMessage = `[Diffusion] Vous : ${content}`;
        recipientContact.heure = now;
      }
    });
  }

  return true;
}

// Fonction pour marquer les messages comme lus
export function markMessagesAsRead(senderId, recipientId) {
  const conversationId = [senderId, recipientId].sort((a, b) => a - b).join('_');
  const conversation = messages.conversations[conversationId];
  
  if (conversation) {
    conversation.messages.forEach(message => {
      if (message.recipient === authState.currentUser.id) {
        message.status = 'read';
      }
    });

    // Réinitialiser le compteur de messages non lus
    const currentUser = users[authState.currentUser.email];
    if (currentUser) {
      const senderContact = currentUser.contacts.find(c => c.id === senderId);
      if (senderContact) {
        senderContact.unreadCount = 0;
      }
    }
  }
}

// Fonction pour récupérer les messages d'une conversation
export function getConversationMessages(userId1, userId2) {
  const conversationId = `${Math.min(userId1, userId2)}_${Math.max(userId1, userId2)}`;
  return messages.conversations[conversationId]?.messages || [];
}
