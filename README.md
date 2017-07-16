The TickerTags dashboard app
================

<strong><a href="https://tickertags.com">TickerTags.com</a></strong> | All change is detectable.

Current release [1.27.20](https://github.com/TickertTags/dashboard/releases/tag/1.27.20) (FeedPanel closed by default for users)

### After cloning
Installs node dependencies <a href="https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md">gulp</a> modules:
`$ npm install` or `yarn install`

Installs frontend dependencies <a href="https://github.com/TickertTags/dashboard/blob/master/bower.json">bower.json</a> (<a href="https://angularjs.org/">Angular</a>, <a href="https://github.com/paulmillr/es6-shim/">es6</a>, <a href="https://lodash.com/">lodash</a> etc):<br/>
<code>$ bower install</code> Installs bower dependencies<br/>

Rebuild the frontend vendors file:
`gulp build:vendors`

Before editing SASS files you need to run gulp:<br/>
<code>$ gulp</code> compiles SASS into CSS

To watch and build HTML and JavaScript modules you need to run webpack:<br/>
<code>npm run dev</code> runs (webpack -w)

### Database
You need to get your local database setup, along with Apache, contact technical founder @Jordan

### Create deployable build
<code>$ V=patch gulp build</code> ie: V= `major` for 1.x.x, `minor` for x.1.x or `patch` for x.x.1

### For production
<code>V=patch gulp build-prod</code>

Creates deployable <a href="https://github.com/TickertTags/dashboard/tree/master/build">build</a> folder.

### Testing
Karma / Mochai / Chai Tests in `test` dir
`$ npm test` Runs the tests
Note: Tests are not complete and need to be refactored

### Alert Testing localhost
Goto tickers directory
$ python
```
>>> from hedge.dl.dm.alert import Alert
>>> alert = Alert.objects({})
>>> alerts = Alert.objects({})
>>> for alert in alerts:
...     alert.approved = 0
...     alert.save()
...
>>> alerts = Alert.objects({})
>>> for alert in alerts[0:100]:
...     print alert.approved
```

![Dashboard](https://raw.githubusercontent.com/leongaban/github_images/e771e512b43b4141c96cea602f9c3c3e0c9c80ac/dark-theme.png)
