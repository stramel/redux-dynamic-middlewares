# redux-dynamic-middlewares

Allow add or remove redux middlewares dynamically (for example: on route change).

```
npm install --save redux-dynamic-middlewares
```

## Example

```js
// configure store

import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/index";

import middlewareRegistry from "redux-middleware-registry";

const store = createStore(
  rootReducer,
  applyMiddleware(
    // ... other static middlewares
    middlewareRegistry
  )
);

// some other place in your code

import { register, deregister, reset } from "redux-middleware-registry";

const myMiddleware = store => next => action => {
  // do something
  return next(action);
};

// will add middleware to existing chain
register(myMiddleware /*[, anotherMiddleware ... ]*/);

// will remove middleware from chain (only which was added by `addMiddleware`)
deregister(myMiddleware);

// clean all dynamic middlewares
reset();
```

### Pass additional arguments

Note that the first param must be an object and any following arguments can be anything

```js
// configure store

import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers/index";

import { createMiddlewareRegistry } from "redux-middleware-registry";

const store = createStore(
  rootReducer,
  applyMiddleware(
    // ... other static middlewares
    createMiddlewareRegistry({ foo: "bar" }, "baz")
  )
);
```
