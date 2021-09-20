import { TAG_ROOT } from "./constants.js";
import { scheduleRoot } from "./schedule.js";

function render(element, container) {
  let rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: {
      children: [element],
    },
  };

  scheduleRoot(rootFiber);
}

export default {
  render,
};
