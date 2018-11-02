import { EventEmitter } from "events";
import { values } from "lodash";

const DEFAULT_STATE = {
  isLoading: false,
  isRefreshing: false,
  isLoaded: false,
  isError: false,
  isFinished: false,
};

export default class Entity extends EventEmitter {
  static events = {
    CHANGED: "changed",
  };

  constructor() {
    super();
    
    this.body = {
      ...DEFAULT_STATE,
      payload: undefined,
      error: undefined,
    };
  }
  
  destructor() {
    values(Entity.events).forEach(eventName => {
      this.removeAllListeners(eventName);
    });
  }

  getProp = (prop) => {
    return this.body[prop];
  }
  
  getProps = () => {
    return this.body;
  }
  
  setProps = (props) => {
    this.body = {
      ...this.body,
      ...props,
    }
    this.emit(Entity.events.CHANGED, props);
  }
};