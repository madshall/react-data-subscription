import React from "react";
import { withDataSubscription } from "react-data-subscription";

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
        console.log("getPayload called", "Basic");
        return {
          method: "POST",
          body: {
            name: "Basic",
            value: this.props.value,
          },
        };
      },
      data => {
        console.log("callback", "Basic", data);
        return {
          data,
        };
      },
      () => this.state.go,
    );
  }
  
  render() {
    console.log("render", "Basic", this.state);
    return (
      <div />
    );
  }
}

export default withDataSubscription(Component);