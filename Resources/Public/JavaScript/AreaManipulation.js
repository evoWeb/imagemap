/**
 * This file is developed by evoweb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */
define(["require", "exports", "./vendor/fabric"], function (require, exports, fabric) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AreaForm = /** @class */ (function () {
        function AreaForm(options, editor) {
            this.element = editor.container.querySelector(options.formSelector);
        }
        return AreaForm;
    }());
    var AreaCanvas = /** @class */ (function () {
        function AreaCanvas(element, options) {
            this.canvas = new fabric.Canvas(element, options);
            fabric.util.setStyle(this.canvas.wrapperEl, {
                height: '100%',
                position: 'absolute',
                width: '100%',
            });
            this.canvas.on('object:moving', this.canvasObjectMoving);
            this.canvas.on('selection:created', this.canvasSelectionCreated);
            this.canvas.on('selection:updated', this.canvasSelectionUpdated);
        }
        AreaCanvas.prototype.canvasObjectMoving = function (event) {
            var element = event.target;
            switch (element.type) {
                case 'control':
                    var center = element.getCenterPoint();
                    element.point.x = center.x - element.polygon.left;
                    element.point.y = center.y - element.polygon.top;
                    break;
                case 'polygon':
                    element.controls.forEach(function (control) {
                        control.left = element.left + control.point.x;
                        control.top = element.top + control.point.y;
                    });
                    break;
            }
        };
        AreaCanvas.prototype.canvasSelectionCreated = function (event) {
            var activePolygon = null;
            if (event.target.type === 'polygon') {
                activePolygon = event.target;
                // show controls of active polygon
                activePolygon.controls.forEach(function (control) {
                    control.opacity = 1;
                });
                this.canvas.renderAll();
            }
        };
        AreaCanvas.prototype.canvasSelectionUpdated = function (event) {
            var _this = this;
            var activePolygon = null;
            event.deselected.forEach(function (element) {
                if (element.type === 'polygon' && event.selected[0].type !== 'control') {
                    // hide controls of active polygon
                    element.controls.forEach(function (control) {
                        control.opacity = 0;
                    });
                    activePolygon = null;
                    _this.canvas.renderAll();
                }
                else if (element.type === 'control') {
                    // hide controls of active polygon
                    activePolygon.controls.forEach(function (control) {
                        control.opacity = 0;
                    });
                    activePolygon = null;
                    _this.canvas.renderAll();
                }
            });
            event.selected.forEach(function (element) {
                if (element.type === 'polygon') {
                    activePolygon = element;
                    // hide controls of active polygon
                    element.controls.forEach(function (control) {
                        control.opacity = 1;
                    });
                    _this.canvas.renderAll();
                }
            });
        };
        return AreaCanvas;
    }());
    var AreaManipulation = /** @class */ (function () {
        function AreaManipulation(container, options) {
            this.interactive = false;
            this.options = options;
            this.container = container;
            this.interactive = !!(options.formSelector || '');
            this.initializeCanvas();
            this.initializeForm();
        }
        AreaManipulation.prototype.initializeCanvas = function () {
            var canvas = this.container.querySelector(this.options.canvasSelector);
            this.canvas = new AreaCanvas(canvas, {
                width: this.options.canvas.width,
                height: this.options.canvas.height,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: this.interactive ? 'move' : 'default',
            });
        };
        AreaManipulation.prototype.initializeForm = function () {
            if (this.interactive) {
                this.form = new AreaForm({
                    formSelector: this.options.formSelector
                }, this);
            }
        };
        AreaManipulation.prototype.removeAllAreas = function () {
        };
        AreaManipulation.prototype.initializeAreas = function (areas) {
        };
        AreaManipulation.prototype.getAreasData = function () {
            return [];
        };
        AreaManipulation.prototype.destruct = function () {
            // this.form.destroy();
        };
        AreaManipulation.wait = function (callback, delay) {
            return window.setTimeout(callback, delay);
        };
        return AreaManipulation;
    }());
    exports.default = AreaManipulation;
});
