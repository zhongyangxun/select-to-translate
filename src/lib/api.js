import { IS_DEV } from './build-env.js';

export const DICT_LOCAL_BASE = 'http://127.0.0.1:8789';
export const DICT_PROD_BASE = 'https://dict.joeyzcode.com';
export const DICT_LOOKUP_PATH = '/lookup';
export const DICT_LOCAL_LOOKUP_URL = `${DICT_LOCAL_BASE}${DICT_LOOKUP_PATH}`;
export const DICT_PROD_LOOKUP_URL = `${DICT_PROD_BASE}${DICT_LOOKUP_PATH}`;

export const DICT_LOOKUP_URL = IS_DEV
  ? DICT_LOCAL_LOOKUP_URL
  : DICT_PROD_LOOKUP_URL;

export const DICT_PROD_PRECONNECT_URL = `${DICT_PROD_BASE}/health`;

export const TRANSLATE_LOCAL_BASE = 'http://127.0.0.1:8787';
export const TRANSLATE_PROD_BASE = 'https://translate.joeyzcode.com';
export const TRANSLATE_PATH = '/translate';
export const TRANSLATE_LOCAL_URL = `${TRANSLATE_LOCAL_BASE}${TRANSLATE_PATH}`;
export const TRANSLATE_PROD_URL = `${TRANSLATE_PROD_BASE}${TRANSLATE_PATH}`;
export const TRANSLATE_URL = IS_DEV ? TRANSLATE_LOCAL_URL : TRANSLATE_PROD_URL;

export const TRANSLATE_PROD_PRECONNECT_URL = `${TRANSLATE_PROD_BASE}/health`;

export const DAILY_QUOTA_EXCEEDED_CODE = 'DAILY_QUOTA_EXCEEDED';
