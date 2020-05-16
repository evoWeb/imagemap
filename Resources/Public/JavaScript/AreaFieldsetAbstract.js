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
define(["require", "exports", "jquery", "./vendor/Fabric", "./AreaShapeFactory"], function (require, exports, $, Fabric_1, AreaShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetAbstract {
        constructor(attributes, configuration, shape) {
            this.id = 0;
            this.name = '';
            this.updateCanvasDelay = 0;
            this.attributes = {};
            this.configuration = {};
            this.attributes = attributes;
            this.configuration = configuration;
            this.shape = shape;
            this.id = Fabric_1.Object.__uid++;
        }
        postAddToForm() {
            this.initializeElement();
            this.updateFields();
            this.initializeColorPicker();
            this.initializeEvents();
            this.addBrowselinkTargetInput();
        }
        initializeElement() {
            this.element = this.getFormElement(`#${this.name}Form`, this.id);
            this.form.element.append(this.element);
        }
        initializeColorPicker() {
            $(this.getElement('.t3js-color-picker')).minicolors({
                format: 'hex',
                position: 'left',
                theme: 'default',
                changeDelay: 100,
                change: this.colorPickerAction.bind(this)
            });
        }
        initializeEvents() {
            this.shape.on('moved', this.updateFields.bind(this));
            this.shape.on('modified', this.updateFields.bind(this));
            this.getElements('.basicOptions .t3js-field').forEach((field) => {
                field.addEventListener('keyup', this.updateProperties.bind(this));
            });
            this.getElements('.positionOptions .t3js-field').forEach((field) => {
                field.addEventListener('input', this.fieldInputHandler.bind(this));
            });
            this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
        }
        updateProperties(event) {
            let field = event.currentTarget, property = field.id;
            this.attributes[property] = field.value;
        }
        fieldInputHandler(event) {
            this.updateCanvasDelay = AreaFieldsetAbstract.wait(() => { this.updateCanvas(event); }, 500, this.updateCanvasDelay);
        }
        buttonEventHandler(button) {
            let action = button.dataset.action + 'Action';
            button.removeEventListener('click', this[action]);
            button.addEventListener('click', this[action].bind(this));
        }
        updateArrowsState() {
            let areasForm = this.form.element, upButton = this.getElement('[data-action="up"]'), downButton = this.getElement('[data-action="down"]');
            if (areasForm.firstChild !== this.element) {
                upButton.classList.remove('disabled');
            }
            else {
                upButton.classList.add('disabled');
            }
            if (areasForm.lastChild !== this.element) {
                downButton.classList.remove('disabled');
            }
            else {
                downButton.classList.add('disabled');
            }
        }
        linkAction(event) {
            this.form.openLinkBrowser(event.currentTarget, this);
        }
        upAction() {
            this.form.moveArea(this, AreaFieldsetAbstract.before);
        }
        downAction() {
            this.form.moveArea(this, AreaFieldsetAbstract.after);
        }
        deleteAction() {
            if (this.element) {
                this.element.remove();
            }
            this.removeBrowselinkTargetInput();
            this.form.updateArrowsState();
            this.form.editor.deleteArea(this);
        }
        expandAction() {
            this.showElement('.moreOptions');
            this.showElement('[data-action="collapse"]');
            this.hideElement('[data-action="expand"]');
        }
        collapseAction() {
            this.hideElement('.moreOptions');
            this.hideElement('[data-action="collapse"]');
            this.showElement('[data-action="expand"]');
        }
        undoAction() {
        }
        redoAction() {
        }
        colorPickerAction(value) {
            this.attributes.color = value;
            this.getElement('.t3js-color-picker').value = this.attributes.color;
            this.shape.set('borderColor', this.attributes.color);
            this.shape.set('stroke', this.attributes.color);
            this.shape.set('fill', AreaShapeFactory_1.AreaShapeFactory.hexToRgbA(this.attributes.color, 0.2));
            this.form.editor.canvas.renderAll();
        }
        getFormElement(selector, id) {
            let template = this.form.editor.modalParent.querySelector(selector)
                .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
            return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild;
        }
        getElement(selector) {
            return this.element.querySelector(selector);
        }
        getElements(selector) {
            return this.element.querySelectorAll(selector);
        }
        hideElement(selector) {
            this.getElement(selector).classList.add('hide');
        }
        showElement(selector) {
            this.getElement(selector).classList.remove('hide');
        }
        getFieldValue(selector) {
            return this.getElement(selector).value;
        }
        getData() {
            return this.attributes;
        }
        /**
         * Add an input as target for browselink which listens for changes and writes value to real field
         */
        addBrowselinkTargetInput() {
            if (this.form.browselinkTargetForm) {
                let browselinkTargetInput = this.form.editor.browselinkParent.createElement('input');
                browselinkTargetInput.setAttribute('id', 'href' + this.id);
                browselinkTargetInput.setAttribute('data-formengine-input-name', 'href' + this.id);
                browselinkTargetInput.setAttribute('value', this.attributes.href);
                browselinkTargetInput.onchange = this.changedBrowselinkTargetInput.bind(this);
                this.form.browselinkTargetForm.appendChild(browselinkTargetInput);
            }
        }
        removeBrowselinkTargetInput() {
            if (this.form && this.form.browselinkTargetForm !== null) {
                let field = this.form.browselinkTargetForm.querySelector('#href' + this.id);
                if (field) {
                    field.remove();
                }
            }
        }
        changedBrowselinkTargetInput() {
            let field = this.form.browselinkTargetForm.querySelector('#href' + this.id);
            this.attributes.href = field.value;
            this.updateFields();
        }
        static wait(callback, delay, timer) {
            clearTimeout(timer);
            return window.setTimeout(callback, delay);
        }
    }
    exports.AreaFieldsetAbstract = AreaFieldsetAbstract;
    AreaFieldsetAbstract.before = -1;
    AreaFieldsetAbstract.after = 1;
});
