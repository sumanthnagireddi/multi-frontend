import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./app.tsx'),
  route('playbook', './routes/about.tsx'),
  route('resources/:pageId?', './pages/resources/resources_main.tsx'),
  route('gold-prediction/:runId?', './pages/gold-prediction/gold_prediction_main.tsx'),
] satisfies RouteConfig;
