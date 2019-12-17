import { pull, some, cloneDeep } from "lodash";

import Entity from "./entity";
import Subscription from "./subscription";

class Store {
  _store = {};
  _owners = [];

  constructor(config) {
    this.config = config;
  }
  
  createSubscription = (endpoint, paramsFunc, conditionFunc) => {
    const subscription = new Subscription(this.config, this.getEntity, endpoint, paramsFunc, conditionFunc);

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
    // Giving another newly mounted component a chance
    // to pick up the subscription before removing it 
    // completely
    setTimeout(() => {
      owner.subscriptions.forEach(subscription => {
        this._tryCleanUpEntity(subscription.getHash());
        subscription.destructor();
      });

      pull(this._owners, owner);
    });
  }
  
  dump = () => {
    return cloneDeep(this._store);
  }

  request = (endpoint, updatedCallback) => {
    const subscription = this.createSubscription(endpoint);
    subscription.run();

    subscription.on(Subscription.events.UPDATED, () => {
      updatedCallback(subscription.getState());
    });
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

export default config => new Store(config);