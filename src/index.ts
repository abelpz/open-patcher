import { splitPath, getType, getObjectCopy } from './utils';
import {
  ObjectOrArray,
  ObjectOrArrayKey,
  Operation,
  OperationType,
} from './types';
import { applyArrayPatch } from './arrayOperations';

/**
 * Represents an operation to be applied to a source object or array.
 */
interface ApplyPatchOperationsParams<T> {
  /** the source object or array to be patched */
  source: T;
  /** the patch operations to apply */
  operations: Operation[]; // The patch operations to apply
}

/**
 * Represents the result of applying a set of patch operations to a source object or array.
 */
type ApplyPatchResult<T> =
  T extends Array<any> ? any[] : Partial<T & { [prop: string | number]: any }>;

/** A cache of resolved paths */
let paths: Record<string, { element: { targetParent: ObjectOrArray<any> } }> =
  {};

/** A cache of the current source object or array */
let currentSource = null as ObjectOrArray<any> | null;

/**
 * Applies a set of patch operations to a source object or array.
 *
 * @template T - The type of the source object or array.
 * @param params - The parameters for applying the patch operations.
 * @param params.source - The source object or array to be patched.
 * @param params.operations - The patch operations to be applied.
 * @returns - The result of applying the patch operations.
 *
 * @remarks
 * A patch operation is a modification that can be applied to a source object or array.
 * It can be of type 'add', 'replace', or 'remove', and it specifies the path to the target element
 * and the value to be added, replaced, or removed.
 * The expected result is the source object or array with the patch operations applied.
 */
export function applyPatch<T extends ObjectOrArray<any>>({
  source,
  operations,
}: ApplyPatchOperationsParams<T>): ApplyPatchResult<T> {
  currentSource = getObjectCopy(source);
  const results = operations.reduce(
    (sourceCopy: ObjectOrArray<any>, operation: Operation) => {
      return applyOperation({ source: sourceCopy, operation });
    },
    currentSource,
  );
  currentSource = null;
  paths = {};
  return results as ApplyPatchResult<T>;
}

interface ApplyPatchOperationParams {
  /** the source object or array to be patched */
  source: ObjectOrArray<any>;
  /** the patch operation to apply */
  operation: Operation;
}

/**
 * Applies a single patch operation to a source object or array.
 *
 * @param params - The parameters for applying the patch operation.
 * @param params.source - The source object or array to be patched.
 * @param params.operation - The patch operation to apply.
 * @returns - The updated source object or array after applying the patch operation.
 *
 * @remarks
 * This function applies a single patch operation to a source object or array.
 * The patch operation can be of type 'add', 'replace', or 'remove'.
 * The source object or array is modified in-place.
 */
export function applyOperation({
  source,
  operation,
}: ApplyPatchOperationParams) {
  if (source !== currentSource) {
    paths = {};
    currentSource = getObjectCopy(source);
  }
  const { type, path, value } = operation;
  const [pathKeys, targetKey] = splitPath(path);

  // Reducer function to get the target's parent element
  const pathReducer = (
    targetParent: ObjectOrArray<any>,
    pathKey: ObjectOrArrayKey<any>,
    index: number,
  ) => {
    const currentPath = pathKeys.slice(0, index + 1);
    const currentPathString = currentPath.join('/');
    try {
      if (paths[currentPathString]) {
        return paths[currentPathString].element.targetParent;
      }
      const currentKey = pathKey as keyof ObjectOrArray<any>;
      const currentElement = getObjectCopy(targetParent[currentKey]);

      if (!currentElement)
        throw new Error(
          `Invalid path containing ${getType(currentElement)}, expecting array or object`,
        );

      if (currentElement) targetParent[currentKey] = currentElement;
      const resolvedElement = {
        targetParent: currentElement,
      };
      paths[currentPathString] = { element: resolvedElement };
      return currentElement;
    } catch (e) {
      console.error({ e });
      throw new Error(`Invalid path ${path} at ${currentPathString}`);
    }
  };

  //Get the parent of the target element
  const targetParent = pathKeys.reduce(pathReducer, currentSource);

  //Apply the operation
  const t = getType(targetParent);

  if (t === 'array') {
    if (typeof targetKey === 'symbol')
      throw new Error(
        `Invalid target key in path. Symbol is not a valid key for an array. Please check the last key in the provided path.`,
      );
    const index = targetKey === '-' ? targetParent.length : +targetKey;
    applyArrayPatch({
      source: targetParent as Array<any>,
      operations: [{ type, index, value }],
      options: {
        mutateSource: true,
      },
    });
    return source;
  }
  if ([OperationType.Replace, OperationType.Add].includes(type))
    targetParent[targetKey as keyof typeof targetParent] = value;
  if (type === OperationType.Remove)
    delete targetParent[targetKey as keyof typeof targetParent];
  return source;
}

export { applyArrayPatch as applyArrayOperations } from './arrayOperations';
