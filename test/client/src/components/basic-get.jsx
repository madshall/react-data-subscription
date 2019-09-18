import React from "react";
import withDataSubscription from "../withDataSubscription";

class Component extends React.Component {
  constructor(props) {
    super(props);
    console.log("constructor", "Basic", props);
    setTimeout(() => {
      this.setState({ go: true });
    }, 1e3);
  }
  
  state = {
    go: false,
  }
  
  componentDidMount() {
    this.props.subscribe(
      this,
      "/ping",
      () => {
        console.log("getPayload called", "BasicGet");
        return {
          method: "GET",
          body: {
            name: "BasicGet",
            value: this.props.value,
          },
        };
      },
      data => {
        console.log("callback", "BasicGet", data);
        return {
          data,
        };
      },
      () => this.state.go,
    );
  }
  
  render() {
    console.log("render", "BasicGet", this.state);
    return (
      <div />
    );
  }
}

export default withDataSubscription(Component);