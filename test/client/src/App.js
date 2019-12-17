import React, { Component } from 'react';
import { withDataSubscription, dataSubscriptionRequest } from "./withDataSubscription";

import './App.css';
import Basic from "./components/basic";
import BasicGet from "./components/basic-get";
import BasicRefresh from "./components/basic-refresh";
import PickUp from "./components/pick-up";

class App extends Component {
  componentDidMount() {
    dataSubscriptionRequest("/ping", data => {
      console.log('got data from request', data)
    });
    setInterval(() => {
      console.log(withDataSubscription.dump());
    }, 1e3);  
    setTimeout(() => {
      this.setState({ value: 321 });
    }, 10e3);  
    setTimeout(() => {
      this.setState({ value: 123 });
    }, 15e3);  
    setTimeout(() => {
      this.setState({ show: false });
    }, 20e3);
  }
  
  state = {
    value: 123,
    show: true,
  }
  
  render() {
    return (
      <div className="App">
        {this.state.show && <Basic value={123} />}
        <Basic value={this.state.value} />
        <BasicGet value={this.state.value} />
        <BasicRefresh value={123} />
        <PickUp />
      </div>
    );
  }
}

export default App;
