import React from "react";
import { pick, keys, isEqual } from "lodash";

import store from "./store/store";

export default WrappedComponent => {
  return class DataSubscription extends React.Component {
    constructor(props) {
      super(props);
      this.firstTimeCall = true;
      store.registerSubscriber(this);
    }
    
    componentWillUnmount() {
      store.unregisterSubscriber(this);
    }
    
    onSubscribe = (instance, endpoint, fetchParams = {}, payloadFunc, callbackFunc, conditionFunc) => {
      if (this.firstTimeCall) {
        this.firstTimeCall = false;
        const originalComponentDidUpdate = instance.componentDidUpdate || (() => {});
        instance.componentDidUpdate = (...args) => {
          this.subscriptions.forEach(_ => _.run());
          return originalComponentDidUpdate.apply(instance, args);
        }
      }
      const boundPayloadFunc = payloadFunc.bind(instance);
      const boundConditionFunc = conditionFunc.bind(instance);
      const boundCalbackFunc = callbackFunc.bind(instance);
      
      const subscription = store.createSubscription(endpoint, fetchParams, boundPayloadFunc, boundConditionFunc);
      this.subscriptions.push(subscription);
      subscription.on("updated", () => {
        const newState = boundCalbackFunc(subscription.getState());
        // get only that part of state that exists in new state
        const oldState = pick(instance.state, keys(newState));
        
        if (!isEqual(oldState, newState)) {
          instance.setState({ ...newState }); 
        }
      });
    }
    
    render() {
      return (
        <WrappedComponent 
          {...this.props}
          subscribe={this.onSubscribe}
        />
      );
    }
  };
};

