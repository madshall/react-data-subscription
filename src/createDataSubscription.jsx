import React from "react";
import { pick, keys, isEqual } from "lodash";

import createStore from "./store/store";
import Subscription from "./store/subscription";

const EMPTY_FUNC = () => {};

export default config => {
  const store = createStore(config);

  const hoc = WrappedComponent => {
    return class DataSubscription extends React.Component {
      constructor(props) {
        super(props);
        this.firstTimeCall = true;
        this._isMounted = false;
        store.registerSubscriber(this);
      }

      componentWillUnmount() {
        store.unregisterSubscriber(this);
        this._isMounted = false;
      }

      onSubscribe = (instance, endpoint, paramsFunc, callbackFunc, conditionFunc) => {
        if (this.firstTimeCall) {
          this._isMounted = true;
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
          // subscription has not been disposed yet, but the component
          // will or did unmount so we can't set any state on it anymore
          if (this._isMounted === false) {
            return;
          }

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

  hoc.dump = () => store.dump();

  return hoc;
};
