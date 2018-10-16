/* global fetch */
import config from "./config";

export default (url, params) => {
  const {
    transformPayload,
    transformUrl,
    ...defaultParams
  } = config.get("request");
  
  const {
    transformResponse,
    transformError,
  } = config.get("response");
  
  const fetchParams = {...defaultParams, ...params};
  
  fetch(transformUrl(url, fetchParams), {
    ...fetchParams,
    body: params.body 
      ? transformPayload(params.body, fetchParams) 
      : undefined,
  })
  .then(transformResponse)
  .catch(transformError);
};