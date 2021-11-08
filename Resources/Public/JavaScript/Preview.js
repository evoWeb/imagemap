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
define(["require", "exports", "./vendor/Fabric.min", "./AreaForm", "./ShapeFactory"], function (require, exports, Fabric_min_1, AreaForm_1, ShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Preview {
        constructor(canvas) {
            this.areaShapes = [];
            this.initializeCanvas(canvas);
        }
        initializeCanvas(canvas) {
            this.canvas = new Fabric_min_1.Canvas(canvas, {
                width: AreaForm_1.AreaForm.width,
                height: AreaForm_1.AreaForm.height,
                top: AreaForm_1.AreaForm.height * -1,
                selection: false,
                preserveObjectStacking: true,
                hoverCursor: 'default',
            });
        }
        renderAreas(areas) {
            if (areas !== undefined) {
                let areaShapeFactory = new ShapeFactory_1.ShapeFactory();
                areas.forEach((area) => {
                    area.color = ShapeFactory_1.ShapeFactory.getRandomColor(area.color);
                    let areaShape = areaShapeFactory.createShape(area, false);
                    this.canvas.add(areaShape);
                    this.areaShapes.push(areaShape);
                });
            }
        }
        removeAreas() {
            this.areaShapes.forEach((areaShape) => {
                this.canvas.remove(areaShape);
                areaShape = null;
            });
            this.areaShapes = [];
        }
    }
    exports.Preview = Preview;
});
