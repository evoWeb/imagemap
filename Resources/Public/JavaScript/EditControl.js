/**
 * This file is developed by evoweb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */
define(["require", "exports", "jquery", "./AreaEditor", "TYPO3/CMS/Backend/Icons", "TYPO3/CMS/Backend/Modal", "TYPO3/CMS/Backend/FormEngineValidation"], function (require, exports, $, AreaEditor_1, Icons, Modal, FormEngineValidation) {
    "use strict";
    var EditControl = /** @class */ (function () {
        function EditControl() {
            this.initializeTrigger();
        }
        EditControl.prototype.initializeTrigger = function () {
            $('.t3js-area-wizard-trigger').off('click').on('click', this.triggerHandler.bind(this));
        };
        EditControl.prototype.triggerHandler = function (event) {
            event.preventDefault();
            this.trigger = $(event.currentTarget);
            this.show();
        };
        EditControl.prototype.show = function () {
            var _this = this;
            var modalTitle = this.trigger.data('modalTitle'), buttonAddrectText = this.trigger.data('buttonAddrectText'), buttonAddcircleText = this.trigger.data('buttonAddcircleText'), buttonAddpolyText = this.trigger.data('buttonAddpolyText'), buttonDismissText = this.trigger.data('buttonDismissText'), buttonSaveText = this.trigger.data('buttonSaveText'), wizardUri = this.trigger.data('url'), payload = this.trigger.data('payload'), initWizardModal = this.initialize.bind(this);
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done(function (icon) {
                /**
                 * Open modal with areas to edit
                 */
                _this.currentModal = Modal.advanced({
                    additionalCssClasses: ['modal-area-wizard modal-image-manipulation'],
                    buttons: [
                        {
                            btnClass: 'btn-default pull-left button-add-rect',
                            icon: 'extensions-imagemap-rect',
                            text: buttonAddrectText,
                        },
                        {
                            btnClass: 'btn-default pull-left button-add-circle',
                            icon: 'extensions-imagemap-circle',
                            text: buttonAddcircleText,
                        },
                        {
                            btnClass: 'btn-default pull-left button-add-poly',
                            icon: 'extensions-imagemap-poly',
                            text: buttonAddpolyText,
                        },
                        {
                            btnClass: 'btn-default button-dismiss',
                            icon: 'actions-close',
                            text: buttonDismissText,
                        },
                        {
                            btnClass: 'btn-primary button-save',
                            icon: 'actions-document-save',
                            text: buttonSaveText,
                        },
                    ],
                    callback: function (currentModal) {
                        $.post({
                            url: wizardUri,
                            data: payload
                        }).done(function (response) {
                            currentModal.find('.t3js-modal-body').html(response).addClass('area-editor');
                            initWizardModal();
                        });
                    },
                    content: $('<div class="modal-loading">').append(icon),
                    size: Modal.sizes.full,
                    style: Modal.styles.dark,
                    title: modalTitle,
                });
                _this.currentModal.on('hide.bs.modal', function () {
                    _this.destroy();
                });
                // do not dismiss the modal when clicking beside it to avoid data loss
                _this.currentModal.data('bs.modal').options.backdrop = 'static';
            });
        };
        EditControl.prototype.initialize = function () {
            var _this = this;
            this.image = this.currentModal.find('.image img');
            this.configuration = this.currentModal.find('.picture').data('configuration');
            this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
            this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
            this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
            this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
            this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));
            $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);
            this.image.on('load', function () {
                setTimeout(_this.initializeArea.bind(_this), 100);
            });
        };
        EditControl.prototype.initializeArea = function () {
            var _this = this;
            var scaleFactor = this.currentModal.find('.picture').data('scale-factor'), width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.editorOptions = {
                fauxFormDocument: window.document,
                canvas: {
                    width: width,
                    height: height,
                    top: height * -1,
                },
                browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
                browseLink: this.configuration.browseLink
            };
            console.log(this.editorOptions.fauxFormDocument);
            var canvas = this.currentModal.find('#modal-canvas')[0];
            this.areaEditor = new AreaEditor_1.default(this.editorOptions, canvas, '#areasForm', this.currentModal[0]);
            window.imagemap = { areaEditor: this.areaEditor };
            (function (scaleFactor) {
                _this.areaEditor.setScale(scaleFactor);
                var that = _this, $magnify = $('#magnify'), $zoomOut = $magnify.find('.zoomout'), $zoomIn = $magnify.find('.zoomin');
                if (scaleFactor < 1) {
                    $zoomIn.removeClass('hide');
                    $zoomIn.click(function () {
                        that.areaEditor.setScale(1);
                        $zoomIn.hide();
                        $zoomOut.show();
                    });
                    $zoomOut.click(function () {
                        that.areaEditor.setScale(scaleFactor);
                        $zoomOut.hide();
                        $zoomIn.show();
                    });
                }
            })(scaleFactor);
            this.areaEditor.initializeAreas(this.configuration.existingAreas);
        };
        EditControl.prototype.destroy = function () {
            if (this.currentModal) {
                this.currentModal = null;
                this.areaEditor.form.destroy();
                this.areaEditor = null;
            }
        };
        EditControl.prototype.buttonAddRectHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.initializeAreas([{
                    shape: 'rect',
                    coords: (width / 2 - 50) + ',' + (height / 2 - 50) + ',' + (width / 2 + 50) + ',' + (height / 2 + 50),
                }]);
        };
        EditControl.prototype.buttonAddCircleHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.initializeAreas([{
                    shape: 'circle',
                    coords: (width / 2) + ',' + (height / 2) + ',50',
                }]);
        };
        EditControl.prototype.buttonAddPolyHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.initializeAreas([{
                    shape: 'poly',
                    coords: (width / 2) + ',' + (height / 2 - 50)
                        + ',' + (width / 2 + 50) + ',' + (height / 2 + 50)
                        + ',' + (width / 2) + ',' + (height / 2 + 70)
                        + ',' + (width / 2 - 50) + ',' + (height / 2 + 50)
                }]);
        };
        EditControl.prototype.buttonDismissHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.currentModal.modal('hide');
        };
        EditControl.prototype.buttonSaveHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var hiddenField = $("input[name=\"" + this.configuration.itemName + "\"]");
            hiddenField.val(this.areaEditor.getMapData()).trigger('imagemap:changed');
            FormEngineValidation.markFieldAsChanged(hiddenField);
            this.currentModal.modal('hide');
        };
        EditControl.prototype.hideColorSwatch = function (event) {
            var _this = this;
            if (!$(event.target).parents().add(event.target).hasClass('minicolors')) {
                // Hides all dropdown panels
                top.window.$('.minicolors-focus').each(function () {
                    var minicolors = $(_this), input = minicolors.find('.minicolors-input'), panel = minicolors.find('.minicolors-panel'), settings = input.data('minicolors-settings');
                    panel.fadeOut(settings.hideSpeed, function () {
                        if (settings.hide)
                            settings.hide.call(input.get(0));
                        minicolors.removeClass('minicolors-focus');
                    });
                });
            }
        };
        return EditControl;
    }());
    return EditControl;
});
