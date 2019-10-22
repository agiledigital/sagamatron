import { SagaIterator } from "@redux-saga/core";
import { FluxStandardAction } from "flux-standard-action";
import { Reducer, ReducersMapObject } from "redux";
import { all, call, put, takeLatest } from "redux-saga/effects";

// tslint:disable: object-literal-sort-keys

export type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};

// TODO: better error type?
// TODO: remove any?
// tslint:disable-next-line: no-any
export type SideEffectRecord<A = any> = ReadonlyRecord<
  string,
  // tslint:disable-next-line: no-any readonly-array
  (...args: A[]) => any
>;

// tslint:disable-next-line: no-any
export type ActionTypes<A extends SideEffectRecord<any>> = {
  readonly [P in keyof A]: readonly [string, string, string, string];
};

type Action = FluxStandardAction<
  string,
  { readonly result?: unknown; readonly error?: unknown }
>;

// PERFORM SIDE EFFECT (e.g. GET)
type SideEffectAction<
  // tslint:disable-next-line: no-any
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  P extends keyof A
> = {
  readonly type: B[P][0];
  readonly payload: {
    readonly params: Parameters<A[P]>;
  };
};

// tslint:disable-next-line: no-any readonly-array
export type ExtractResult<A extends (...a: any[]) => any> = ReturnType<
  A
> extends Promise<infer Result>
  ? Result
  : ReturnType<A>;

type SagaActionsArray<
  P extends keyof A,
  // tslint:disable-next-line: no-any
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  ErrorType extends unknown = Error
> = readonly [
  // PERFORM SIDE EFFECT (e.g. GET)
  (...params: Parameters<A[P]>) => SideEffectAction<A, B, P>,
  // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
  (
    result: ExtractResult<A[P]>
  ) => {
    readonly type: B[P][1];
    readonly payload: {
      readonly result: ExtractResult<A[P]>;
    };
  },
  // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
  (
    error: ErrorType
  ) => {
    readonly type: B[P][2];
    readonly payload: {
      readonly error: ErrorType;
    };
    readonly error: true;
  },
  // TODO: better types for the reducer
  Reducer<object, Action>,
  (action: SideEffectAction<A, B, P>) => SagaIterator<void>
];

type SagaActionsRecord<
  // tslint:disable-next-line: no-any
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  ErrorType extends unknown = Error
> = {
  readonly [P in keyof A]: SagaActionsArray<P, A, B, ErrorType>;
};

export type SagaBoilerplate<
  // tslint:disable-next-line: no-any
  A extends SideEffectRecord<any>,
  B extends ActionTypes<A>,
  S,
  ErrorType extends unknown = Error
> = {
  readonly actions: SagaActionsRecord<A, B, ErrorType>;
  // TODO: better types for the reducer
  readonly rootReducer: ReducersMapObject<S>;
  readonly rootSaga: () => SagaIterator<void>;
};

export type State<ErrorType extends unknown = Error, ResultType = unknown> = {
  readonly loading: boolean;
  readonly error?: ErrorType;
  readonly result?: ResultType;
};

export const concoctBoilerplate = <
  A extends SideEffectRecord,
  B extends ActionTypes<A>
>(
  sideEffects: A,
  actionTypes: B
): SagaBoilerplate<A, B, ReadonlyRecord<string, State>> => {
  const keys = Object.keys(sideEffects) as ReadonlyArray<keyof A>;

  const defaultState: State = {
    error: undefined,
    result: undefined,
    loading: false
  };

  const actions = keys.reduce((acc, k) => {
    // tslint:disable-next-line: one-variable-per-declaration
    const reducer = (
      state: State | undefined = defaultState,
      action: Action
    ): State => {
      switch (action.type) {
        case actionTypes[k][0]:
          return {
            ...state,
            loading: true
          };
        case actionTypes[k][1]:
          return {
            ...state,
            loading: false,
            result:
              action.payload !== undefined ? action.payload.result : undefined,
            error: undefined
          };
        case actionTypes[k][2]:
          return {
            ...state,
            loading: false,
            result: undefined,
            error:
              action.payload !== undefined
                ? // tslint:disable-next-line: no-any
                  (action.payload.error as any)
                : undefined
          };
        default:
          return state !== undefined ? state : defaultState;
      }
    };

    function* saga(
      action: SideEffectAction<A, B, typeof k>
    ): SagaIterator<void> {
      // tslint:disable-next-line: no-try
      try {
        // TODO: https://github.com/agiledigital/typed-redux-saga
        const result = yield call(sideEffects[k], ...action.payload.params);

        // tslint:disable-next-line: no-expression-statement
        yield put<Action>({
          type: actionTypes[k][1],
          payload: {
            result
          }
        });
      } catch (error) {
        // tslint:disable-next-line: no-expression-statement
        yield put<Action>({
          type: actionTypes[k][2],
          payload: {
            error
          }
        });
      }
    }

    return {
      ...acc,
      [k]: [
        // PERFORM SIDE EFFECT (e.g. GET)
        (...params: Parameters<A[typeof k]>) => ({
          type: actionTypes[k][0],
          payload: {
            params
          }
        }),
        // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
        (result: ExtractResult<A[typeof k]>) => ({
          type: actionTypes[k][1],
          payload: {
            result
          }
        }),
        // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
        (error: unknown) => ({
          type: actionTypes[k][2],
          payload: {
            error
          },
          error: true
        }),
        reducer,
        saga
      ]
    };
    // TODO get rid of this cast
  }, {}) as SagaActionsRecord<A, B>;

  const rootReducer = keys.reduce(
    (acc, k) => ({
      ...acc,
      [actionTypes[k][3]]: actions[k][3]
    }),
    {}
  ) as ReducersMapObject<ReadonlyRecord<string, State>>;

  function* rootSaga(): SagaIterator<void> {
    // tslint:disable-next-line: no-expression-statement no-unsafe-any
    yield all(keys.map(k => takeLatest(actionTypes[k][0], actions[k][4])));
  }

  return {
    actions,
    rootReducer,
    rootSaga
  };
};
