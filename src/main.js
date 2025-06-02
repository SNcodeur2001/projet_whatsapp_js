import { createElement } from "./component.js";
import { iconColors } from "./colors.js";
import { 
  appState, 
  updateState, 
  addContact, 
  addGroup, 
  sendMessage,
  sendBroadcastMessage,
  messages,
  login,
  logout,
  authState 
} from "./data.js";
import {
  archiveDiscussion,
  unarchiveDiscussion,
  deleteDiscussion,
  getContactById,
  getGroupById,
  addMembersToGroup,
  removeMemberFromGroup,
  toggleAdminStatus,
} from "./utils.js";
import {
  createLoginForm,
  createDiscussionsList,
  createArchivesList,
  createContactForm,
  createGroupForm,
  createContactsList,
  createGroupsList,
  createGroupDetails,
  createAddMemberForm,
  createDiffusionList,
  createMessagesList,
  createEmptyMessageView  // Add this line
} from "./views.js";

// ===== GESTIONNAIRES D'ÉVÉNEMENTS =====
function handleSaveContact(e) {
  e.preventDefault();
  
  const nom = document.getElementById("contactNom").value.trim();
  const telephone = document.getElementById("contactTelephone").value.trim();
  const photo = document.getElementById("contactPhoto").value.trim();

  // Validation du nom
  if (!nom) {
    alert("Le nom est obligatoire");
    document.getElementById("contactNom").focus();
    return;
  }

  // Validation du numéro de téléphone avec une regex
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  if (!telephone || !phoneRegex.test(telephone)) {
    alert("Veuillez entrer un numéro de téléphone valide");
    document.getElementById("contactTelephone").focus();
    return;
  }

  // Validation optionnelle de l'URL de la photo
  if (photo && !isValidUrl(photo)) {
    alert("L'URL de la photo n'est pas valide");
    document.getElementById("contactPhoto").focus();
    return;
  }

  try {
    // Si toutes les validations sont passées, ajouter le contact
    addContact({
      nom,
      telephone,
      photo: photo || "https://via.placeholder.com/40",
      dernierMessage: "Nouveau contact",
    });

    showDiscussions();
  } catch (error) {
    alert(error.message);
    document.getElementById("contactTelephone").focus();
  }
}

// Ajouter cette fonction utilitaire pour valider les URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function handleSaveGroup(e) {
  e.preventDefault();
  
  const nom = document.getElementById("groupNom").value.trim();
  const description = document.getElementById("groupDescription").value.trim();
  const photo = document.getElementById("groupPhoto").value.trim();
  
  // Récupérer les membres sélectionnés
  const selectedMembers = Array.from(document.querySelectorAll('input[name="members[]"]:checked'))
    .map(checkbox => parseInt(checkbox.value));

  // Validation du nom du groupe
  if (!nom) {
    alert("Le nom du groupe est obligatoire");
    document.getElementById("groupNom").focus();
    return;
  }

  // Validation du nombre minimum de membres
  if (selectedMembers.length < 2) {
    alert("Veuillez sélectionner au moins 2 membres pour créer le groupe");
    return;
  }

  // Validation optionnelle de la description
  if (description && description.length < 3) {
    alert("La description doit faire au moins 3 caractères");
    document.getElementById("groupDescription").focus();
    return;
  }

  // Validation optionnelle de l'URL de la photo
  if (photo && !isValidUrl(photo)) {
    alert("L'URL de la photo n'est pas valide");
    document.getElementById("groupPhoto").focus();
    return;
  }

  try {
    // Si toutes les validations sont passées, créer le groupe
    const newGroup = {
      nom,
      description: description || "Nouveau groupe",
      photo: photo || "https://via.placeholder.com/40",
      dernierMessage: "Groupe créé",
      membres: selectedMembers, // Ajouter les membres sélectionnés
    };

    addGroup(newGroup);
    showGroupsList();
  } catch (error) {
    alert(error.message);
  }
}

function handleAddMembers() {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  const memberIds = Array.from(checkboxes).map((cb) =>
    parseInt(cb.id.replace("contact-", ""))
  );

  addMembersToGroup(appState.selectedGroup, memberIds);
  showGroupDetails(appState.selectedGroup);
}

function selectDiscussion(type, id) {
  // Mettre à jour l'état
  updateState({ 
    selectedDiscussion: { type, id },
    currentView: "discussions"
  });

  // Mettre à jour l'interface
  const headerTitle = document.querySelector("#headerTitle");
  const headerImage = document.querySelector("#headerImage");
  const messagesContainer = document.querySelector("#corpsZoneMessage");
  const messageInput = document.getElementById("messageInput");
  const inputZone = document.querySelector("#inputZoneMessage");
  
  const item = type === "contact" 
    ? getContactById(id)
    : getGroupById(id);

  if (item) {
    // Mettre à jour l'en-tête
    if (headerTitle) headerTitle.textContent = item.nom;
    if (headerImage) {
      headerImage.style.backgroundImage = `url(${item.photo || "https://via.placeholder.com/40"})`;
    }
    
    // Activer la zone de message
    if (messageInput) messageInput.disabled = false;
    if (inputZone) inputZone.style.display = "flex";
    
    // Afficher les messages
    if (messagesContainer) {
      messagesContainer.innerHTML = "";
      const messagesList = createMessagesList(type, id);
      messagesContainer.appendChild(messagesList);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  updateHeaderActions();
}

// ===== FONCTIONS DE NAVIGATION =====
function showDiscussions() {
  updateState({ currentView: "discussions", selectedDiscussion: null });
  updateDiscussionView();
  updateHeaderActions();
}

function showContactForm() {
  updateState({ currentView: "addContact" });
  updateDiscussionView();
}

function showGroupForm() {
  updateState({ currentView: "addGroup" });
  updateDiscussionView();
}

function showContactsList() {
  updateState({ currentView: "contacts" });
  updateDiscussionView();
}

function showGroupsList() {
  updateState({ currentView: "groupes" });
  updateDiscussionView();
}

function showGroupDetails(groupId) {
  updateState({ currentView: "groupDetails", selectedGroup: groupId });
  updateDiscussionView();
}

function showAddMemberForm(groupId) {
  updateState({ currentView: "addMember", selectedGroup: groupId });
  updateDiscussionView();
}

function showArchives() {
  updateState({ currentView: "archives", selectedDiscussion: null });
  updateDiscussionView();
  updateHeaderActions();
}

function showDiffusionList() {
  updateState({
    currentView: "diffusion",
  });
  updateDiscussionView();
}

function updateDiscussionView() {
  const discussionContainer = document.querySelector("#discussion");
  if (!discussionContainer) return;

  discussionContainer.innerHTML = "";

  switch (appState.currentView) {
    case "discussions":
      discussionContainer.appendChild(createDiscussionsList(selectDiscussion));
      break;
    case "archives":
      discussionContainer.appendChild(createArchivesList(selectDiscussion, showDiscussions));
      break;
    case "addContact":
      discussionContainer.appendChild(createContactForm(handleSaveContact, showDiscussions));
      break;
    case "addGroup":
      discussionContainer.appendChild(createGroupForm(handleSaveGroup, showGroupsList));
      break;
    case "contacts":
      discussionContainer.appendChild(createContactsList(showDiscussions));
      break;
    case "groupes":
      discussionContainer.appendChild(
        createGroupsList(
          showDiscussions,      // onBack
          showGroupDetails,     // onGroupSelect
          showGroupForm,        // onCreateGroup
          selectDiscussion      // Fonction de sélection pour les discussions
        )
      );
      break;
    case "groupDetails":
      discussionContainer.appendChild(
        createGroupDetails(
          appState.selectedGroup,
          showGroupsList,
          showAddMemberForm
        )
      );
      break;
    case "addMember":
      discussionContainer.appendChild(
        createAddMemberForm(
          appState.selectedGroup,
          () => showGroupDetails(appState.selectedGroup),
          handleAddMembers
        )
      );
      break;
    case "diffusion":
      discussionContainer.appendChild(
        createDiffusionList(
          showDiscussions,     // onBack
          handleSendBroadcast  // onSendBroadcast
        )
      );
      break;
    default:
      discussionContainer.appendChild(createDiscussionsList(selectDiscussion));
  }
}

function updateHeaderActions() {
  const actionsContainer = document.getElementById("actions");
  if (!actionsContainer) return;

  actionsContainer.innerHTML = "";

  if (appState.selectedDiscussion) {
    const { type, id } = appState.selectedDiscussion;
    const item = type === "contact" 
      ? authState.currentUserData.contacts.find(c => c.id === id)
      : getGroupById(id);

    const isArchived = item?.archive === true;

    // Bouton archiver/désarchiver
    const archiveBtn = createElement(
      "div",
      {
        className: [
          "w-[17%]",
          "h-full",
          "border-2",
          "border-blue-500",
          "rounded-full",
          "flex",
          "justify-center",
          "items-center",
          "cursor-pointer",
          "hover:bg-blue-100",
        ],
        onclick: () => {
          if (isArchived) {
            if (unarchiveDiscussion(type, id)) {
              updateState({ selectedDiscussion: null });
              updateDiscussionView();
              showDiscussions(); // Retour à la liste principale
            }
          } else {
            if (archiveDiscussion(type, id)) {
              updateState({ selectedDiscussion: null });
              updateDiscussionView();
              showDiscussions();
            }
          }
        },
      },
      [
        createElement("i", {
          className: [
            "fa-solid",
            isArchived ? "fa-box-open" : "fa-box-archive",
            "text-blue-500",
          ],
        }),
      ]
    );

    // Bouton supprimer
    const deleteBtn = createElement(
      "div",
      {
        className: [
          "w-[17%]",
          "h-full",
          "border-2",
          "border-red-500",
          "rounded-full",
          "flex",
          "justify-center",
          "items-center",
          "cursor-pointer",
          "hover:bg-red-100",
        ],
        onclick: () => {
          if (deleteDiscussion(type, id)) {
            updateState({ selectedDiscussion: null });
            updateDiscussionView();
            updateHeaderActions();
          }
        },
      },
      [
        createElement("i", {
          className: ["fa-solid", "fa-trash", "text-red-500"],
        }),
      ]
    );

    actionsContainer.appendChild(archiveBtn);
    actionsContainer.appendChild(deleteBtn);
  }
}

// Fonction utilitaire pour créer un bouton de la sidebar
function createSidebarButton(icon, text, onClick, id) {
  return createElement(
    "button",
    {
      className: [
        "w-32",
        "h-22",
        "p-3",
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "gap-2",
        "rounded-xl",
        "border-2",
        "border-orange-500",
        "bg-white",
        "hover:bg-orange-50",
        "text-orange-500",
        "hover:scale-105",
        "transition-all",
        "duration-200",
        "shadow-sm",
        "hover:shadow-md",
      ],
      onclick: onClick,
      id: id,
    },
    [
      createElement("i", { 
        className: [
          "fa-solid",
          icon,
          "text-xl",
          "text-orange-500",
        ]
      }),
      createElement("span", {
        className: ["text-sm", "font-medium"]
      }, text)
    ]
  );
}

// Utilisation pour tous les boutons
const messageBtn = createSidebarButton("fa-message", "Messages", showDiscussions, "messageBtn");
const groupBtn = createSidebarButton("fa-user-group", "Groupes", showGroupsList, "groupBtn");
const diffusionBtn = createSidebarButton("fa-arrows-turn-to-dots", "Diffusions", showDiffusionList, "diffusionBtn");
const archiveBtn = createSidebarButton("fa-box-archive", "Archives", showArchives, "archiveBtn");

// Modifier le bouton nouveauBtn
const nouveauBtn = createElement(
  "button",
  {
    className: [
      "border-2",
      "border-orange-500",
      "p-2",
      "w-32",
      "h-22",
      "flex",
      "flex-col",
      "hover:bg-orange-500",
      "hover:text-white",
      "transition-colors",
      "duration-200",
    ],
    onclick: showContactForm, // Modification ici : appel direct de showContactForm
    id: "nouveauBtn",
  },
  [
    createElement("i", { className: ["fa-solid", "fa-plus", "text-xl"] }),
    "Nouveau contact", // Modification du texte
  ]
);

// ===== CRÉATION DE LA MISE EN PAGE =====
const sidebar = createElement(
  "div",
  {
    className: [
      "w-1/12",
      "h-full",
      "bg-[#f0efe8]",
      "flex",
      "items-center",
      "justify-center",
      "flex",
      "flex-col",
      "gap-3",
      "rounded-tl-xl",
      "rounded-bl-xl",
    ],
  },
  [messageBtn, groupBtn, diffusionBtn, archiveBtn, nouveauBtn]
);

const discussion = createElement("div", {
  className: ["w-3/12", "h-full", "bg-[#f9f7f5]", "p-0"],
  id: "discussion",
});

const actions = createElement("div", {
  className: [
    "w-[25%]",
    "h-full",
    "text-xl",
    "flex",
    "justify-around",
    "items-center",
  ],
  id: "actions",
});

const photo_profil = createElement("div", {
  className: ["w-[3.6%]", "h-full", "rounded-full", "bg-slate-500"],
});

const headerZoneMessage = createElement(
  "div",
  {
    className: [
      "w-full",
      "h-[7%]",
      "bg-[#f0f2f5]",
      "p-2",
      "rounded-tr-xl",
      "flex",
      "items-center",
      "gap-4",
      "border-b",
    ],
  },
  [
    createElement("div", {
      id: "headerImage",
      className: [
        "w-10",
        "h-10",
        "rounded-full",
        "bg-cover",
        "bg-center",
      ]
    }),
    createElement("h2", {
      id: "headerTitle",
      className: ["text-lg", "font-semibold", "text-gray-800"]
    }, "Sélectionnez une discussion"),
    actions,
    createElement("button", {
      className: [
        "ml-auto",
        "px-4",
        "py-2",
        "text-sm",
        "text-red-600",
        "hover:bg-red-50",
        "rounded-md",
        "transition-colors",
      ],
      onclick: handleLogout,
    }, "Déconnexion")
  ]
);

const corpsZoneMessage = createElement("div", {
  id: "corpsZoneMessage",
  className: [
    "w-full",
    "h-[83%]",
    "bg-[#efeae2]",
    "overflow-y-auto",
    "scrollbar-thin",
    "scrollbar-thumb-gray-300",
    "scrollbar-track-transparent",
  ],
});

const textMessage = createElement("input", {
  type: "text",
  id: "messageInput",
  placeholder: "Tapez votre message...",
  className: [
    "w-[94%]",
    "h-[70%]",
    "bg-[#f2eff0]",
    "rounded-xl",
    "px-4",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-orange-500",
    "transition-all",
  ],
  onkeyup: (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  }
});

function handleSendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (!message) return;

  if (appState.selectedDiscussion) {
    const { type, id } = appState.selectedDiscussion;
    if (sendMessage(type, id, message)) {
      messageInput.value = "";
      
      // Mettre à jour l'affichage des messages
      const messagesContainer = document.querySelector("#corpsZoneMessage");
      if (messagesContainer) {
        messagesContainer.innerHTML = "";
        messagesContainer.appendChild(createMessagesList(type, id));
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      // Mettre à jour l'interface
      updateDiscussionView();
    }
  }
}

// Modifier la création du bouton d'envoi
const envoyer = createElement(
  "button",
  {
    className: [ 
      "w-[5%]",
      "h-[80%]",
      "rounded-full",
      "bg-orange-500",
      "flex",
      "justify-center",
      "items-center",
      "hover:bg-orange-600",
      "transition-colors",
    ],
    onclick: handleSendMessage,
  },
  [
    createElement("i", {
      className: ["fa-solid", "fa-paper-plane", "text-xl", "text-white"],
    }),
  ]
);

// Modifier la création du champ de texte
// const textMessage = createElement("input", {
//   type: "text",
//   id: "messageInput",
//   placeholder: "Tapez votre message...",
//   className: [
//     "w-[94%]",
//     "h-[70%]",
//     "bg-[#f2eff0]",
//     "rounded-xl",
//     "px-4",
//     "focus:outline-none",
//     "focus:ring-2",
//     "focus:ring-orange-500",
//     "transition-all",
//   ],
//   onkeyup: (e) => {
//     if (e.key === "Enter") {
//       handleSendMessage();
//     }
//   }
// });



const inputZoneMessage = createElement(
  "div",
  {
    id: "inputZoneMessage",
    className: [
      "w-full",
      "h-[10%]",
      "rounded-br-xl",     
      "py-2",
      "px-2",
      "hidden", // Caché par défaut
      "items-center",
      "justify-between",
    ],
  },
  [textMessage, envoyer]
);

const zoneMessage = createElement(
  "div",
  {
    className: [
      "w-8/12",
      "h-full",
      "rounded-tr-xl",
      "rounded-br-xl",
      "bg-[#f9f7f5]",
    ],
  },
  [headerZoneMessage, corpsZoneMessage, inputZoneMessage]
);

const container = createElement(
  "div",
  {
    className: [
      "w-11/12",
      "h-full",
      "border",
      "bg-white",
      "rounded-xl",
      "flex",
      "shadow-2xl",
    ],
  },
  [sidebar, discussion, zoneMessage]
);

const app = createElement(
  "div",
  {
    className: [
      "w-screen",
      "h-screen",
      "bg-slate-50",
      "flex",
      "justify-center",
      "items-center",
      "py-7",
    ],
  },
  [container]
);

// ===== INITIALISATION =====
const body = document.querySelector("body");
if (authState.isAuthenticated) {
  initializeApp();
} else {
  showLogin();
}

// Démarrer l'application
showDiscussions();

// Fonction pour retirer un membre d'un groupe
function handleRemoveMember(groupId, memberId, memberName) {
  if (confirm(`Êtes-vous sûr de vouloir retirer ${memberName} du groupe ?`)) {
    const result = removeMemberFromGroup(groupId, memberId);
    if (result.success) {
      updateDiscussionView();
      alert(`${memberName} a été retiré du groupe`);
    } else {
      alert(result.message);
    }
  }
}

// Ajouter la fonction de gestion du login
function handleLogin(email, password) {
  if (login(email, password)) {
    // Connexion réussie
    initializeApp();
  } else {
    alert("Email ou mot de passe incorrect");
  }
}

// Ajouter la fonction de déconnexion
function handleLogout() {
  if (logout()) {
    // Supprimer l'app existante
    const body = document.querySelector("body");
    body.innerHTML = "";
    // Afficher le login
    showLogin();
  }
}

// Fonction d'initialisation de l'app
function initializeApp() {
  const body = document.querySelector("body");
  body.innerHTML = "";
  body.append(app);

  // Afficher la vue vide par défaut
  const messagesContainer = document.querySelector("#corpsZoneMessage");
  const messageInput = document.getElementById("messageInput");
  const inputZone = document.querySelector("#inputZoneMessage");

  if (messagesContainer) {
    messagesContainer.innerHTML = "";
    messagesContainer.appendChild(createEmptyMessageView());
  }

  // Désactiver la zone de saisie
  if (messageInput) messageInput.disabled = true;
  if (inputZone) inputZone.style.display = "none";

  showDiscussions();
}

// Fonction d'affichage du login
function showLogin() {
  const body = document.querySelector("body");
  body.innerHTML = "";
  body.append(createLoginForm(handleLogin));
}

// Fonction pour gérer l'envoi de messages de diffusion
function handleSendBroadcast(selectedContacts, message) {
  if (sendBroadcastMessage(selectedContacts, message)) {
    alert("Message de diffusion envoyé avec succès");
    updateDiscussionView();
    showDiscussions(); // Retour à la liste des discussions
  } else {
    alert("Erreur lors de l'envoi du message de diffusion");
  }
}