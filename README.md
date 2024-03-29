# Open Patcher

> A community library for patching JavaScript objects.

[![npm version](https://img.shields.io/npm/v/open-patcher.svg?style=flat-square)](https://www.npmjs.com/package/open-patcher)
[![License](https://img.shields.io/npm/l/open-patcher.svg?style=flat-square)](https://github.com/abelpz/open-patcher/blob/master/LICENSE)

Make changes to objects using JSON paths.

This library is designed to be flexible and extensible, allowing developers to easily apply changes to objects using JSON patches. It was built with the intention of being a collaborative effort, and we welcome contributions from the developer community to enhance its functionality and usability.

If you have any ideas, bug fixes, or feature requests, please feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/abelpz/open-patcher). Your contributions will be greatly appreciated!

## API Documentation

### `applyPatch({source, operations})`

Applies a patch (an array of operations) to the given object and returns the patched object.

#### Named Parameters

- `source` (Object): The object to be patched.
- `operations` (Array): An array of operations.

#### Returns

- (Object): The patched object.

#### Example

```js
import openPatcher from 'open-patcher';

const source = {
  name: 'John',
  age: 30,
  address: {
    city: 'New York',
    country: 'USA',
  },
  hobbies: [
    { name: 'Reading', type: 'Indoor' },
    { name: 'Hiking', type: 'Outdoor' },
  ],
};

const operations = [
  { type: 'add', path: '/name', value: 'Jane' },
  { type: 'replace', path: '/age', value: 35 },
  { type: 'remove', path: '/address/country' },
  {
    type: 'add',
    path: '/hobbies/1',
    value: { name: 'Swimming', type: 'Outdoor' },
  },
  { type: 'replace', path: '/hobbies/0/type', value: 'Indoor/Outdoor' },
  { type: 'remove', path: '/hobbies/1' },
];

const patchedObj = openPatcher.applyPatch({ source, operations });

console.log(patchedObj);

/* Output:
{
  "name": "Jane",
  "age": 35,
  "address": {
    "city": "New York"
  },
  "hobbies": [
    { "name": "Reading", "type": "Indoor/Outdoor" }
  ]
}
*/
```

### `applyOperation({source, operation})`

Applies a single patch operation to a source object or array.

#### Named Parameters

- `source`: The source object or array to be patched. This can be any JavaScript object or array.
- `operation`: The patch operation to apply. This should be an object that represents a patch operation. The exact structure of this object depends on the type of operation.

#### Returns

(Object): The patched object.

#### Example

```js
import openPatcher from 'open-patcher';

const source = [1, 2, 3];
const operation = { type: 'add', path: '/1', value: 4 };
const patchedObj = openPatcher.applyOperation({ source, operation });
console.log(patchedObj);
/* Output:
[1, 4, 2, 3]
*/
```

### `applyArrayPatch({source, operations, options})`

Applies a batch of operations to an array and returns the modified array.

#### Parameters

- `source`: The original array to be patched. This can be any JavaScript array.
- `operations`: The array of operations to apply. Each operation should be an object that represents a patch operation. The exact structure of this object depends on the type of operation.
- `options` (optional): An object with the following properties:
  - `chainOperations` (optional, default = false): A boolean that determines whether operations should be chained. If `true`, operations are applied in the order they appear in the `operations` array. If `false` or not provided, operations are sorted and applied in descending order to avoid index shifting during deletion.
  - `mutateSource` (optional, default = false): A boolean that determines whether the `source` array should be mutated. If `true`, the `source` array is modified in-place. If `false` or not provided, a new array is created and modified.

#### Returns

The updated source array after applying the patch operations. If `options.mutateSource` is `true`, this will be the same array as `source`. Otherwise, it will be a new array.

#### Example

```javascript
const source = [1, 2, 3];
const operations = [{ type: 'add', index: 1, value: 4 }];
const options = { chainOperations: false, mutateSource: false };
applyArrayPatch({ source, operations, options });
// returns [1, 4, 2, 3]
```

#### Notes

The returned patched object is a shallow clone of the source object. This means that only the affected nodes are cloned and modified, while non-affected nodes share references with the source object. Any mutations made to the patchedObj will also affect the source object. To avoid this, it is recommended to deeply clone the patchedObj before making any mutations.

## Contributing

We welcome contributions from the developer community to enhance the functionality and usability of this library. If you have any ideas, bug fixes, or feature requests, please feel free to open an issue or submit a pull request on our [GitHub repository](https://github.com/abelpz/open-patcher). Your contributions will be greatly appreciated!
