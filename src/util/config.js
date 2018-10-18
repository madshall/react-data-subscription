import { get, set, merge } from "lodash";
import QueryString from "querystring";

const config = {
  request: {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    transformPayload: (url, params, requestParams) => {
      if (requestParams.method !== "GET" && requestParams.method !== "HEAD") {
        return JSON.stringify(params.body || {});
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
  },
};

export default {
  get: path => {
    return get(config, path);
  },
  set: (pathOrObject, value) => {
    // single setter
    if (typeof pathOrObject === "string") {
      set(config, pathOrObject, value);
    }

    // bulk setter
    merge(config, pathOrObject);
  },
};
