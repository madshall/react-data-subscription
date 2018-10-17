import { pull, some, cloneDeep } from "lodash";

import Entity from "./entity";
import Subscription from "./subscription";

class Store {
  _store = {};
  _owners = [];
  
  createSubscription = (endpoint, paramsFunc, conditionFunc) => {
    const subscription = new Subscription(this.getEntity, endpoint, paramsFunc, conditionFunc);

    subscription.on(Subscription.events.HASH_CHANGED, ({ oldHash, newHash }) => {
      this._tryCleanUpEntity(oldHash);
    });

    return subscription;
  }
  
  getEntity = hash => {
    return this._store[hash] 
      ? this._store[hash] 
      : (this._store[hash] = new Entity());
  }
  
  registerSubscriber = owner => {
    owner.subscriptions = [];
    this._owners.push(owner);
  }
  
  unregisterSubscriber = owner => {
    owner.subscriptions.forEach(subscription => {
      this._tryCleanUpEntity(subscription.getHash());
      subscription.destructor();
    });
    
    pull(this._owners, owner);
  }
  
  dump = () => {
    return cloneDeep(this._store);
  }
  
  _tryCleanUpEntity = hash => {
    if (!this._store[hash]) return;
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
    
    this._store[hash].destructor();
    delete this._store[hash];
  }
}

export default new Store();