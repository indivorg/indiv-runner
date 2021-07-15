import { parseUri } from '../parse-uri';

describe('parse uri', () => {
  it('should parse service-tenant:8080', () =>
    expect(parseUri('service-tenant:8080')).toMatchInlineSnapshot(`
Object {
  "port": 8080,
  "service": "service-tenant",
}
`));
  it('should parse https://vg.no/hello-there', () =>
    expect(parseUri('https://vg.no/hello-there')).toMatchInlineSnapshot(`
Object {
  "path": "/hello-there",
  "port": 80,
  "service": "vg.no",
}
`));
});
