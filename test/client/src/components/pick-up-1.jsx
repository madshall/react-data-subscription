import React from "react";
import { withDataSubscription } from "../withDataSubscription";

class Component extends React.Component {
  constructor(props) {
    super(props);
  }
  
  state = {
  }
  
  componentDidMount() {
    this.props.subscribe(
      this,
      "/ping",
      () => {
        return {
          method: "POST",
          body: {
            name: "Basic",
            value: this.props.value,
          },
        };
      },
      data => {
        return {
          data,
        };
      },
    );
  }

  componentWillUnmount() {
    console.log("Pick up 1 will unmount");
  }
  
  render() {
    console.log("render", "Pick up 1", this.state);
    return (
      <div />
    );
  }
}

export default withDataSubscription(Component);