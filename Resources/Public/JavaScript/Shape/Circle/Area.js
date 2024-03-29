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
define(["require", "exports", "../AbstractArea"], function (require, exports, AbstractArea_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CircleArea extends AbstractArea_1.AbstractArea {
        shapeModified(event) {
            let shape = event.target, radius = shape.getRadiusX(), left = Math.round(shape.left) + radius, top = Math.round(shape.top) + radius;
            this.areaData.coords.radius = this.inputX(radius);
            this.areaData.coords.left = this.inputX(left);
            this.areaData.coords.top = this.inputY(top);
            this.sidebarFieldset.shapeModified(left, top, radius);
        }
        fieldsetModified(event) {
            let field = (event.currentTarget || event.target), value = parseInt(field.value);
            switch (field.dataset.field) {
                case 'radius':
                    this.areaData.coords.top = this.inputX(value);
                    this.canvasShape.set({ radius: value });
                    break;
                case 'left':
                    value -= parseInt(this.sidebarFieldset.getElement('.radius').value);
                    this.areaData.coords.left = this.inputX(value);
                    this.canvasShape.set({ left: value });
                    break;
                case 'top':
                    value -= parseInt(this.sidebarFieldset.getElement('.radius').value);
                    this.areaData.coords.top = this.inputY(value);
                    this.canvasShape.set({ top: value });
                    break;
            }
            this.canvasShape.canvas.renderAll();
        }
    }
    exports.CircleArea = CircleArea;
});
