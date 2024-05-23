/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const SnapshotWindow = t.iface([], {
  "count": "number",
  "unit": t.union(t.lit('days'), t.lit('month'), t.lit('year')),
});

export const Product = t.iface([], {
  "name": "string",
  "features": "Features",
});

export const Features = t.iface([], {
  "vanityDomain": t.opt("boolean"),
  "workspaces": t.opt("boolean"),
  "maxSharesPerDoc": t.opt("number"),
  "maxSharesPerDocPerRole": t.opt(t.iface([], {
    [t.indexKey]: "number",
  })),
  "maxSharesPerWorkspace": t.opt("number"),
  "maxDocsPerOrg": t.opt("number"),
  "maxWorkspacesPerOrg": t.opt("number"),
  "readOnlyDocs": t.opt("boolean"),
  "snapshotWindow": t.opt("SnapshotWindow"),
  "baseMaxRowsPerDocument": t.opt("number"),
  "baseMaxApiUnitsPerDocumentPerDay": t.opt("number"),
  "baseMaxDataSizePerDocument": t.opt("number"),
  "baseMaxAttachmentsBytesPerDocument": t.opt("number"),
  "gracePeriodDays": t.opt("number"),
  "baseMaxAssistantCalls": t.opt("number"),
  "minimumUnits": t.opt("number"),
});

export const StripeMetaValues = t.iface([], {
  "isStandard": t.opt("boolean"),
  "gristProduct": t.opt("string"),
  "gristLimit": t.opt("string"),
  "family": t.opt("string"),
  "trialPeriodDays": t.opt("number"),
});

const exportedTypeSuite: t.ITypeSuite = {
  SnapshotWindow,
  Product,
  Features,
  StripeMetaValues,
};
export default exportedTypeSuite;