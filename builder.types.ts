type IsRequired<T, K extends keyof T> = {} extends Pick<T, K> ? never : true;

type RequiredFields<T> = {
  [K in keyof T]: true extends IsRequired<T, K> ? K : never;
}[keyof T];

type OptionalFields<T> = {
  [K in keyof T]: true extends IsRequired<T, K> ? never : K;
}[keyof T];

type StateFlag<K extends string> = `has${Capitalize<K>}`;

type BuilderState<T> = {
  [K in RequiredFields<T> as StateFlag<string & K>]-?: IsRequired<
    T,
    K
  > extends never
    ? never
    : boolean;
};

type InitialState<T> = BuilderState<T> & {
  [K in keyof BuilderState<T>]: BuilderState<T>[K] extends never
    ? never
    : false;
};

type FullfilledState<T> = BuilderState<T> & {
  [K in keyof BuilderState<T>]: BuilderState<T>[K] extends never ? never : true;
};

type SetFieldState<
  T,
  State extends BuilderState<T>,
  K extends RequiredFields<T>,
> = BuilderState<T> &
  Omit<State, StateFlag<string & K>> &
  Record<StateFlag<string & K>, true>;

type Builder<T, State extends BuilderState<T> = InitialState<T>> = {
  [K in RequiredFields<T> as `set${Capitalize<string & K>}`]: (
    value: T[K],
  ) => Builder<T, SetFieldState<T, State, K>>;
} & {
  [K in OptionalFields<T> as `set${Capitalize<string & K>}`]: (
    value?: T[K],
  ) => Builder<T, State>;
} & {
  build: State extends FullfilledState<T> ? () => T : "Missing required fields";
};

// -------------------- DEMO --------------------

type DBConnection = {
  host: string;
  port: number;
  dbName: string;
  password?: string;
  ssl?: boolean;
};

declare const dbConnectionBuilder: Builder<DBConnection>;
dbConnectionBuilder.setHost("localhost").setPort(5432).setDbName("mydb").build(); // Valid
dbConnectionBuilder.setHost("localhost").setPort(5432).setDbName("mydb").setPassword("secret").build(); // Valid
dbConnectionBuilder.setHost("localhost").setPort(5432).setDbName("mydb").setSsl(true).build(); // Valid
// dbConnectionBuilder.setHost("localhost").setPort(5432).build(); // Error: Missing required fields