import Checkers, {Features as FeaturesTi} from './Features-ti';
import {CheckerT, createCheckers} from 'ts-interface-checker';
import defaultsDeep from 'lodash/defaultsDeep';

export interface SnapshotWindow {
  count: number;
  unit: 'days' | 'month' | 'year';
}

// Information about the product associated with an org or orgs.
export interface Product {
  name: string;
  features: Features;
}


// A product is essentially a list of flags and limits that we may enforce/support.
export interface Features {
  vanityDomain?: boolean;   // are user-selected domains allowed (unenforced) (default: true)

  workspaces?: boolean;     // are workspaces shown in web interface (default: true)
                            // (this was intended as something we can turn off to shut down
                            // web access to content while leaving access to billing)

  /**
   * Some optional limits.  Since orgs can change plans, limits will typically be checked
   * at the point of creation.  E.g. adding someone new to a document, or creating a
   * new document.  If, after an operation, the limit would be exceeded, that operation
   * is denied.  That means it is possible to exceed limits if the limits were not in
   * place when shares/docs were originally being added.  The action that would need
   * to be taken when infringement is pre-existing is not so obvious.
   */

  maxSharesPerDoc?: number; // Maximum number of users that can be granted access to a
                            // particular doc.  Doesn't count users granted access at
                            // workspace or organization level.  Doesn't count billable
                            // users if applicable (default: unlimited)

  maxSharesPerDocPerRole?: {[role: string]: number};  // As maxSharesPerDoc, but
                            // for specific roles.  Roles are named as in app/common/roles.
                            // Applied independently to maxSharesPerDoc.
                            // (default: unlimited)
  maxSharesPerWorkspace?: number;  // Maximum number of users that can be granted access to
                            // a particular workspace.  Doesn't count users granted access
                            // at organizational level, or billable users (default: unlimited)

  maxDocsPerOrg?: number;   // Maximum number of documents allowed per org.
                            // (default: unlimited)
  maxWorkspacesPerOrg?: number;   // Maximum number of workspaces allowed per org.
                            // (default: unlimited)

  readOnlyDocs?: boolean;   // if set, docs can only be read, not written.

  snapshotWindow?: SnapshotWindow;  // if set, controls how far back snapshots are kept.

  baseMaxRowsPerDocument?: number;  // If set, establishes a default maximum on the
                                 // number of rows (total) in a single document.
                                 // Actual max for a document may be higher.
  baseMaxApiUnitsPerDocumentPerDay?: number;  // Similar for api calls.
  baseMaxDataSizePerDocument?: number;  // Similar maximum for number of bytes of 'normal' data in a document
  baseMaxAttachmentsBytesPerDocument?: number;  // Similar maximum for total number of bytes used
                                                // for attached files in a document

  gracePeriodDays?: number;  // Duration of the grace period in days, before entering delete-only mode

  baseMaxAssistantCalls?: number; // Maximum number of AI assistant calls. Defaults to 0 if not set, use -1 to indicate
                                  // unbound limit. This is total limit, not per month or per day, it is used as a seed
                                  // value for the limits table. To create a per-month limit, there must be a separate
                                  // task that resets the usage in the limits table.
  minimumUnits?: number; // Minimum number of units for the plan. Default no minimum.
}

/**
 * Returns a merged set of features, combining the features of the given objects.
 * If all objects are null, returns null.
 */
export function mergedFeatures(...features: (Features|null)[]): Features|null {
  const filledIn = features.filter(Boolean) as Features[];
  if (!filledIn.length) { return null; }
  return filledIn.reduce((acc: Features, f) => defaultsDeep(acc, f), {});
}


/**
 * Other meta values stored in Stripe Price or Product metadata.
 */
export interface StripeMetaValues {
  isStandard?: boolean;
  gristProduct?: string;
  gristLimit?: string;
  family?: string;
  trialPeriodDays?: number;
}

export const FeaturesChecker = createCheckers(Checkers).Features as CheckerT<Features>;
export const StripeMetaValuesChecker = createCheckers(Checkers).StripeMetaValues as CheckerT<StripeMetaValues>;

/**
 * Method takes arbitrary record and returns Features object, trimming any unknown fields.
 * It mutates the input record.
 */
export function parseStripeFeatures(record: Record<string, any>): Features {
  // Stripe metadata can contain many more values that we don't care about, so we just
  // filter out the ones we do care about.
  const validProps = new Set(FeaturesTi.props.map(p => p.name));
  for (const key in record) {

    // If this is unknown property, remove it.
    if (!validProps.has(key)) {
      delete record[key];
      continue;
    }

    const value = record[key];
    const tester = FeaturesChecker.getProp(key);
    // If the top level property is invalid, just remove it.
    if (!tester.strictTest(value)) {
      // There is an exception for 1 and 0, if the target type is boolean.
      switch (value) {
        case 1:
          record[key] = true;
          break;
        case 0:
          record[key] = false;
          break;
      }
      // Test one more time, if it is still invalid, remove it.
      if (!tester.strictTest(record[key])) {
        delete record[key];
      }
    }
  }
  return record;
}

// Check whether it is possible to add members at the org level.  There's no flag
// for this right now, it isn't enforced at the API level, it is just a bluff.
// For now, when maxWorkspacesPerOrg is 1, we should assume members can't be added
// to org (even though this is not enforced).
export function canAddOrgMembers(features: Features): boolean {
  return features.maxWorkspacesPerOrg !== 1;
}

// Grist is aware only about those plans.
// Those plans are synchronized with database only if they don't exists currently.
export const PERSONAL_FREE_PLAN = 'personalFree';
export const TEAM_FREE_PLAN = 'teamFree';

// This is a plan for suspended users.
export const SUSPENDED_PLAN = 'suspended';

// This is virtual plan for anonymous users.
export const ANONYMOUS_PLAN = 'anonymous';
// This is free plan. Grist doesn't offer a way to create it using API, but
// it can be configured as a substitute for any other plan using environment variables (like DEFAULT_TEAM_PLAN)
export const FREE_PLAN = 'Free';

// This is a plan for temporary org, before assigning a real plan.
export const STUB_PLAN = 'stub';

// Legacy free personal plan, which is not available anymore or created in new instances, but used
// here for displaying purposes and in tests.
export const PERSONAL_LEGACY_PLAN = 'starter';

// Pro plan for team sites (first tier). It is generally read from Stripe, but we use it in tests, so
// by default all installation have it. When Stripe updates it, it will be synchronized with Grist.
export const TEAM_PLAN = 'team';


export const displayPlanName: { [key: string]: string } = {
  [PERSONAL_FREE_PLAN]: 'Free Personal',
  [TEAM_FREE_PLAN]: 'Team Free',
  [SUSPENDED_PLAN]: 'Suspended',
  [ANONYMOUS_PLAN]: 'Anonymous',
  [FREE_PLAN]: 'Free',
  [TEAM_PLAN]: 'Pro'
} as const;

// Returns true if `planName` is for a legacy product.
export function isLegacyPlan(planName: string): boolean {
  return planName === PERSONAL_LEGACY_PLAN;
}

// Returns true if `planName` is for a free personal product.
export function isFreePersonalPlan(planName: string): boolean {
  return [PERSONAL_LEGACY_PLAN, PERSONAL_FREE_PLAN].includes(planName);
}

/**
 * Actually all known plans don't require billing (which doesn't mean they are free actually, as it can
 * be overridden by Stripe). There are also pro (team) and enterprise plans, which are billable, but they are
 * read from Stripe.
 */
export function isFreePlan(planName: string): boolean {
  switch (planName) {
    case PERSONAL_LEGACY_PLAN:
    case PERSONAL_FREE_PLAN:
    case TEAM_FREE_PLAN:
    case FREE_PLAN:
    case ANONYMOUS_PLAN:
      return true;
    default:
      return false;
  }
}

/**
 * Are the plan limits managed by Grist.
 */
export function isManagedPlan(planName: string): boolean {
  switch (planName) {
    case PERSONAL_LEGACY_PLAN:
    case PERSONAL_FREE_PLAN:
    case TEAM_FREE_PLAN:
    case FREE_PLAN:
    case SUSPENDED_PLAN:
    case ANONYMOUS_PLAN:
    case STUB_PLAN:
      return true;
    default:
      return false;
  }
}
