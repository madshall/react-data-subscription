import React from "react";
import { withDataSubscription } from "../withDataSubscription";

class Component extends React.Component {
  constructor(props) {
    super(props);
    console.log("constructor", "BasicRefresh", props);
  }
  
  state = {
    go: false,
  }
  
  componentDidMount() {
    this.props.subscribe(
      this,
      "/ping",
      () => {
        console.log("getPayload called", "BasicRefresh");
        return {
          method: "POST",
          body: {
            name: "BasicRefresh",
            value: this.props.value,
          },
        };
      },
      data => {
        console.log("callback", "BasicRefresh", data);
        if (data.isFinished) {
          setTimeout(() => {
            console.log("refreshing BasicRefresh");
            data.refresh();
          }, 5e3);
        }
        return {
          data,
        };
      },
    );
  }
  
  render() {
    console.log("render", "BasicRefresh", this.state);
    return (
      <div />
    );
  }
}

export default withDataSubscription(Component);