import { findRelevantBookmarks, flatBookmarks } from '../../../bookmarks';

const normalizeQueryText = (value = '') => {
  const text = String(value || '').trim();
  return text || null;
};

export const searchBookmarks = ({ queryText = null, limit = 8 }) => {
  if (!queryText) {
    return Promise.resolve(flatBookmarks.slice(0, limit));
  }

  return Promise.resolve(findRelevantBookmarks(queryText, limit));
};

export { normalizeQueryText };
