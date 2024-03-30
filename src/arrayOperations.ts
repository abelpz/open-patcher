import { ArrayFlatOperation, ArrayOperation, OperationType } from './types';
interface ArrayOperationsOptions {
  chainOperations?: boolean;
  mutateSource?: boolean;
}

interface ApplyArrayPatchParams {
  source: any[];
  operations: ArrayOperation[];
  options?: ArrayOperationsOptions;
}

/**
 * Applies a batch of operations to an array and returns the modified array.
 * @param source The original array.
 * @param operations The array of operations to apply.
 * @param options The options for applying the operations.
 * @returns The new modified array after applying the operations.
 */
export function applyArrayPatch({
  source,
  operations,
  options = {
    chainOperations: false,
    mutateSource: false,
  },
}: ApplyArrayPatchParams): any[] {
  const newArr = options.mutateSource ? source : [...source];
  // Flatten the operations array to split ranges
  const flatOperations = flattenOperations(
    operations,
    !options.chainOperations,
  );

  if (!options.chainOperations) {
    // Sort operations in descending order to avoid index shifting during deletion
    flatOperations.sort((a, b) => b.index - a.index);
  }

  // Apply each operation
  flatOperations.forEach((operation) => {
    applyFlatOperation(operation, newArr);
  });

  return newArr;
}

/**
 * Flattens an array of non-overlapping operations by converting each operation with a range of indexes into separate operations with just one index.
 * @param operations The array of operations to flatten.
 * @returns The flattened array of operations.
 */
function flattenOperations(
  operations: ArrayOperation[],
  shouldThrowOnOverlappingIndex: boolean,
): ArrayFlatOperation[] {
  const indexMap = new Map<number, boolean>();
  return operations.reduce(
    (
      accumulatedFlatOperations: ArrayFlatOperation[],
      operation,
      operationsArrayIndex,
    ) => {
      // If the operation has a single index, return it as is i.e. no flattening required
      if (!Array.isArray(operation.index)) {
        if (shouldThrowOnOverlappingIndex) {
          throwOnRepeatedIndex(operation.index, operationsArrayIndex);
          updateIndexes(operation.index);
        }
        return accumulatedFlatOperations.concat(
          operation as ArrayFlatOperation,
        );
      }

      // If the operation has a range of indexes, flatten it
      const start = operation.index[0];
      const end = operation.index[1] ?? start;

      const range = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i,
      );

      // Create a flat operation for each index in the range
      const flatOperations = range.map((index, i) => {
        if (shouldThrowOnOverlappingIndex) {
          throwOnRepeatedIndex(index, operationsArrayIndex);
          updateIndexes(index);
        }
        const newOperation = {
          ...operation,
          index: operation.type === 'add' ? end : index,
        };
        if (i > 0 && operation.type === 'replace') {
          if ('value' in newOperation) {
            delete newOperation.value;
          }
          newOperation.type = OperationType.Remove;
        }
        return newOperation;
      });
      if (!shouldThrowOnOverlappingIndex)
        flatOperations.sort((a, b) => b.index - a.index);
      return accumulatedFlatOperations.concat(flatOperations);
    },
    [],
  );

  /**
   * Throws an error if a repeated index is found.
   * @param index The index to check.
   * @param i The index of the operation in the operations array.
   */
  function throwOnRepeatedIndex(index: number, i: number) {
    if (indexMap.has(index)) {
      throw new Error(
        `Overlapping index found: ${index}\n at: \`operations[${i}]\`.`,
      );
    }
  }

  /**
   * Updates the index map with the provided index.
   * @param index The index to update.
   */
  function updateIndexes(index: number) {
    indexMap.set(index, true);
  }
}

function applyFlatOperation(operation: ArrayFlatOperation, arr: any[]) {
  if (operation.type === OperationType.Remove) {
    arr.splice(operation.index, 1);
  } else if (operation.type === 'replace' && operation.value) {
    arr.splice(operation.index, 1, ...[].concat(operation.value));
  } else if (operation.type === 'add' && operation.value) {
    arr.splice(operation.index, 0, ...[].concat(operation.value));
  }
  return arr;
}
