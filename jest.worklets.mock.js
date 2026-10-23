/* eslint-env node, es2020 */
/* global globalThis */
'use strict';

const NOOP = () => {};
const NOOP_FACTORY = () => NOOP;
const ID = (value) => value;
const IMMEDIATE_CALLBACK_INVOCATION = (callback) =>
  typeof callback === 'function' ? callback() : callback;

globalThis._WORKLET = false;
globalThis.__RUNTIME_KIND = 1;
globalThis._log = console.log;
globalThis._getAnimationTimestamp = () => Date.now();

const WorkletAPI = {
  callMicrotasks: NOOP,
  createSerializable: ID,
  createShareable: (_hostRuntimeId, initial) => ({
    isHost: false,
    __shareableRef: true,
    getAsync: () => Promise.resolve(initial),
    getSync: () => initial,
    setAsync: NOOP,
    setSync: NOOP,
  }),
  createSynchronizable: (initialValue) => ({
    __synchronizableRef: true,
    getDirty: () => initialValue,
    getBlocking: () => initialValue,
    setBlocking: NOOP,
    lock: NOOP,
    unlock: NOOP,
  }),
  createWorkletRuntime: NOOP_FACTORY,
  executeOnUIRuntimeSync: ID,
  getCurrentThreadId: () => '0',
  getDynamicFeatureFlag: () => false,
  getRuntimeKind: () => 1,
  getStaticFeatureFlag: () => false,
  getUIRuntimeHolder: () => ({}),
  getUISchedulerHolder: () => ({}),
  isBundleModeEnabled: () => false,
  isRNRuntime: () => true,
  isSerializableRef: ID,
  isShareable: (value) =>
    typeof value === 'object' && value !== null && !!value.__shareableRef,
  isShareableRef: () => true,
  isSynchronizable: () => false,
  isUIRuntime: () => false,
  isWorkerRuntime: () => false,
  isWorkletFunction: () => false,
  isWorkletRuntime: () => false,
  makeShareable: ID,
  makeShareableCloneOnUIRecursive: ID,
  makeShareableCloneRecursive: ID,
  registerCustomSerializable: NOOP,
  runOnJS: (fun) => (...args) => (fun ? fun(...args) : undefined),
  runOnRuntime: ID,
  runOnRuntimeAsync: (_rt, worklet, ...args) =>
    Promise.resolve(worklet ? worklet(...args) : undefined),
  runOnRuntimeAsyncWithId: (_id, worklet, ...args) =>
    Promise.resolve(worklet ? worklet(...args) : undefined),
  runOnRuntimeSync: (_rt, worklet, ...args) =>
    worklet ? worklet(...args) : undefined,
  runOnRuntimeSyncWithId: (_id, worklet, ...args) =>
    worklet ? worklet(...args) : undefined,
  runOnUI: (worklet) => (...args) => (worklet ? worklet(...args) : undefined),
  runOnUIAsync: (worklet, ...args) =>
    Promise.resolve(worklet ? worklet(...args) : undefined),
  runOnUISync: IMMEDIATE_CALLBACK_INVOCATION,
  RuntimeKind: { ReactNative: 1, UI: 2 },
  scheduleOnRN: (fun, ...args) => (fun ? fun(...args) : undefined),
  scheduleOnRuntime: IMMEDIATE_CALLBACK_INVOCATION,
  scheduleOnRuntimeWithId: (_id, worklet, ...args) =>
    worklet ? worklet(...args) : undefined,
  scheduleOnUI: (worklet, ...args) => (worklet ? worklet(...args) : undefined),
  serializableMappingCache: new Map(),
  setDynamicFeatureFlag: NOOP,
  shareableMappingCache: new Map(),
  toggleSlowAnimationsOnUIRuntime: () => false,
  UIRuntimeId: 2,
  WorkletsModule: {},
};

module.exports = {
  __esModule: true,
  ...WorkletAPI,
  default: WorkletAPI,
};
