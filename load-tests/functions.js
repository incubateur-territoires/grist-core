const {log} = require("console");
const crypto = require("crypto");
const fs = require("fs");
const assert = require("assert");
const path = require("path");
const { blob } = require("node:stream/consumers");

const logHeaders = function (requestParams, context, ee, next) {
  console.log(requestParams); return next();
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

function forgeWorkspaceName(requestParams, context, ee, next) {
  context.vars.workspaceName = `load-test-${crypto.randomUUID().substring(0, 8)}`;
  requestParams.json = {
    "name": context.vars.workspaceName,
  };
  console.log('context.vars.workspaceName = ', context.vars.w);
  return next();
}

async function importHeavyDocument(context, ee, next) {
  const headers = {
    'Authorization': `Bearer ${context.vars.token}`,
  };
  const { docWorkerUrl, selfPrefix } = await (async function () {
    const res = await fetch(`${context.vars.target}/api/worker/import`, {
      method: 'GET',
      headers,
    });
    assert.equal(res.status, 200, res.statusText);
    return res.json();
  })();

  const importUrl = docWorkerUrl ?? `${context.vars.target}${selfPrefix}`;

  const { uploadId } = await (async function () {
    const url = `${importUrl}/o/docs/uploads`;
    const formData = new FormData();
    const filename = path.resolve(__dirname, './assets/heavy-doc.grist');
    formData.append('upload', await blob(fs.createReadStream(filename)), path.basename(filename));
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    assert.equal(res.status, 200, res.statusText);
    return res.json();
  })();

  const { id: docId } = await (async function () {

    const res = await fetch(`${importUrl}/o/docs/api/workspaces/${context.vars.workspaceId}/import`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uploadId }),
    });
    assert.equal(res.status, 200, res.statusText);
    return res.json();
  })();

  context.vars.heavyDocId = docId;

  return next();
}


module.exports = { importHeavyDocument, logHeaders, logResponse, forgeScenario2ColumnsBody, forgeWorkspaceName };
