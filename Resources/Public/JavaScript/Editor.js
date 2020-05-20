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
            this.formSelector = '#areasForm';
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
            this.canvas.on('object:modified', Editor.objectModified.bind(this));
        }
        initializeAreaForm() {
            let element = this.modalParent.querySelector(this.formSelector);
            this.form = new AreaForm_1.AreaForm(element, this.canvas, this.configuration, this.modalParent, this.browselinkParent);
        }
        static objectModified(event) {
            // @todo check these
            console.log(event, 'objectModified');
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
                let areaShapeFactory = new AreaShapeFactory_1.AreaShapeFactory(this.canvas);
                let areaFieldsetFactory = new AreaFieldsetFactory_1.AreaFieldsetFactory(this.configuration);
                areas.forEach((area) => {
                    area.color = AreaShapeFactory_1.AreaShapeFactory.getRandomColor(area.color);
                    let areaShape = areaShapeFactory.createShape(area, true), areaFieldset = areaFieldsetFactory.createFieldset(area, areaShape);
                    this.canvas.add(areaShape);
                    this.form.addArea(areaFieldset);
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
