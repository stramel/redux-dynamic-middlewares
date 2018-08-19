import { compose } from "redux";

const allMiddleware = new Set();

export const createMiddlewareRegistry = (objArg, ...rest) => ({
  getState,
  dispatch
}) => next => action => {
  const middlewareChain = Array.from(allMiddleware).map(middleware =>
    middleware(
      {
        ...objArg,
        getState,
        dispatch
      },
      ...rest
    )
  );

  return compose(...middlewareChain)(next)(action);
};

export const register = (...middleware) =>
  middleware.forEach(m => allMiddleware.add(m));

export const deregister = (...middleware) =>
  middleware.forEach(m => allMiddleware.delete(m));

export const reset = () => allMiddleware.clear();

export default createMiddlewareRegistry();
