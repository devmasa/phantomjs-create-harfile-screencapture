# Quick summary
Example how to create har file and create screen capture.
Add config.json.

## How do I get set up?
* Summary of set up
    * git clone https://github.com/devmasa/phantomjs-create-harfile-screencapture.git
    * rename config-sample.json config.json
    * modify config.json
    * phantomjs createHarAndScreenCapture.js identifier
    * setup cron(Linux) or TaskScheduler(Windows)
* Configuration
    * config.json  
        "useragent" : set page.settings.userAgent. (optional)  
        "url" : URL to be monitored.  
        "filename" : file name that you want to create(with path).  
        "timeout" : the max amount of time to wait.(optional - default 10000ms)  
        "selector" : selector to determine if page were loaded.(optional)  
        "viewportwidth" : set page.viewportSize.width.  
        "viewportheight" : set page.viewportSize.height.  
* Dependencies
    PhantomJS >= 2.1.1

## Thanks
* http://stackoverflow.com/questions/11340038/phantomjs-not-waiting-for-full-page-load
* http://stackoverflow.com/questions/21964043/can-i-force-phantomjs-to-render-pdfs-with-the-background-images-and-colors
* http://uggedal.com/journal/phantomjs-default-background-color/