import { contacts, groupes } from "./data.js";

// ===== FONCTIONS UTILITAIRES =====
export function getContactById(id) {
  return contacts.find((contact) => contact.id === id);
}

export function getGroupById(id) {
  return groupes.find((group) => group.id === id);
}

export function archiveDiscussion(type, id) {
  // Vérification uniquement pour votre contact
  if (type === "contact" && id === 1) {
    alert("Vous ne pouvez pas vous archiver vous-même");
    return false;
  }

  // Procéder à l'archivage
  if (type === "contact") {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.archive = true;
      return true;
    }
  } else if (type === "group") {
    const group = groupes.find(g => g.id === id);
    if (group) {
      group.archive = true;
      return true;
    }
  }

  return false;
}

export function unarchiveDiscussion(type, id) {
  if (type === "contact") {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.archive = false;
      return true;
    }
  } else if (type === "group") {
    const group = groupes.find(g => g.id === id);
    if (group) {
      group.archive = false;
      return true;
    }
  }
  return false;
}

export function deleteDiscussion(type, id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette discussion ?")) {
    if (type === "contact") {
      const index = contacts.findIndex((contact) => contact.id === id);
      if (index !== -1) contacts.splice(index, 1);
    } else if (type === "group") {
      const index = groupes.findIndex((group) => group.id === id);
      if (index !== -1) groupes.splice(index, 1);
    }
    return true;
  }
  return false;
}

export function addMembersToGroup(groupId, memberIds) {
  const group = getGroupById(groupId);
  if (group) {
    memberIds.forEach((id) => {
      if (!group.membres.some(membre => membre.id === id)) {
        group.membres.push({ id, role: "member" });
      }
    });
  }
}

export function removeMemberFromGroup(groupId, memberId) {
  const group = getGroupById(groupId);
  
  // Vérifications
  if (!group) return { success: false, message: "Groupe non trouvé" };
  if (memberId === 1) return { success: false, message: "Impossible de retirer l'administrateur" };
  if (group.membres.length <= 2) return { success: false, message: "Un groupe doit avoir au moins 2 membres" };
  
  // Retirer le membre
  group.membres = group.membres.filter(membre => membre.id !== memberId);
  
  return { success: true, message: "Membre retiré avec succès" };
}

export function toggleAdminStatus(groupId, memberId) {
  const group = getGroupById(groupId);
  
  // Vérifications
  if (!group) return { success: false, message: "Groupe non trouvé" };
  if (memberId === 1) return { success: false, message: "Impossible de modifier le statut de l'administrateur principal" };
  
  // Trouver le membre
  const membre = group.membres.find(m => m.id === memberId);
  if (!membre) return { success: false, message: "Membre non trouvé" };
  
  // Changer le statut
  membre.role = membre.role === "admin" ? "member" : "admin";
  
  return { 
    success: true, 
    message: `Statut modifié en ${membre.role}`,
    newRole: membre.role 
  };
}

const avatarColors = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500', 
  'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 
  'bg-indigo-500', 'bg-teal-500'
];

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRandomColor() {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

export function createAvatarElement(name, size = 10) {
  return createElement("div", {
    className: [
      `w-${size}`,
      `h-${size}`,
      "rounded-full",
      "flex",
      "items-center",
      "justify-center",
      "text-white",
      "font-bold",
      getRandomColor(),
    ]
  }, getInitials(name));
}

export function filterDiscussions(searchTerm) {
  if (searchTerm === "*") {
    return sortDiscussionsAlphabetically([
      ...contacts
        .filter(contact => !contact.archive)
        .map(contact => ({ ...contact, type: "contact" })),
      ...groupes
        .filter(group => !group.archive)
        .map(group => ({ ...group, type: "group" }))
    ]);
  }

  const term = searchTerm.toLowerCase();
  
  const filteredContacts = contacts
    .filter(contact => !contact.archive)
    .filter(contact => 
      contact.nom.toLowerCase().includes(term) || 
      contact.telephone.includes(term)
    )
    .map(contact => ({ ...contact, type: "contact" }));

  const filteredGroups = groupes
    .filter(group => !group.archive)
    .filter(group => 
      group.nom.toLowerCase().includes(term)
    )
    .map(group => ({ ...group, type: "group" }));

  return [...filteredContacts, ...filteredGroups];
}

export function sortDiscussionsAlphabetically(items) {
  return [...items].sort((a, b) => {
    // Conversion en minuscules pour un tri insensible à la casse
    const nameA = a.nom.toLowerCase();
    const nameB = b.nom.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}
