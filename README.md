ijson
=====

Purpose: Control whether a particular Same-Domain ajax json requests to trigger a browsers native loading indicator by piping some $.ajax requests through as special iframe method

####The Problem
Ajax requests don't trigger browser loading indicators in most situations, which is usually a good thing, but can be disappointing for that point in single page apps when you WANT the user to think a major form submission or "page" transition is in process.

####The Lousy Solution: 
When you want to trigger "loading state," insert a separate hidden iframe into the page that loads a forever stalled resource (such as a php page that runs the command sleep(100000); ) and then remove it whenever you're done.  Doing this requires an extra http request, not to mention requiring the use of a server that is forced to expend resources basically doing nothing but keeping pointless connections alive, which doesn't scale.  It's also not intuitively linked to the actual action of getting the data: it's an effect tacked on later.

####This Solution: use jQuery's ajax transport method to create a data transfer method that pipes requests through a hidden iframe, then parses out the result.

####Its Limitations
- Same-Origin only: since we're reading the contents of an iframe, this approach is only suitable when both the calling page and the api are on the same domain (many single-page apps meet these qualifications).
- the server's api responses need to be sent as application/json, text/plain, text/html

The code/approach in question is basically a fork of [cmlenz](https://github.com/cmlenz)'s lifesaving [jquery-iframe-transport](https://github.com/cmlenz/jquery-iframe-transport) (an amazingly slick little solution for achieving ajax-like file uploads on older browsers).


Once you include the library, you can control whether or not an ajax request triggers the browser loading state simply by setting the dataType from "json" to "ijson json" in the options object.  Here's an example function that can do either on a test call to a simulated "slow" api.


```
function testcall(silent){
    
    var options = $.extend(
            {
                url:'/response.php',
                type:'POST',
                data: {
                    foo:45,
                    bar:65
                }
            },
            silent?{}:{ dataType:'ijson json'}
        ),
        req = $.ajax(options).always(function(d){
            console.log('response',d,arguments);
        });
    console.log('making that call '+(silent?'silently':'loudly')+ ' with options',options);
}


$(document).ready(function(){

    //noisy ajax call
    ifcall();

    //vs
    //silent (standard) ajax call
    ifcall(true);
    
});
```