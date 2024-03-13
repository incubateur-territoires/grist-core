import {driver} from 'mocha-webdriver';
import * as gu from 'test/nbrowser/gristUtils';
import {server, setupTestSuite} from 'test/nbrowser/testUtils';

describe('LoginWithOIDC', function () {
  this.timeout(60000);
  setupTestSuite();
  gu.withEnvironmentSnapshot({
    get 'GRIST_OIDC_SP_HOST' () { return server.getHost(); },
    'GRIST_OIDC_IDP_ISSUER': 'http://localhost:8081/realms/grist',
    'GRIST_OIDC_IDP_CLIENT_ID': 'keycloak_clientid',
    'GRIST_OIDC_IDP_CLIENT_SECRET': 'keycloak_secret',
    'GRIST_OIDC_IDP_SCOPES': 'openid email profile',
    'GRIST_TEST_LOGIN': 0,
  });

  it('should login using OIDC', async () => {
    console.log("HERE");
    await driver.get(`${server.getHost()}/o/docs/login`);
    await driver.findWait('#kc-form-login', 10_000);
    await driver.find('#username').sendKeys('keycloackuser');
    await driver.find('#password').sendKeys('keycloakpassword');
    await driver.find('#kc-login').click();

    // await driver.wait(
    //   async () => {
    //     const url = await driver.getCurrentUrl();
    //     return url.startsWith(server.getHost());
    //   },
    //   20_000
    // );
    // await driver.find('.weasel-popup-open').click();
    // await gu.openAccountMenu();
    // assert.equal(await driver.find('.test-usermenu-name').getText(), 'keycloackuser');
    // assert.equal(await driver.find('.test-usermenu-email').getText(), 'keycloakuser@example.com');
    // await driver.find('.test-dm-log-out').click();
    // await driver.wait(
    //   async () => {
    //     const url = await driver.getCurrentUrl();
    //     return url.startsWith(`${server.getHost()}/o/docs/signed-out`);
    //   },
    //   20_000
    // );
    // assert.equal(await driver.find('.test-error-header').getText(), 'Signed out');
  });
});

