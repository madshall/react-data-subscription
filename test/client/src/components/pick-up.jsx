import React from "react";
import PU1 from "./pick-up-1";
import PU2 from "./pick-up-2";

class Component extends React.Component {
  constructor(props) {
    super(props);
    setTimeout(() => {
      this.setState({
        flag: 0,
      }, () => {
        this.setState({
          flag: 2,
        });
      });
    }, 3e3)
  }

  state = {
    flag: 1,
  }
  
  render() {
    return (
      (this.state.flag === 1 && <PU1 />) ||
      (this.state.flag === 2 && <PU2 />)
    );
  }
}

export default Component;