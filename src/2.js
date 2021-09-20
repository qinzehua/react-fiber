import { element } from "./element.js";
let container = document.getElementById("root");
const PLACEMENT = "PLACEMENT";

let workingInProgressRoot = {
  stateNode: container,
  props: {
    children: [element],
  },
};

let nextUnitOfWork = workingInProgressRoot;

function workLoop(deadline) {
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (!nextUnitOfWork) {
    commitRoot();
  }
}

function commitRoot() {
  let currentFiber = workingInProgressRoot.firstEffect;
  while (currentFiber) {
    if (currentFiber.effectTag === PLACEMENT) {
      currentFiber.return.stateNode.appendChild(currentFiber.stateNode);
    }

    currentFiber = currentFiber.nextEffect;
  }

  workingInProgressRoot = null;
}

function performUnitOfWork(workingInProgressFiber) {
  beginWork(workingInProgressFiber);
  if (workingInProgressFiber.child) {
    return workingInProgressFiber.child;
  }

  while (workingInProgressFiber) {
    completeUnitOfWork(workingInProgressFiber);
    if (workingInProgressFiber.sibling) {
      return workingInProgressFiber.sibling;
    }
    workingInProgressFiber = workingInProgressFiber.return;
  }
}

function beginWork(workingInProgressFiber) {
  console.log("beginWork", workingInProgressFiber.props.id);
  if (!workingInProgressFiber.stateNode) {
    workingInProgressFiber.stateNode = document.createElement(
      workingInProgressFiber.type
    );

    for (const key in workingInProgressFiber.props) {
      if (key !== "children") {
        workingInProgressFiber.stateNode[key] =
          workingInProgressFiber.props[key];
      }
    }
  }

  let previousFiber;
  if (Array.isArray(workingInProgressFiber.props.children)) {
    workingInProgressFiber.props.children.forEach((child, index) => {
      let childFiber = {
        type: child.type,
        props: child.props,
        return: workingInProgressFiber,
        effectTag: PLACEMENT,
        nextEffect: null,
      };

      if (index === 0) {
        workingInProgressFiber.child = childFiber;
      } else {
        previousFiber.sibling = childFiber;
      }

      previousFiber = childFiber;
    });
  }
}

function completeUnitOfWork(workingInProgressFiber) {
  console.log("completeUnitOfWork", workingInProgressFiber.props.id);
  let returnFiber = workingInProgressFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = workingInProgressFiber.firstEffect;
    }
    if (workingInProgressFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workingInProgressFiber.firstEffect;
      }
      returnFiber.lastEffect = workingInProgressFiber.lastEffect;
    }
    if (workingInProgressFiber.effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = workingInProgressFiber;
      } else {
        returnFiber.firstEffect = workingInProgressFiber;
      }
      returnFiber.lastEffect = workingInProgressFiber;
    }
  }
}

requestIdleCallback(workLoop);
