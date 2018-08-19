import { applyMiddleware, createStore } from "redux";
import middlewareRegistry, {
  createMiddlewareRegistry,
  register,
  deregister,
  reset
} from "./";

const reducer = (state = {}, action) => {
  if (action.type === "foo") return { foo: "bar" };
  return state;
};

describe("Middleware Registry", () => {
  it("should work without error", () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const store = createStore(reducer, applyMiddleware(middlewareRegistry));
    expect(store.getState()).toEqual({});
    store.dispatch({ type: "foo" });
    // eslint-disable-next-line no-console
    expect(console.error).not.toBeCalled();
    expect(store.getState()).toEqual({ foo: "bar" });
  });
  describe("createMiddlewareRegistry", () => {
    it("should work out of the box", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const middlewareWork = jest.fn();
      const middleware = (...args) => next => action => {
        middlewareWork(action, ...args);
        return next(action);
      };
      register(middleware);

      store.dispatch({ type: "foo" });
      expect(middlewareWork).toHaveBeenCalledWith(
        { type: "foo" },
        expect.objectContaining({
          dispatch: expect.any(Function),
          getState: expect.any(Function)
        })
      );
    });
    it("should work with extra arguments", () => {
      const store = createStore(
        reducer,
        applyMiddleware(createMiddlewareRegistry({ foo: "bar" }, "baz"))
      );
      const middlewareWork = jest.fn();
      const middleware = (...args) => next => action => {
        middlewareWork(action, ...args);
        return next(action);
      };
      register(middleware);

      store.dispatch({ type: "foo" });
      expect(middlewareWork).toHaveBeenCalledWith(
        { type: "foo" },
        expect.objectContaining({
          foo: "bar",
          dispatch: expect.any(Function),
          getState: expect.any(Function)
        }),
        "baz"
      );
    });
  });

  describe("register", () => {
    it("should allow a single middleware to be registered", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const middlewareWork = jest.fn();
      const middleware = () => next => action => {
        middlewareWork(action);
        return next(action);
      };
      register(middleware);

      store.dispatch({ type: "foo" });
      expect(middlewareWork).toBeCalledWith({ type: "foo" });
    });
    it("should allow multiple middlware to be registered", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const firstMiddlewareWork = jest.fn();
      const firstMiddleware = () => next => action => {
        firstMiddlewareWork(action);
        return next(action);
      };
      const secondMiddlewareWork = jest.fn();
      const secondMiddleware = () => next => action => {
        secondMiddlewareWork(action);
        return next(action);
      };
      register(firstMiddleware, secondMiddleware);

      store.dispatch({ type: "foo" });
      expect(firstMiddlewareWork).toBeCalledWith({ type: "foo" });
      expect(secondMiddlewareWork).toBeCalledWith({ type: "foo" });
    });
    it("should not allow duplicate middleware to be registered", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const firstMiddlewareWork = jest.fn();
      const firstMiddleware = () => next => action => {
        firstMiddlewareWork(action);
        return next(action);
      };
      register(firstMiddleware, firstMiddleware);

      store.dispatch({ type: "foo" });
      expect(firstMiddlewareWork).toBeCalledWith({ type: "foo" });
      expect(firstMiddlewareWork).toHaveBeenCalledTimes(1);
    });
  });
  describe("deregister", () => {
    it("should allow removal of single middleware", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const firstMiddlewareWork = jest.fn();
      const firstMiddleware = () => next => action => {
        firstMiddlewareWork(action);
        return next(action);
      };
      const secondMiddlewareWork = jest.fn();
      const secondMiddleware = () => next => action => {
        secondMiddlewareWork(action);
        return next(action);
      };
      register(firstMiddleware, secondMiddleware);
      deregister(secondMiddleware);

      store.dispatch({ type: "foo" });
      expect(firstMiddlewareWork).toBeCalledWith({ type: "foo" });
      expect(secondMiddlewareWork).not.toBeCalled();
    });
    it("should allow removal of multiple middleware", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const firstMiddlewareWork = jest.fn();
      const firstMiddleware = () => next => action => {
        firstMiddlewareWork(action);
        return next(action);
      };
      const secondMiddlewareWork = jest.fn();
      const secondMiddleware = () => next => action => {
        secondMiddlewareWork(action);
        return next(action);
      };
      register(firstMiddleware, secondMiddleware);
      deregister(firstMiddleware);
      deregister(secondMiddleware);

      store.dispatch({ type: "foo" });
      expect(firstMiddlewareWork).not.toBeCalled();
      expect(secondMiddlewareWork).not.toBeCalled();
    });
    it("should not allow removal of middleware not registered", () => {
      const firstMiddlewareWork = jest.fn();
      const firstMiddleware = () => next => action => {
        firstMiddlewareWork(action);
        return next(action);
      };
      const secondMiddlewareWork = jest.fn();
      const secondMiddleware = () => next => action => {
        secondMiddlewareWork(action);
        return next(action);
      };

      const store = createStore(
        reducer,
        applyMiddleware(middlewareRegistry, secondMiddleware)
      );
      register(firstMiddleware);
      deregister(firstMiddleware);
      deregister(secondMiddleware);

      store.dispatch({ type: "foo" });
      expect(firstMiddlewareWork).not.toBeCalled();
      expect(secondMiddlewareWork).toBeCalledWith({ type: "foo" });
    });
  });
  describe("reset", () => {
    it("should remove all registered middleware", () => {
      const store = createStore(reducer, applyMiddleware(middlewareRegistry));
      const firstMiddlewareWork = jest.fn();
      const firstMiddleware = () => next => action => {
        firstMiddlewareWork(action);
        return next(action);
      };
      const secondMiddlewareWork = jest.fn();
      const secondMiddleware = () => next => action => {
        secondMiddlewareWork(action);
        return next(action);
      };
      register(firstMiddleware, secondMiddleware);
      reset();

      store.dispatch({ type: "foo" });
      expect(firstMiddlewareWork).not.toBeCalled();
      expect(secondMiddlewareWork).not.toBeCalled();
    });
  });
});
