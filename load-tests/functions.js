const logHeaders = function (requestParams, context, ee, next) {
  console.log(requestParams);
  return next();
}

const logResponse = function (requestParams, response, context, ee, next) {
  console.log(response);
  return next();
}

const connectToWs = async function (params, context, next) {
  params.target = `${context.vars.wsTarget}`;
  const res = await fetch(`${context.vars.target}/o/docs/login?next=%2F`, {
    method: 'GET',
  });
  params.options.headers = {
    'Cookie': res.headers.getSetCookie().join('; '),
  };
  let reqId = 0;
  Object.defineProperty(context.vars, 'reqId', {
    get: function () {
      return reqId;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(context.vars, 'reqIdInc', {
    get: function () {
      return reqId++;
    },
    enumerable: true,
    configurable: true
  });
  return next();
};


const forgeScenario2ColumnsBody = function (requestParams, context, ee, next) {
  const regularColumns = [
    ...Array.from({ length: 19 }, (_, i) => {
      return {
        id: `column${i}`,
        fields: {
          label: `Column ${i}`,
        }
      }
    }),
    {
      id: 'column19',
      fields: {
        label: 'Column 19',
        type: "ChoiceList",
        widgetOptions: JSON.stringify({
          choices: Array.from({ length: 26 }, (_, i) => String.fromCharCode(0x61 + i)),
        }),
      }
    }
  ];
  const getFormula = (i) => [
    `str.upper($column${i})`,
    `str.lower($column${i})`,
    `str.capitalize($column${i})`,
    `len($column${i})`,
    `str.isalnum($column${i})`,
    `str.isalpha($column${i})`,
    `str.isdigit($column${i})`,
    `str.islower($column${i})`,
    `str.isupper($column${i})`,
    `str.join('', reversed($column${i}))`,
    `str.lstrip($column${i})`,
    `str.rstrip($column${i})`,
    `str.replace($column${i}, 'a', 'b')`,
    `str.split($column${i}, ' ')`,
    `str.startswith($column${i}, 'a')`,
    `str.endswith($column${i}, 'a')`,
    `str.swapcase($column${i})`,
    `str.encode($column${i}, 'utf-8')`,
    `str.index($column${i}, 'a')`,
    `len(Table1.lookupRecords(column19=CONTAINS('a')))`,
  ][i];
  const formulaColumns = Array.from({ length: 20 }, (_, i) => {
    return {
      id: `formula${i}`,
      fields: {
        label: `Formula ${i}`,
        isFormula: true,
        formula: getFormula(i),
        colId: `Formula${i}`,
      }
    };
  });
  requestParams.json = {
    "columns": [...regularColumns, ...formulaColumns],
  };
  return next();
}

module.exports = { connectToWs, logHeaders, logResponse, forgeScenario2ColumnsBody };
