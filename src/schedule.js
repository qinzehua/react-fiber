import {
  PLACEMENT,
  TAG_ROOT,
  TAG_TEXT,
  TAG_HOST,
  TAG_CLASS,
  TAG_FUNC,
  ELEMENT_TEXT,
  DELETION,
  UPDATE,
} from "./constants";
import { setProps } from "./utils.js";
import { UpdateQueue, Update } from "./UpdateQueue";

let nextUnitOfWork = null;
let workingInProgressRoot = null;
let currentRoot = null;
let deletions = [];

let workingInProgressFiber = null;
let hookIndex = 0;

export function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    workingInProgressRoot = currentRoot.alternate;
    workingInProgressRoot.alternate = currentRoot;
    if (rootFiber) {
      workingInProgressRoot.props = rootFiber.props;
    }
  } else if (currentRoot) {
    if (rootFiber) {
      rootFiber.alternate = currentRoot;
      workingInProgressRoot = rootFiber;
    } else {
      workingInProgressRoot = {
        ...currentRoot,
        alternate: currentRoot,
      };
    }
  } else {
    workingInProgressRoot = rootFiber;
  }
  workingInProgressRoot.firstEffect =
    workingInProgressRoot.lastEffect =
    workingInProgressRoot.nextEffect =
      null;
  nextUnitOfWork = workingInProgressRoot;
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
  } else if (currentFiber.tag === TAG_CLASS) {
    updateClassComponent(currentFiber);
  } else if (currentFiber.tag === TAG_FUNC) {
    updateFuncComponent(currentFiber);
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

function updateClassComponent(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = new currentFiber.type(currentFiber.props);
    currentFiber.stateNode.internalFiber = currentFiber;
    currentFiber.updateQueue = new UpdateQueue();
  }

  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(
    currentFiber.stateNode.state
  );

  let newElement = currentFiber.stateNode.render();
  const newChildren = [newElement];
  reconcileChildre(currentFiber, newChildren);
}

function updateFuncComponent(currentFiber) {
  workingInProgressFiber = currentFiber;
  hookIndex = 0;
  workingInProgressFiber.hooks = [];

  const newChildren = [currentFiber.type(currentFiber.props)];
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
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  if (oldFiber) {
    oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
  }

  let prevSibling;
  while (newChildIndex < newChildren.length || oldFiber) {
    let newChild = newChildren[newChildIndex];
    const sameType = oldFiber && newChild && oldFiber.type === newChild.type;
    let newFiber;
    let tag;
    if (newChild && newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT;
    } else if (newChild && typeof newChild.type === "string") {
      tag = TAG_HOST;
    } else if (
      newChild &&
      typeof newChild.type === "function" &&
      newChild.type.prototype.isReactComponent
    ) {
      tag = TAG_CLASS;
    } else if (newChild && typeof newChild.type === "function") {
      tag = TAG_FUNC;
    }

    if (sameType) {
      newFiber = {
        tag,
        type: newChild.type,
        props: newChild.props,
        stateNode: oldFiber.stateNode, // 复用老的dom
        return: currentFiber,
        updateQueue: oldFiber.updateQueue,
        alternate: oldFiber,
        effectTag: UPDATE,
        nextEffect: null,
      };
    } else {
      if (newChild) {
        newFiber = {
          tag,
          type: newChild.type,
          props: newChild.props,
          stateNode: null,
          return: currentFiber,
          updateQueue: new UpdateQueue(),
          effectTag: PLACEMENT,
          nextEffect: null,
        };
      }

      if (oldFiber) {
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (newChild) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    }

    newChildIndex++;
  }
}

function commitRoot() {
  deletions.forEach(commitWork);
  let currentFiber = workingInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  deletions.length = 0;
  currentRoot = workingInProgressRoot;
  workingInProgressRoot = null;
}

function commitWork(currentFiber) {
  if (!currentFiber) return;
  let returnFiber = currentFiber.return;
  while (returnFiber.tag !== TAG_HOST && returnFiber.tag !== TAG_ROOT) {
    returnFiber = returnFiber.return;
  }

  let returnDom = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    let nextFiber = currentFiber;
    while (nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
      nextFiber = nextFiber.child;
    }

    returnDom.appendChild(nextFiber.stateNode);
  } else if (currentFiber.effectTag === DELETION) {
    commitDeletion(currentFiber, returnDom);
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.type === ELEMENT_TEXT) {
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      }
    } else {
      updateDom(
        currentFiber.stateNode,
        currentFiber.alternate.props,
        currentFiber.props
      );
    }
  }
  currentFiber.effectTag = null;
}

function commitDeletion(currentFiber, returnDom) {
  if (currentFiber.tag === TAG_HOST || currentFiber.tag === TAG_TEXT) {
    returnDom.removeChild(currentFiber.stateNode);
  } else {
    commitDeletion(currentFiber.child, returnDom);
  }
}

export function useReducer(reducer, initialState) {
  let oldHook =
    workingInProgressFiber.alternate &&
    workingInProgressFiber.alternate.hooks &&
    workingInProgressFiber.alternate.hooks[hookIndex];

  let newHook = oldHook;

  if (oldHook) {
    oldHook.state = oldHook.updateQueue.forceUpdate(oldHook.state);
  } else {
    newHook = {
      state: initialState,
      updateQueue: new UpdateQueue(),
    };
  }
  const dispatch = function (aciton) {
    let playload = reducer ? reducer(newHook.state, aciton) : aciton;
    newHook.updateQueue.enqueueUpdate(new Update(playload));
    scheduleRoot();
  };

  workingInProgressFiber.hooks[hookIndex++] = newHook;
  return [newHook.state, dispatch];
}

requestIdleCallback(workLoop);
