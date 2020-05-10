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
define(["require", "exports", "./vendor/Fabric", "./AreaShapeFactory"], function (require, exports, Fabric_1, AreaShapeFactory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaPreview {
        constructor(configurations, canvas) {
            this.areaShapes = [];
            this.configurations = configurations;
            this.initializeCanvas(canvas, configurations);
        }
        initializeCanvas(canvas, options) {
            this.canvas = new Fabric_1.Canvas(canvas, Object.assign(Object.assign({}, options.canvas), { selection: false, preserveObjectStacking: true, hoverCursor: 'default' }));
        }
        renderAreas(areas) {
            if (areas !== undefined) {
                let areaShapeFactory = new AreaShapeFactory_1.AreaShapeFactory(this.configurations);
                areas.forEach((area) => {
                    let areaShape = areaShapeFactory.createShape(area, false);
                    this.canvas.add(areaShape);
                    this.areaShapes.push(areaShape);
                });
            }
        }
        removeAreas() {
            this.areaShapes.forEach((area) => {
                area.remove();
            });
        }
    }
    exports.AreaPreview = AreaPreview;
});
