const logHeaders = function (requestParams, context, ee, next) {
  console.log(requestParams);
  return next();
}

const logResponse = function (requestParams, response, context, ee, next) {
  console.log(response);
  return next();
}

const connectToWs = function (params, context, next) {
  params.target = `${context.vars.wsTarget}`;
  params.headers = {
    'Authorization': `Bearer ${context.vars.bearer}`
  };
  let reqId = 0;
  Object.defineProperty(context.vars, 'reqId', {
    get: function () {
      return reqId++;
    },
    enumerable: true,
    configurable: true
  });
  return next();
};
module.exports = { connectToWs, logHeaders, logResponse };
