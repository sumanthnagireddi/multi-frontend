# Unified Frontend Monorepo

This Nx workspace contains three apps:

- `angular-app`
- `react-app`
- `next-app`

They are connected through shared libraries:

- `@unified-frontend-monorepo/workspace-data`
- `@unified-frontend-monorepo/react-ui`

Tailwind is configured in all three apps, and the React and Next apps both render the shared React UI library.

## Run the apps

```sh
npm run dev:angular
npm run dev:react
npm run dev:next
```

Expected local ports:

- Angular: `http://localhost:4200`
- React: `http://localhost:4201`
- Next: `http://localhost:4202`

## Useful Nx commands

```sh
npm run build:apps
npm run lint:apps
npx nx graph
```

## Shared architecture

- `workspace-data` exports the app catalog, run commands, and shared architecture notes for every frontend.
- `react-ui` exports the shared showcase component used by both React and Next.
- Angular stays connected by importing the same shared data library and exposing its own router-based pages.

## Node note

This workspace uses Node `22.x` in the root scripts because Angular 21, Vite 8, and Next 16 are happiest on currently supported Node releases. If your machine defaults to Node 21, the `npm run dev:*` and `npm run build:apps` scripts will still bootstrap through Node 22 for you.
