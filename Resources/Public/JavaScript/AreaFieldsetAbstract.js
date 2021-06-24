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
define(["require", "exports", "jquery", "./AreaShapeFactory"], function (require, exports, $, AreaShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetAbstract {
        constructor(area, configuration, shape) {
            this.name = '';
            this.id = 0;
            this.moveShapeDelay = 0;
            this.area = {};
            this.area = area;
            this.configuration = configuration;
            this.shape = shape;
            this.shape.fieldset = this;
            this.id = this.shape.id;
        }
        addForm(form) {
            this.form = form;
            this.initializeElement();
            this.updateFields();
            this.initializeColorPicker();
            this.initializeEvents();
            this.addBrowselinkTargetInput();
        }
        initializeElement() {
            this.element = this.getFieldsetElement(`#${this.name}Form`, this.id);
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
            this.initializeInformationFieldEvents(this.getElements('.basicOptions .t3js-field'));
            this.initializeCoordinateFieldEvents(this.getElements('.positionOptions .t3js-field'));
            this.initializeButtonEvents(this.getElements('.t3js-btn'));
            this.initializeShapeEvents(this.shape);
        }
        initializeInformationFieldEvents(fields) {
            fields.forEach((field) => {
                field.removeEventListener('keyup', this.basicOptionsHandler);
                field.addEventListener('keyup', this.basicOptionsHandler.bind(this));
            });
        }
        initializeCoordinateFieldEvents(fields) {
            fields.forEach((field) => {
                field.removeEventListener('input', this.positionOptionsHandler);
                field.addEventListener('input', this.positionOptionsHandler.bind(this));
            });
        }
        initializeButtonEvents(buttons) {
            buttons.forEach((button) => {
                let action = button.dataset.action + 'Action';
                button.removeEventListener('click', this[action]);
                button.addEventListener('click', this[action].bind(this));
            });
        }
        initializeShapeEvents(shape) {
            [
                'moving',
                'moved',
                'mouseup',
                'mousedown',
                'mousemove',
                'mouseup:before',
                'mousedown:before',
                'mousedblclick',
                'mousewheel',
                'mouseover',
                'mouseout',
            ].forEach((eventName) => {
                shape.on(eventName, (e) => { console.log(e, eventName); });
            });
        }
        basicOptionsHandler(event) {
            let field = event.currentTarget;
            this.area[field.dataset.field] = field.value;
        }
        positionOptionsHandler(event) {
            this.moveShapeDelay = AreaFieldsetAbstract.wait(() => { this.moveShape(event); }, 500, this.moveShapeDelay);
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
            this.form.deleteArea(this);
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
            this.area.color = value;
            this.getElement('.t3js-color-picker').setAttribute('value', this.area.color);
            this.shape.set('borderColor', this.area.color);
            this.shape.set('stroke', this.area.color);
            this.shape.set('fill', AreaShapeFactory_1.AreaShapeFactory.hexToRgbA(this.area.color, 0.2));
            this.form.canvas.renderAll();
        }
        getFieldsetElement(selector, id) {
            let template = this.form.modalParent.querySelector(selector)
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
            return this.area;
        }
        /**
         * Add an input as target for browselink which listens for changes and writes value to real field
         */
        addBrowselinkTargetInput() {
            if (this.form.browselinkTargetForm) {
                let input = this.form.browselinkParent.createElement('input');
                input.id = `href${this.id}_target`;
                input.value = this.area.href;
                input.setAttribute('data-formengine-input-name', input.id);
                input.onchange = this.changedBrowselinkTargetInput.bind(this);
                this.form.browselinkTargetForm.appendChild(input);
            }
        }
        removeBrowselinkTargetInput() {
            if (this.form && this.form.browselinkTargetForm) {
                let field = this.form.browselinkTargetForm.querySelector(`#href${this.id}_target`);
                if (field) {
                    field.remove();
                }
            }
        }
        changedBrowselinkTargetInput() {
            let field = this.form.browselinkTargetForm.querySelector(`#href${this.id}_target`);
            this.area.href = field.value;
            console.log(this, 'changedBrowselinkTargetInput');
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
