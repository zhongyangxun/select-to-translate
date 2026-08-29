import {
  DICT_PROD_PRECONNECT_URL,
  TRANSLATE_PROD_PRECONNECT_URL,
} from '../lib/api';
import { IS_DEV } from '../lib/build-env';

// preconnect to the API servers in production to warm up the connection
export const preconnect = () => {
  // only preconnect in production
  if (IS_DEV) return Promise.resolve();

  const preconnectLinks = [
    DICT_PROD_PRECONNECT_URL,
    TRANSLATE_PROD_PRECONNECT_URL,
  ];

  return Promise.allSettled(preconnectLinks.map((link) => fetch(link)));
};
