# human-readable-diff

![npm version](https://img.shields.io/npm/v/human-readable-diff)
![license](https://img.shields.io/npm/l/human-readable-diff)
![bundle size](https://img.shields.io/bundlephobia/minzip/human-readable-diff)

A **zero-dependency**, **lightweight** Node.js utility to generate human-readable descriptions of object changes.

[한국어 문서 (Korean Docs)](./README.ko.md)

## Why this?

- 🪶 **Tiny**: Zero runtime dependencies. No Lodash, No Moment.js.
- 🛡️ **Robust**: 100% TypeScript with strict types.
- ⚡ **DX-First**: Immediate usage with zero config.
- 🌍 **i18n Support**: Built-in support for English and Korean.

## Installation

```bash
npm install human-readable-diff
# or
yarn add human-readable-diff
# or
pnpm add human-readable-diff
```

## Usage

### Basic Usage (Pure JS/TS)

```typescript
import { getHumanDiff } from 'human-readable-diff';

const before = { price: 100, status: 'pending' };
const after = { price: 200, status: 'success' };

const diff = getHumanDiff(before, after);
console.log(diff);
// Output:
// [
//   "price changed from 100 to 200",
//   "status changed from 'pending' to 'success'"
// ]
```

### With Nested Objects & Arrays

```typescript
const before = {
  user: { name: 'Alice', tags: ['admin'] }
};
const after = {
  user: { name: 'Alice', tags: ['admin', 'super-user'] }
};

const diff = getHumanDiff(before, after);
console.log(diff);
// [ "user.tags added item 'super-user'" ]
```

### Options: Exclude & Formatters

```typescript
const diff = getHumanDiff(before, after, {
  exclude: ['id', 'updatedAt'],
  formatters: {
    price: (val) => `$${val.toFixed(2)}`
  }
});
```

### NestJS Example

Easily integrate into your services for audit logs.

```typescript
import { Injectable } from '@nestjs/common';
import { getHumanDiff } from 'human-readable-diff';

@Injectable()
export class AuditService {
  logChange(oldEntity: any, newEntity: any) {
    const changes = getHumanDiff(oldEntity, newEntity, {
      exclude: ['password', 'createdAt']
    });
    
    if (changes.length > 0) {
      console.log('Entity updated:', changes);
      // Save to database...
    }
  }
}
```

## API

### `getHumanDiff(before, after, options?)`

- **before**: Original object.
- **after**: New object.
- **options**:
  - `exclude`: Array of strings (dot notation supported) to ignore.
  - `formatters`: Object mapping keys to formatter functions.
  - `lang`: 'en' | 'ko' (default: 'en').

## License

ISC
