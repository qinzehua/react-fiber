import React from "./react";
import ReactDom from "./react-dom";

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return { count: state.count + 1 };
    default:
      return state;
  }
}

function FuctionCom(props) {
  const [state, dispatch] = React.useReducer(reducer, { count: 0 });

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: "ADD" })}>+</button>
    </div>
  );
}

ReactDom.render(<FuctionCom />, document.getElementById("root"));
