# TheatreX

![banner](packages/theatrex/static/theatrex-banner.png)

TheatreX is a place to combine all your favorite streaming services into a single, unified experience.

## Client

TheatreX Client connects to different local and remote providers and allows the user to interact with them through a unified interface.

Also, it is responsible for managing the user's preferences, history, and other personal data.

### Configuration

TheatreX Client is configured through a YAML file located at `~/.theatrex/config.yaml`.

```yaml
providers:
    - use: https://remote-provider.com
      auth:
          username: ""
    - use: /local/provider/index.js
      auth:
          username: ""
          other: "value"
```

## Provider

TheatreX Provider is an adapter that allows TheatreX Client to interact with a specific service. It is a simple HTTP server that exposes a REST API.

It can be written in any language and can be hosted anywhere.

> Since it may include sensitive information, such as your secret credentials, it is recommended to host it locally.
