// TODO: prettier
// TODO: type coverage
// TODO: tslint
// TODO: tslint immutable
// TODO: push to agile github
// TODO: entertaining readme, ad hominem attacks against hook heathens
// TODO: tests

type ReadonlyRecord<K extends string, T> = {
  readonly [P in K]: T;
};

// TODO: better error type?
type SideEffectRecord = ReadonlyRecord<string, (...args: unknown[]) => Promise<unknown>>;

type ActionTypes<A extends SideEffectRecord> = {
  readonly [P in keyof A]: readonly [string, string, string];
};

type SagaBoilerplate<A extends SideEffectRecord, B extends ActionTypes<A>, ErrorType extends unknown = Error> = {
  readonly [P in keyof A]: [
    // PERFORM SIDE EFFECT (e.g. GET)
    (...params: Parameters<A[P]>) => {
      readonly type: B[P][0],
      readonly payload: {
        readonly params: Parameters<A[P]>
      }
    },
    // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
    (result: ReturnType<A[P]> extends Promise<infer Result> ? Result : never) => {
      readonly type: B[P][1],
      readonly payload: {
        // TODO: don't repeat this incantation
        readonly result: ReturnType<A[P]> extends Promise<infer Result> ? Result : never
      }
    },
    // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
    (error: ErrorType) => {
      readonly type: B[P][2],
      readonly error: ErrorType
    },
    // TODO Reducer,
    (action: any, state: any) => any,
    // TODO Saga,
    () => undefined
  ]
};

export const concoctBoilerplate = <A extends SideEffectRecord, B extends ActionTypes<A>>(
  sideEffects: A,
  actionTypes: B
): SagaBoilerplate<A, B> => {

  const keys = Object.keys(sideEffects) as ReadonlyArray<keyof A>;

  return keys.reduce((acc, k) => ({
    ...acc,
    [k]: [
      // PERFORM SIDE EFFECT (e.g. GET)
      (...params: Parameters<A[typeof k]>) => ({
        type: actionTypes[0],
        payload: {
          params
        }
      }),
      // PERFORM SIDE EFFECT SUCCESS (e.g. GET SUCCESS)
      (result: ReturnType<A[typeof k]> extends Promise<infer Result> ? Result : never) => ({
        type: actionTypes[1],
        payload: {
          result
        }
      }),
      // PERFORM SIDE EFFECT FAILURE (e.g. GET FAILURE)
      (error: unknown) => ({
        type: actionTypes[2],
        error
      }),
      // TODO Reducer,
      (action: any, state: any) => {
        switch (action.type) {
          case actionTypes[0]:
            return {
              ...state,
              loading: true
            };
          case actionTypes[1]:
            return {
              ...state,
              loading: false,
              result: action.payload.result,
              error: undefined
            };
          case actionTypes[2]:
            return {
              ...state,
              loading: false,
              result: undefined,
              error: action.error
            };
          default:
            return state;
        }
      },
      // TODO Saga,
      () => undefined
    ]
  }), {}) as SagaBoilerplate<A, B>;
}

type User = {readonly id: string, readonly username: string};

const userApi = {
  get: (id: string): Promise<User> => {
    // tslint:disable-next-line: no-reject
    return Promise.reject("Not implemented")
  },
  // TODO support subsets
  // delete: (id: string): Promise<void> => {
  //   // tslint:disable-next-line: no-reject
  //   return Promise.reject("Not implemented")
  // }
};

const actionTypes = {
  get: ["GET_USER", "GET_USER_SUCCESS", "GET_USER_FAILURE"]
} as const;

const {get: [getUser, getUserSuccess, getUserFailure, reducer, saga]} = concoctBoilerplate(userApi, actionTypes);

// dispatch(getUser("42"))