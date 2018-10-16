import { EventEmitter } from "events";
import ObjectHash from "object-hash";

import request from "../util/request";

const DEFAULT_STATE = {
  isLoading: false,
  isRefreshing: false,
  isLoaded: false,
  isError: false,
  isFinished: false,
};

const trueFunc = () => true;

export default class Subscription extends EventEmitter {
  constructor(store, endpoint, params, payloadFunc, conditionFunc = trueFunc) {
    super();
    this._state = {
      ...DEFAULT_STATE,
    };
    this._data = {
      payload: null,
      error: null,
    };
    this._private = {
      endpoint,
      params,
      payloadFunc,
      conditionFunc,
    };
    this._store = store;
    this._hash = null;
  }

  _setState = (newState) => {
    this._state = {
      ...DEFAULT_STATE,
      ...newState,
    }
    this.emit("updated");
  }

  _setData = (type, value) => {
    this._data[type] = value;
  }
  
  getHash = () => {
    return this._hash;
  }

  getState = () => {
    return {
      ...this._state,
      ...this._data,
    };
  }

  refresh = () => {
    this.run(true);
  }

  run = (forcedRefresh = false) => {
    if (!this._private.conditionFunc()) {
      return;  
    }
    
    const hash = ObjectHash({
      endpoint: this._private.endpoint,
      params: this._private.params,
      payload: this._private.payloadFunc(),
    });
    
    if (hash !== this._hash) {
      this.emit("hash-changed", {
        oldHash: this._hash,
        newHash: hash,
      });
    } else {
      return;
    }
    
    this._hash = hash;
    
    this._setState({
      isLoaing: !forcedRefresh,
      isRefreshing: forcedRefresh,
    });
    
    // don't run if already running or fetched
    const existingSubscription = this._store.getSubscription(this._hash);
    if (existingSubscription && !(existingSubscription.isLoading || existingSubscription.isRefreshing)) {
      request(this._private.endpoint, this._private.params, this._private.payloadFunc())
        .then(response => {
          this._setData("payload", response);
          this._setState({
            isLoaded: true,
            isFinished: true,
          });
        })
        .catch(error => {
          this._setData("error", error);    
          this._setState({
            isError: true,
            isFinished: true,
          });
        });
    }
  }
};
