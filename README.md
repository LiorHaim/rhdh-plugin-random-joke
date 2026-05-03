# Random Joke Plugin for RHDH

A frontend-only dynamic plugin for Red Hat Developer Hub (RHDH 1.9+) that fetches a random joke from the [Official Joke API](https://official-joke-api.appspot.com) and displays it on a dedicated page accessible from the sidebar.

## Features

- Sidebar entry with an emoji icon linking to `/random-joke`
- Joke card showing the setup, with a button to reveal the punchline (fade-in animation)
- "Get Another Joke" button to fetch a new joke
- Loading spinner and error panel for resilient UX
- Packaged as an OCI image for RHDH 1.9+ dynamic plugin deployment

## Prerequisites

- RHDH 1.9+ (Backstage 1.45.3)
- Access to the Backstage proxy (configured in app-config)
- A container registry for pushing the OCI image (e.g. `quay.io`)

## Proxy Configuration

The plugin fetches jokes through the Backstage proxy. Add this to your RHDH `app-config.yaml`:

```yaml
proxy:
  endpoints:
    /joke-api:
      target: https://official-joke-api.appspot.com
      changeOrigin: true
```

## Building

```bash
# Install dependencies
yarn install

# Build the plugin
yarn build

# Export as a dynamic plugin
cd packages/random-joke
npm run export-dynamic
```

## Packaging & Publishing (OCI)

```bash
cd packages/random-joke

# Package and push to your registry
REGISTRY=quay.io/rh_ee_lhaim VERSION=0.1.0 npm run package:oci
```

This produces and pushes `oci://quay.io/rh_ee_lhaim/plugin-random-joke:0.1.0!scope-plugin-random-joke`.

## Deploying to RHDH

Add the following to your RHDH Helm values:

```yaml
global:
  dynamic:
    plugins:
      - package: oci://quay.io/rh_ee_lhaim/plugin-random-joke:0.1.0!scope-plugin-random-joke
        disabled: false
        pluginConfig:
          dynamicPlugins:
            frontend:
              scope.plugin-random-joke:
                dynamicRoutes:
                  - path: /random-joke
                    importName: RandomJokePage
                    menuItem:
                      icon: EmojiEmotions
                      text: Random Joke
                sidebarItems:
                  - mountPoint: sidebar.nav
                    importName: RandomJokeSidebarItem
```

See [`examples/`](examples/) for ready-to-use config files.

## Project Structure

```
rhdh-plugin-random-joke/
├── packages/
│   └── random-joke/          # Frontend plugin
│       └── src/
│           ├── plugin.ts      # Plugin definition, extensions
│           ├── routes.ts      # Route ref
│           └── components/
│               ├── JokePage/          # Main joke card UI
│               └── RandomJokeSidebarItem/  # Sidebar navigation item
└── examples/
    ├── app-config.random-joke.yaml   # Proxy configuration
    └── rhdh-helm-values.yaml         # Helm deployment values
```

## License

Apache-2.0
