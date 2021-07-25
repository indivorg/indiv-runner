# Running Indiv Runner on a mono repository

First, let's create a separate script which we are going to run later. Let's
just call it `run-server.ts` for now.

In this file, we need to setup our packages. Let's imagine we have two packages,
`backend` and `web`. Let's set these services up with
[`concurrently`](https://www.npmjs.com/package/concurrently).

```typescript
import concurrenctly from 'concurrently';

const main = async () => {
  concurrenctly([
    {
      command: 'yarn:start:dev',
      cwd: join(process.cwd(), 'packages', 'backend'),
    },
    {
      command: 'yarn:start',
      cwd: join(process.cwd(), 'packages', 'web'),
    },
  ]);
};

main();
```

Okey, so what this script does is run `yarn:start:dev` in the `backend` package
and `yarn:start` in the `web` package. So far, we haven't added any of the
`indiv-runner` stuff. Let's do that now!

First, let me explain how we've designed the runner.

```typescript
import { runner } from '@indivorg/runner';

const environment = await runner({
    namespace: 'my-app-namespace',
    stdout: message => console.log(message),
})

/**
 * environment:
 * {
 *  "MY_SERVICE_URI": "localhost:3338",
 *  ...
 * }

```

What `runner` is doing here is first look for a ConfigMap named
`service-env-config`. Then it parses this configMap to know which service we
need to forward ports. After forwarding is all done, the function outputs the
same environment variables as it found inside `service-env-config` but instead
replaced the references to a local URI (e.g. `localhost:3338`).

What we can do then is to add those variables back to our concurrently. Neat,
right?

This is how the same example, but with some data from the runner looks like:

```typescript
import concurrenctly from 'concurrently';
import { runner } from '@indivorg/runner';

const main = async () => {
  const environment = await runner({
    namespace: 'my-app-namespace',
    stdout: (message) => console.log(message),
  });

  concurrenctly([
    {
      command: 'yarn:start:dev',
      env: environment,
      cwd: join(process.cwd(), 'packages', 'backend'),
    },
    {
      command: 'yarn:start',
      cwd: join(process.cwd(), 'packages', 'web'),
    },
  ]);
};

main();
```
