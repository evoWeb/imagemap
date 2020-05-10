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
define(["require", "exports", "./vendor/Fabric", "./AreaForm", "./AreaShapeFactory", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, fabric, AreaForm_1, AreaShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // needed to access top frame elements
    fabric.document = top.document || document;
    fabric.window = top.window || window;
    class AreaEditor {
        constructor(configurations, canvas, formSelector, document) {
            this.formSelector = '';
            this.preview = false;
            this.areaShapes = [];
            this.areaForms = [];
            this.configurations = configurations;
            this.document = document;
            this.initializeCanvas(canvas, configurations);
            this.initializeAreaForm(formSelector);
        }
        initializeCanvas(canvas, options) {
            let activePolygon = null;
            this.canvas = new fabric.Canvas(canvas, Object.assign(Object.assign({}, options.canvas), { selection: false, preserveObjectStacking: true, hoverCursor: this.preview ? 'default' : 'move' }));
            this.canvas.on('object:moving', (event) => {
                let element = event.target;
                switch (element.type) {
                    case 'control':
                        let center = element.getCenterPoint();
                        element.point.x = center.x - element.polygon.left;
                        element.point.y = center.y - element.polygon.top;
                        break;
                    case 'polygon':
                        element.controls.forEach((control) => {
                            control.left = element.left + control.point.x;
                            control.top = element.top + control.point.y;
                        });
                        break;
                }
            });
            this.canvas.on('selection:created', (event) => {
                if (event.target.type === 'polygon') {
                    activePolygon = event.target;
                    // show controls of active polygon
                    activePolygon.controls.forEach((control) => {
                        control.opacity = 1;
                    });
                    this.canvas.renderAll();
                }
            });
            this.canvas.on('selection:updated', (event) => {
                event.deselected.forEach((element) => {
                    if (element.type === 'polygon' && event.selected[0].type !== 'control') {
                        // hide controls of active polygon
                        element.controls.forEach((control) => {
                            control.opacity = 0;
                        });
                        activePolygon = null;
                        this.canvas.renderAll();
                    }
                    else if (element.type === 'control') {
                        // hide controls of active polygon
                        activePolygon.controls.forEach((control) => {
                            control.opacity = 0;
                        });
                        activePolygon = null;
                        this.canvas.renderAll();
                    }
                });
                event.selected.forEach((element) => {
                    if (element.type === 'polygon') {
                        activePolygon = element;
                        // hide controls of active polygon
                        element.controls.forEach((control) => {
                            control.opacity = 1;
                        });
                        this.canvas.renderAll();
                    }
                });
            });
        }
        initializeAreaForm(formSelector) {
            this.form = new AreaForm_1.AreaForm(formSelector, this);
        }
        renderAreas(areas) {
            if (areas !== undefined) {
                let areaShapeFactory = new AreaShapeFactory_1.AreaShapeFactory(this.configurations);
                areas.forEach((area) => {
                    let areaShape = areaShapeFactory.createShape(area, true);
                    this.canvas.add(areaShape);
                    this.areaShapes.push(areaShape);
                    /*areaElement.editor = this;
                    if (this.form) {
                      this.form.addArea(areaElement);
                    }*/
                });
            }
        }
        removeAreas() {
            this.areaShapes.forEach((area) => {
                area.remove();
            });
        }
        deleteArea(area) {
            let areas = [];
            this.areaForms.forEach((currentArea) => {
                if (area !== currentArea) {
                    areas.push(currentArea);
                }
            });
            this.areaForms = areas;
            this.canvas.remove(area);
        }
        getMapData() {
            let areas = [];
            this.areaForms.forEach((area) => {
                areas.push(area.getData());
            });
            return JSON.stringify(areas);
        }
    }
    exports.AreaEditor = AreaEditor;
});
