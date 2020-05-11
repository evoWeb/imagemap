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
    class AreaFieldsetCircle extends AreaFieldsetAbstract_1.AreaFieldsetAbstract {
        constructor() {
            super(...arguments);
            this.name = 'circle';
        }
        updateFields() {
            this.getElement('.color').value = this.data.color;
            this.getElement('.alt').value = this.alt || '';
            this.getElement('.href').value = this.href || '';
            this.getElement('#left').value = Math.floor(this.left).toString();
            this.getElement('#top').value = Math.floor(this.top).toString();
            this.getElement('#radius').value = Math.floor(this.getRadiusX()).toString();
            Object.entries(this.attributes).forEach((attribute) => {
                this.getElement('#' + attribute[0]).value = attribute[1] || '';
            });
        }
        updateCanvas(event) {
            let field = (event.currentTarget || event.target), value = 0;
            switch (field.id) {
                case 'left':
                    value = parseInt(field.value);
                    this.set({ left: value });
                    break;
                case 'top':
                    value = parseInt(field.value);
                    this.set({ top: value });
                    break;
                case 'radius':
                    value = parseInt(field.value);
                    this.set({ radius: value });
                    break;
            }
            this.canvas.renderAll();
        }
        getData() {
            return Object.assign(Object.assign({}, this.attributes), { coords: {
                    left: Math.floor(this.left + this.getRadiusX()),
                    top: Math.floor(this.top + this.getRadiusX()),
                    radius: Math.floor(this.getRadiusX())
                } });
        }
    }
    exports.AreaFieldsetCircle = AreaFieldsetCircle;
});
