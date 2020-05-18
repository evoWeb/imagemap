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
define(["require", "exports", "./vendor/Fabric", "./AreaFieldsetFactory", "./AreaForm", "./AreaShapeFactory", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, Fabric_1, AreaFieldsetFactory_1, AreaForm_1, AreaShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Editor {
        constructor(configuration, canvas, modalParent, browselinkParent) {
            this.areaShapes = [];
            this.formSelector = '#areasForm';
            this.areaFieldsets = [];
            this.activePolygon = null;
            this.configuration = configuration;
            this.modalParent = modalParent;
            this.browselinkParent = browselinkParent;
            this.initializeCanvas(canvas);
            this.initializeAreaForm();
        }
        initializeCanvas(canvas) {
            this.canvas = new Fabric_1.Canvas(canvas, {
                width: AreaForm_1.AreaForm.width,
                height: AreaForm_1.AreaForm.height,
                top: AreaForm_1.AreaForm.height * -1,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: 'move',
            });
            this.canvas.on('object:moving', this.objectMoving.bind(this));
            this.canvas.on('selection:created', this.selectionCreated.bind(this));
            this.canvas.on('selection:updated', this.selectionUpdated.bind(this));
        }
        objectMoving(event) {
            // @todo check these
            console.log(event);
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
            // @todo check these
            console.log(event);
            let element = event.target;
            if (element.type === 'polygon') {
                this.activePolygon = element;
                // show controls of active polygon
                this.activePolygon.controls.forEach((control) => {
                    control.opacity = 1;
                });
                this.canvas.renderAll();
            }
        }
        selectionUpdated(event) {
            // @todo check these
            console.log(event);
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
            if (AreaForm_1.AreaForm.width !== width || AreaForm_1.AreaForm.height !== height) {
                // @todo resize canvas size
                // @todo resize and reposition shapes on canvas
                // @todo change values in areaFieldset
            }
        }
        renderAreas(areas) {
            if (areas !== undefined) {
                let areaShapeFactory = new AreaShapeFactory_1.AreaShapeFactory(this.canvas);
                let areaFieldsetFactory = new AreaFieldsetFactory_1.AreaFieldsetFactory(this.configuration);
                areas.forEach((area) => {
                    area.color = AreaShapeFactory_1.AreaShapeFactory.getRandomColor(area.color);
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
