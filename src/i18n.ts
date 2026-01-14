import type { LanguageMap } from './types';

export const en: LanguageMap = {
  changed: "'{key}' changed from '{from}' to '{to}'",
  added: "'{key}' added with value '{value}'",
  removed: "'{key}' removed (was '{value}')",
  arrayAdded: "'{key}' added item '{value}'",
  arrayRemoved: "'{key}' removed item '{value}'",
};

export const ko: LanguageMap = {
  changed: "'{key}' 값이 '{from}'에서 '{to}'(으)로 변경되었습니다",
  added: "'{key}' 값이 추가되었습니다: '{value}'",
  removed: "'{key}' 값이 삭제되었습니다 (이전 값: '{value}')",
  arrayAdded: "'{key}'에 항목이 추가되었습니다: '{value}'",
  arrayRemoved: "'{key}'에서 항목이 삭제되었습니다: '{value}'",
};

export const templates = { en, ko };
