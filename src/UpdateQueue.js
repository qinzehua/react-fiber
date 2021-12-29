export class Update {
  constructor(playload) {
    this.playload = playload;
  }
}

export class UpdateQueue {
  constructor() {
    this.firstUpdate = null;
    this.lastupdate = null;
  }

  enqueueUpdate(update) {
    if (this.lastupdate == null) {
      this.firstUpdate = this.lastupdate = update;
    } else {
      this.lastupdate.nextUpdate = update;
      this.lastupdate = update;
    }
  }

  forceUpdate(state) {
    let currentUpdate = this.firstUpdate;
    while (currentUpdate) {
      let nextState =
        typeof currentUpdate.playload === "function"
          ? currentUpdate.playload(state)
          : currentUpdate.playload;
      state = { ...state, ...nextState };
      currentUpdate = currentUpdate.nextUpdate;
    }

    this.firstUpdate = this.lastupdate = null;
    return state;
  }
}
