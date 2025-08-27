# Architecture

This application is a variant of the [Future Mobility Simulator](https://github.com/IMAGINARY/future-mobility).

It installs the base application source code, copies a series of extra files on top of it, and uses the 
original application's build script to build the final application.

## Build process

The build process is started by the `build` action in the `package.json` file. It takes the
following steps (please check the file for potential updates):

- Remove the `future-mobility` directory if it exists.
- Clone the base application source code into the `future-mobility` directory using git.
- Copy the contents of the `extras` directory into the `future-mobility` directory.
- Run `npm install` and `npm build` into the `future-mobility` directory to build the application.

## Modifications via `extras/`

### Configuration

The `settings.yml` file overrides the default configuration of the base application.

### Styles

In `future-mobility/sass` we have styles that override the application's defaults. 

In `static` we have alternative images that replace the original ones.
