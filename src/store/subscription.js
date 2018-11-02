import { EventEmitter } from "events";
import ObjectHash from "object-hash";
import { values } from "lodash";

import Entity from "./entity";
import request from "../util/request";

const TRUE_FUNC = () => true;
const EMPTY_FUNC = () => {};

export default class Subscription extends EventEmitter {
  static empty = (store) => {
    return new Subscription();  
  }
  
  static events = {
    UPDATED: "updated",
    HASH_CHANGED: "hash-changed",
  };
  
  constructor(getEntity, endpoint, paramsFunc = EMPTY_FUNC, conditionFunc = TRUE_FUNC) {
    super();
    this._private = {
      endpoint,
      paramsFunc,
      conditionFunc,
    };
    this._getEntity = getEntity;
    this._hash = null;
  }
  
  destructor() {
    values(Subscription.events).forEach(eventName => {
      this.removeAllListeners(eventName);
    });
    this._unlistenEntity();
  }
  
  _setEntity = (hash) => {
    this._unlistenEntity();
    
    this._entity = this._getEntity(hash);
    this._entity.on(Entity.events.CHANGED, (props) => {
      this._emitUpdated();
    });
  }
  
  _unlistenEntity = () => {
    if (this._entity) {
      this._entity.removeListener(Entity.events.CHANGED, this._emitUpdated);  
    }
  }
  
  _emitUpdated = () => {
    this.emit(Subscription.events.UPDATED);
  }

  _setData = (data) => {
    this._entity.setProps(data);
  }

  getHash = () => {
    return this._hash;
  }

  getState = () => {
    return {
      ...this._entity.getProps(),
      refresh: this.refresh,
    };
  }

  refresh = () => {
    this.run(true);
  }

  run = (forcedRefresh = false) => {
    if (!this._private.conditionFunc()) {
      return;  
    }
    
    const params = this._private.paramsFunc();
    const hash = ObjectHash({
      endpoint: this._private.endpoint,
      params,
    });
    
    if (hash !== this._hash) {
      this._setEntity(hash);
      this.emit(Subscription.events.HASH_CHANGED, {
        oldHash: this._hash,
        newHash: hash,
      });
    } else if (!forcedRefresh) {
      return;
    }
    
    this._hash = hash;

    if ((this._entity.getProp("isLoading")
      || this._entity.getProp("isFinished")
      || this._entity.getProp("isRefreshing")
    ) && !forcedRefresh) {
      return;
    }
    
    this._entity.setProps({
      isLoading: !forcedRefresh,
      isRefreshing: forcedRefresh,
      isLoaded: false,
      isFinished: false,
      isError: false,
    });
    
    request(this._private.endpoint, params)
      .then(payload => {
        this._entity.setProps({
          isLoading: false,
          isRefreshing: false,
          isLoaded: true,
          isFinished: true,
          payload,
          error: undefined,
        });
      })
      .catch(error => {
        this._entity.setProps({
          isLoading: false,
          isRefreshing: false,
          isError: true,
          isFinished: true,
          payload: undefined,
          error,
        });
      });
  }
};
