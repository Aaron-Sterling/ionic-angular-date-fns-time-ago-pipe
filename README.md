# ionic-angular-date-fns-time-ago-pipe
The default Angular time ago pipe is based on i18n. Users on the Ionic message board have reported that some Apple phones render i18n dates incorrectly. This repo is a demo of a time-ago pipe based on the lightweight date-fns distance function. The pipe is in pure Ionic and Angular (no use of zone for example).

Change detection of the pipe is performant, and based on a backoff function that directs frequent updates when the time is very close to now, and less frequent updates the further in the past the input time is. However, this means that if you change the input value of the pipe, the pipe may not notice for a while.  (I've overridden default Angular change detection.)  So I recommend you use this pipe only to display static data.
