/*
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */
define(["require", "exports", "jquery", "./AreaEditor", "TYPO3/CMS/Backend/Icons", "TYPO3/CMS/Backend/Modal", "TYPO3/CMS/Backend/FormEngineValidation", "TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min"], function (require, exports, $, AreaEditor_1, Icons, Modal, FormEngineValidation, ImagesLoaded) {
    "use strict";
    class EditControl {
        constructor(fieldSelector) {
            this.initializeFormElement(fieldSelector);
            this.initializeEvents();
        }
        initializeFormElement(fieldSelector) {
            this.hiddenInput = document.querySelector(fieldSelector);
        }
        initializeEvents() {
            this.trigger = $('.t3js-area-wizard-trigger');
            this.trigger
                .off('click')
                .on('click', this.triggerHandler.bind(this));
        }
        triggerHandler(event) {
            event.preventDefault();
            this.openModal();
        }
        openModal() {
            let modalTitle = this.trigger.data('modalTitle'), buttonAddRectangleText = this.trigger.data('buttonAddrectText'), buttonAddCircleText = this.trigger.data('buttonAddcircleText'), buttonAddPolygonText = this.trigger.data('buttonAddpolyText'), buttonDismissText = this.trigger.data('buttonDismissText'), buttonSaveText = this.trigger.data('buttonSaveText'), wizardUri = this.trigger.data('url'), payload = this.trigger.data('payload'), initWizardModal = this.initialize.bind(this);
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon) => {
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
                    callback: (currentModal) => {
                        $.post({
                            url: wizardUri,
                            data: payload
                        }).done((response) => {
                            currentModal.find('.t3js-modal-body').html(response).addClass('area-editor');
                            initWizardModal();
                        });
                    },
                });
                this.currentModal.on('hide.bs.modal', () => {
                    this.destroy();
                });
                // do not dismiss the modal when clicking beside it to avoid data loss
                this.currentModal.data('bs.modal').options.backdrop = 'static';
            });
        }
        initialize() {
            this.image = this.currentModal.find('img.image');
            this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
            this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
            this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
            this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
            this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));
            $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);
            ImagesLoaded(this.image, () => {
                setTimeout(this.initializeArea.bind(this), 100);
            });
        }
        initializeArea() {
            let width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height')), editorOptions = {
                canvas: {
                    width: width,
                    height: height,
                    top: height * -1,
                },
                fauxFormDocument: window.document,
                formSelector: '[name="areasForm"]',
            };
            let canvas = this.currentModal.find('#modal-canvas')[0];
            this.areaEditor = new AreaEditor_1.AreaEditor(editorOptions, canvas, '#areasForm', this.currentModal[0]);
            window.imagemap = { areaEditor: this.areaEditor };
            let areas = this.hiddenInput.value;
            if (areas.length) {
                this.areaEditor.renderAreas(JSON.parse(areas));
            }
        }
        destroy() {
            if (this.currentModal) {
                this.currentModal = null;
                this.areaEditor.form.destroy();
                this.areaEditor = null;
            }
        }
        buttonAddRectHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            let width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.renderAreas([{
                    shape: 'rect',
                    coords: {
                        left: (width / 2 - 50),
                        top: (height / 2 - 50),
                        right: (width / 2 + 50),
                        bottom: (height / 2 + 50)
                    },
                }]);
        }
        buttonAddCircleHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            let width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.renderAreas([{
                    shape: 'circle',
                    coords: {
                        left: (width / 2),
                        top: (height / 2),
                        radius: 50
                    },
                }]);
        }
        buttonAddPolyHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            let width = parseInt(this.image.css('width')), height = parseInt(this.image.css('height'));
            this.areaEditor.renderAreas([{
                    shape: 'poly',
                    points: [
                        { x: (width / 2), y: (height / 2 - 50) },
                        { x: (width / 2 + 50), y: (height / 2 + 50) },
                        { x: (width / 2), y: (height / 2 + 70) },
                        { x: (width / 2 - 50), y: (height / 2 + 50) },
                    ]
                }]);
        }
        buttonDismissHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            this.currentModal.modal('hide');
        }
        buttonSaveHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            let hiddenField = $(this.hiddenInput);
            this.hiddenInput.value = this.areaEditor.getMapData();
            hiddenField.trigger('imagemap:changed');
            FormEngineValidation.markFieldAsChanged(hiddenField);
            this.currentModal.modal('hide');
        }
        hideColorSwatch(event) {
            if (!$(event.target).parents().add(event.target).hasClass('minicolors')) {
                // Hides all dropdown panels
                top.window.$('.minicolors-focus').each(() => {
                    let minicolors = $(this), input = minicolors.find('.minicolors-input'), panel = minicolors.find('.minicolors-panel'), settings = input.data('minicolors-settings');
                    panel.fadeOut(settings.hideSpeed, () => {
                        if (settings.hide)
                            settings.hide.call(input.get(0));
                        minicolors.removeClass('minicolors-focus');
                    });
                });
            }
        }
    }
    return EditControl;
});
