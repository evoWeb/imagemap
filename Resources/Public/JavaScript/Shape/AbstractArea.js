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
define(["require", "exports", "../AreaForm"], function (require, exports, AreaForm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AbstractArea {
        constructor(areaData) {
            this.id = 0;
            this.areaData = {};
            this.areaData = new Proxy(areaData, {
                set(target, property, value) {
                    console.log(`Property ${property} has been set to value ` + value);
                    target[property] = value;
                    return true;
                }
            });
        }
        setFieldset(fieldset) {
            this.sidebarFieldset = fieldset;
        }
        setShape(shape) {
            this.canvasShape = shape;
            this.id = this.canvasShape.id;
        }
        getData() {
            return this.areaData;
        }
        shapeModified(event) {
        }
        fieldsetModified(event) {
            this.canvasShape.fieldsetModified(event);
        }
        inputX(value) {
            return value / AreaForm_1.AreaForm.width;
        }
        inputY(value) {
            return value / AreaForm_1.AreaForm.height;
        }
        outputiX(value) {
            return Math.round(value * AreaForm_1.AreaForm.width);
        }
        outputiY(value) {
            return Math.round(value * AreaForm_1.AreaForm.height);
        }
        outputX(value) {
            return this.outputiX(value).toString();
        }
        outputY(value) {
            return this.outputiY(value).toString();
        }
    }
    exports.AbstractArea = AbstractArea;
});
