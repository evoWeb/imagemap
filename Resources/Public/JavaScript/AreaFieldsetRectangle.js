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
            for (let attributeKey in this.area) {
                if (!this.area.hasOwnProperty(attributeKey)) {
                    continue;
                }
                let attributeValue = this.area[attributeKey] || '', element = this.getElement('.' + attributeKey);
                if (element !== null) {
                    if (typeof attributeValue === 'number') {
                        attributeValue = attributeValue.toString();
                    }
                    element.value = attributeValue;
                }
            }
            for (let coordinatesKey in this.area.coords) {
                if (!this.area.coords.hasOwnProperty(coordinatesKey)) {
                    continue;
                }
                let coordinatesValue = this.area.coords[coordinatesKey] || '', element = this.getElement('.' + coordinatesKey);
                if (['left', 'right'].indexOf(coordinatesKey) > -1) {
                    coordinatesValue = this.outputX(coordinatesValue);
                }
                else if (['top', 'bottom'].indexOf(coordinatesKey) > -1) {
                    coordinatesValue = this.outputY(coordinatesValue);
                }
                if (element !== null) {
                    element.value = coordinatesValue;
                }
            }
        }
        shapeMoved(event) {
            console.log(event);
        }
        moveShape(event) {
            let field = (event.currentTarget || event.target), value = parseInt(field.value);
            switch (field.dataset.field) {
                case 'left':
                    this.area.coords.left = this.inputX(value);
                    this.area.coords.right = this.inputX(value + this.shape.getScaledWidth());
                    this.getElement('#right').value = value + this.shape.getScaledWidth();
                    this.shape.set({ left: value });
                    break;
                case 'top':
                    this.area.coords.top = this.inputY(value);
                    this.area.coords.bottom = this.inputY(value + this.shape.getScaledHeight());
                    this.getElement('#bottom').value = value + this.shape.getScaledHeight();
                    this.shape.set({ top: value });
                    break;
                case 'right':
                    this.area.coords.right = this.inputX(value);
                    value -= this.shape.left;
                    if (value < 0) {
                        value = 10;
                        field.value = this.left + value;
                    }
                    this.shape.set({ width: value });
                    break;
                case 'bottom':
                    this.area.coords.bottom = this.inputY(value);
                    value -= this.shape.top;
                    if (value < 0) {
                        value = 10;
                        field.value = this.top + value;
                    }
                    this.shape.set({ height: value });
                    break;
            }
            this.shape.canvas.renderAll();
        }
    }
    exports.AreaFieldsetRectangle = AreaFieldsetRectangle;
});
