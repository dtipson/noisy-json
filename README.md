Noisy JSON
=====

Control whether particular Same-Domain ajax JSON requests trigger a browser's native loading indicator by piping selected $.ajax requests through as special iframe method.

####The Problem
Ajax requests don't trigger browser loading indicators in most situations, which is usually a good thing, but can be disappointing for that point in single page apps when you WANT the user to think a major form submission or "page" transition is in process.

####The Lousy Solution: 
The only really reliable way to trigger a browser's native loading state is to insert a separate hidden iframe into the page that loads a "stalled" resource (such as a php page that runs the command sleep(100000); ) and then removes it whenever you're done.  Doing this requires an extra http request, not to mention requiring the use of a server that is forced to expend resources basically doing nothing but keeping pointless connections alive.  The approach is also not intuitively linked to the actual action of getting the data: it's an effect that has to be tacked on later.

####This Solution
We can use jQuery's [ajax transport](http://api.jquery.com/jQuery.ajaxTransport/) api to create a special data transfer method that pipes requests through a hidden iframe, then parses the result and returns it as if it were a normal JSON request.

The code/approach in question is basically a fork/rewrite of [cmlenz](https://github.com/cmlenz)'s lifesaving [jquery-iframe-transport](https://github.com/cmlenz/jquery-iframe-transport) (an amazingly slick little solution for achieving ajax-like file uploads on older browsers).

####Limitations
- This approach is same-origin only: since we're reading the contents of an iframe, this approach is only suitable when both the calling page and the api are on the exact same domain (many single-page apps meet these qualifications but not all).
- the server's api responses need to be sent as application/json, text/plain, or text/html

####Usage

Once you include the library, you can control whether or not an ajax request triggers the browser loading state simply by setting the dataType from "json" to "njson json" in the $.ajax options object. 

```
$.ajax({
    url:'/your/local/api',
    data:{
        some:true,
        data:true
    },
    dataType:'njson json'
});
```

Here's an example function that can do either on a test call to a simulated "slow" api:

```
function testcall(silent){
    
    var options = $.extend(
            {
                url:'/response.php',//endpoint that takes 4 seconds to respond with data
                type:'POST',//POST or GET
                data: {
                    foo:45,//include any data as usual
                    bar:65
                }
            },
            silent ? { dataType:'json' } : { dataType:'njson json' }//control which method is used
        ),
        req = $.ajax(options).always(function(d){
            console.log('response',d,arguments);
        });
    console.log('making that call '+(silent?'silently':'loudly')+ ' with options',options);
}


$(document).ready(function(){

    //noisy ajax call
    testcall();

    //vs
    //silent (standard) ajax call
    testcall(true);
    
});
```