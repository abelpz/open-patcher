import { applyPatch } from './';
import { Operation, OperationType } from './types';
import { areObjectsRelated } from './utils';
describe('applyPatch with single operations', () => {
  it('should apply patch delete operation over an array correctly', () => {
    const source = [1, 2, 3, 4, 5];
    const operations: Operation[] = [
      { type: OperationType.Remove, path: '/2' },
    ];
    const expectedResult = [1, 2, 4, 5];
    const result = applyPatch({
      source: source,
      operations,
    });
    expect(result).toEqual(expectedResult);
    expect(source.length).toBe(result.length + 1);
  });

  it('should apply patch add operation over an array correctly', () => {
    const source = [1, 2, 3, 4, 5];
    const operations: Operation[] = [
      { type: OperationType.Add, path: '/2', value: 6 },
    ];
    const expectedResult = [1, 2, 6, 3, 4, 5];
    const result = applyPatch({
      source: source,
      operations,
    });
    expect(result).toEqual(expectedResult);
    expect(source.length).toBe(result.length - 1);
  });

  it('should apply patch replace operation over an array correctly', () => {
    const source = [1, 2, 3, 4, 5];
    const operations: Operation[] = [
      { type: OperationType.Replace, path: '/2', value: 6 },
    ];
    const expectedResult = [1, 2, 6, 4, 5];
    const result = applyPatch({
      source: source,
      operations,
    });
    expect(result).toEqual(expectedResult);
    expect(source.length).toBe(result.length);
  });

  it('should apply patch remove operation over a plain object correctly', () => {
    const source = {
      name: 'John Doe',
      age: 30,
      email: 'johndoe@example.com',
    };
    const operations: Operation[] = [
      { type: OperationType.Remove, path: '/age' },
    ];
    const expectedResult = {
      name: 'John Doe',
      email: 'johndoe@example.com',
    };
    const result = applyPatch({
      source: source,
      operations,
    });
    expect(result).toEqual(expectedResult);
    expect(Object.keys(source).length).toBe(Object.keys(result).length + 1);
  });

  it('should apply patch add operation over a plain object correctly', () => {
    const source = {
      name: 'John Doe',
      age: 30,
      email: 'johndoe@example.com',
    };
    const operations: Operation[] = [
      { type: OperationType.Add, path: '/country', value: 'USA' },
    ];
    const expectedResult = {
      name: 'John Doe',
      age: 30,
      email: 'johndoe@example.com',
      country: 'USA',
    };
    const result = applyPatch({
      source: source,
      operations,
    });
    expect(result).toEqual(expectedResult);
    expect(result.country).toBe('USA');
    expect(Object.keys(source).length).toBe(Object.keys(result).length - 1);
  });

  it('should apply patch replace operation over a plain object correctly', () => {
    const source = {
      name: 'John Doe',
      age: 30,
      email: 'johndoe@example.com',
      country: 'USA',
    };
    const operations: Operation[] = [
      { type: OperationType.Replace, path: '/country', value: 'Canada' },
    ];
    const expectedResult = {
      name: 'John Doe',
      age: 30,
      email: 'johndoe@example.com',
      country: 'Canada',
    };
    const result = applyPatch({
      source: source,
      operations,
    });
    expect(result).toEqual(expectedResult);
    expect(result.country).toBe('Canada');
    expect(Object.keys(source).length).toBe(Object.keys(result).length);
  });
});

describe('applyPatch with multiple operations', () => {
  const source = {
    name: 'John Doe',
    age: 30,
    email: 'johndoe@example.com',

    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
    projects: [
      { name: 'Project A', status: 'completed', team: ['Alice', 'Bob'] },
      {
        name: 'Project B',
        status: 'in progress',
        team: ['Charlie', 'David'],
      },
      { name: 'Project C', status: 'in progress', team: ['Eve'] },
    ],

    isEmployed: true,
    children: null,
    clients: [
      { name: 'Client A', status: 'active' },
      { name: 'Client B', status: 'inactive' },
    ],
  };

  const sourceCloned = JSON.parse(JSON.stringify(source));

  const operations: Operation[] = [
    { type: OperationType.Add, path: '/projects/0/team/-', value: 'Eve' },
    { type: OperationType.Remove, path: '/projects/1/team/0' },
    {
      type: OperationType.Replace,
      path: '/projects/2',
      value: {
        name: 'Project D',
        status: 'pending approval',
        team: ['Bruce'],
      },
    },

    { type: OperationType.Add, path: '/address/country', value: 'USA' },
    {
      type: OperationType.Replace,
      path: '/projects/1/status',
      value: 'completed',
    },
    { type: OperationType.Remove, path: '/children' },
  ];

  const expectedResult = {
    name: 'John Doe',
    age: 30,
    email: 'johndoe@example.com',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    projects: [
      {
        name: 'Project A',
        status: 'completed',
        team: ['Alice', 'Bob', 'Eve'],
      },
      {
        name: 'Project B',
        status: 'completed',
        team: ['David'],
      },
      {
        name: 'Project D',
        status: 'pending approval',
        team: ['Bruce'],
      },
    ],
    isEmployed: true,
    clients: [
      { name: 'Client A', status: 'active' },
      { name: 'Client B', status: 'inactive' },
    ],
  };
  const result = applyPatch<typeof source>({ source, operations });

  it('should return a shallow copy of the source object', () => {
    expect(sourceCloned).toEqual(source);
    expect(areObjectsRelated(source, sourceCloned)).toBe(false);
    expect(result).not.toBe(source);
    expect(areObjectsRelated(source, result)).toBe(true);
    expect(result.clients).toBe(source.clients);
    expect(result.projects).not.toBe(source.projects);
  });

  it('should apply multiple patch operations over complex object correctly', () => {
    expect(result).toEqual(expectedResult);
  });
});
