export function setProps(dom, oldProps, newProps) {
  for (var prop in oldProps) {
  }

  for (var propName in newProps) {
    if (propName !== "children") {
      setProp(dom, propName, newProps[propName]);
    }
  }
}

function setProp(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value;
  } else if (key === "style") {
    if (value) {
      for (var styleName in value) {
        dom.style[styleName] = value[styleName];
      }
    }
  } else {
    dom.setAttribute(key, value);
  }
}
