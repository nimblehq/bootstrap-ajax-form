Validate & Process Bootstrap Forms with Ajax
======

This jQuery Plugin provides the following benefits:

- Leverage built-in styling helpers provided by Bootstrap to show validations with a beautiful UI
- Process any form type, even file uploads, with jQuery $.ajax. This feature only when the FormData API is available.

## Documentation

The jQuery plugin comes with the following options:

`animation` String: disable (default) | slideUp 

Behaviour of the form while the Ajax request is being processed. With `animation:'disable'`, all input fields are disabled until the Ajax is completed. While with `animation:'slideUP'`, the form is hidden using the built-in jQuery animation `slideUp`

`autoReset` Boolean: false (default)
`autoResetDelay` Integer: 5000 (default)

Option to reset the form to its initial state upon failure of the Ajax request after a specific delay

`onAjaxAlways: ''` Function: null (default)

Custom callback fired when the jQuery Deferred is resolved or rejected

`onAjaxSuccess: ''` Function: null (default)

Custom callback fired when the jQuery Deferred is resolved

`onAjaxError: ''` Function: null (default)

Custom callback fired when the jQuery Deferred is rejected


## How to use

Bind the plugin to a form using the following syntax:

	$('#contactForm').n3AjaxBootStrapForm({
		animation: 'disable',
		autoReset: true,
		onAjaxSuccess: function(){
			console.log('The form has been processed successfully');
		}		
	});