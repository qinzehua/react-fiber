import { ELEMENT_TEXT } from "./constants.js";

import { Update, UpdateQueue } from "./UpdateQueue";
import { scheduleRoot, useReducer } from "./schedule.js";

function createElement(type, config, ...children) {
  delete config.__self;
  delete config.__store;
  delete config.__source;
  return {
    type,
    props: {
      ...config,
      children: children.map((child) => {
        return typeof child === "object"
          ? child
          : {
              type: ELEMENT_TEXT,
              props: { text: child, children: [] },
            };
      }),
    },
  };
}

class Component {
  constructor(props) {
    this.props = props;
    this.updateQueue = new UpdateQueue();
  }

  setState(playload) {
    let update = new Update(playload);
    this.internalFiber.updateQueue.enqueueUpdate(update);
    scheduleRoot();
  }
}
Component.prototype.isReactComponent = {};

const React = {
  Component,
  createElement,
  useReducer,
};

export default React;
