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
define(["require", "exports", "jquery", "./AreaEditor", "TYPO3/CMS/Backend/Icons", "TYPO3/CMS/Backend/Modal", "TYPO3/CMS/Backend/FormEngineValidation", "TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min"], function (require, exports, $, AreaEditor, Icons, Modal, FormEngineValidation, ImagesLoaded) {
    "use strict";
    var EditControl = /** @class */ (function () {
        function EditControl(fieldSelector) {
            this.fieldSelector = fieldSelector;
            this.initializeTrigger();
        }
        EditControl.prototype.initializeTrigger = function () {
            this.trigger = $('.t3js-area-wizard-trigger');
            this.trigger
                .off('click')
                .on('click', this.triggerHandler.bind(this));
        };
        EditControl.prototype.triggerHandler = function (event) {
            event.preventDefault();
            this.openModal();
        };
        EditControl.prototype.openModal = function () {
            var _this = this;
            var modalTitle = this.trigger.data('modalTitle'), buttonAddRectangleText = this.trigger.data('buttonAddrectText'), buttonAddCircleText = this.trigger.data('buttonAddcircleText'), buttonAddPolygonText = this.trigger.data('buttonAddpolyText'), buttonDismissText = this.trigger.data('buttonDismissText'), buttonSaveText = this.trigger.data('buttonSaveText'), wizardUri = this.trigger.data('url'), payload = this.trigger.data('payload'), initWizardModal = this.initialize.bind(this);
            this.configuration = this.trigger.data('configuration');
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done(function (icon) {
                /**
                 * Open modal with areas to edit
                 */
                _this.currentModal = Modal.advanced({
                    additionalCssClasses: ['modal-area-wizard modal-image-manipulation'],
                    buttons: [
                        {
                            btnClass: 'btn-default pull-left',
                            dataAttributes: {
                                method: 'rectangle',
                            },
                            icon: 'extensions-imagemap-rect',
                            text: buttonAddRectangleText,
                        },
                        {
                            btnClass: 'btn-default pull-left',
                            dataAttributes: {
                                method: 'circle',
                            },
                            icon: 'extensions-imagemap-circle',
                            text: buttonAddCircleText,
                        },
                        {
                            btnClass: 'btn-default pull-left',
                            dataAttributes: {
                                method: 'polygon',
                            },
                            icon: 'extensions-imagemap-poly',
                            text: buttonAddPolygonText,
                        },
                        {
                            btnClass: 'btn-default button-dismiss',
                            dataAttributes: {
                                method: 'dismiss',
                            },
                            icon: 'actions-close',
                            text: buttonDismissText,
                        },
                        {
                            btnClass: 'btn-primary button-save',
                            dataAttributes: {
                                method: 'save',
                            },
                            icon: 'actions-document-save',
                            text: buttonSaveText,
                        },
                    ],
                    content: $('<div class="modal-loading">').append(icon),
                    size: Modal.sizes.full,
                    style: Modal.styles.dark,
                    title: modalTitle,
                    callback: function (currentModal) {
                        $.post({
                            url: wizardUri,
                            data: payload
                        }).done(function (response) {
                            currentModal.find('.t3js-modal-body').html(response).addClass('area-editor');
                            initWizardModal();
                        });
                    },
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
            this.image = this.currentModal.find('img.image');
            this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
            this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
            this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
            this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
            this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));
            $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);
            ImagesLoaded(this.image, function () {
                setTimeout(_this.initializeArea.bind(_this), 100);
            });
        };
        EditControl.prototype.initializeArea = function () {
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height')), editorOptions = {
                canvas: {
                    width: width,
                    height: height,
                    top: height * -1,
                },
                fauxFormDocument: window.document,
                browseLink: this.configuration.browseLink,
                browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
                formSelector: '[name="areasForm"]',
                typo3Branch: this.trigger.data('typo3-branch'),
            };
            var canvas = this.currentModal.find('#modal-canvas')[0];
            this.areaEditor = new AreaEditor(editorOptions, canvas, '#areasForm', this.currentModal[0]);
            window.imagemap = { areaEditor: this.areaEditor };
            // @todo remove .areas to use all values
            var areas = jQuery(this.fieldSelector).eq(0).val();
            this.areaEditor.initializeAreas(JSON.parse(areas).areas);
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
                    coords: {
                        left: (width / 2 - 50),
                        top: (height / 2 - 50),
                        right: (width / 2 + 50),
                        bottom: (height / 2 + 50)
                    },
                }]);
        };
        EditControl.prototype.buttonAddCircleHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.initializeAreas([{
                    shape: 'circle',
                    coords: {
                        left: (width / 2),
                        top: (height / 2),
                        radius: 50
                    },
                }]);
        };
        EditControl.prototype.buttonAddPolyHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.initializeAreas([{
                    shape: 'poly',
                    coords: {
                        points: [
                            { x: (width / 2), y: (height / 2 - 50) },
                            { x: (width / 2 + 50), y: (height / 2 + 50) },
                            { x: (width / 2), y: (height / 2 + 70) },
                            { x: (width / 2 - 50), y: (height / 2 + 50) },
                        ]
                    }
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
