import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./app.tsx'),
  route('playbook', './routes/about.tsx'),
  route('resources', './routes/resources.tsx'),
] satisfies RouteConfig;
