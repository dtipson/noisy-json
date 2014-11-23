<?php
    ##this page will simulate a slow connection by waiting 4 seconds until responding with test data
    ##to actually use it you'd need to set up a local server that supports php on the same domain as the api
    
    sleep(4);
    header('Content-Type: text/plain; charset=utf-8');
    echo '{ "status": 200, "data" : { "wedidit": true }  }';
?>

