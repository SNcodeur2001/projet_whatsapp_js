export function createElement(tag, props = {}, content = "") {
  if (typeof tag !== "string") return null;

  if ("vIf" in props && !props.vIf) return null;

  const el = document.createElement(tag);

  if ("vShow" in props) {
    el.style.display = props.vShow ? "" : "none";
  }

  for (const key in props) {
    const value = props[key];

    if (key === "class" || key === "className") {
      el.className = Array.isArray(value) ? value.join(" ") : value;
    } else if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === "vIf" || key === "vFor" || key === "vShow") {
      continue;
    } else if (key.startsWith(":")) {
      const realAttr = key.slice(1);
      el.setAttribute(realAttr, value);
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  if ("vFor" in props) {
    const { each, render } = props.vFor;
    each.forEach((item) => {
      const child = render(item);
      if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  } else if (Array.isArray(content)) {
    content.forEach((item) => {
      if (typeof item === "string") {
        el.appendChild(document.createTextNode(item));
      } else if (item instanceof Node) {
        el.appendChild(item);
      }
    });
  } else if (typeof content === "string") {
    el.textContent = content;
  } else if (content instanceof Node) {
    el.appendChild(content);
  }

  // Méthodes de chaînage
  el.addElement = function (tag, props = {}, content = "") {
    const newEl = createElement(tag, props, content);
    this.appendChild(newEl);
    return this;
  };
  el.addNode = function (node) {
    this.appendChild(node);
    return this;
  };

  return el;
}
