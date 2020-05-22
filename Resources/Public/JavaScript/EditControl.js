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
define(["require", "exports", "jquery", "TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min", "TYPO3/CMS/Backend/Icons", "TYPO3/CMS/Backend/Modal", "./AreaForm", "./Editor"], function (require, exports, $, ImagesLoaded, Icons, Modal, AreaForm_1, Editor_1) {
    "use strict";
    class EditControl {
        constructor(fieldSelector) {
            this.editorImageSelector = '#t3js-editor-image';
            this.formElementSelector = '#t3js-imagemap-container';
            this.resizeTimeout = 450;
            this.initializeFormElement(fieldSelector);
            this.initializeTrigger();
            this.resizeEnd(this.resizeEditor.bind(this));
        }
        initializeFormElement(fieldSelector) {
            this.hiddenInput = document.querySelector(fieldSelector);
        }
        initializeTrigger() {
            this.trigger = document.querySelector('.t3js-area-wizard-trigger');
            this.trigger.removeEventListener('click', this.triggerHandler);
            this.trigger.addEventListener('click', this.triggerHandler.bind(this));
        }
        triggerHandler(event) {
            event.preventDefault();
            this.show();
        }
        initializeAreaEditorModal() {
            const image = this.currentModal[0].querySelector(this.editorImageSelector);
            ImagesLoaded(image, () => {
                setTimeout(() => {
                    AreaForm_1.AreaForm.width = image.width;
                    AreaForm_1.AreaForm.height = image.height;
                    this.init();
                }, 100);
            });
        }
        show() {
            const modalTitle = this.trigger.dataset.modalTitle, buttonAddRectangleText = this.trigger.dataset.buttonAddrectText, buttonAddCircleText = this.trigger.dataset.buttonAddcircleText, buttonAddPolygonText = this.trigger.dataset.buttonAddpolyText, buttonDismissText = this.trigger.dataset.buttonDismissText, buttonSaveText = this.trigger.dataset.buttonSaveText, wizardUri = this.trigger.dataset.url, payload = JSON.parse(this.trigger.dataset.payload), initEditorModal = this.initializeAreaEditorModal.bind(this);
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon) => {
                let content = '<div class="modal-loading">' + icon + '</div>';
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
                            icon: 'extensions-imagemap-rectangle',
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
                            icon: 'extensions-imagemap-polygon',
                            text: buttonAddPolygonText,
                        },
                        {
                            btnClass: 'btn-default',
                            dataAttributes: {
                                method: 'dismiss',
                            },
                            icon: 'actions-close',
                            text: buttonDismissText,
                        },
                        {
                            btnClass: 'btn-primary',
                            dataAttributes: {
                                method: 'save',
                            },
                            icon: 'actions-document-save',
                            text: buttonSaveText,
                        },
                    ],
                    content: content,
                    size: Modal.sizes.full,
                    style: Modal.styles.dark,
                    title: modalTitle,
                    callback: (currentModal) => {
                        let data = new FormData(), request = new XMLHttpRequest();
                        data.append('arguments', payload.arguments);
                        data.append('signature', payload.signature);
                        request.open('POST', wizardUri);
                        request.onreadystatechange = (e) => {
                            let request = e.target;
                            if (request.readyState === 4 && request.status === 200) {
                                currentModal.find('.t3js-modal-body').html(request.responseText).addClass('imagemap-editor');
                                initEditorModal();
                            }
                        };
                        request.send(data);
                    },
                });
                this.currentModal.on('hide.bs.modal', () => {
                    this.destroy();
                });
                // do not dismiss the modal when clicking beside it to avoid data loss
                this.currentModal.data('bs.modal').options.backdrop = 'static';
            });
        }
        init() {
            let modal = this.currentModal[0];
            this.formElement = modal.querySelector(this.formElementSelector);
            this.buttonAddCircle = modal.querySelector('[data-method=circle]');
            this.buttonAddCircle.removeEventListener('click', this.buttonAddCircleHandler);
            this.buttonAddCircle.addEventListener('click', this.buttonAddCircleHandler.bind(this));
            this.buttonAddPolygon = modal.querySelector('[data-method=polygon]');
            this.buttonAddPolygon.removeEventListener('click', this.buttonAddPolygonHandler);
            this.buttonAddPolygon.addEventListener('click', this.buttonAddPolygonHandler.bind(this));
            this.buttonAddRectangle = modal.querySelector('[data-method=rectangle]');
            this.buttonAddRectangle.removeEventListener('click', this.buttonAddRectangleHandler);
            this.buttonAddRectangle.addEventListener('click', this.buttonAddRectangleHandler.bind(this));
            this.buttonDismiss = modal.querySelector('[data-method=dismiss]');
            this.buttonDismiss.removeEventListener('click', this.buttonDismissHandler);
            this.buttonDismiss.addEventListener('click', this.buttonDismissHandler.bind(this));
            this.buttonSave = modal.querySelector('[data-method=save]');
            this.buttonSave.removeEventListener('click', this.buttonSaveHandler);
            this.buttonSave.addEventListener('click', this.buttonSaveHandler.bind(this));
            $(top.document).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);
            this.initializeEditor();
            this.renderAreas(this.hiddenInput.value);
        }
        initializeEditor() {
            let image = this.formElement.querySelector(this.editorImageSelector), data = this.hiddenInput.dataset, configurations = {
                formSelector: '#areasForm',
                tableName: data.tablename,
                fieldName: data.fieldname,
                uid: parseInt(data.uid),
                pid: parseInt(data.pid),
            }, modalParent = image.parentNode;
            while (modalParent.parentNode) {
                modalParent = modalParent.parentNode;
            }
            this.editor = new Editor_1.Editor(configurations, this.formElement.querySelector('#canvas'), modalParent, 
            // document in which the browslink is able to set fields
            window.document);
        }
        resizeEditor() {
            if (this.editor) {
                let image = this.formElement.querySelector(this.editorImageSelector);
                this.editor.resize(image.offsetWidth, image.offsetHeight);
            }
        }
        renderAreas(areas) {
            if (areas.length) {
                this.editor.renderAreas(JSON.parse(areas));
            }
        }
        destroy() {
            if (this.currentModal) {
                this.editor.destroy();
                this.editor = null;
                this.currentModal = null;
            }
        }
        buttonAddRectangleHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            this.editor.renderAreas([{
                    shape: 'rect',
                    coords: {
                        left: 0.4,
                        top: 0.4,
                        right: 0.4,
                        bottom: 0.4
                    },
                }]);
        }
        buttonAddCircleHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            this.editor.renderAreas([{
                    shape: 'circle',
                    coords: {
                        left: 0.5,
                        top: 0.5,
                        radius: 0.2
                    },
                }]);
        }
        buttonAddPolygonHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            this.editor.renderAreas([{
                    shape: 'poly',
                    points: [
                        { x: 0.5, y: 0.4 },
                        { x: 0.6, y: 0.6 },
                        { x: 0.5, y: 0.7 },
                        { x: 0.4, y: 0.6 },
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
            this.hiddenInput.value = this.editor.getMapData();
            this.hiddenInput.dispatchEvent(new CustomEvent('imagemap:changed'));
            // without FormEngineValidation.markFieldAsChanged call
            EditControl.closest(this.hiddenInput, '.t3js-formengine-palette-field').classList.add('has-change');
            this.currentModal.modal('hide');
        }
        hideColorSwatch(event) {
            let swatch = (event.target);
            if (!$(swatch).parents().add(swatch).hasClass('minicolors')) {
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
        /**
         * Calls a function when the editor window has been resized
         */
        resizeEnd(callback) {
            let timer;
            window.addEventListener('resize', () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    callback();
                }, this.resizeTimeout);
            });
        }
        static closest(element, selector) {
            let parent;
            // traverse parents
            while (element) {
                parent = element.parentElement;
                if (parent && parent.matches(selector)) {
                    element = parent;
                    break;
                }
                element = parent;
            }
            return element;
        }
    }
    return EditControl;
});
