/* eslint no-console: off */
import * as k8s from '@kubernetes/client-node';
import invariant from 'ts-invariant';
import { parseUri } from './parse-uri';
import { portForward } from './port-forward';

export interface RunnerArguments {
  namespace?: string;
  command?: string;
  logger?: (message: string | Buffer) => void;
}

/**
 *
 * Indiv Runner has a few simple responsibilities,
 * 1) Get all the services from a well-known configMap
 * 2) Parse the configMap (function is in parse-uri.ts)
 * 3) Forward ports for the services (function is in port-forward.ts)
 * 4) Create a Map with environment variables that can be
 *    consumed by a local running app.
 *
 * @param args: RunnerArguments
 * @returns a Map with all environment variables
 */
export const runner = async (args: RunnerArguments = {}): Promise<Record<string, string>> => {
  const { namespace = 'indiv-prod', logger = console.log } = args;

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const core = kc.makeApiClient(k8s.CoreV1Api);

  const {
    body: { data },
  } = await core.readNamespacedConfigMap('service-env-config', namespace);
  invariant(data, 'service-env-config was not found');

  const environment = new Map();

  for (const [key, uri] of Object.entries(data)) {
    const { service, port, path } = parseUri(uri);
    const res = await portForward(kc, service, namespace, port);
    logger(`${service}:${port} → 127.0.0.1:${res.port}\n`);
    environment.set(
      key,
      path ? `localhost:${res.port}${path}` : `localhost:${res.port}`,
    );
  }

  logger('\nServices are running! 🚀\n\n');

  return Object.fromEntries(environment);
};
