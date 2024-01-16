module.exports = { logHeaders, logResponse, generateReqId };
function logHeaders(requestParams, context, ee, next) {
  console.log(requestParams);
  return next();
}

function logResponse(requestParams, response, context, ee, next) {
  console.log(response);
  return next();
}

function generateReqId(requestParams, context, ee, next) {
  let reqId = 0;
  Object.defineProperty(context.vars, 'reqId', {
    get: function () {
      return reqId++;
    },
    enumerable: true,
    configurable: true
  });
  return next();
}


