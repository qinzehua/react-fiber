import React from "./react";
import ReactDOM from "./react-dom";

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "xx",
    };
    this.handleClick = function () {
      this.setState({ name: "aa" });
    }.bind(this);
  }

  render() {
    return (
      <div>
        {this.state.name}
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}

class Wrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "xx",
    };
  }

  render() {
    return <h1>{this.props.children[0]}</h1>;
  }
}

let element = (
  <div id="A">
    A1
    <div id="B1">
      B1
      <div id="C1">C1</div>
      <div id="C2">C2</div>
      <Wrapper>
        <Counter />
      </Wrapper>
    </div>
    <div id="B2">B2</div>
  </div>
);

ReactDOM.render(element, document.getElementById("root"));
let render2 = document.getElementById("render2");
let render3 = document.getElementById("render3");

render2.addEventListener("click", () => {
  let element2 = (
    <div id="A-new">
      A1-new
      <div id="B1-new">
        B1-new
        <div id="C1-new">C1-new</div>
        <div id="C2-new">C2-new</div>
      </div>
      <div id="B2-new">B2-new</div>
      <div id="B3">B3</div>
    </div>
  );
  ReactDOM.render(element2, document.getElementById("root"));
});

render3.addEventListener("click", () => {
  let element3 = (
    <div id="A-new2">
      A1-new2
      <div id="B1-new2">
        B1-new2
        <div id="C1-new2">C1-new2</div>
        <div id="C2-new2">C2-new2</div>
      </div>
      <div id="B2-new2">B2-new2</div>
    </div>
  );
  ReactDOM.render(element3, document.getElementById("root"));
});
