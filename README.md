# About
This React HOC simplifies and optimizes communication with API and solves multiple problems at once:
1. It doesn't rely on Saga, Thunk and Redux in general. No learning curve, no extra dependencies.
2. It eliminates the overhead of using promises, callbacks, async/wait.
3. It optimizes network, memory usage and as a result - application performance.
4. With this HOC you can make every single component a self-sufficient one with no harm to application performance.
5. Everything data-related is handled in one place.

# Key points
- Each subscription is bound to a component that initializes it. It lives with and it dies with it. 
- There has been a data store manager implemented that does all the optimization and synchronization. 
- If a subscription is trying to make the same call that an already existing subscription made before - it won't produce a new request. It will refer to the existing request instead. Example: three components which have the same subscription parameters (`endpoint` + `requestParams`) will share a single network request.
- This module allows creating components dependent on API data without worrying about excessive amount of network requests. It also allows making each component a self-sufficient one that can be reused anywhere else.
- **Forget about duplication of network requests**
- **Forget about thinking of when to make a request and how to handle it**

# Installation

```javascript
yarn add react-data-subscription
```

or 

```javascript
npm install react-data-subscription
```

# Usage
## Config
Provides with an option to configure how the underlying `fetch` should process requests and responses globally.

* `get( path: string ): any` - get config property at its path; see [lodash.get](https://lodash.com/docs/4.17.10#get) for details on path format
* `set( pathOrObject: string|object, value: any )` - set config property at its path or merge the default config with a given object; see [lodash.set](https://lodash.com/docs/4.17.10#set) for details on path format

Default settings:

```javascript
request: {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  transformPayload: (payload, requestParams) => {
    if (requestParams.method !== "GET" && requestParams.method !== "HEAD") {
      return JSON.stringify(payload || {});
    }
  },
  transformUrl: (url, requestParams) => {
    if (requestParams.method === "GET" || requestParams.method === "HEAD") {
      return `${url}?${QueryString.stringify(requestParams.body)}`;
    }
    
    return url;
  },
},
response: {
  transformResponse: response => response.json(),
  transformError: error => error,
}
```

Any of these settings can be overwritten and new ones can be added to be used by `fetch` function.

```javascript
import { config } from "react-data-subscription";

config.set({
  credentials: "include",
  redirect: "follow",
  transformUrl: (url, requestParams) => {
    const prefix = "/api";
    if (requestParams.method === "GET" || requestParams.method === "HEAD") {
      return `${prefix}${url}?${QueryString.stringify(requestParams.body)}`;
    }
    
    return `${prefix}${url}`;
  },
})
```

**NOTE: This is a global config. It controls the way the module will behave for all components**

## HOC
Adds an extra prop called `subscribe` to your component.

```javascript
import React from "react";
import { withDataSubscription } from "react-data-subscription";

class MyComponent extends React.Component {
  componentDidMount() {
    this.props.subscribe(
      this,
      "/getTodos"
      () => {
        return {
          body: {
            subject: this.props.subject,
            count: this.state.count,
            perPage: this.state.perPage,
          }
        };
      },
      data => {
        return {
          todos: data,
        };
      }
    );
  }
  
  render() {
    const todos = this.state.todos || {};
    return (
      <div>
        {todos.isLoading && <LoadingIndicator />}
        {todos.isRefreshing && <RefreshingIndicator />}
        {todos.isError && <Error error={todos.error} />}
        {todos.isLoaded && 
          <Yikes>
            {JSON.stringify(todos.payload || {})}
          </Yikes>
        }
      </div>
    );
  }
}

export default withDataSubscription(MyComponent);
```

This is a basic example, but what might be not obvious here is:
- Any time `this.props.subject`, `this.state.count` or `this.state.perPage` is changed the data is going to be updated automatically.
- We can handle the request lifecycle.
- When the data is loaded it's available from out component's state.

### Parameters
- `componentInstance: object` - component instance. Is needed for hooking into components lifecycle events. Typically, `this` has to be passed.
- `endpoint: string` - an endpoint to make a request to.
- `requestParams: function` - a function that returns request params for underlying `fetch` call. Every time the value returned by this function is different from the previous one a new `fetch` will be made. These parameters will get merged with default parameters set in global `config` and get passed to `fetch`.
- `responseCallback(status: object): function` - a function that returns changes to component's state. Based on the current state or response returned by the endpoint you can make a decision around what should go into your component's state. The returned value gets passed to your component's `setState()` if it's different from what's already there. Only the keys returned by this function get compared to the existing state. Comparison is done by [lodash.isEqual](https://lodash.com/docs/4.17.10#isEqual) 
- `shouldRun: function` - a function that indicates whether the component is ready to `fetch` the data or not. Default value is `() => true`. This parameter can be used to delay the request until some condition is met, like some payload parameter may not be set at the time when `componentDidMount` is invoked.

The status of `responseCallback` is:
- `isLoading: boolean` - `true` if request is being currently in progresss.
- `isRefreching: boolean` - `true` if request is being currently refreshed.
- `isLoaded: boolean` - `true` if there's no error and request was successfull. Usually means that its payload contains the response data.
- `isError: boolean` - `true` if there's an error while making this request
- `isFinished: boolean` - `true` if either `isLoaded` or `isError` is `true`.
- `payload: object` - response body if there was no error. Default: `null`,
- `error: object` - error detail if there was an error. Default: `null`.
- `refresh: function` - a function that triggers re-fetch of data no matter what.
