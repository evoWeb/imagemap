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
define(["require", "exports", "./AreaFieldsetAbstract", "./AreaForm"], function (require, exports, AreaFieldsetAbstract_1, AreaForm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetCircle extends AreaFieldsetAbstract_1.AreaFieldsetAbstract {
        constructor() {
            super(...arguments);
            this.name = 'circle';
        }
        updateFields() {
            for (let attributeKey in this.area) {
                if (!this.area.hasOwnProperty(attributeKey)) {
                    continue;
                }
                let attributeValue = this.area[attributeKey] || '', element = this.getElement(`.${attributeKey}`);
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
                let coordinatesValue = this.area.coords[coordinatesKey] || '', element = this.getElement(`.${coordinatesKey}`);
                if (['left', 'radius'].indexOf(coordinatesKey) > -1) {
                    coordinatesValue = AreaForm_1.AreaForm.outputX(coordinatesValue);
                }
                else if (['top'].indexOf(coordinatesKey) > -1) {
                    coordinatesValue = AreaForm_1.AreaForm.outputY(coordinatesValue);
                }
                if (element !== null) {
                    element.value = coordinatesValue;
                }
            }
        }
        shapeModified(event) {
            let shape = event.target, radius = shape.getRadiusX(), left = shape.left + radius, top = shape.top + radius;
            this.area.coords.left = AreaForm_1.AreaForm.inputX(left);
            this.area.coords.top = AreaForm_1.AreaForm.inputY(top);
            this.area.coords.radius = AreaForm_1.AreaForm.inputX(radius);
            this.getElement('.left').setAttribute('value', left);
            this.getElement('.top').setAttribute('value', top);
            this.getElement('.radius').setAttribute('value', radius);
        }
        moveShape(event) {
            let field = (event.currentTarget || event.target), value = parseInt(field.value);
            switch (field.dataset.field) {
                case 'left':
                    value -= parseInt(this.getElement(`.radius`).value);
                    this.area.coords.left = AreaForm_1.AreaForm.inputX(value);
                    this.shape.set({ left: value });
                    break;
                case 'top':
                    value -= parseInt(this.getElement(`.radius`).value);
                    this.area.coords.top = AreaForm_1.AreaForm.inputY(value);
                    this.shape.set({ top: value });
                    break;
                case 'radius':
                    this.area.coords.top = AreaForm_1.AreaForm.inputX(value);
                    this.shape.set({ radius: value });
                    break;
            }
            this.form.canvas.renderAll();
        }
    }
    exports.AreaFieldsetCircle = AreaFieldsetCircle;
});
