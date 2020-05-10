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
define(["require", "exports", "jquery", "./vendor/Fabric", "./AreaShapeFactory"], function (require, exports, $, fabric, AreaShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FormElementAbstract {
        constructor(attributes, configuration) {
            this.id = 0;
            this.name = '';
            this.eventDelay = 0;
            this.attributes = {};
            this.configuration = {};
            this.attributes = attributes;
            this.configuration = configuration;
        }
        postAddToForm() {
            this.id = fabric.Object.__uid++;
            this.initializeElement();
            this.updateFields();
            this.initializeColorPicker();
            this.initializeEvents();
            this.addFauxInput();
        }
        initializeElement() {
            this.element = this.getFormElement('#' + this.name + 'Form', this.id);
            this.form.areaZone.append(this.element);
            this.form.updateArrowsState();
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
            this.areaShape.on('moved', this.updateFields.bind(this));
            this.areaShape.on('modified', this.updateFields.bind(this));
            this.getElements('.basicOptions .t3js-field').forEach((field) => {
                field.addEventListener('keyup', this.updateProperties.bind(this));
            });
            this.getElements('.positionOptions .t3js-field').forEach((field) => {
                field.addEventListener('input', this.fieldInputHandler.bind(this));
            });
            this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
        }
        fieldInputHandler(event) {
            clearTimeout(this.eventDelay);
            this.eventDelay = FormElementAbstract.wait(() => { this.updateCanvas(event); }, 500);
        }
        buttonEventHandler(button) {
            let action = button.dataset.action + 'Action';
            button.removeEventListener('click', this[action]);
            button.addEventListener('click', this[action].bind(this));
        }
        updateArrowsState() {
            let areaZone = this.form.areaZone;
            this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
            this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
        }
        updateFields() {
        }
        updateProperties(event) {
            let field = event.currentTarget, property = field.id;
            if (field.classList.contains('href')) {
                this.attributes.href = field.value;
            }
            else if (this.attributes.hasOwnProperty(property)) {
                this.attributes[property] = field.value;
            }
        }
        updateCanvas(event) {
        }
        linkAction(event) {
            this.form.openLinkBrowser(event.currentTarget, this);
        }
        upAction() {
            this.form.moveArea(this, FormElementAbstract.before);
        }
        downAction() {
            this.form.moveArea(this, FormElementAbstract.after);
        }
        deleteAction() {
            if (this.element) {
                this.element.remove();
            }
            if (this.form) {
                this.form.updateArrowsState();
            }
            this.removeFauxInput();
            this.editor.deleteArea(this);
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
            this.getElement('.t3js-color-picker').value = value;
            this.areaShape.set('borderColor', value);
            this.areaShape.set('stroke', value);
            this.areaShape.set('fill', AreaShapeFactory_1.AreaShapeFactory.hexToRgbA(value, 0.2));
            this.editor.canvas.renderAll();
        }
        getFormElement(selector, id) {
            let template = this.form.element.querySelector(selector)
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
        /**
         * Add faux input as target for browselink which listens for changes and writes value to real field
         */
        addFauxInput() {
            if (this.form.fauxForm) {
                let fauxInput = this.editor.fauxFormDocument.createElement('input');
                fauxInput.setAttribute('id', 'href' + this.id);
                fauxInput.setAttribute('data-formengine-input-name', 'href' + this.id);
                fauxInput.setAttribute('value', this.attributes.href);
                fauxInput.onchange = this.changedFauxInput.bind(this);
                this.form.fauxForm.appendChild(fauxInput);
            }
        }
        removeFauxInput() {
            if (this.form && this.form.fauxForm !== null) {
                let field = this.form.fauxForm.querySelector('#href' + this.id);
                if (field) {
                    field.remove();
                }
            }
        }
        changedFauxInput() {
            let field = this.form.fauxForm.querySelector('#href' + this.id);
            this.attributes.href = field.value;
            this.updateFields();
        }
        static wait(callback, delay) {
            return window.setTimeout(callback, delay);
        }
    }
    exports.FormElementAbstract = FormElementAbstract;
    FormElementAbstract.before = -1;
    FormElementAbstract.after = 1;
});
