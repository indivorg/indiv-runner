import * as net from 'net';
import querystring = require('querystring');
import * as k8s from '@kubernetes/client-node';
import getPort = require('get-port');
import invariant from 'ts-invariant';

export interface PortForwardResponse {
  port: number;
  close: () => void;
}

export const portForward = async (
  kc: k8s.KubeConfig,
  service: string,
  namespace: string,
  servicePort?: number,
): Promise<PortForwardResponse> => {
  const core = kc.makeApiClient(k8s.CoreV1Api);
  const { body } = await core.readNamespacedService(service, namespace);
  const portConfig =
    body.spec?.ports?.length === 1
      ? body.spec.ports[0]
      : body.spec?.ports?.find(
          port => port.name === 'http' || port.port === servicePort,
        );
  invariant(portConfig, 'a known port config was not found');

  const port = portConfig.targetPort;
  invariant(port, 'expected config to exist');

  const selector = body?.spec?.selector;
  invariant(selector, 'expected selector to exist');

  const labelSelector = querystring.stringify(selector);
  const pods = await core.listNamespacedPod(
    namespace,
    'false',
    false,
    '',
    '',
    labelSelector,
  );
  const pod = pods.body.items.find(p => p?.status?.phase !== 'Failed');
  const podName = pod?.metadata?.name;

  invariant(podName, 'no pod found');
  const exposePort = await getPort();

  const forward = new k8s.PortForward(kc);
  const server = net.createServer(socket => {
    forward.portForward(
      namespace,
      podName,
      [Number(port)],
      socket,
      null,
      socket,
    );
  });

  server.listen(exposePort, '127.0.0.1');

  return {
    port: exposePort,
    close: () => {
      server.close();
    },
  };
};
