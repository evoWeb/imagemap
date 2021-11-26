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
define(["require", "exports", "./vendor/Fabric.min", "./AreaForm", "./Shape/Factory", "./Shape/Polygon/Area"], function (require, exports, Fabric, AreaForm_1, Factory_1, Area_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Editor {
        /**
         * @param canvas element to use to render shapes into
         * @param configuration
         * @param modalParent document in which the image is rendered
         * @param browselinkParent document in which the browslink is going to set fields
         */
        constructor(canvas, configuration, modalParent, browselinkParent) {
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
                width: this.configuration.width,
                height: this.configuration.height,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: 'move',
            });
        }
        setWindowAndDocument() {
            let frame = frameElement;
            if (frame && frame.contentWindow && Fabric.window !== frame.contentWindow.parent) {
                Fabric.window = frame.contentWindow.parent;
                Fabric.document = frame.contentWindow.parent.document;
            }
        }
        initializeAreaForm() {
            let element = this.modalParent.querySelector(this.formSelector);
            this.form = new AreaForm_1.AreaForm(element, this.canvas, this.configuration, this.modalParent, this.browselinkParent);
        }
        renderAreas(areas) {
            let shapeFactory = new Factory_1.ShapeFactory(this.canvas, this.configuration);
            areas.forEach((areaData) => {
                let area = shapeFactory.create(areaData, true);
                this.canvas.add(area.canvasShape);
                this.areas.push(area);
                if (area instanceof Area_1.PolygonArea) {
                    area.canvasShape.initializeControls();
                }
                this.form.addArea(area.sidebarFieldset);
            });
        }
        resize(width, height) {
            if (this.configuration.width !== width || this.configuration.height !== height) {
                this.configuration.width = width;
                this.configuration.height = height;
                this.canvas.setWidth(width);
                this.canvas.setHeight(height);
                this.canvas.calcOffset();
                this.resizeAreas();
            }
        }
        resizeAreas() {
            this.areas.forEach((area) => {
                area.resize(this.configuration.width, this.configuration.height);
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
