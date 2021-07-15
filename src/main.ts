/* eslint no-console: off */
import * as k8s from '@kubernetes/client-node';
import { exec } from 'rxjs-shell';
import invariant from 'ts-invariant';
import { parseUri } from './parse-uri';
import { portForward } from './port-forward';

export interface BootstrapArguments {
  namespace?: string;
  command?: string;
}

export const bootstrap = async (args: BootstrapArguments): Promise<void> => {
  const { namespace = 'indiv-prod', command } = args;
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
    process.stdout.write(`${service}:${port} → 127.0.0.1:${res.port}\n`);
    environment.set(
      key,
      path ? `localhost:${res.port}${path}` : `localhost:${res.port}`,
    );
  }

  process.stdout.write('\nServices are running! 🚀\n\n');

  if (command) {
    exec(command).subscribe(({ stdout, stderr }) => {
      if (stderr) {
        process.stderr.write(stderr);
      }
      process.stdout.write(stdout);
    });
  }
};
