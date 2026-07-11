import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./app.tsx'),
  route('playbook', './routes/about.tsx'),
] satisfies RouteConfig;
