import { formatValue } from './formatters';
import { templates } from './i18n';
import type { DiffOptions, LanguageMap } from './types';

// Helper to check if a value is a plain object
const isObject = (val: any): boolean =>
  val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date);

const isDate = (val: any): boolean => val instanceof Date;

export function getHumanDiff(
  before: any,
  after: any,
  options: DiffOptions = {},
  prefix = ''
): string[] {
  const changes: string[] = [];
  const langAsString = options.lang || 'en';
  const tmpl: LanguageMap = templates[langAsString] || templates.en;
  
  // Formatters
  const format = (val: any, k?: string) => {
    if (k && options.formatters && options.formatters[k]) {
      return options.formatters[k](val);
    }
    // Check if there is a formatter for the specific full path
    if (prefix && options.formatters && options.formatters[prefix]) { 
       // This logic might need refinement: do we match full dot path? 
       // Let's assume options.formatters keys match the dot path or just property name?
       // The requirement wasn't specific, but usually property name or path.
       // Let's stick to global property name match or path match.
    }
    return formatValue(val);
  };

  const processTemplate = (template: string, replacements: Record<string, string>) => {
    return template.replace(/{(\w+)}/g, (_, key) => replacements[key] || '');
  };

  // Helper to push change
  const addChange = (
    type: keyof LanguageMap,
    key: string,
    vals: { from?: any; to?: any; value?: any }
  ) => {
    const pKey = prefix ? `${prefix}.${key}` : key;
    // Check exclude
    if (options.exclude?.some((ex) => pKey === ex || pKey.startsWith(`${ex}.`))) {
      return;
    }

    const replacements: Record<string, string> = {
      key: pKey,
      from: format(vals.from, key),
      to: format(vals.to, key),
      value: format(vals.value, key),
    };
    changes.push(processTemplate(tmpl[type], replacements));
  };

  // 1. Handle primitive mismatches or null/undefined immediately
  if (before === after) return []; // strict equality check

  // If one is null/undefined and strict check failed
  if ((before === null || before === undefined) && (after !== null && after !== undefined)) {
     // Treat as root level change if prefix is empty? Or just return raw change?
     // If we are deep in recursion, this is handled by key iteration.
     // But if this is top-level call:
     // getHumanDiff(null, {a:1}) -> we can't really "traverse" keys of null.
     // So we just report the whole object changed?
     // Or we treat it as "property x changed from null to..."
     // If this is top level, we might just return "Value changed from null to [object Object]"
     // Let's assume the top level objects are usually objects.
  }

  // 2. Arrays
  if (Array.isArray(before) && Array.isArray(after)) {
    // Detect additions and removals
    // Naive approach for simple lists:
    // If primitives, use inclusion.
    // If objects, this is hard without IDs. 
    // Requirement: "Detect added and removed items intelligently"
    // Let's just do a simple "item present" check for primitives, and maybe strict equality for objects?
    
    // Check removed items
    for (const item of before) {
      if (!after.includes(item)) {
         // Should we format the whole item?
         // For objects, formatValue does JSON.stringify
         // We might want to filter this check if duplicates exist, but "includes" is simple.
         // Wait, strict inclusion for objects might fail if they are new references but same content.
         // We should probably rely on JSON stringify for uniqueness check if meaningful?
         // Let's try deep equality check? No, simple strict equality for now or formatted string comparison.
         
         // Let's use stringified comparison for "value" based check to be robust for objects
         const itemStr = JSON.stringify(item);
         const afterStrs = after.map(x => JSON.stringify(x));
         if (!afterStrs.includes(itemStr)) {
            // Check exclude (no key for array items directly... maybe use parent key?)
            // If prefix IS the array name.
            if (options.exclude?.includes(prefix)) return changes; // Whole array excluded?
            
            // "arrayRemoved": "'{key}' removed item '{value}'"
            const replacements: Record<string, string> = {
                key: prefix || 'root', // root array?
                value: format(item)
            };
            changes.push(processTemplate(tmpl.arrayRemoved, replacements));
         }
      }
    }

    // Check added items
    for (const item of after) {
       const itemStr = JSON.stringify(item);
       const beforeStrs = before.map(x => JSON.stringify(x));
       if (!beforeStrs.includes(itemStr)) {
          if (options.exclude?.includes(prefix)) return changes; 
          const replacements: Record<string, string> = {
              key: prefix || 'root',
              value: format(item)
          };
          changes.push(processTemplate(tmpl.arrayAdded, replacements));
       }
    }
    return changes;
  }

  // 3. Objects
  if (isObject(before) && isObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    
    for (const key of keys) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      // Exclude check
      if (options.exclude?.includes(fullPath)) continue;

      const valBefore = before[key];
      const valAfter = after[key];

      // Both strictly equal?
      if (valBefore === valAfter) continue;

      // Existence check
      if (!(key in before)) {
        addChange('added', key, { value: valAfter });
        continue;
      }
      if (!(key in after)) {
        addChange('removed', key, { value: valBefore });
        continue;
      }

      // If one is object and other is not -> Type changed (covered by not isObject check usually?)
      // Recurse if both are objects (and not null/date/array handled above)
      if (isObject(valBefore) && isObject(valAfter)) {
        changes.push(...getHumanDiff(valBefore, valAfter, options, fullPath));
      } else if (Array.isArray(valBefore) && Array.isArray(valAfter)) {
        changes.push(...getHumanDiff(valBefore, valAfter, options, fullPath));
      } else if (isDate(valBefore) && isDate(valAfter)) {
        if (valBefore.getTime() !== valAfter.getTime()) {
           addChange('changed', key, { from: valBefore, to: valAfter });
        }
      } else {
        // Primitive change or Type mismatch
        // Check deep equality for non-primitive if validation slipped? 
        // We already did "===" check.
        // If values are different:
        addChange('changed', key, { from: valBefore, to: valAfter });
      }
    }
    return changes;
  }

  // 4. Top-level primitive or mixed type change (e.g. number -> string, or null -> object)
  // If we are here, at least one is not an object/array, or types mismatched.
  const replacements: Record<string, string> = {
      key: prefix || 'root',
      from: format(before),
      to: format(after)
  };
  changes.push(processTemplate(tmpl.changed, replacements));

  return changes;
}
