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
define(["require", "exports", "../AbstractFieldset"], function (require, exports, AbstractFieldset_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RectangleFieldset extends AbstractFieldset_1.AbstractFieldset {
        constructor() {
            super(...arguments);
            this.name = 'rectangle';
        }
        updateFields() {
            for (let attributeKey in this.area.areaData) {
                if (!this.area.areaData.hasOwnProperty(attributeKey)) {
                    continue;
                }
                let attributeValue = this.area.areaData[attributeKey] || '', element = this.getElement(`.${attributeKey}`);
                if (element !== null) {
                    if (typeof attributeValue === 'number') {
                        attributeValue = attributeValue.toString();
                    }
                    element.value = attributeValue;
                }
            }
            for (let coordinatesKey in this.area.areaData.coords) {
                if (!this.area.areaData.coords.hasOwnProperty(coordinatesKey)) {
                    continue;
                }
                let coordinatesValue = this.area.areaData.coords[coordinatesKey] || '', element = this.getElement(`.${coordinatesKey}`);
                if (['left', 'right'].indexOf(coordinatesKey) > -1) {
                    coordinatesValue = this.area.outputX(coordinatesValue);
                }
                else if (['top', 'bottom'].indexOf(coordinatesKey) > -1) {
                    coordinatesValue = this.area.outputY(coordinatesValue);
                }
                if (element !== null) {
                    element.value = coordinatesValue;
                }
            }
        }
        shapeModified(left, top, right, bottom) {
            this.getElement('.left').setAttribute('value', left.toString());
            this.getElement('.top').setAttribute('value', top.toString());
            this.getElement('.right').setAttribute('value', right.toString());
            this.getElement('.bottom').setAttribute('value', bottom.toString());
        }
        fieldsetModified(event) {
            this.area.fieldsetModified(event);
        }
    }
    exports.RectangleFieldset = RectangleFieldset;
});
