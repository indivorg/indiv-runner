<p align="center">
  <img
    src="/.github/logo.svg"
    width="39"
    height="33"
  />
</p>

<h1 align="center">Indiv Runner</h1>

<p align="center">
  <strong>Forwards ports from all services and sets local environment variables</strong>
</p>

\
Forwards services running in a Kubernetes cluster to a local environment based off
a ConfigMap (designed with environment variables). Typical use-case is spinning up
a service that depends on other microservices without having to run all of them locally.

**Warning**: We will at some point make this useful for others than Indiv, but
right now, we are focusing on us. There are things we need to _generalized_
before it's ready for prime-time as an Open Source project. Please share your
thoughts in Github issues!

---

Built to run either as a command-line utility or an NPM package to combine with
any current build system.

- Few dependencies (no need to install other tools, everything is in one
  package)
- Simple API

## Getting Started

Currently, the `indiv-runner` is somewhat opinionated. We don't support having
your own name for the ConfigMap – and we only have a few test cases on how we
parse URIs. But as long as you use the same style ConfigMap Indiv do, you're off
to the races (or if you go ahead and open PRs, of course!).

We have a solid example on
[how to use the runner on an mono-repository](examples/run-mono-repo.md) you
should check out!

See an example of the required ConfigMap below.

```sh
yarn add @indivorg/runner
```

**PS**: You can also run as command-line utility, like so:
`npx @indivorg/runner --help`

```shell
▶ npx @indivorg/runner --help
npx: installed 419 in 15.481s
Usage: indiv-runner [options]

port-forwards all services, creates environment file and starts the service

Options:
  -r, --command <command>  a command to run after runner has started e.g. yarn run dev
  -h, --help               display help for command
```

### Example `service-env-config`

Below you'll find a real world example of the required ConfigMap.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-env-config
  namespace: indiv-prod
data:
  SERVICE_CONTRACT_URL: service-contract-jqmfhxs8:8080
  SERVICE_JOURNAL_URL: service-journal-brwo4lco:8080
  SERVICE_NOTIFICATION_URL: service-notification-bbnurz99:8080
  SERVICE_PLAN_URL: service-plan-700rh4nk:8080
  SERVICE_PROGRAMME_URL: service-programme-vj9gu1u1:8080
  SERVICE_TASK_URL: service-task-jtr1dfx2:8080
  SERVICE_TENANT_URL: service-tenant-2s9n0u0f:8080
  SERVICE_UNLEASH_URL: http://unleash/api/client
  SERVICE_USER_URL: service-user-svzw10vr:8080
```

## Contribute & Disclaimer

We love to get help 🙏 Read more about how to get started in
[CONTRIBUTING](CONTRIBUTING.md) 🌳
