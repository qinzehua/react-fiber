class Update {
  constructor(playload, nextUpdate) {
    this.playload = playload;
    this.nextUpdate = nextUpdate;
  }
}

class UpdateQueue {
  constructor() {
    this.baseState = null;
    this.firstUpdate = null;
    this.lastupdate = null;
  }
  enqueueUpdate(update) {
    if (this.firstUpdate == null) {
      this.firstUpdate = update;
      this.lastupdate = update;
    } else {
      this.lastupdate.nextUpdate = update;
      this.lastupdate = update;
    }
  }

  forceUpdate() {
    let currentState = this.baseState || {};
    let currentUpdate = this.firstUpdate;
    while (currentUpdate != null) {
      let nextState =
        typeof currentUpdate.playload === "function"
          ? currentUpdate.playload(currentState)
          : currentUpdate.playload;

      currentState = { ...currentState, ...nextState };
      currentUpdate = currentUpdate.nextUpdate;
    }

    this.firstUpdate = this.lastupdate = null;
    this.baseState = currentState;
    return currentState;
  }
}

let queue = new UpdateQueue();
queue.enqueueUpdate(new Update({ name: "qq" }));

queue.enqueueUpdate(new Update({ number: 1 }));
queue.enqueueUpdate(new Update((state) => ({ number: state.number + 1 })));
queue.enqueueUpdate(new Update((state) => ({ number: state.number + 1 })));
queue.forceUpdate();

console.log(queue.baseState);
