import { createElement } from "./component.js";
import { contacts, groupes, messages, authState } from "./data.js";
import { getContactById, getGroupById } from "./utils.js";
import { appState } from "./data.js";
import { createAvatarElement } from "./avatar.js";
import { removeMemberFromGroup } from "./utils.js";
import { toggleAdminStatus } from "./utils.js";
import { filterDiscussions } from "./utils.js";
import { sortDiscussionsAlphabetically } from "./utils.js";
import { getConversationMessages } from "./data.js";
// ===== LISTES ET DISCUSSIONS =====
export function createDiscussionsList(onSelectDiscussion) {
  // Utiliser les contacts de l'utilisateur connecté
  const userContacts = authState.currentUserData.contacts;
  
  const discussionsWithMessages = userContacts
    .filter(contact => !contact.archive)
    .map(contact => ({ ...contact, type: "contact" }));

  // Ajouter cette ligne pour définir hasDiscussions
  const hasDiscussions = discussionsWithMessages.length > 0;

  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput?.value?.trim() || "";

  let itemsToDisplay;

  if (searchTerm === "*") {
    // Afficher tous les contacts et groupes triés alphabétiquement
    itemsToDisplay = sortDiscussionsAlphabetically([
      ...contacts
        .filter(contact => !contact.archive)
        .map(contact => ({ ...contact, type: "contact" })),
      ...groupes
        .filter(group => !group.archive)
        .map(group => ({ ...group, type: "group" }))
    ]);
  } else if (searchTerm) {
    // Recherche normale
    itemsToDisplay = filterDiscussions(searchTerm);
  } else {
    // Afficher uniquement les discussions avec messages
    itemsToDisplay = discussionsWithMessages;
  }

  return createElement("div", { 
    className: [
      "w-full", 
      "h-full", 
      "flex", 
      "flex-col",
      "bg-[#f9f7f5]",
    ] 
  }, [
    createElement("div", {
      className: [
        "p-4",
        "border-b",
        "bg-white",
        "sticky",
        "top-0",
        "z-10",
        "shadow-sm",
      ]
    }, [
      createElement("h1", {
        className: [
          "text-xl",
          "font-bold",
          "text-gray-800",
          "mb-4",
        ]
      }, !hasDiscussions ? "Contacts" : "Discussions"),

      // Barre de recherche modifiée
      createElement("div", {
        className: [
          "relative",
          "rounded-lg",
          "overflow-hidden",
          "shadow-sm",
          "hover:shadow-md",
          "transition-shadow",
        ]
      }, [
        createElement("input", {
          type: "text",
          id: "searchInput",
          placeholder: "Rechercher une discussion...",
          className: [
            "w-full",
            "py-2.5",
            "pl-10",
            "pr-4",
            "bg-gray-50",
            "border",
            "border-gray-200",
            "rounded-lg",
            "focus:outline-none",
            "focus:border-orange-500",
            "focus:ring-1",
            "focus:ring-orange-500",
            "transition-all",
          ],
          oninput: (e) => {
            const searchTerm = e.target.value.trim();
            const listContainer = document.querySelector("#discussionsList");
            
            if (listContainer) {
              listContainer.innerHTML = "";
              let filteredItems;

              if (searchTerm === "*") {
                // Tri alphabétique de tous les éléments
                filteredItems = sortDiscussionsAlphabetically([
                  ...contacts.map(contact => ({ ...contact, type: "contact" })),
                  ...groupes.map(group => ({ ...group, type: "group" }))
                ]);
              } else if (searchTerm === "") {
                // Retour à l'affichage par défaut
                filteredItems = itemsToDisplay;
              } else {
                // Recherche normale
                filteredItems = filterDiscussions(searchTerm);
              }

              // Affichage des résultats
              const updatedList = filteredItems.map((item) =>
                createElement("div", {
                  className: [
                    "flex",
                    "items-center",
                    "p-3",
                    "rounded-xl",
                    "hover:bg-gray-100",
                    "cursor-pointer",
                    "mb-1",
                    "transition-all",
                    "duration-200",
                    "group",
                    appState.selectedDiscussion?.id === item.id ? "bg-orange-50" : "bg-white",
                    "relative",
                    "shadow-sm",
                    "hover:shadow-md",
                  ],
                  onclick: () => onSelectDiscussion(item.type, item.id),
                }, [
                  // Avatar avec point de statut
                  createElement("div", {
                    className: ["relative"]
                  }, [
                    createAvatarElement(item.nom, 12, item.avatarColor),
                    // Point vert de statut
                    createElement("div", {
                      className: [
                        "absolute",
                        "-bottom-0.5",
                        "-right-0.5",
                        "w-3",
                        "h-3",
                        "bg-green-500",
                        "rounded-full",
                        "border-2",
                        "border-white",
                        "shadow-sm",
                      ]
                    })
                  ]),

                  // Informations de la discussion
                  createElement("div", {
                    className: [
                      "flex-1",
                      "ml-4",
                      "border-l",
                      "border-gray-100",
                      "pl-4",
                    ]
                  }, [
                    // En-tête avec nom et heure
                    createElement("div", {
                      className: ["flex", "justify-between", "items-center", "mb-0.5"]
                    }, [
                      createElement("h3", {
                        className: [
                          "font-semibold",
                          "text-gray-900",
                          "group-hover:text-orange-600",
                          "transition-colors",
                        ]
                      }, item.nom),
                      createElement("span", {
                        className: [
                          "text-xs",
                          "text-gray-500",
                          "font-medium",
                          "min-w-[45px]",
                          "text-right",
                        ]
                      }, item.heure || "")
                    ]),

                    // Ligne du dernier message
                    createElement("div", {
                      className: ["flex", "items-center", "justify-between"]
                    }, [
                      createElement("p", {
                        className: [
                          "text-sm",
                          "text-gray-600",
                          "truncate",
                          "max-w-[200px]",
                          !hasDiscussions ? "italic" : "",
                          "group-hover:text-gray-800",
                        ]
                      }, item.type === "group" 
                        ? `${item.membres.length} membres` 
                        : item.dernierMessage
                      ),
                      // Badge de messages non lus (optionnel)
                      item.unreadCount && createElement("span", {
                        className: [
                          "ml-2",
                          "bg-orange-500",
                          "text-white",
                          "text-xs",
                          "font-medium",
                          "px-2",
                          "py-0.5",
                          "rounded-full",
                          "min-w-[20px]",
                          "text-center",
                        ]
                      }, item.unreadCount)
                    ])
                  ])
                ])
              );
              
              if (updatedList.length === 0) {
                listContainer.appendChild(
                  createElement("div", {
                    className: [
                      "flex",
                      "items-center",
                      "justify-center",
                      "p-4",
                      "text-gray-500",
                      "italic"
                    ]
                  }, searchTerm === "*" ? "Aucune discussion disponible" : "Aucun résultat trouvé")
                );
              } else {
                updatedList.forEach(item => listContainer.appendChild(item));
              }
            }
          }
        }),
        createElement("i", {
          className: [
            "fa-solid",
            "fa-search",
            "absolute",
            "left-3",
            "top-1/2",
            "-translate-y-1/2",
            "text-gray-400",
          ]
        })
      ])
    ]),

    // Conteneur de la liste avec ID
    createElement("div", {
      id: "discussionsList",
      className: [
        "flex-1",
        "overflow-y-auto",
        "scrollbar-thin",
        "scrollbar-thumb-gray-300",
        "scrollbar-track-transparent",
        "px-2",
        "py-1",
      ]
    }, itemsToDisplay.map((item) =>
      createElement("div", {
        className: [
          "flex",
          "items-center",
          "p-3",
          "rounded-xl",
          "hover:bg-gray-100",
          "cursor-pointer",
          "mb-1",
          "transition-all",
          "duration-200",
          "group",
          appState.selectedDiscussion?.id === item.id ? "bg-orange-50" : "bg-white",
          "relative",
          "shadow-sm",
          "hover:shadow-md",
        ],
        onclick: () => onSelectDiscussion(item.type, item.id),
      }, [
        // Avatar avec point de statut
        createElement("div", {
          className: ["relative"]
        }, [
          createAvatarElement(item.nom, 12, item.avatarColor),
          // Point vert de statut
          createElement("div", {
            className: [
              "absolute",
              "-bottom-0.5",
              "-right-0.5",
              "w-3",
              "h-3",
              "bg-green-500",
              "rounded-full",
              "border-2",
              "border-white",
              "shadow-sm",
            ]
          })
        ]),

        // Informations de la discussion
        createElement("div", {
          className: [
            "flex-1",
            "ml-4",
            "border-l",
            "border-gray-100",
            "pl-4",
          ]
        }, [
          // En-tête avec nom et heure
          createElement("div", {
            className: ["flex", "justify-between", "items-center", "mb-0.5"]
          }, [
            createElement("h3", {
              className: [
                "font-semibold",
                "text-gray-900",
                "group-hover:text-orange-600",
                "transition-colors",
              ]
            }, item.nom),
            createElement("span", {
              className: [
                "text-xs",
                "text-gray-500",
                "font-medium",
                "min-w-[45px]",
                "text-right",
              ]
            }, item.heure || "")
          ]),

          // Ligne du dernier message
          createElement("div", {
            className: ["flex", "items-center", "justify-between"]
          }, [
            createElement("p", {
              className: [
                "text-sm",
                "text-gray-600",
                "truncate",
                "max-w-[200px]",
                !hasDiscussions ? "italic" : "",
                "group-hover:text-gray-800",
              ]
            }, item.type === "group" 
              ? `${item.membres.length} membres` 
              : item.dernierMessage
            ),
            // Badge de messages non lus (optionnel)
            item.unreadCount && createElement("span", {
              className: [
                "ml-2",
                "bg-orange-500",
                "text-white",
                "text-xs",
                "font-medium",
                "px-2",
                "py-0.5",
                "rounded-full",
                "min-w-[20px]",
                "text-center",
              ]
            }, item.unreadCount)
          ])
        ])
      ])
    ))
  ]);
}

export function createArchivesList(onSelectDiscussion, onBack) {
  const archivedItems = [
    ...contacts
      .filter((contact) => contact.archive)
      .map((contact) => ({ ...contact, type: "contact" })),
    ...groupes
      .filter((group) => group.archive)
      .map((group) => ({ ...group, type: "group" })),
  ];

  return createElement("div", { 
    className: [
      "w-full", 
      "h-full", 
      "flex", 
      "flex-col",
      "bg-[#f9f7f5]",
    ] 
  }, [
    // En-tête
    createElement("div", {
      className: [
        "p-4",
        "border-b",
        "bg-white",
        "sticky",
        "top-0",
        "z-10",
        "shadow-sm",
        "flex",
        "justify-between",
        "items-center",
      ]
    }, [
      createElement("h1", {
        className: ["text-xl", "font-bold", "text-gray-800"]
      }, "Discussions archivées"),
      createElement("button", {
        className: [
          "text-gray-500",
          "hover:text-orange-500",
          "text-lg",
          "transition-colors",
        ],
        onclick: onBack,
      }, "← Retour")
    ]),

    // Liste des éléments archivés
    createElement("div", {
      className: [
        "flex-1",
        "overflow-y-auto",
        "scrollbar-thin",
        "scrollbar-thumb-gray-300",
        "scrollbar-track-transparent",
        "px-2",
        "py-1",
      ]
    }, archivedItems.length > 0 ? archivedItems.map((item) =>
      createElement("div", {
        className: [
          "flex",
          "items-center",
          "p-3",
          "rounded-xl",
          "hover:bg-gray-100",
          "cursor-pointer",
          "mb-1",
          "transition-all",
          "duration-200",
          "group",
          "bg-white",
          "shadow-sm",
          "hover:shadow-md",
        ],
        onclick: () => onSelectDiscussion(item.type, item.id),
      }, [
        // Avatar
        createElement("div", {
          className: ["relative"]
        }, [
          createAvatarElement(item.nom, 12, item.avatarColor),
          // Badge "Archivé"
          createElement("div", {
            className: [
              "absolute",
              "-top-1",
              "-right-1",
              "bg-orange-500",
              "text-white",
              "text-xs",
              "px-2",
              "py-0.5",
              "rounded-full",
              "font-medium",
            ]
          }, "Archivé")
        ]),

        // Informations
        createElement("div", {
          className: [
            "flex-1",
            "ml-4",
            "border-l",
            "border-gray-100",
            "pl-4",
          ]
        }, [
          createElement("div", {
            className: ["flex", "justify-between", "items-center", "mb-0.5"]
          }, [
            createElement("h3", {
              className: [
                "font-semibold",
                "text-gray-900",
                "group-hover:text-orange-600",
                "transition-colors",
              ]
            }, item.nom),
            createElement("span", {
              className: [
                "text-xs",
                "text-gray-500",
                "font-medium",
              ]
            }, item.heure || "")
          ]),
          createElement("p", {
            className: [
              "text-sm",
              "text-gray-600",
              "truncate",
              "group-hover:text-gray-800",
            ]
          }, item.type === "group" 
            ? `${item.membres.length} membres` 
            : item.dernierMessage
          )
        ])
      ])
    ) : createElement("p", {
      className: [
        "text-gray-500",
        "text-center",
        "py-8",
        "italic",
      ]
    }, "Aucune discussion archivée"))
  ]);
}

// ===== FORMULAIRES =====
export function createContactForm(onSave, onCancel) {
  return createElement("div", { className: ["w-full", "h-full", "p-4"] }, [
    createElement(
      "div",
      { className: ["flex", "justify-between", "items-center", "mb-6"] },
      [
        createElement(
          "h2",
          { className: ["text-xl", "font-bold"] },
          "Ajouter un contact"
        ),
        createElement(
          "button",
          {
            className: ["text-gray-500", "hover:text-gray-700", "text-xl"],
            onclick: onCancel,
          },
          "×"
        ),
      ]
    ),
    createElement(
      "form",
      {
        className: ["space-y-4"],
        onsubmit: onSave, // Maintenant onSave recevra l'événement
      },
      [
        createElement("input", {
          type: "text",
          placeholder: "Nom du contact",
          className: [
            "w-full",
            "p-3",
            "border",
            "border-gray-300",
            "rounded-md",
            "focus:outline-none",
            "focus:border-blue-500",
            "focus:ring-1",
            "focus:ring-blue-500",
          ],
          id: "contactNom",
        }),
        createElement("input", {
          type: "tel",
          placeholder: "Numéro de téléphone",
          className: [
            "w-full",
            "p-3",
            "border",
            "border-gray-300",
            "rounded-md",
            "focus:outline-none",
            "focus:border-blue-500",
            "focus:ring-1",
            "focus:ring-blue-500",
          ],
          id: "contactTelephone",
        }),
        createElement("input", {
          type: "url",
          placeholder: "URL de la photo (optionnel)",
          className: [
            "w-full",
            "p-3",
            "border",
            "border-gray-300",
            "rounded-md",
            "focus:outline-none",
            "focus:border-blue-500",
            "focus:ring-1",
            "focus:ring-blue-500",
          ],
          id: "contactPhoto",
        }),
        createElement("div", { className: ["flex", "gap-3", "mt-6"] }, [
          createElement(
            "button",
            {
              type: "button",
              className: [
                "px-4",
                "py-2",
                "bg-gray-300",
                "text-gray-700",
                "rounded-md",
                "hover:bg-gray-400",
              ],
              onclick: onCancel,
            },
            "Annuler"
          ),
          createElement(
            "button",
            {
              type: "submit",
              className: [
                "px-4",
                "py-2",
                "bg-blue-500",
                "text-white",
                "rounded-md",
                "hover:bg-blue-600",
              ],
            },
            "Enregistrer"
          ),
        ]),
      ]
    ),
  ]);
}

export function createGroupForm(onSave, onCancel) {
  return createElement("div", { className: ["w-full", "h-full", "p-4"] }, [
    createElement(
      "div",
      { className: ["flex", "justify-between", "items-center", "mb-6"] },
      [
        createElement("h2", { className: ["text-xl", "font-bold"] }, "Créer un groupe"),
        createElement(
          "button",
          {
            className: ["text-gray-500", "hover:text-gray-700", "text-xl"],
            onclick: onCancel,
          },
          "×"
        ),
      ]
    ),
    createElement(
      "form",
      {
        className: ["space-y-4"],
        onsubmit: onSave,
      },
      [
        // Champs existants
        createElement("input", {
          type: "text",
          placeholder: "Nom du groupe",
          className: [
            "w-full",
            "p-3",
            "border",
            "border-gray-300",
            "rounded-md",
            "focus:outline-none",
            "focus:border-blue-500",
          ],
          id: "groupNom",
        }),
        createElement("textarea", {
          placeholder: "Description du groupe",
          className: [
            "w-full",
            "p-3",
            "border",
            "border-gray-300",
            "rounded-md",
            "focus:outline-none",
            "focus:border-blue-500",
            "h-20",
          ],
          id: "groupDescription",
        }),
        createElement("input", {
          type: "url",
          placeholder: "URL de la photo (optionnel)",
          className: [
            "w-full",
            "p-3",
            "border",
            "border-gray-300",
            "rounded-md",
            "focus:outline-none",
            "focus:border-blue-500",
          ],
          id: "groupPhoto",
        }),
        
        // Nouvelle section pour la sélection des membres
        createElement("div", 
          { className: ["mt-4", "border-t", "pt-4"] },
          [
            createElement("h3", 
              { className: ["font-semibold", "mb-2"] },
              "Sélectionnez au moins 2 membres *"
            ),
            createElement("div", 
              { className: ["max-h-48", "overflow-y-auto", "space-y-2", "border", "rounded-md", "p-2"] },
              contacts.map(contact => 
                createElement("div", 
                  { className: ["flex", "items-center", "p-2", "hover:bg-gray-50"] },
                  [
                    createElement("input", {
                      type: "checkbox",
                      id: `member-${contact.id}`,
                      className: ["mr-3", "w-4", "h-4"],
                      name: "members[]",
                      value: contact.id,
                    }),
                    createElement("label", 
                      { 
                        className: ["flex", "items-center", "flex-1", "cursor-pointer"],
                        for: `member-${contact.id}`,
                      },
                      [
                        createElement("img", {
                          src: contact.photo,
                          alt: contact.nom,
                          className: ["w-8", "h-8", "rounded-full", "mr-2"],
                        }),
                        contact.nom
                      ]
                    )
                  ]
                )
              )
            )
          ]
        ),

        // Boutons
        createElement("div", { className: ["flex", "gap-3", "mt-6"] }, [
          createElement(
            "button",
            {
              type: "button",
              className: [
                "px-4",
                "py-2",
                "bg-gray-300",
                "text-gray-700",
                "rounded-md",
                "hover:bg-gray-400",
              ],
              onclick: onCancel,
            },
            "Annuler"
          ),
          createElement(
            "button",
            {
              type: "submit",
              className: [
                "px-4",
                "py-2",
                "bg-blue-500",
                "text-white",
                "rounded-md",
                "hover:bg-blue-600",
              ],
            },
            "Créer"
          ),
        ]),
      ]
    ),
  ]);
}

// ===== AUTRES VUES =====
export function createContactsList(onBack) {
  return createElement("div", { className: ["w-full", "h-full", "p-4"] }, [
    createElement(
      "div",
      { className: ["flex", "justify-between", "items-center", "mb-4"] },
      [
        createElement(
          "h2",
          { className: ["text-xl", "font-bold"] },
          "Contacts"
        ),
        createElement(
          "button",
          {
            className: ["text-gray-500", "hover:text-gray-700", "text-lg"],
            onclick: onBack,
          },
          "← Retour"
        ),
      ]
    ),
    createElement(
      "div",
      { className: ["space-y-2", "overflow-y-auto", "max-h-full"] },
      contacts.map((contact) =>
        createElement(
          "div",
          {
            className: [
              "flex",
              "items-center",
              "p-3",
              "hover:bg-gray-100",
              "cursor-pointer",
              "border-b",
              "border-gray-200",
            ],
          },
          [
            createElement("img", {
              src: contact.photo,
              alt: contact.nom,
              className: [
                "w-10",
                "h-10",
                "rounded-full",
                "mr-3",
                "object-cover",
              ],
            }),
            createElement("div", { className: ["flex-1"] }, [
              createElement(
                "h3",
                { className: ["font-semibold"] },
                contact.nom
              ),
              createElement(
                "p",
                { className: ["text-sm", "text-gray-600"] },
                contact.telephone
              ),
            ]),
          ]
        )
      )
    ),
  ]);
}

export function createGroupsList(onBack, onGroupSelect, onCreateGroup, onSelectDiscussion) {
   return createElement("div", { 
    className: ["w-full", "h-full", "flex", "flex-col", "bg-[#f9f7f5]", "relative"] 
  }, [
    // En-tête avec style amélioré
    createElement("div", {
      className: [
        "p-4",
        "border-b",
        "bg-white",
        "sticky",
        "top-0",
        "z-10",
        "shadow-sm",
        "flex",
        "justify-between",
        "items-center",
      ]
    }, [
      createElement("h2", {
        className: ["text-xl", "font-bold", "text-gray-800"]
      }, "Groupes"),
      createElement("button", {
        className: [
          "text-gray-500",
          "hover:text-orange-500",
          "text-lg",
          "transition-colors",
        ],
        onclick: onBack,
      }, "← Retour")
    ]),

    // Liste des groupes avec style amélioré
    createElement("div", {
      className: [
        "flex-1",
        "overflow-y-auto",
        "scrollbar-thin",
        "scrollbar-thumb-gray-300",
        "scrollbar-track-transparent",
        "px-2",
        "py-1",
      ]
    }, groupes.map((group) =>
      createElement("div", {
        className: [
          "flex",
          "items-center",
          "p-3",
          "rounded-xl",
          "hover:bg-gray-100",
          "cursor-pointer",
          "mb-1",
          "transition-all",
          "duration-200",
          "group",
          "bg-white",
          "shadow-sm",
          "hover:shadow-md",
          "relative", // Ajouté pour le positionnement des boutons
        ],
        // Supprimer l'onclick ici
      }, [
        // Avatar avec badge nombre de membres
        createElement("div", {
          className: ["relative"]
        }, [
          createAvatarElement(group.nom, 12, group.avatarColor),
          createElement("div", {
            className: [
              "absolute",
              "-bottom-0.5",
              "-right-0.5",
              "bg-orange-500",
              "text-white",
              "text-xs",
              "w-5",
              "h-5",
              "rounded-full",
              "flex",
              "items-center",
              "justify-center",
              "border-2",
              "border-white",
              "font-medium",
            ]
          }, group.membres.length)
        ]),

        // Informations du groupe
        createElement("div", {
          className: [
            "flex-1",
            "ml-4",
            "border-l",
            "border-gray-100",
            "pl-4",
          ]
        }, [
          createElement("div", {
            className: ["flex", "justify-between", "items-center", "mb-0.5"]
          }, [
            createElement("h3", {
              className: [
                "font-semibold",
                "text-gray-900",
                "group-hover:text-orange-600",
                "transition-colors",
              ]
            }, group.nom),
            createElement("span", {
              className: [
                "text-xs",
                "text-gray-500",
                "font-medium",
              ]
            }, group.heure || "")
          ]),
          createElement("p", {
            className: [
              "text-sm",
              "text-gray-600",
              "truncate",
              "group-hover:text-gray-800",
            ]
          }, group.description || `Groupe · ${group.membres.length} membres`)
        ]),

        // Nouveaux boutons pour les actions
        createElement("div", {
          className: ["absolute", "right-2", "top-1/2", "-translate-y-1/2", "flex", "gap-2"],
        }, [
          // Bouton pour les messages
          createElement("button", {
            className: [
              "px-3",
              "py-1",
              "rounded-md",
              "bg-orange-100",
              "text-orange-600",
              "hover:bg-orange-200",
              "transition-colors",
              "text-sm",
            ],
            onclick: (e) => {
              e.stopPropagation();
              onSelectDiscussion("group", group.id); // Utilisation correcte du paramètre
            },
          }, "Messages"),
          // Bouton pour les détails
          createElement("button", {
            className: [
              "px-3",
              "py-1",
              "rounded-md",
              "bg-blue-100",
              "text-blue-600",
              "hover:bg-blue-200",
              "transition-colors",
              "text-sm",
            ],
            onclick: (e) => {
              e.stopPropagation(); // Empêche la propagation au parent
              onGroupSelect(group.id);
            },
          }, "Détails")
        ])
      ])
    )),




    // Modifier le bouton d'ajout de groupe
    createElement(
      "button",
      {
        className: [
          "absolute",
          "bottom-4",
          "right-4",
          "w-12",
          "h-12",
          "bg-orange-500",
          "text-white",
          "rounded-full",
          "flex",
          "items-center",
          "justify-center",
          "shadow-lg",
          "hover:bg-orange-600",
          "transition-colors",
        ],
        onclick: onCreateGroup, // Utiliser le paramètre passé
      },
      [createElement("i", { className: ["fa-solid", "fa-plus", "text-xl"] })]
    ),
  ]);
}

export function createGroupDetails(groupId, onBack, onAddMembers) {
  const group = getGroupById(groupId);
  const membresDetails = group.membres.map(membre => ({
    ...getContactById(membre.id),
    role: membre.role
  }));

  return createElement("div", { className: ["w-full", "h-full", "p-4"] }, [
    createElement(
      "div",
      { className: ["flex", "justify-between", "items-center", "mb-4"] },
      [
        createElement("h2", { className: ["text-xl", "font-bold"] }, group.nom),
        createElement(
          "button",
          {
            className: ["text-gray-500", "hover:text-gray-700", "text-lg"],
            onclick: onBack,
          },
          "← Retour"
        ),
      ]
    ),
    createElement(
      "div",
      { className: ["mb-4", "p-3", "bg-gray-50", "rounded-md"] },
      [
        createElement(
          "p",
          { className: ["text-sm", "text-gray-600", "mb-2"] },
          group.description
        ),
        createElement(
          "p",
          { className: ["text-sm", "font-semibold"] },
          `${group.membres.length} membres`
        ),
      ]
    ),
    createElement(
      "button",
      {
        className: [
          "w-full",
          "p-2",
          "bg-blue-500",
          "text-white",
          "rounded-md",
          "hover:bg-blue-600",
          "mb-4",
        ],
        onclick: () => onAddMembers(groupId),
      },
      "Ajouter des membres"
    ),
    createElement(
      "div",
      { className: ["space-y-2", "overflow-y-auto", "max-h-full"] },
      membresDetails.map((membre) =>
        createElement(
          "div",
          {
            className: [
              "flex",
              "items-center",
              "p-3",
              "border-b",
              "border-gray-200",
              "justify-between",
            ],
          },
          [
            createElement("div", { 
              className: ["flex", "items-center", "flex-1"] 
            }, [
              createAvatarElement(membre.nom, 8, membre.avatarColor),
              createElement("div", { 
                className: ["flex-1", "ml-3"] 
              }, [
                createElement(
                  "div",
                  { className: ["flex", "items-center", "gap-2"] },
                  [
                    createElement(
                      "h4",
                      { className: ["font-semibold", "text-sm"] },
                      membre.nom
                    ),
                    membre.role === "admin" && 
                    createElement(
                      "span",
                      {
                        className: [
                          "text-xs",
                          "bg-blue-100",
                          "text-blue-800",
                          "px-2",
                          "py-0.5",
                          "rounded-full",
                        ],
                      },
                      "Admin"
                    ),
                  ]
                ),
                createElement(
                  "p",
                  { className: ["text-xs", "text-gray-600"] },
                  membre.telephone
                ),
              ]),
            ]),
            // Bouton d'action
            createElement("div", {
              className: ["flex", "gap-2"]
            }, [
              // Bouton Admin (seulement pour les non-admin et si vous êtes admin)
              membre.id !== 1 && createElement(
                "button",
                {
                  className: [
                    "px-3",
                    "py-1",
                    "rounded-md",
                    "text-sm",
                    "transition-colors",
                    membre.role === "admin"
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200",
                  ],
                  onclick: () => {
                    const result = toggleAdminStatus(groupId, membre.id);
                    if (result.success) {
                      // Rafraîchir l'affichage
                      document.querySelector("#discussion").innerHTML = "";
                      document.querySelector("#discussion").appendChild(
                        createGroupDetails(groupId, onBack, onAddMembers)
                      );
                    } else {
                      alert(result.message);
                    }
                  },
                },
                membre.role === "admin" ? "Enlever admin" : "Rendre admin"
              ),
              // Bouton de retrait (seulement pour les non-admins)
              membre.role !== "admin" && createElement(
                "button",
                {
                  className: [
                    "text-red-500",
                    "text-sm",
                    "px-3",
                    "py-1",
                    "rounded-md",
                    "hover:bg-red-50",
                    "transition-colors",
                  ],
                  onclick: () => {
                    const result = removeMemberFromGroup(groupId, membre.id);
                    if (result.success) {
                      document.querySelector("#discussion").innerHTML = "";
                      document.querySelector("#discussion").appendChild(
                        createGroupDetails(groupId, onBack, onAddMembers)
                      );
                    } else {
                      alert(result.message);
                    }
                  },
                },
                "Retirer du groupe"
              ),
            ])
          ]
        )
      )
    ),
  ]);
}

export function createAddMemberForm(groupId, onBack, onSave) {
  const group = getGroupById(groupId);
  const availableContacts = contacts.filter(
    (contact) => !group.membres.includes(contact.id)
  );

  return createElement("div", { className: ["w-full", "h-full", "p-4"] }, [
    createElement(
      "div",
      { className: ["flex", "justify-between", "items-center", "mb-6"] },
      [
        createElement(
          "h2",
          { className: ["text-xl", "font-bold"] },
          `Ajouter des membres à ${group.nom}`
        ),
        createElement(
          "button",
          {
            className: ["text-gray-500", "hover:text-gray-700", "text-xl"],
            onclick: onBack,
          },
          "×"
        ),
      ]
    ),
    createElement(
      "div",
      { className: ["space-y-2"] },
      availableContacts.length > 0
        ? availableContacts.map((contact) =>
            createElement(
              "div",
              {
                className: [
                  "flex",
                  "items-center",
                  "p-3",
                  "border",
                  "rounded-md",
                  "hover:bg-gray-50",
                ],
              },
              [
                createElement("input", {
                  type: "checkbox",
                  id: `contact-${contact.id}`,
                  className: ["mr-3"],
                }),
                createElement("img", {
                  src: contact.photo,
                  alt: contact.nom,
                  className: [
                    "w-8",
                    "h-8",
                    "rounded-full",
                    "mr-3",
                    "object-cover",
                  ],
                }),
                createElement(
                  "label",
                  {
                    for: `contact-${contact.id}`,
                    className: ["flex-1", "cursor-pointer"],
                  },
                  `${contact.nom} (${contact.telephone})`
                ),
              ]
            )
          )
        : [
            createElement(
              "p",
              { className: ["text-gray-500", "text-center", "py-8"] },
              "Tous les contacts sont déjà dans ce groupe"
            ),
          ]
    ),
    availableContacts.length > 0
      ? createElement("div", { className: ["flex", "gap-3", "mt-6"] }, [
          createElement(
            "button",
            {
              type: "button",
              className: [
                "px-4",
                "py-2",
                "bg-gray-300",
                "text-gray-700",
                "rounded-md",
                "hover:bg-gray-400",
              ],
              onclick: onBack,
            },
            "Annuler"
          ),
          createElement(
            "button",
            {
              type: "button",
              className: [
                "px-4",
                "py-2",
                "bg-blue-500",
                "text-white",
                "rounded-md",
                "hover:bg-blue-600",
              ],
              onclick: onSave,
            },
            "Ajouter les membres sélectionnés"
          ),
        ])
      : null,
  ]);
}

export function createDiffusionList(onBack, onSendBroadcast) {
  return createElement("div", { 
    className: ["w-full", "h-full", "flex", "flex-col", "p-4"] 
  }, [
    // En-tête
    createElement("div", {
      className: [
        "flex",
        "justify-between",
        "items-center",
        "mb-6",
        "pb-4",
        "border-b",
      ]
    }, [
      createElement("h2", {
        className: ["text-xl", "font-bold", "text-gray-800"]
      }, "Message de diffusion"),
      createElement("button", {
        className: [
          "text-gray-500",
          "hover:text-orange-500",
          "text-lg",
          "transition-colors",
        ],
        onclick: onBack,
      }, "← Retour")
    ]),

    // Liste des contacts
    createElement("div", {
      className: [
        "flex-1",
        "overflow-y-auto",
        "mb-4",
      ]
    }, [
      // Section des contacts
      createElement("div", {
        className: ["space-y-2", "mb-4"]
      }, contacts
        .filter(contact => contact.id !== 1) // Exclure votre propre contact
        .map(contact => 
          createElement("div", {
            className: [
              "flex",
              "items-center",
              "p-3",
              "border",
              "rounded-md",
              "hover:bg-gray-50",
            ]
          }, [
            createElement("input", {
              type: "checkbox",
              id: `diffusion-${contact.id}`,
              value: contact.id,
              className: [
                "mr-3",
                "w-4",
                "h-4",
                "text-orange-500",
                "focus:ring-orange-500",
                "rounded",
              ]
            }),
            createAvatarElement(contact.nom, 8, contact.avatarColor),
            createElement("label", {
              htmlFor: `diffusion-${contact.id}`,
              className: [
                "ml-3",
                "flex-1",
                "cursor-pointer",
                "font-medium",
                "text-gray-700",
              ]
            }, contact.nom)
          ])
        )
      )
    ]),

    // Zone de message et bouton d'envoi
    createElement("form", {
      className: ["mt-auto", "space-y-4"],
      onsubmit: (e) => {
        e.preventDefault();
        
        // Récupérer les contacts sélectionnés
        const selectedContacts = Array.from(
          document.querySelectorAll('input[type="checkbox"]:checked')
        ).map(cb => parseInt(cb.value));

        // Récupérer le message
        const message = document.getElementById("diffusionMessage").value.trim();

        if (selectedContacts.length === 0) {
          alert("Veuillez sélectionner au moins un contact");
          return;
        }

        if (!message) {
          alert("Veuillez entrer un message");
          return;
        }

        // Envoyer le message de diffusion
        onSendBroadcast(selectedContacts, message);
      }
    }, [
      createElement("textarea", {
        id: "diffusionMessage",
        placeholder: "Tapez votre message de diffusion...",
        className: [
          "w-full",
          "p-3",
          "border",
          "rounded-md",
          "focus:ring-2",
          "focus:ring-orange-500",
          "focus:border-orange-500",
          "h-32",
          "resize-none",
        ],
        required: true
      }),
      createElement("button", {
        type: "submit",
        className: [
          "w-full",
          "bg-orange-500",
          "text-white",
          "py-3",
          "rounded-md",
          "font-medium",
          "hover:bg-orange-600",
          "transition-colors",
        ]
      }, "Envoyer le message")
    ])
  ]);
}

export function createMessagesList(type, id) {
  const currentUserId = authState.currentUser.id;
  const conversationId = `${Math.min(currentUserId, id)}_${Math.max(currentUserId, id)}`;
  const conversation = messages.conversations[conversationId] || { messages: [] };

  return createElement("div", {
    className: [
      "flex-1",
      "p-4",
      "flex",
      "flex-col",
      "gap-2",
      "overflow-y-auto",
      "bg-[#efeae2]", // Fond style WhatsApp
    ]
  }, [
    // Date du jour
    createElement("div", {
      className: [
        "flex",
        "justify-center",
        "mb-4",
      ]
    }, [
      createElement("span", {
        className: [
          "bg-white",
          "text-gray-500",
          "text-xs",
          "px-3",
          "py-1",
          "rounded-full",
          "shadow-sm",
        ]
      }, new Date().toLocaleDateString())
    ]),

    // Messages
    ...conversation.messages.map(message => {
      const isOwnMessage = message.sender === currentUserId;
      const timeClass = isOwnMessage ? "text-gray-600" : "text-gray-500";

      return createElement("div", {
        className: [
          "flex",
          isOwnMessage ? "justify-end" : "justify-start",
          "mb-2",
        ]
      }, [
        createElement("div", {
          className: [
            "max-w-[65%]",
            "relative",
            "group",
          ]
        }, [
          // Bulle du message
          createElement("div", {
            className: [
              "p-2",
              "px-3",
              "rounded-lg",
              isOwnMessage ? 
                "bg-[#dcf8c6] rounded-tr-none" : 
                "bg-white rounded-tl-none",
              "shadow-sm",
            ]
          }, [
            // Contenu du message
            createElement("p", {
              className: ["text-sm", "text-gray-800", "mb-1"]
            }, message.content),

            // Heure et statut
            createElement("div", {
              className: [
                "flex",
                "items-center",
                "justify-end",
                "gap-1",
                "mt-1",
              ]
            }, [
              createElement("span", {
                className: ["text-[10px]", timeClass]
              }, message.time),
              isOwnMessage && createElement("i", {
                className: [
                  "fa-solid",
                  message.status === 'read' ? 
                    "fa-check-double text-blue-500" : 
                    "fa-check text-gray-400",
                  "text-[10px]",
                ]
              })
            ])
          ]),

          // Flèche de la bulle
          createElement("div", {
            className: [
              "absolute",
              isOwnMessage ? "-right-2" : "-left-2",
              "top-0",
              "w-2",
              "h-4",
              "overflow-hidden",
            ]
          }, [
            createElement("div", {
              className: [
                "absolute",
                "w-4",
                "h-4",
                "transform",
                "rotate-45",
                isOwnMessage ? 
                  "bg-[#dcf8c6] -left-2" : 
                  "bg-white -right-2",
              ]
            })
          ])
        ])
      ]);
    })
  ]);
}

export function createLoginForm(onLogin) {
  return createElement("div", {
    className: [
      "min-h-screen",
      "w-full",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "bg-gradient-to-r",
      "from-orange-500",
      "to-orange-600",
      "p-4",
    ]
  }, [
    // Logo Container
    createElement("div", {
      className: [
        "mb-8",
        "text-center",
      ]
    }, [
      createElement("h1", {
        className: [
          "text-4xl",
          "font-bold",
          "text-white",
          "mb-2",
        ]
      }, "WhatsApp Clone"),
      createElement("p", {
        className: [
          "text-orange-100",
          "text-lg",
        ]
      }, "Connectez-vous pour continuer")
    ]),
    
    // Form Container
    createElement("div", {
      className: [
        "w-full",
        "max-w-md",
        "bg-white",
        "rounded-2xl",
        "shadow-2xl",
        "p-8",
        "space-y-6",
      ]
    }, [
      // Form
      createElement("form", {
        className: ["space-y-6"],
        onsubmit: (e) => {
          e.preventDefault();
          const email = document.getElementById("loginEmail").value;
          const password = document.getElementById("loginPassword").value;
          onLogin(email, password);
        }
      }, [
        // Email Field
        createElement("div", {}, [
          createElement("label", {
            className: ["text-sm", "font-medium", "text-gray-700", "block", "mb-2"],
            htmlFor: "loginEmail"
          }, "Email"),
          createElement("input", {
            type: "email",
            id: "loginEmail",
            required: true,
            placeholder: "exemple@email.com",
            className: [
              "w-full",
              "px-4",
              "py-3",
              "border",
              "border-gray-300",
              "rounded-lg",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-orange-500",
              "focus:border-orange-500",
              "transition-all",
            ]
          })
        ]),

        // Password Field
        createElement("div", {}, [
          createElement("label", {
            className: ["text-sm", "font-medium", "text-gray-700", "block", "mb-2"],
            htmlFor: "loginPassword"
          }, "Mot de passe"),
          createElement("input", {
            type: "password",
            id: "loginPassword",
            required: true,
            placeholder: "••••••",
            className: [
              "w-full",
              "px-4",
              "py-3",
              "border",
              "border-gray-300",
              "rounded-lg",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-orange-500",
              "focus:border-orange-500",
              "transition-all",
            ]
          })
        ]),

        // Submit Button
        createElement("button", {
          type: "submit",
          className: [
            "w-full",
            "bg-orange-500",
            "text-white",
            "py-3",
            "rounded-lg",
            "font-semibold",
            "hover:bg-orange-600",
            "transition-colors",
            "shadow-lg",
            "hover:shadow-xl",
            "transform",
            "hover:-translate-y-0.5",
            "transition-all",
          ]
        }, "Se connecter")
      ]),

      // Divider
      createElement("div", {
        className: ["relative", "py-4"]
      }, [
        createElement("div", {
          className: ["absolute", "inset-0", "flex", "items-center"]
        }, [
          createElement("div", {
            className: ["w-full", "border-t", "border-gray-200"]
          })
        ]),
        createElement("div", {
          className: ["relative", "flex", "justify-center", "text-sm"]
        }, [
          createElement("span", {
            className: ["px-2", "bg-white", "text-gray-500"]
          }, "Connexion sécurisée")
        ])
      ]),

      // Help text
      createElement("p", {
        className: ["text-center", "text-sm", "text-gray-600"]
      }, [
        "Identifiants de test : ",
        createElement("br", {}),
        "Email: mapathe@example.com",
        createElement("br", {}),
        "Mot de passe: 123456"
      ])
    ])
  ]);
}
