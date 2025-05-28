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
