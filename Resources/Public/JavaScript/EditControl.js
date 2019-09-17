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
define(["require", "exports", "jquery", "./AreaManipulation", "TYPO3/CMS/Backend/Icons", "TYPO3/CMS/Backend/Modal", "TYPO3/CMS/Backend/FormEngineValidation", "TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min"], function (require, exports, $, AreaEditor, Icons, Modal, FormEngineValidation, ImagesLoaded) {
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
            this.button
                .off('click')
                .on('click', this.areaWizardTriggerClickHandler.bind(this));
        };
        EditControl.prototype.areaWizardTriggerClickHandler = function (event) {
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
                    _this.currentModal = currentModal;
                    $.post({
                        url: wizardUri,
                        data: payload
                    }).done(_this.modalLoaded.bind(_this));
                },
            });
            this.currentModal.on('hide.bs.modal', function () {
                _this.destruct();
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
            this.image = this.currentModal.find('.picture img');
            this.configuration = this.currentModal.find('#t3js-imagemap-container').data('configuration');
            this.buttonAddRect = this.currentModal.find('[data-method=rectangle]').off('click').on('click', this.buttonAddRectHandler.bind(this));
            this.buttonAddCircle = this.currentModal.find('[data-method=circle]').off('click').on('click', this.buttonAddCircleHandler.bind(this));
            this.buttonAddPoly = this.currentModal.find('[data-method=polygon]').off('click').on('click', this.buttonAddPolyHandler.bind(this));
            this.buttonDismiss = this.currentModal.find('[data-method=dismiss]').off('click').on('click', this.buttonDismissHandler.bind(this));
            this.buttonSave = this.currentModal.find('[data-method=save]').off('click').on('click', this.buttonSaveHandler.bind(this));
            $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);
            ImagesLoaded(this.image, function () {
                AreaEditor.AreaUtility.wait(_this.initializeAreaManipulation.bind(_this), 100);
            });
        };
        EditControl.prototype.initializeAreaManipulation = function () {
            this.canvasSize = {
                width: parseInt(this.image.css('width')),
                height: parseInt(this.image.css('height')),
            };
            this.areaManipulation = new AreaEditor.AreaManipulation(this.currentModal[0], {
                canvas: this.canvasSize,
                canvasSelector: '#modal-canvas',
                editControlDocument: window.document,
                browseLink: this.configuration.browseLink,
                browseLinkUrlAjaxUrl: top.window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
                formSelector: '[name="areasForm"]',
            });
            this.areaManipulation.initializeAreas(this.currentModal.find('.picture').data('existingAreas'));
        };
        EditControl.prototype.destruct = function () {
            if (this.currentModal) {
                this.currentModal = null;
            }
            if (this.areaManipulation) {
                this.areaManipulation.destruct();
                this.areaManipulation = null;
            }
        };
        EditControl.prototype.buttonAddRectHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaManipulation.initializeAreas([{
                    shape: 'rect',
                    data: { color: '' },
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
            this.areaManipulation.initializeAreas([{
                    shape: 'circle',
                    data: { color: '' },
                    coords: {
                        left: (width / 2),
                        top: (height / 2),
                        radius: 50
                    }
                }]);
        };
        EditControl.prototype.buttonAddPolyHandler = function (event) {
            event.stopPropagation();
            event.preventDefault();
            var width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaManipulation.initializeAreas([{
                    shape: 'poly',
                    data: { color: '' },
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
            var areasData = this.areaManipulation.getAreasData(), hiddenField = $("input[name=\"" + this.configuration.itemName + "\"]");
            hiddenField
                .val(areasData)
                .trigger('imagemap:changed');
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
