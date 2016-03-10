import selectn from 'selectn';

const config = typeof clientConfig === 'object' ? clientConfig : Object.create(null);

config.get = key => {
  const c = selectn(key, config);
  if (typeof c === 'undefined') {
    throw Error(`${key} not defined`);
  }

  return c;
};

export default config;
