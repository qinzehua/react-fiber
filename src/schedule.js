import {
  PLACEMENT,
  TAG_ROOT,
  TAG_TEXT,
  TAG_HOST,
  ELEMENT_TEXT,
} from "./constants";
import { setProps } from "./utils.js";
let nextUnitOfWork = null;
let workingInProgressRoot = null;

export function scheduleRoot(rootFiber) {
  workingInProgressRoot = rootFiber;
  nextUnitOfWork = rootFiber;
}

function workLoop(deadlilne) {
  while (nextUnitOfWork && deadlilne.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork && workingInProgressRoot) {
    console.log("render 结束");
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function performUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while (currentFiber) {
    completeUnitOfWork(currentFiber);
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.return;
  }
}

function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoots(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber);
  } else if (currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber);
  }
}

function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }

    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }

    const effectTag = currentFiber.effectTag;
    if (effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}

function updateHostRoots(currentFiber) {
  let newChildren = currentFiber.props.children;
  reconcileChildre(currentFiber, newChildren);
}

function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
}

function updateHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
  const newChildren = currentFiber.props.children;
  reconcileChildre(currentFiber, newChildren);
}

function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  } else if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type);
    updateDom(stateNode, {}, currentFiber.props);
    return stateNode;
  }
}

function updateDom(stateNode, oldPrps, newProps) {
  setProps(stateNode, oldPrps, newProps);
}

function reconcileChildre(currentFiber, newChildren) {
  let newChildIndex = 0;
  let prevSibling;
  while (newChildIndex < newChildren.length) {
    let newChild = newChildren[newChildIndex];
    let tag;
    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT;
    } else if (typeof newChild.type === "string") {
      tag = TAG_HOST;
    }

    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT,
      nextEffect: null,
    };
    if (newChildIndex === 0) {
      currentFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    newChildIndex++;
  }
}

function commitRoot() {
  let currentFiber = workingInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  workingInProgressRoot = null;
}

function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  let returnDom = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    returnDom.appendChild(currentFiber.stateNode);
  }
  currentFiber.effectTag = null;
}

requestIdleCallback(workLoop);
