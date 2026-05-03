import {
  createPlugin,
  createRoutableExtension,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { randomJokeRouteRef } from './routes';

export const randomJokePlugin = createPlugin({
  id: 'random-joke',
  routes: {
    root: randomJokeRouteRef,
  },
});

export const RandomJokePage = randomJokePlugin.provide(
  createRoutableExtension({
    name: 'RandomJokePage',
    component: () =>
      import('./components/JokePage').then(m => m.JokePage),
    mountPoint: randomJokeRouteRef,
  }),
);

export const RandomJokeSidebarItem = randomJokePlugin.provide(
  createComponentExtension({
    name: 'RandomJokeSidebarItem',
    component: {
      lazy: () =>
        import('./components/RandomJokeSidebarItem').then(
          m => m.RandomJokeSidebarItem,
        ),
    },
  }),
);
