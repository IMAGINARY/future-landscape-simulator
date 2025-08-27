# future-landscape-simulator
Future Landscape Simulator exhibit. A variant of the Future Mobility Simulator.

## Installation

Run

```bash
npm install
npm run build
```

to build the project. The built files are in the `future-mobility/dist` directory.

## Configuration

The configuration files are in the `future-mobility/config` directory.

You can override any of the configuration keys through the `extras/settings.yml` file.

See the `future-mobility/README.md` and `future-mobility/server/README.md` files for more information on configuring and 
running the app.

## Development

Run both

```bash
npm run watch:copy
```

and

```bash
npm run watch:compile
```

The first will copy any files changed in `extras` to `future-mobility` (without requiring a full build), and
the second will recompile the JavaScript and SASS files (it actually runs watch on the inner
project, inside of `future-mobility`).

## Sentry

The app supports Sentry.

The `city.html` and `dashboard.html` entry points can take the DSN from the `sentry-dsn` query
string parameter.

It can also get the DSN from the `sentry.dsn` configuration key in the  `settings-exhibit.yml` file.

The server also supports Sentry. Check the [`server/README.md`](server/README.md) for details.

## Credits

[Eric Londaits](https://github.com/elondaits) (for [Imaginary gGmbH](https://about.imaginary.org)).

## License

Copyright (c) 2025 IMAGINARY gGmbH
Licensed under the MIT license (see LICENSE)
Supported by Futurium gGmbH.
Based on the Future Mobility Simulator, also supported by Futurium gGmbH.
