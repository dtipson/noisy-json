(function ($){

    var i = 0;

    $.ajaxPrefilter('njson json',function(options, origOptions, jqXHR) {
        
        options.njson = true;
    });

    $.ajaxTransport('njson', function (options, originalOptions) {
        if (options.async) {

            var $form,
                $formHTML='',
                iframe;
            return {
                send: function (headers, completeCallback) {
                    $form = $('<form/>').hide();

                    // XDomainRequest only supports GET and POST:
                    if (options.type.toUpperCase()!=="GET") {
                        options.url = options.url + (/\?/.test(options.url) ? '&' : '?') + '_method='+options.type.toUpperCase();
                        options.type = 'POST';
                    }

                    i++;

                    /*create the iframe and set its load behaviors*/
                    // javascript:false as initial iframe src
                    // prevents warning popups on HTTPS in IE6:
                    /*jshint scripturl: true */
                    iframe = $(
                        '<iframe src="javascript:false;" id="njson-' + i + '" name="njson-' + i + '"></iframe>'
                    ).bind('load', function () {
                        iframe
                            .unbind('load')
                            .bind('load', function () {
                                var response;
                                // Wrap in a try/catch block to catch exceptions thrown
                                // when trying to access cross-domain iframe contents:
                                try {
                                    response = iframe.contents();
                                    // Google Chrome and Firefox do not throw an
                                    // exception when calling iframe.contents() on
                                    // cross-domain requests, so we unify the response:
                                    if (!response.length || !response[0].firstChild) {
                                        console.log('likely attempt at CORS');
                                        throw new Error();
                                    }
                                } catch (e) {
                                    response = undefined;
                                }
                                // The complete callback returns the
                                // iframe content document as response object:
                                completeCallback(
                                    200,
                                    'success',
                                    {'njson': response}//use a converter
                                );
                                // Fix for IE endless progress bar activity bug
                                // (happens on $form submits to iframe targets):
                                $('<iframe src="javascript:false;"></iframe>').appendTo($form);
                                window.setTimeout(function () {
                                    // Removing the $form in a setTimeout call
                                    // allows Chrome's developer tools to display
                                    // the response result
                                    $form.remove();
                                }, 10);
                            });

                        /*configure $form properties*/
                        $form.prop({
                            'accept-charset':'UTF-8',
                            'target': iframe.prop('name'),
                            'action': originalOptions.url,
                            'method': options.type
                        });

                        /*convert data into inputs for POST or GET*/
                        if (originalOptions.data) {
                            $.each(originalOptions.data, function (key,value) {
                                $formHTML += '<input type="hidden" name="'+key+'" value="'+value+'"/>';
                            });
                            $form.append($formHTML);
                        }
                        window.setTimeout(function(){
                            $form.submit();
                        },1);//have to wait a tic or else FF doesn't respond!
            
                        // Insert the file input fields at their original location
                        // by replacing the clones with the originals:
                        
                    });
                    console.log($form);
                    $form.append(iframe).appendTo(document.body);
                },
                abort: function () {
                    if (iframe) {
                        // javascript:false as iframe src aborts the request
                        // and prevents warning popups on HTTPS in IE6.
                        // concat is used to avoid the "Script URL" JSLint error:
                        iframe
                            .unbind('load')
                            .prop('src', 'javascript:false;');
                    }
                    if ($form) {
                        $form.remove();
                    }
                }
            };
        }
    });

    // The iframe transport returns the iframe content document as response.
    // The following adds converters from iframe to text, json, html, xml
    // and script.
    // Please note that the Content-Type for JSON responses has to be text/plain
    // or text/html, if the browser doesn't include application/json in the
    // Accept header, else IE will show a download dialog.
    // The Content-Type for XML responses on the other hand has to be always
    // application/xml or text/xml, so IE properly parses the XML response.
    // See also
    // https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation

    function njson(iframe) {
        //console.log('json',iframe[0]);
        return iframe && $.parseJSON($(iframe[0].body).text());
    }

    /*be prepared to handle various response types*/
    $.ajaxSetup({
        converters: {
            'njson text': njson,
            'njson json': njson,
            'njson html': njson,
            'njson script': njson
        }
    });

}(jQuery));