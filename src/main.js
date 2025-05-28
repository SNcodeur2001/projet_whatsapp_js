import { createElement } from "./component.js";
import { iconColors } from "./colors.js";
import { appState, updateState, addContact, addGroup } from "./data.js";
import {
  archiveDiscussion,
  unarchiveDiscussion,
  deleteDiscussion,
  getContactById,
  getGroupById,
  addMembersToGroup,
} from "./utils.js";
import {
  createDiscussionsList,
  createArchivesList,
  createContactForm,
  createGroupForm,
  createContactsList,
  createGroupsList,
  createGroupDetails,
  createAddMemberForm,
  createDiffusionList,
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
  updateState({ selectedDiscussion: { type, id } });
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
  updateState({ currentView: "diffusion" });
  updateDiscussionView();
}

function updateDiscussionView() {
  const discussionContainer = document.getElementById("discussion");
  discussionContainer.innerHTML = "";

  let content;

  switch (appState.currentView) {
    case "discussions":
      content = createDiscussionsList(selectDiscussion);
      break;
    case "archives":
      content = createArchivesList(selectDiscussion, showDiscussions);
      break;
    case "addContact":
      content = createContactForm(handleSaveContact, showDiscussions);
      break;
    case "addGroup":
      content = createGroupForm(handleSaveGroup, showGroupsList);
      break;
    case "contacts":
      content = createContactsList(showDiscussions);
      break;
    case "groupes":
      content = createGroupsList(
        showDiscussions, // onBack
        showGroupDetails, // onGroupSelect
        showGroupForm // onCreateGroup - Ajout de cette fonction
      );
      break;
    case "groupDetails":
      content = createGroupDetails(
        appState.selectedGroup,
        showGroupsList,
        showAddMemberForm
      );
      break;
    case "addMember":
      content = createAddMemberForm(
        appState.selectedGroup,
        () => showGroupDetails(appState.selectedGroup),
        handleAddMembers
      );
      break;
    case "diffusion":
      content = createDiffusionList(showDiscussions);
      break;
    default:
      content = createDiscussionsList(selectDiscussion);
  }

  discussionContainer.appendChild(content);
}

function updateHeaderActions() {
  const actionsContainer = document.getElementById("actions");
  if (!actionsContainer) return;

  actionsContainer.innerHTML = "";

  if (appState.selectedDiscussion) {
    const { type, id } = appState.selectedDiscussion;
    const isArchived =
      type === "contact"
        ? getContactById(id)?.archive
        : getGroupById(id)?.archive;

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
            unarchiveDiscussion(type, id);
          } else {
            archiveDiscussion(type, id);
          }
          updateState({ selectedDiscussion: null });
          updateDiscussionView();
          updateHeaderActions();
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
      "bg-[#efe7d7]",
      "p-2",
      "rounded-tr-xl",
      "flex",
      "justify-between",
      "items-center",
      "border-2",
      "border-b-white",
    ],
  },
  [photo_profil, actions]
);

const corpsZoneMessage = createElement("div", {
  className: ["w-full", "h-[83%]", "bg-[#efe7d7]"],
});

const textMessage = createElement("input", {
  type: "text",
  className: ["w-[94%]", "h-[70%]", "bg-[#f2eff0]", "rounded-xl"],
});

const envoyer = createElement(
  "button",
  {
    className: [
      "w-[5%]",
      "h-[80%]",
      "rounded-full",
      "bg-green-500",
      "flex",
      "justify-center",
      "items-center",
    ],
  },
  [
    createElement("i", {
      className: ["fa-solid", "fa-arrow-right", "text-xl", "text-white"],
    }),
  ]
);

const inputZoneMessage = createElement(
  "div",
  {
    className: [
      "w-full",
      "h-[10%]",
      "rounded-br-xl",
      "py-2",
      "px-2",
      "flex",
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
body.append(app);

// Démarrer l'application
showDiscussions();