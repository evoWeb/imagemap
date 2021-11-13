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
define(["require", "exports", "./vendor/Fabric.min", "./AreaForm", "./Shape/Factory"], function (require, exports, Fabric, AreaForm_1, Factory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Preview {
        constructor(canvas) {
            this.areas = [];
            this.initializeCanvas(canvas);
        }
        initializeCanvas(canvas) {
            this.canvas = new Fabric.Canvas(canvas, {
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
                let shapeFactory = new Factory_1.ShapeFactory();
                areas.forEach((areaData) => {
                    let area = shapeFactory.create(areaData, false);
                    this.canvas.add(area.canvasShape);
                    this.areas.push(area);
                });
            }
        }
        removeAreas() {
            this.areas.forEach((area) => {
                this.canvas.remove(area.canvasShape);
                area = null;
            });
            this.areas = [];
        }
    }
    exports.Preview = Preview;
});
