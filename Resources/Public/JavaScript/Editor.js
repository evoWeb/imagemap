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
define(["require", "exports", "./vendor/Fabric", "./AreaForm", "./AreaShapeFactory", "./AreaFieldsetFactory", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, Fabric_1, AreaForm_1, AreaShapeFactory_1, AreaFieldsetFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Editor {
        constructor(configurations, canvas, modalParent, browselinkParent) {
            this.areaShapes = [];
            this.formSelector = '#areasForm';
            this.areaFieldsets = [];
            this.activePolygon = null;
            this.configurations = configurations;
            this.width = configurations.canvas.width;
            this.height = configurations.canvas.height;
            this.modalParent = modalParent;
            this.browselinkParent = browselinkParent;
            this.initializeCanvas(canvas, configurations.canvas);
            this.initializeAreaForm();
        }
        initializeCanvas(canvas, configurations) {
            this.canvas = new Fabric_1.Canvas(canvas, Object.assign(Object.assign({}, configurations), { selection: false, preserveObjectStacking: true, hoverCursor: 'move' }));
            // @todo check these
            this.canvas.on('object:moving', this.objectMoving.bind(this));
            this.canvas.on('selection:created', this.selectionCreated.bind(this));
            this.canvas.on('selection:updated', this.selectionUpdated.bind(this));
        }
        objectMoving(event) {
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
        }
        selectionCreated(event) {
            if (event.target.type === 'polygon') {
                this.activePolygon = event.target;
                // show controls of active polygon
                this.activePolygon.controls.forEach((control) => {
                    control.opacity = 1;
                });
                this.canvas.renderAll();
            }
        }
        selectionUpdated(event) {
            event.deselected.forEach((element) => {
                if (element.type === 'polygon' && event.selected[0].type !== 'control') {
                    // hide controls of active polygon
                    element.controls.forEach((control) => {
                        control.opacity = 0;
                    });
                    this.activePolygon = null;
                    this.canvas.renderAll();
                }
                else if (element.type === 'control') {
                    // hide controls of active polygon
                    this.activePolygon.controls.forEach((control) => {
                        control.opacity = 0;
                    });
                    this.activePolygon = null;
                    this.canvas.renderAll();
                }
            });
            event.selected.forEach((element) => {
                if (element.type === 'polygon') {
                    this.activePolygon = element;
                    // hide controls of active polygon
                    element.controls.forEach((control) => {
                        control.opacity = 1;
                    });
                    this.canvas.renderAll();
                }
            });
        }
        initializeAreaForm() {
            this.form = new AreaForm_1.AreaForm(this.formSelector, this.modalParent, this);
        }
        resize(width, height) {
            if (this.width !== width || this.height !== height) {
                // @todo resize canvas size
                // @todo resize and reposition shapes on canvas
                // @todo change values in areaFieldset
            }
        }
        renderAreas(areas) {
            if (areas !== undefined) {
                let areaShapeFactory = new AreaShapeFactory_1.AreaShapeFactory(this.configurations, this.canvas);
                let areaFieldsetFactory = new AreaFieldsetFactory_1.AreaFieldsetFactory(this.configurations);
                areas.forEach((area) => {
                    let areaShape = areaShapeFactory.createShape(area, true), areaFieldset = areaFieldsetFactory.createFieldset(area, areaShape);
                    this.canvas.add(areaShape);
                    this.areaShapes.push(areaShape);
                    this.areaFieldsets.push(areaFieldset);
                    this.form.addArea(areaFieldset);
                });
            }
        }
        removeAreas() {
            this.areaFieldsets.forEach((area) => {
                area.deleteAction();
            });
        }
        deleteArea(area) {
            let areas = [];
            this.areaFieldsets.forEach((currentArea) => {
                if (area !== currentArea) {
                    areas.push(currentArea);
                }
            });
            this.areaFieldsets = areas;
            this.canvas.remove(area.shape);
        }
        getMapData() {
            let areas = [];
            this.areaFieldsets.forEach((area) => {
                areas.push(area.getData());
            });
            return JSON.stringify(areas);
        }
        destroy() {
            this.canvas = null;
            this.form.destroy();
        }
    }
    exports.Editor = Editor;
});
