import React from "./react";
import ReactDOM from "./react-dom";

let element = (
  <div id="A">
    A1
    <div id="B1">
      B1
      <div id="C1">C1</div>
      <div id="C2">C2</div>
    </div>
    <div id="B12">B2</div>
  </div>
);

console.log(element);

ReactDOM.render(element, document.getElementById("root"));
