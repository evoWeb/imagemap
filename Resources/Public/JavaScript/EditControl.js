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
            this.button = $('.t3js-area-wizard-trigger');
            this.initialize();
        }
        EditControl.prototype.initialize = function () {
            this.initializeEvents();
        };
        EditControl.prototype.initializeEvents = function () {
            this.button.off('click').on('click', this.areaWizardTiggerClickHandler.bind(this));
        };
        EditControl.prototype.areaWizardTiggerClickHandler = function (event) {
            event.preventDefault();
            this.openModal();
        };
        EditControl.prototype.openModal = function () {
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done(this.iconLoaded.bind(this));
        };
        EditControl.prototype.iconLoaded = function (icon) {
            var _this = this;
            var modalTitle = this.button.data('modalTitle'), buttonAddRectangleText = this.button.data('buttonAddrectText'), buttonAddCircleText = this.button.data('buttonAddcircleText'), buttonAddPolygonText = this.button.data('buttonAddpolyText'), buttonDismissText = this.button.data('buttonDismissText'), buttonSaveText = this.button.data('buttonSaveText'), wizardUri = this.button.data('url'), payload = this.button.data('payload');
            /**
             * Open modal with areas to edit
             */
            this.currentModal = Modal.advanced({
                additionalCssClasses: ['modal-area-wizard modal-image-manipulation'],
                buttons: [
                    {
                        btnClass: 'btn-default pull-left button-add-rect',
                        icon: 'extensions-imagemap-rect',
                        text: buttonAddRectangleText,
                    },
                    {
                        btnClass: 'btn-default pull-left button-add-circle',
                        icon: 'extensions-imagemap-circle',
                        text: buttonAddCircleText,
                    },
                    {
                        btnClass: 'btn-default pull-left button-add-poly',
                        icon: 'extensions-imagemap-poly',
                        text: buttonAddPolygonText,
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
                content: $('<div class="modal-loading">').append(icon),
                size: Modal.sizes.full,
                style: Modal.styles.dark,
                title: modalTitle,
                callback: function (currentModal) {
                    _this.currentModal = currentModal;
                    $.post({
                        url: wizardUri,
                        data: payload
                    }).done(_this.modalLoaded.bind(_this));
                },
            });
            this.currentModal.on('hide.bs.modal', function () {
                _this.destroy();
            });
            // do not dismiss the modal when clicking beside it to avoid data loss
            this.currentModal.data('bs.modal').options.backdrop = 'static';
        };
        EditControl.prototype.modalLoaded = function (response) {
            this.currentModal
                .find('.t3js-modal-body')
                .html(response)
                .addClass('area-editor');
            this.initializeModal();
        };
        EditControl.prototype.initializeModal = function () {
            var _this = this;
            this.image = this.currentModal.find('.image img');
            this.configuration = this.currentModal.find('.image').data('configuration');
            this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
            this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
            this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
            this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
            this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));
            $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);
            this.image.on('load', function () {
                setTimeout(function () {
                    _this.initializeAreaEditor({
                        canvas: {
                            width: parseInt(_this.image.css('width')),
                            height: parseInt(_this.image.css('height')),
                            top: parseInt(_this.image.css('height')) * -1,
                        },
                        fauxFormDocument: window.document,
                        browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
                        browseLink: _this.configuration.browseLink
                    }, $('.picture').data('existingAreas'));
                }, 100);
            });
        };
        EditControl.prototype.initializeAreaEditor = function (editorOptions, areas) {
            var canvas = this.currentModal.find('#modal-canvas')[0];
            this.areaEditor = new AreaEditor_1.default(editorOptions, canvas, '#areasForm', this.currentModal[0]);
            this.areaEditor.initializeAreas(areas);
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
