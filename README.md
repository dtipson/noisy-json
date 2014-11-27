Noisy JSON
=====

Control whether particular Same-Domain ajax JSON requests trigger a browser's native loading indicator by piping selected $.ajax requests through as special iframe method.

####The Problem
Ajax requests don't trigger browser loading indicators in most situations, which is usually a good thing, but can be disappointing for that point in single page apps when you WANT the user to think a major form submission or "page" transition is in process. It's always worth building your own loading/busy states internal to the page/app of course.  It's just that things don't feel quite "right" when major page transitions and form submissions don't engage the browser as well.

####The Lousy Solution: 
The only really reliable way to trigger a browser's native loading state is to insert a separate hidden iframe into the page that loads a "stalled" resource (such as a php page that runs the command sleep(100000); ) and then removes it whenever you're done.  Doing this requires an extra http request, not to mention requiring the use of a server that is forced to expend resources basically doing nothing but keeping pointless connections alive.  The approach is also not intuitively linked to the actual action of getting the data: it's an effect that has to be tacked on later.

####This Solution
We can use jQuery's [ajax transport](http://api.jquery.com/jQuery.ajaxTransport/) api to create a special data transfer method that pipes any particular requests that you want to be "noisy" through a hidden iframe, then parses the result and returns it as if it were a normal JSON request.

The code/approach in question is basically a fork/rewrite of [cmlenz](https://github.com/cmlenz)'s lifesaving [jquery-iframe-transport](https://github.com/cmlenz/jquery-iframe-transport) (an amazingly slick little solution for achieving ajax-like file uploads on older browsers).

####Browser Support
The basic approach should work in any browser that supports ajax: that is, the iframe requests should work.  Only certain browsers will actually trigger indicators as expected though: so far I've gotten them to work in desktop Chrome, Firefox, and IE8.

Safari and IE9(+?) are probably beyond help here.  [They don't trigger ANY browser UI for content loaded in iframes](http://www.stevesouders.com/blog/2013/06/16/browser-busy-indicators/). I happen to think that this is bad design: users are familiar with these subtle loading signals and they are valuble when used correctly. One additional weird side effect of "silent" iframes is that it means that you could make an entire site load in a fullscreen iframe and have all internal navigation (i.e. new page loads) run "silently": that is, you can essentially instantly give any site the "feel" of a single page app, with no loading or busy indicators, just by running this code:

```
document.documentElement.innerHTML = '<iframe src="/" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"></iframe>'
```

Try it! It's... werid. It also means that a malicious site or code can more easily supress navigation signals, even when moving you from one domain to another.

Mobile browsers are also very stingy about triggering busy/loading indicators, so they all ignore iframe loads.  Because they're so important, I'm still looking for a sneaky way to make it work.  But sometimes you can't win.

####Environment Limitations
- This approach is same-origin only: since we're reading the contents of an iframe, this approach is only suitable when both the calling page and the api are on the exact same domain (many single-page apps meet these qualifications but obviously not all: depends on your setup).

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
            silent ? { dataType:'json' } : { dataType:'njson json' } //control which method is used
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

####General IE8 note
~IE8 is a bit tricky for json in general as it needs server responses to be configured in such a way that it doesn't prompt the user to DOWNLOAD the json response. This has nothing to do with this library per se, it's just a problem that applies to this library as well.  A good practice for IE support is that you send responses as content-type text/plain, and always specify your ajax dataType (be it json or njson json).