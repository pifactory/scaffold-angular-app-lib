# Scaffold AngularJS component library

Clone this repo to get quick start of your library of AngularJS Components.

It uses [YABL] to get things easily integrated together.

Interesting commands:

* `grunt build` - prepare components in the `dist/` dir for distribution
* `grunt serve` - start demo app (livereload included)
* `grunt release` - bump version number, build and commit to git repo with version tag
* `grunt watch:build` - keep files in `dist/` in sync with the sources (helps if you use bower link)

## Folders layout

### Own sources

```
/app-lib/scripts
/app-lib/images
/app-lib/styles
/app-lib/views
```

### Dependencies

Managed by bower in `bower_components/`. They get deployed only to the demo-app and are not included in the component distribution build since bower is used for dependency management.

### Distribution build

Files prepared in `dist/` folder and are ready to be referenced by the hosting application or another component.
 
`bower.json` contains references to `dist/${libraryName}/scripts/index.js` and `dist/${libraryName}/styles/main.css` and ignores all folders besides `dist/`.

#### Scripts

All scripts from `app-lib/scripts/**/*.js` are style-checked with ESLint and concatenated to `dist/${libraryName}/scripts/index.js`.

No other processing is applied.

#### Styles

`app-lib/styles/main.less` is compiled, autoprefixed and put into `dist/${libraryName}/styles/main.css`
 
#### Other assets

Assets like pictures, fonts etc are copied to `dist/${libraryName}` as-is.

### Demo app build

There is a demo app which is used to develop and test the component and is not part of the distribution.

It's sources are placed under `demo-app/` folder:

```
/demo-app
/demo-app/scripts
/demo-app/images
/demo-app/styles
/demo-app/views
```

Build is similar to development build of an application.

#### Styles

Own LESS stylesheet is compiled to CSS and autoprefixed:

```
less(demo-app/styles, main.less) -> demo-app.gen/styles/main.css
autoprefix(demo-app.gen/styles, *.css)
```

#### Library Components

Prepared by distribution build in `dist/`. Included manually in the demo app, references have template `${libraryName}/${assetType}/${assetName}`, for example `client-widgets/views/clientDetails.html`, where `client-widgets` is the name of the library.

#### Assets from dependencies

Script and css files are injected by wiredep into `demo-app/index.html`.

Other assets are copied to `demo-app.libs` and served as static resources by development web server: 

```
copy(bower_components/(.*)/dist, $1/**/![*.js, *.css]) -> demo-app.libs/
```

### Development web server
 
Serves static content from following directories:

* `demo-app.gen`
* `demo-app`
* `dist`
* `demo-app.libs`

Changes are watched and propagated to these folders automatically
