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
define(["require", "exports", "./vendor/Fabric.min", "./AreaForm", "./Shape/Factory", "./Shape/Polygon/Shape"], function (require, exports, Fabric, AreaForm_1, Factory_1, Shape_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Editor {
        constructor(configuration, canvas, modalParent, browselinkParent) {
            this.areas = [];
            this.formSelector = '#areasForm';
            this.configuration = configuration;
            this.modalParent = modalParent;
            this.browselinkParent = browselinkParent;
            this.initializeCanvas(canvas);
            this.initializeAreaForm();
        }
        initializeCanvas(canvas) {
            this.setWindowAndDocument();
            this.canvas = new Fabric.Canvas(canvas, {
                width: AreaForm_1.AreaForm.width,
                height: AreaForm_1.AreaForm.height,
                top: AreaForm_1.AreaForm.height * -1,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: 'move',
            });
        }
        setWindowAndDocument() {
            let helper = frameElement;
            if (helper && helper.contentWindow && Fabric.window !== helper.contentWindow.parent) {
                Fabric.window = helper.contentWindow.parent;
                Fabric.document = helper.contentWindow.parent.document;
            }
        }
        initializeAreaForm() {
            let element = this.modalParent.querySelector(this.formSelector);
            this.form = new AreaForm_1.AreaForm(element, this.canvas, this.configuration, this.modalParent, this.browselinkParent);
        }
        resize(width, height) {
            if (AreaForm_1.AreaForm.width !== width || AreaForm_1.AreaForm.height !== height) {
                let data = JSON.parse(this.getMapData());
                // @todo rerender shapes with relative values and update absolute values in shape and fieldset
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
                let shapeFactory = new Factory_1.ShapeFactory(this.canvas, this.configuration);
                areas.forEach((area) => {
                    let shape = shapeFactory.create(area, true);
                    this.areas.push(shape);
                    this.canvas.add(shape.canvasShape);
                    this.form.addArea(shape.sidebarFieldset);
                    if (shape instanceof Shape_1.PolygonShape) {
                        shape.canvasShape.initializeControls();
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
            let areas = [];
            this.areas.forEach((area) => {
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
