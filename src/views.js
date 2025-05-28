import { createElement } from "./component.js";
import { contacts, groupes } from "./data.js";
import { getContactById, getGroupById } from "./utils.js";
import { appState } from "./data.js";
import { createAvatarElement } from "./avatar.js";  // Ajoutez cette ligne

// ===== LISTES ET DISCUSSIONS =====
export function createDiscussionsList(onSelectDiscussion) {
  const allItems = [
    ...contacts
      .filter((contact) => !contact.archive)
      .map((contact) => ({ ...contact, type: "contact" })),
    ...groupes
      .filter((group) => !group.archive)
      .map((group) => ({ ...group, type: "group" })),
  ];

  // Vérifie s'il y a des discussions existantes avec des messages
  const hasDiscussions = allItems.some(
    (item) => item.dernierMessage && item.dernierMessage !== "Nouveau contact"
  );

  // Si pas de discussions, afficher tous les contacts
  const itemsToDisplay = !hasDiscussions
    ? contacts.map((contact) => ({
        ...contact,
        type: "contact",
        dernierMessage: "Cliquez pour démarrer une conversation",
      }))
    : allItems;

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

      // Barre de recherche améliorée
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

    // Liste des discussions avec nouveau style
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

export function createGroupsList(onBack, onGroupSelect, onCreateGroup) {
   return createElement("div", { 
    className: [
      "w-full", 
      "h-full", 
      "flex", 
      "flex-col",
      "bg-[#f9f7f5]",
      "relative",
    ] 
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
        ],
        onclick: () => onGroupSelect(group.id),
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
            ],
          },
          [
            createElement("img", {
              src: membre.photo,
              alt: membre.nom,
              className: ["w-8", "h-8", "rounded-full", "mr-3", "object-cover"],
            }),
            createElement("div", { className: ["flex-1"] }, [
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

export function createDiffusionList(onBack) {
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
      }, "Liste de diffusion"),
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
        "scrollbar-thin",
        "scrollbar-thumb-gray-300",
        "scrollbar-track-transparent",
        "px-2",
        "py-1",
      ]
    }, contacts.map((contact) =>
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
        ]
      }, [
        createElement("input", {
          type: "checkbox",
          id: `diffusion-${contact.id}`,
          className: [
            "mr-3",
            "w-4",
            "h-4",
            "accent-orange-500",
            "rounded",
          ],
        }),
        // Avatar
        createElement("div", {
          className: ["relative"]
        }, [
          createAvatarElement(contact.nom, 12, contact.avatarColor)
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
          createElement("h3", {
            className: [
              "font-semibold",
              "text-gray-900",
              "group-hover:text-orange-600",
              "transition-colors",
            ]
          }, contact.nom),
          createElement("p", {
            className: [
              "text-sm",
              "text-gray-600",
              "group-hover:text-gray-800",
            ]
          }, contact.telephone)
        ])
      ])
    ))
  ]);
}
