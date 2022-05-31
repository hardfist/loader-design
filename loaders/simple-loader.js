async function resolve(id, context, next) {
  const result = await next(id, context, next);
  console.log({ result });
  return {
    ...result,
    format: 'module',
  };
}
module.exports = {
  resolve,
};
