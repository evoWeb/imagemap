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
define(["require", "exports", "./vendor/Fabric.min", "./FieldsetFactory", "./AreaForm", "./ShapeFactory", "./PolygonShape", "TYPO3/CMS/Core/Contrib/jquery.minicolors"], function (require, exports, Fabric, FieldsetFactory_1, AreaForm_1, ShapeFactory_1, PolygonShape_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Editor {
        constructor(configuration, canvas, modalParent, browselinkParent) {
            this.formSelector = '#areasForm';
            this.configuration = configuration;
            this.modalParent = modalParent;
            this.browselinkParent = browselinkParent;
            this.initializeCanvas(canvas);
            this.initializeAreaForm();
        }
        initializeCanvas(canvas) {
            // @ts-ignore
            let helper = frameElement;
            if (helper && helper.contentWindow && Fabric.window !== helper.contentWindow.parent) {
                Fabric.window = helper.contentWindow.parent;
                Fabric.document = helper.contentWindow.parent.document;
            }
            this.canvas = new Fabric.Canvas(canvas, {
                width: AreaForm_1.AreaForm.width,
                height: AreaForm_1.AreaForm.height,
                top: AreaForm_1.AreaForm.height * -1,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: 'move',
            });
        }
        initializeAreaForm() {
            let element = this.modalParent.querySelector(this.formSelector);
            this.form = new AreaForm_1.AreaForm(element, this.canvas, this.configuration, this.modalParent, this.browselinkParent);
        }
        static objectModified(event) {
            let element = event.target;
            if (element.hasOwnProperty('fieldset')) {
                // circle, polygon, rectangle
                element.fieldset.shapeModified(event);
            }
        }
        resize(width, height) {
            if (AreaForm_1.AreaForm.width !== width || AreaForm_1.AreaForm.height !== height) {
                let data = JSON.parse(this.getMapData());
                this.removeAreas();
                AreaForm_1.AreaForm.width = width;
                AreaForm_1.AreaForm.height = height;
                this.canvas.setWidth(width);
                this.canvas.setHeight(height);
                this.canvas.calcOffset();
                this.renderAreas(data);
            }
        }
        renderAreas(areas) {
            if (areas !== undefined) {
                let areaShapeFactory = new ShapeFactory_1.ShapeFactory(this.canvas);
                let areaFieldsetFactory = new FieldsetFactory_1.FieldsetFactory(this.configuration);
                areas.forEach((area) => {
                    area.color = ShapeFactory_1.ShapeFactory.getRandomColor(area.color);
                    let areaShape = areaShapeFactory.createShape(area, true), areaFieldset = areaFieldsetFactory.createFieldset(area, areaShape);
                    this.canvas.add(areaShape);
                    this.form.addArea(areaFieldset);
                    if (areaShape instanceof PolygonShape_1.PolygonShape) {
                        areaShape.initializeControls();
                    }
                });
            }
        }
        removeAreas() {
            this.form.areaFieldsets.forEach((area) => {
                this.form.deleteArea(area);
            });
        }
        getMapData() {
            return this.form.getMapData();
        }
        destroy() {
            this.canvas = null;
            this.form.destroy();
        }
    }
    exports.Editor = Editor;
});
