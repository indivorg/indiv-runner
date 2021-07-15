import url = require('url');

export interface ParseUriResponse {
  service: string;
  port: number;
  path?: string;
}

export const parseUri = (uri: string): ParseUriResponse => {
  if (uri.match(/\//)) {
    const a = new url.URL(uri);
    return {
      service: a.host,
      port: Number(a.port) || 80,
      path: a.pathname,
    };
  }

  const [service, port] = uri.split(':');

  return {
    service,
    port: Number(port),
  };
};
