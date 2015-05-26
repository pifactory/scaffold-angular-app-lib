# Scaffold AngularJS component library

Clone this repo to get quick start of your library of AngularJS Components.

It uses [YABL](YABL.md) to get things integrated.

Interesting commands:

* `grunt build` - prepare components in the `dist/` dir for distribution
* `grunt serve` - start demo app (livereload included)
* `grunt serve:browserSync` - same with browserSync
* `grunt release` - bump version number, build and commit to git repo with version tag
* `grunt release:minor` - same, bump minor version number (like 0.1.0)
* `grunt release:major` - same, bump major version number (like 1.0.0), other options are: premajor, preminor, prepatch, prerelease, zero
* `grunt watch` - keep files in `dist/` in sync with the sources (helps if you use bower link)

## Folders layout

### Component library sources

```
app-lib/scripts
app-lib/images
app-lib/styles
app-lib/views
```

Build prepares distribution copy in `dist/${packageName}` folder.
 
#### Script files
It is not required, but better be placed to `app-lib/scripts`. Must be referenced in the `demo-app/index.html` between usemin build annotation tags:

```html
<!-- build:js index.js -->
<script src="scaffold-angular-app-lib/scripts/lib.js"></script>
<script src="scaffold-angular-app-lib/scripts/directives/smcComponentX.js"></script>
<script src="scaffold-angular-app-lib/scripts/services/someService.js"></script>
<!-- endbuild -->
```

They are style-checked with ESLint and concatenated into `dist/${packageName}/index.js`.
 
#### HTML files
It is not required, but better be placed to `app-lib/views`. No processing is applied, they are just copied to `dist/${packageName}`
and are meant to be available on hosting apps via reference `${packageName}/views/**/*.html`.
  
#### Images
Same as HTML files, sub-folder name is `images`. 

#### Styles
Less styles from `app-lib/styles/main.less` are compiled to `dist/${packageName}/main.css`.
__CSS files are not supported.__

### Demo app

There is a demo app which is used to develop and test the component and is not part of the distribution.

It's sources are placed under `demo-app/` folder:

```
demo-app
demo-app/scripts
demo-app/images
demo-app/styles
demo-app/views
```

Build is similar to development build of an application: bower dependencies (including self) are injected into index.html by wiredep.
Less styles from `demo-app/styles/main.less` are compiled to CSS, all CSS files are autoprefixed.
All assets from `bower_componets/*/dist` are served as static resources: this gives the possibity to use assets from other libraries,
`bower_componets` served as `/bower_componets`.

## Safe release procedure

Following procedure is implemented by `grunt release` task:

1. Check there are no uncommitted changes.
2. Bump version number
2. Run `build` task
5. Update manifest files (package.json, bower.json)
6. Commit changes
7. Tag commit
9. Push changes & tag to the repo

Still, things can go wrong if bower.json doesn't have all the required dependencies and they are injected manually into demo app for testing.
 
It makes sense to prepare full build first and test it before producing important release:

```sh
rm -rf node_modules && npm install
rm -rf bower_components && bower install
grunt serve
```

and release after build is tested.
