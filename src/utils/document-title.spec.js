import {
  getDocumentTitle,
  getRouteTitle,
  getSiteTitle,
} from './document-title';

describe('test document title', () => {
  it('getSiteTitle', () => {
    expect(getSiteTitle({ title: { en: 'Skyline' } })).toBe('Skyline');
    expect(getSiteTitle()).toBe('Cloud');
  });

  it('getRouteTitle', () => {
    const routes = [{ name: 'Compute' }, { name: 'Instances' }];
    expect(getRouteTitle(routes)).toBe('Instances - Compute');
  });

  it('getDocumentTitle', () => {
    const routes = [{ name: 'Compute' }, { name: 'Instances' }];
    expect(getDocumentTitle(routes, 'Cloud')).toBe(
      'Instances - Compute - Cloud'
    );
    expect(getDocumentTitle([], 'Cloud')).toBe('Cloud');
  });
});
