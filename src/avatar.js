import { createElement } from "./component.js";

const avatarColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
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

export function createAvatarElement(name, size = 10, color) {
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
      color || getRandomColor(), // Utiliser la couleur fournie ou en générer une nouvelle
    ]
  }, getInitials(name));
}