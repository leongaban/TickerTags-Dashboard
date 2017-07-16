# Feed
## init
~~- init: should load the default feed: 20 alerts of any kind;~~
- when we append a feed: 
 ~~- 1 alert: by websockets; or annotating an alert (it replaces itself on the feed)~~
  ~~- 20 alerts: on init load and on scrolling to refresh (api call)~~
    ~~1. appending 20 alerts the initial feed can have alerts in it; at base20 qts~~

## incoming alert
~~- by clicking on alert from the chart~~
~~- initiated by websocket when it receives a new alert from the websocket server~~
~~- curators receive a notification window and a title representation~~

## annotating an alert

~~- curators can approve, deny or reject an alert~~

## curators can create an alert
~~- by submit window;~~
~~- insights submissions are different than breaking/momentum alerts~~

## clicking an alert to feed the chart
- clicking on `chart` button will feed the alert to the chart
  ~~- setting the alert ticker on the ticker panel~~
  ~~- setting its tags to tag panel~~
  - settting its timespan on the component
  - setting the interval on the social media

## filters
- by:
   - all or portfolio
   - alert type
   - 

# Types
- Alert
  - ChartAlert
  - FeedAlert
