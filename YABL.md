# YABL
_Yet Another Build Layout_

## Goal
Make web applications composable.

It must be easy to make a library of components which includes javascript, CSS files, HTML files, images, things. It can be tested, built, released to git repo and then included with bower and build tooling into a web application.

Popular build tools/folder layouts handle javascript and CSS quite well, but like forget HTML and stuff. This leads to bloated, monolith applications. Small libraries are easier to maintain, test and change. Polymer in particular and Web Components in general will allow natural composition of HTML-based components into one application. AngularJS applications can also be made composable with some help of the build tooling. Actually, proposed layout will fit not only with AngularJS but with any other technology which needs to reuse assets from components (like fonts, images, etc). So, Polymer apps can use it as well. Tooling then has to be adjusted (like add HTML vulcanisation), but general idea stays the same.

## General idea
There are 2 layouts: one for component library and another for the main application. Dependencies are managed with bower, build is managed by Grunt. Can be Gulp or npm scripts, doesn't matter really. Depends on personal preferences and psychological traumas from previous ~~lives~~ projects.

Library layout contains `app-lib` folder with all the sources of components in it. Then there is `demo-app` folder for the demo app which is used to test the components. It provides only basic context, may be even empty page which includes the component(s) and nothing more. Sources from `app-lib` are compiled and prepared for distribution in the `dist` folder. This is the only folder allowed by `bower.json`. Sources are transformed when needed to includable and redistributable assets like javascript, CSS, HTML, image files. They are not minified, not hash-named, not uglified. They are concatenated if appropriate (like for scripts, css files and HTML with Web Components) - just to simplify including them from the main app.

Main app layout is very much like standard: it has `app` folder with all the sources in it. Dependencies are managed by bower. Javascript and CSS files are injected into `app/index.html` by the wiredep. Build tooling is used to copy other assets from dependencies into right place. They are minified, uglified and hash-named etc together with the app sources.