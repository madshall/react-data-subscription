import { pull, some } from "lodash";
import Subscription from "./supscription";

export default class Store {
  _store = {};
  _owners = [];
  
  createSubscription = (endpoint, params, getPayload, conditionFunc) => {
    const subscription = new Subscription(this, endpoint, params, getPayload, conditionFunc);
    subscription.on("hash-changed", ({ oldHash, newHash }) => {
      this._store[newHash] = this._store[newHash] || subscription;
      this._tryCleanUpSubscription(oldHash);
    });

    return subscription;
  }
  
  getSubscription = hash => {
    return this._store[hash];
  }
  
  registerSubscriber = owner => {
    owner.subscriptions = [];
    this._owners.push(owner);
  }
  
  unregisterSubscriber = owner => {
    owner.subscriptions.forEach(subscription => {
      this._tryCleanUpSubscription(subscription.getHash());
    });
    
    pull(this._owners, owner);
  }
  
  _tryCleanUpSubscription = hash => {
    let usages = 0;
    const usedSomewhereElse = some(this._owners, owner => {
      return some(owner.subscriptions, subscription => {
        if (subscription.getHash() === hash) {
          usages++;
        }
        
        return usages > 1;
      });
    });
    
    if (usedSomewhereElse) return;
    
    delete this._store[hash];
  }
}