import React from "react";
import { pick, keys, isEqual } from "lodash";

import store from "./store/store";
import Subscription from "./store/subscription";

const EMPTY_FUNC = () => {};

export const dump = () => store.dump();

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
    
    onSubscribe = (instance, endpoint, paramsFunc, callbackFunc, conditionFunc) => {
      if (this.firstTimeCall) {
        this.firstTimeCall = false;
        const originalComponentDidUpdate = instance.componentDidUpdate || EMPTY_FUNC;
        instance.componentDidUpdate = (...args) => {
          this.subscriptions.forEach(_ => _.run());
          return originalComponentDidUpdate.apply(instance, args);
        }
      }
      const boundParamsFunc = paramsFunc && paramsFunc.bind(instance);
      const boundConditionFunc = conditionFunc && conditionFunc.bind(instance);
      const boundCalbackFunc = callbackFunc && callbackFunc.bind(instance);
      
      const subscription = store.createSubscription(endpoint, boundParamsFunc, boundConditionFunc);
      this.subscriptions.push(subscription);
      
      subscription.on(Subscription.events.UPDATED, () => {
        const newState = boundCalbackFunc(subscription.getState()) || {};
        // get only that part of state that exists in new state
        const oldState = pick(instance.state, keys(newState));
        if (!isEqual(oldState, newState)) {
          instance.setState({ ...newState }); 
        }
      });
      
      subscription.run();
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

