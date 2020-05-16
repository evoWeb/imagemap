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
define(["require", "exports", "./AreaFieldsetAbstract"], function (require, exports, AreaFieldsetAbstract_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetRectangle extends AreaFieldsetAbstract_1.AreaFieldsetAbstract {
        constructor() {
            super(...arguments);
            this.name = 'rectangle';
        }
        updateFields() {
            for (let attributeKey in this.attributes) {
                if (!this.attributes.hasOwnProperty(attributeKey)) {
                    continue;
                }
                let attributeValue = this.attributes[attributeKey] || '', element = this.getElement('.' + attributeKey);
                if (element !== null) {
                    if (typeof attributeValue === 'number') {
                        attributeValue = attributeValue.toString();
                    }
                    element.value = attributeValue;
                }
            }
            for (let coordinatesKey in this.attributes.coords) {
                if (!this.attributes.coords.hasOwnProperty(coordinatesKey)) {
                    continue;
                }
                let coordinatesValue = this.attributes.coords[coordinatesKey] || '', element = this.getElement('.' + coordinatesKey);
                if (['left', 'right'].indexOf(coordinatesKey)) {
                    coordinatesValue = Math.round(coordinatesValue * this.form.editor.width);
                }
                else if (['top', 'bottom'].indexOf(coordinatesKey)) {
                    coordinatesValue = Math.round(coordinatesValue * this.form.editor.height);
                }
                if (element !== null) {
                    if (typeof coordinatesValue === 'number') {
                        coordinatesValue = coordinatesValue.toString();
                    }
                    element.value = coordinatesValue;
                }
            }
        }
        updateCanvas(event) {
            let field = (event.currentTarget || event.target), value = parseInt(field.value);
            switch (field.id) {
                case 'left':
                    this.attributes.coords.left = value / this.form.editor.width;
                    this.attributes.coords.right = (value + this.shape.getScaledWidth()) / this.form.editor.width;
                    this.getElement('#right').value = value + this.shape.getScaledWidth();
                    this.shape.set({ left: value });
                    break;
                case 'top':
                    this.attributes.coords.top = value / this.form.editor.height;
                    this.attributes.coords.bottom = (value + this.shape.getScaledHeight()) / this.form.editor.height;
                    this.getElement('#bottom').value = value + this.shape.getScaledHeight();
                    this.shape.set({ top: value });
                    break;
                case 'right':
                    this.attributes.coords.right = value / this.form.editor.width;
                    value -= this.shape.left;
                    if (value < 0) {
                        value = 10;
                        field.value = this.left + value;
                    }
                    this.shape.set({ width: value });
                    break;
                case 'bottom':
                    this.attributes.coords.bottom = value / this.form.editor.height;
                    value -= this.shape.top;
                    if (value < 0) {
                        value = 10;
                        field.value = this.top + value;
                    }
                    this.shape.set({ height: value });
                    break;
            }
            this.canvas.renderAll();
        }
    }
    exports.AreaFieldsetRectangle = AreaFieldsetRectangle;
});
