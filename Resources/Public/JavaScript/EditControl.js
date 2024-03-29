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
define(["require", "exports", "imagesloaded", "TYPO3/CMS/Backend/Icons", "TYPO3/CMS/Backend/Modal", "./Editor", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, ImagesLoaded, Icons, Modal, Editor_1) {
    "use strict";
    class EditControl {
        constructor(fieldSelector) {
            this.editorImageSelector = '#t3js-editor-image';
            this.formElementSelector = '#t3js-imagemap-container';
            this.resizeTimeout = 450;
            this.initializeFormElement(fieldSelector);
            this.initializeEvents();
        }
        initializeFormElement(fieldSelector) {
            this.hiddenInput = document.querySelector(fieldSelector);
        }
        initializeEvents() {
            this.trigger = document.querySelector('.t3js-area-wizard-trigger');
            this.trigger.removeEventListener('click', this.triggerHandler);
            this.trigger.addEventListener('click', this.triggerHandler.bind(this));
        }
        triggerHandler(event) {
            event.stopPropagation();
            event.preventDefault();
            Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).then(this.createModal.bind(this));
        }
        createModal(icon) {
            const wizardUri = this.trigger.dataset.url, payload = JSON.parse(this.trigger.dataset.payload), modalLoading = document.createElement('div');
            modalLoading.innerHTML = icon;
            modalLoading.setAttribute('class', 'modal-loading');
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
                        text: this.trigger.dataset.buttonAddrectText,
                    },
                    {
                        btnClass: 'btn-default pull-left',
                        dataAttributes: {
                            method: 'circle',
                        },
                        icon: 'extensions-imagemap-circle',
                        text: this.trigger.dataset.buttonAddcircleText,
                    },
                    {
                        btnClass: 'btn-default pull-left',
                        dataAttributes: {
                            method: 'polygon',
                        },
                        icon: 'extensions-imagemap-polygon',
                        text: this.trigger.dataset.buttonAddpolyText,
                    },
                    {
                        btnClass: 'btn-default',
                        dataAttributes: {
                            method: 'dismiss',
                        },
                        icon: 'actions-close',
                        text: this.trigger.dataset.buttonDismissText,
                    },
                    {
                        btnClass: 'btn-primary',
                        dataAttributes: {
                            method: 'save',
                        },
                        icon: 'actions-document-save',
                        text: this.trigger.dataset.buttonSaveText,
                    },
                ],
                content: modalLoading,
                size: Modal.sizes.full,
                style: Modal.styles.dark,
                title: this.trigger.dataset.modalTitle,
                callback: () => {
                    let data = new FormData();
                    data.append('arguments', payload.arguments);
                    data.append('signature', payload.signature);
                    fetch(wizardUri, {
                        method: 'POST',
                        cache: 'no-cache',
                        credentials: 'same-origin',
                        body: data
                    })
                        .then(async (response) => {
                        this.currentModal.find('.t3js-modal-body').html(await response.text()).addClass('imagemap-editor');
                        this.currentModal.find('.modal-loading').remove();
                        this.waitForImageToBeLoaded();
                    });
                },
            });
            this.currentModal.on('hide.bs.modal', () => {
                this.destroy();
            });
        }
        waitForImageToBeLoaded() {
            const image = this.currentModal[0].querySelector(this.editorImageSelector);
            ImagesLoaded(image, () => {
                this.initializeEventHandler();
                this.initializeEditor(image);
                this.resizeEnd(this.resizeEditor.bind(this));
                this.renderAreas(this.hiddenInput.value);
            });
        }
        initializeEventHandler() {
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
        }
        initializeEditor(image) {
            let data = this.hiddenInput.dataset, configurations = {
                formSelector: '#areasForm',
                tableName: data.tablename,
                fieldName: data.fieldname,
                uid: parseInt(data.uid),
                pid: parseInt(data.pid),
                width: image.width,
                height: image.height
            };
            this.editor = new Editor_1.Editor(this.formElement.querySelector('#canvas'), configurations, this.getTopMostParentOfElement(image), window.document);
        }
        getTopMostParentOfElement(modalParent) {
            while (modalParent.parentNode) {
                modalParent = modalParent.parentNode;
            }
            return modalParent;
        }
        /**
         * Calls a function when the editor window has been resized
         */
        resizeEnd(callback) {
            let timer;
            window.addEventListener('resize', () => {
                clearTimeout(timer);
                timer = setTimeout(callback, this.resizeTimeout);
            });
        }
        resizeEditor() {
            if (this.editor) {
                let image = this.formElement.querySelector(this.editorImageSelector);
                this.editor.resize(image.offsetWidth, image.offsetHeight);
            }
        }
        renderAreas(value) {
            if (value.length) {
                let areas = JSON.parse(value);
                if (areas !== undefined && areas.length) {
                    this.editor.renderAreas(areas);
                }
            }
        }
        destroy() {
            if (this.currentModal) {
                if (this.editor instanceof Editor_1.Editor) {
                    this.editor.destroy();
                }
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
                        left: 0.3,
                        top: 0.3,
                        right: 0.7,
                        bottom: 0.7
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
