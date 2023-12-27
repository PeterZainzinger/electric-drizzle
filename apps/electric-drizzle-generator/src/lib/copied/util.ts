export type AnyFunction = (...args: any[]) => any
export type BindParams = SqlValue[] | Row
export type DbName = string
export type DbNamespace = string
export type EmptyFunction = () => void
export type FunctionMap = { [key: string]: AnyFunction }
export type Path = string
export type Query = string
export type Row = { [key: string]: SqlValue }
export type RowCallback = (row: Row) => void
export type RowId = number
export type SqlValue = string | number | null | Uint8Array | bigint
export type StatementId = string
export type Tablename = string
export type VoidOrPromise = void | Promise<void>
export type LSN = Uint8Array
export type Statement = { sql: string; args?: SqlValue[] }
