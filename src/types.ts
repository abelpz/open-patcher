//IMPLEMENTATION
export enum OperationType {
  Add = 'add',
  Replace = 'replace',
  Remove = 'remove',
}
type PlainObject<T> = Record<string | number, T>;
type ArrayKey<T> = keyof T[];
type PlainObjectKey<T> = keyof PlainObject<T>;

export type ObjectOrArray<T> = PlainObject<T> | T[];
export type ObjectOrArrayKey<T> = ArrayKey<T> | PlainObjectKey<T>;

interface OperationBase {
  type: OperationType;
  path: string | ObjectOrArrayKey<any>[];
  value: any;
}

export interface OperationAdd extends OperationBase {
  type: OperationType.Add;
}

export interface OperationReplace extends OperationBase {
  type: OperationType.Replace;
}

export interface OperationRemove extends Omit<OperationBase, 'value'> {
  type: OperationType.Remove;
  value?: any;
}

export type Operation = OperationAdd | OperationReplace | OperationRemove;

/**
 * Represents an operation to remove an element from an array.
 */
export interface ArrayOperationRemove {
  index: number | [number, number];
  type: OperationType.Remove;
}

/**
 * Represents an operation to replace an element in an array.
 */
export interface ArrayOperationReplace {
  index: number | [number, number];
  type: OperationType.Replace;
  value: any[] | any;
}

/**
 * Represents an operation to add an element to an array.
 */
export interface ArrayOperationAdd {
  index: number;
  type: OperationType.Add;
  value: any[] | any;
}

/**
 * Represents an operation to be applied to an array.
 */
export type ArrayOperation =
  | ArrayOperationRemove
  | ArrayOperationReplace
  | ArrayOperationAdd;

/**
 * Represents a flattened operation with a single index.
 */
export type ArrayFlatOperation = ArrayOperation & { index: number };
