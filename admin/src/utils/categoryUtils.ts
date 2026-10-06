import type { Category } from '../services/category.service';

export const getCategoryPath = (categories: Category[], categoryId: string): Category[] => {
  const path: Category[] = [];
  let current = categories.find(c => c.id === categoryId);
  while (current && current.parent_id) {
    const parent = categories.find(c => c.id === current!.parent_id);
    if (parent && !path.find(p => p.id === parent.id)) {
      path.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  return path;
};

export const getCategoryDepth = (categories: Category[], categoryId: string): number => {
  return getCategoryPath(categories, categoryId).length;
};

export const getCategoryLevelName = (categories: Category[], categoryId: string): string => {
  const depth = getCategoryDepth(categories, categoryId);
  if (depth === 0) return 'Principal';
  if (depth === 1) return '2do Nivel';
  return '3er Nivel';
};

export const getCategoryLevelBadgeColors = (depth: number) => {
  if (depth === 0) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (depth === 1) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-purple-700 bg-purple-50 border-purple-100';
};
