import type { Formatter } from './types';

export const formatValue: Formatter = (value: any): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
     // Fallback for objects that are not dates (though deep diff should handle nested objects, 
     // this is for leaf values in array changes or if we hit a non-traversable object)
     return JSON.stringify(value);
  }

  return String(value);
};
