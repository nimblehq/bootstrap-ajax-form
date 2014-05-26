;(function ($, window, document, undefined) {

    'use strict';

    // Create the defaults once
    var pluginName = 'n3BootstrapAjaxForm',
        defaults = {
            // Behaviour when submitting the form
            // slideUp: slide up the form fields
            // disable: disabled all form fields
            animation: 'disable',
            // Reset form upon failure after a specific delay
            autoReset: false,
            autoResetDelay: 5000,
            // Custom callbacks
            onAjaxAlways: '',
            onAjaxSuccess: '',
            onAjaxError: ''
        };

    // Plugin constructor
    function Plugin(element, options){
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.Init();
    }

    Plugin.prototype = {
        Init: function(){
            // Set options using data attributes
            if ($(this.element).data('process-ajax-animation')){
                this.settings.animation = $(this.element).data('process-ajax-animation');
            }
            if (typeof $(this.element).data('process-ajax-auto-reset') !== 'undefined'){
                this.settings.autoReset = $(this.element).data('process-ajax-auto-reset');
            }
            if ($(this.element).data('process-ajax-auto-reset-delay')){
                this.settings.autoResetDelay = $(this.element).data('process-ajax-auto-reset-delay');
            }
            // Pre-bind validation and Ajax processing
            this.Validate();
            if (this.checkBrowserSupport()){
                this.Process();
            }
            this.Setup();
        },
        Setup: function(){
            var $element = $(this.element);
            this.InitializeValidation($element);
            this.AddFeedbackIcon($element);
            this.AddAlertsContainer($element);
            this.HideAlerts($element);
            this.DisableSubmit($element);
            this.ResetForm($element);
        },
        InitializeValidation: function($form){
            $form.data('is-valid-select', ( $form.find('select[required]').length ? false : true) );
            $form.data('is-valid-input',  ( $form.find('input[required], textarea[required]').length ? false : true) );
        },
        AddFeedbackIcon:function($form){
            $form
                .addClass('has-feedback')
                .find('.form-group')
                .each(function(){
                    var $feedbackIcon = $('<span />', { 'class': ' glyphicon form-control-feedback' });
                    $(this)
                        .addClass('has-feedback')
                        .append($feedbackIcon);
                });
        },
        AddAlertsContainer: function($form){
            if ($form.find('.alerts-container').length){
                return;
            }
            var $alertsContainer = $('<div/>', {class: '.alerts-container'});
            $form.prepend($alertsContainer);
        },
        HideAlerts: function($form){
            $form.find('fieldset').css('display', 'block');
            $form
                .find('.alert')
                .css({
                    'display': 'none'
                });
        },
        DisableSubmit: function($form){
            $form.trigger('isValid');
        },
        ResetForm: function($form){
            // Remove all feedback visuals
            $form.find('.form-group.has-feedback').removeClass('has-success has-error');
            $form.find('.form-control-feedback').removeClass('glyphicon-remove glyphicon-ok');
        },
        ResetFormValues: function($form){
            // Empty all input fields
            $form.find('select').val('');
            $form.find('input').not('[type="hidden"]').val('');
            $form.find('textarea').val('');
        },
        checkBrowserSupport: function(){
            var canProcessForm = true;
            // Check if the forms contains file input
            // Requires FormData
            canProcessForm = this.CanProcessFileInput();
            return canProcessForm;
        },
        HasFileInput: function(){
            return $(this.element).find('input[type="file"]').length;
        },
        CanProcessFileInput: function(){
            if (this.HasFileInput() && typeof window.FormData === 'undefined'){
                return false;
            } else {
                return true;
            }
        },
        // Validate form with BS feedback styling
        Validate: function(){
            $(this.element)
                .on('isValid', function(){
                    var $this = $(this),
                        $submitBtn = $this.find('[type="submit"]');
                    if ($this.data('is-valid-select') && $this.data('is-valid-input')) {
                        $submitBtn.prop('disabled', false);
                    } else {
                        $submitBtn.prop('disabled', 'disabled');
                    }
                })
                .on('change', 'select[required]', function(){
                    var $this      = $(this),
                        $form      = $this.parents('form'),
                        validation = true;
                    $form.find('select').each(function(){
                        var $this       = $(this),
                            $formGroup  = $this.parents('.form-group');
                        if (!$this.val()){
                            validation = false;
                            if ($this.is(':focus')) {
                                $formGroup.removeClass('has-success').addClass('has-error');
                            }
                        } else {
                            if ($this.is(':focus')) {
                                $formGroup.removeClass('has-error').addClass('has-success');
                            }
                        }
                    });
                    $form.data('is-valid-select', validation);
                    $form.trigger('isValid');
                })
                .on('keyup', 'input[required], textarea[required]', function(){
                    var $this      = $(this),
                        $form      = $this.parents('form'),
                        validation = true;
                    $form
                        .find('input[required], textarea[required]')
                        .not('[type="hidden"]')
                        .each(function(){
                            var $this = $(this),
                                $formGroup = $this.parents('.form-group'),
                                $feedbackIcon = $this.next('span');
                            if (!$this.val() || !$this.is(':valid')){
                                validation = false;
                                if ($this.is(':focus')) {
                                    $formGroup.removeClass('has-success').addClass('has-error');
                                    $feedbackIcon.removeClass('glyphicon-ok').addClass('glyphicon-remove');
                                }
                            } else {
                                if ($this.is(':focus')) {
                                    $formGroup.removeClass('has-error').addClass('has-success');
                                    $feedbackIcon.removeClass('glyphicon-remove').addClass('glyphicon-ok');
                                }
                            }
                        });
                    $form.data('is-valid-input', validation);
                    $form.trigger('isValid');
                });
        },
        GenerateAlert: function(type, msg){
            if (msg == ''){
                return false;
            }
            var $alert = $('<div />', {
                class: 'col-xs-12 alert alert-'+ type +( this.settings.animation === 'slideUp' ? ' has-no-margin' : '' ),
                html: msg
            });
            return $alert;
        },
        // Process form with BS alerts feedback styling
        Process: function(){
            var self = this;
            $(this.element)
                .on('click', '[type=submit]', function(e){
                    e.preventDefault();
                    var $this   = $(this),
                        $form   = $this.parents('form'),
                        formData = self.HasFileInput() ? new FormData( $form[0] ) : $form.serialize(),
                        process = $.ajax({
                            type: $form.prop('method'),
                            url: $form.prop('action'),
                            dataType: 'json',
                            data: formData,
                            processData: (self.HasFileInput() ? false : true),
                            contentType: (self.HasFileInput() ? false : 'application/x-www-form-urlencoded; charset=UTF-8'),
                            beforeSend: function(){
                                // Disable all inputs
                                if (self.settings.animation.toString() === 'disable'){
                                    $form.find('input, select, textarea').prop('disabled', 'disabled');
                                    $form.find('.alerts-container').css('display', 'block');
                                }
                            }
                        });
                    process
                        .done(function(jgXHR){
                            $form.find('.alert-success').fadeIn();
                            // execute custom callback
                            if (typeof self.settings.onAjaxSuccess == 'function') {
                                self.settings.onAjaxSuccess();
                            }
                        })
                        .fail(function(jgXHR){
                            // replace default callback by custom callback
                            if (typeof self.settings.onAjaxError == 'function') {
                                self.settings.onAjaxError();
                                return;
                            }
                            // show error message
                            $form.find('.alerts-container')
                                .empty()
                                .append(self.GenerateAlert('danger', jgXHR.ErrorMessage));


                        })
                        .always(function(jgXHR){
                            // hide loading animation
                            $this.button('reset');
                            // slide up the input fields to show the alert messages
                            if (self.settings.animation === 'slideUp'){
                                $form.find('fieldset').slideUp(200, function(){
                                    $form.find('.alerts-container').css('display', 'block');
                                });
                            }
                            // Re-enable form input fields
                            if (self.settings.animation.toString() === 'disable'){
                                $form.find('input, select, textarea').prop('disabled', false);
                            }
                            // reset the form automatically
                            if (self.settings.autoReset){
                                var resetFormTimer = setTimeout( function(){
                                    self.ResetFormValues($form);
                                    self.HideAlerts($form);
                                }, self.settings.autoResetDelay)
                            }
                            self.ResetForm($form);
                            // execute custom callback
                            if (typeof self.settings.onAjaxAlways == 'function') {
                                self.settings.onAjaxAlways();
                            }
                        });
                    return process;
                });
        }
    };

    $.fn[ pluginName ] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, 'plugin_' + pluginName ) ) {
                $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
            }
        });
        // chain jQuery functions
        return this;
    };

})( jQuery, window, document );