// Domain manager support: the domain-scoped token is used for Keystone calls only, and only for
// users whose management rights come from a domain role assignment.
jest.mock('utils/local-storage', () => {
  const store = {};
  return {
    getLocalStorageItem: (k) => store[k] || '',
    setLocalStorageItem: (k, v) => {
      store[k] = v;
    },
    clearLocalStorage: () => Object.keys(store).forEach((k) => delete store[k]),
    __store: store,
  };
});
jest.mock(
  'utils/cookie',
  () => () => String(Math.floor(Date.now() / 1000) + 3600)
);

const localStorage = require('utils/local-storage');
const { HttpRequest } = require('src/client/client/request');

const KEYSTONE = '/api/openstack/regionone/keystone';
const NOVA = '/api/openstack/regionone/nova';

describe('HttpRequest.addToken with a domain-scoped token', () => {
  let request;
  beforeEach(() => {
    localStorage.clearLocalStorage();
    localStorage.setLocalStorageItem('keystone_token', 'PROJECT-TOKEN');
    localStorage.setLocalStorageItem('domain_scope_token', 'DOMAIN-TOKEN');
    request = new HttpRequest();
  });

  it('uses the domain-scoped token on Keystone for a domain manager', () => {
    localStorage.setLocalStorageItem('domain_manager', '1');
    const config = { headers: {}, url: `${KEYSTONE}/v3/users` };
    request.addToken(config, KEYSTONE);
    expect(config.headers['X-Auth-Token']).toBe('DOMAIN-TOKEN');
  });

  it('keeps the project-scoped token on every other service', () => {
    localStorage.setLocalStorageItem('domain_manager', '1');
    const config = { headers: {}, url: `${NOVA}/v2.1/servers` };
    request.addToken(config, NOVA);
    expect(config.headers['X-Auth-Token']).toBe('PROJECT-TOKEN');
  });

  it('keeps the project-scoped token on Keystone for everybody else', () => {
    localStorage.setLocalStorageItem('domain_manager', '');
    const config = { headers: {}, url: `${KEYSTONE}/v3/users` };
    request.addToken(config, KEYSTONE);
    expect(config.headers['X-Auth-Token']).toBe('PROJECT-TOKEN');
  });

  it('never sends a domain token that does not exist', () => {
    localStorage.setLocalStorageItem('domain_manager', '1');
    localStorage.setLocalStorageItem('domain_scope_token', '');
    const config = { headers: {}, url: `${KEYSTONE}/v3/users` };
    request.addToken(config, KEYSTONE);
    expect(config.headers['X-Auth-Token']).toBe('PROJECT-TOKEN');
  });

  it('does not match "keystone" inside another path segment', () => {
    localStorage.setLocalStorageItem('domain_manager', '1');
    const config = { headers: {}, url: `${NOVA}/v2.1/keystone-named-server` };
    request.addToken(config, NOVA);
    expect(config.headers['X-Auth-Token']).toBe('PROJECT-TOKEN');
  });
});
