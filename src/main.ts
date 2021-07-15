/* eslint no-console: off */
import * as k8s from '@kubernetes/client-node';
import invariant from 'ts-invariant';
import { parseUri } from './parse-uri';
import { portForward } from './port-forward';

export interface RunnerArguments {
  namespace?: string;
  command?: string;
  stdout?: (message: string | Buffer) => void;
}

export const runner = async (args: RunnerArguments = {}): Promise<void> => {
  const { namespace = 'indiv-prod', stdout: log = process.stdout.write } = args;

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
    log(`${service}:${port} → 127.0.0.1:${res.port}\n`);
    environment.set(
      key,
      path ? `localhost:${res.port}${path}` : `localhost:${res.port}`,
    );
  }

  process.stdout.write('\nServices are running! 🚀\n\n');
};
