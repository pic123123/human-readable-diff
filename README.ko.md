# human-readable-diff

![npm version](https://img.shields.io/npm/v/human-readable-diff)
![license](https://img.shields.io/npm/l/human-readable-diff)
![bundle size](https://img.shields.io/bundlephobia/minzip/human-readable-diff)

객체 변경 사항을 사람이 읽기 쉬운 설명으로 변환해주는 **의존성 없는 경량** Node.js 유틸리티입니다.

[English Docs](./README.md)

## 특징

- 🪶 **Tiny (초경량)**: 런타임 의존성이 '0'입니다. Lodash나 Moment.js가 필요 없습니다.
- 🛡️ **Robust (안정성)**: 100% TypeScript로 작성되었으며 Strict 모드를 준수합니다.
- ⚡ **DX-First (개발자 경험)**: 복잡한 설정 없이 바로 사용할 수 있습니다.
- 🌍 **i18n (국제화)**: 한국어(ko)와 영어(en)를 기본 지원합니다.

## 설치

```bash
npm install human-readable-diff
# 또는
yarn add human-readable-diff
# 또는
pnpm add human-readable-diff
```

## 사용법

### 기본 사용법 (Pure JS/TS)

```typescript
import { getHumanDiff } from 'human-readable-diff';

const before = { price: 100, status: 'pending' };
const after = { price: 200, status: 'success' };

const diff = getHumanDiff(before, after);
console.log(diff);
// 출력 결과:
// [
//   "price changed from 100 to 200",
//   "status changed from 'pending' to 'success'"
// ]
```

### 중첩 객체 및 배열 처리

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

### 옵션: 제외(Exclude) 및 포맷터(Formatters)

```typescript
const diff = getHumanDiff(before, after, {
  exclude: ['id', 'updatedAt'], // 변경 감지에서 제외할 키
  formatters: {
    price: (val) => `${val.toLocaleString()}원` // 특정 키에 대한 포맷팅
  },
  lang: 'ko' // 한국어 출력
});
```

### NestJS 예제

Audit Log(감사 로그) 시스템 등에 쉽게 통합할 수 있습니다.

```typescript
import { Injectable } from '@nestjs/common';
import { getHumanDiff } from 'human-readable-diff';

@Injectable()
export class AuditService {
  logChange(oldEntity: any, newEntity: any) {
    const changes = getHumanDiff(oldEntity, newEntity, {
      exclude: ['password', 'createdAt'],
      lang: 'ko'
    });
    
    if (changes.length > 0) {
      console.log('변경된 엔티티:', changes);
      // DB 저장 로직...
    }
  }
}
```

## API REFERENCE

### `getHumanDiff(before, after, options?)`

- **before**: 변경 전 객체.
- **after**: 변경 후 객체.
- **options**:
  - `exclude`: 제외할 키 목록 (점 표기법 지원, 예: `user.password`).
  - `formatters`: 키별 커스텀 포맷터 함수 매핑.
  - `lang`: 'en' | 'ko' (기본값: 'en').

## 라이선스

ISC
