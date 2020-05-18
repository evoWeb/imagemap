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
define(["require", "exports", "./vendor/Fabric", "./AreaForm"], function (require, exports, Fabric_1, AreaForm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaShapePolygon extends Fabric_1.Polygon {
        constructor(points, options) {
            super(points, options);
            this.controls = [];
        }
        initializeControls(points) {
            if (this.selectable) {
                this.controls = [];
                points.forEach((point, index) => {
                    this.addControl(point, index, 100000);
                });
                this.canvas.renderAll();
            }
        }
        addControl(point, index, newControlIndex) {
            let circle = new Fabric_1.Circle({
                hasControls: false,
                fill: '#eee',
                stroke: '#bbb',
                originX: 'center',
                originY: 'center',
                name: index,
                type: 'control',
                opacity: this.opacity,
                // set control position relative to polygon
                left: Math.round(point.x * AreaForm_1.AreaForm.width),
                top: Math.round(point.y * AreaForm_1.AreaForm.height),
                radius: 5,
                id: point.id,
                polygon: this,
                point: point,
            });
            this.canvas.add(circle);
            this.controls = AreaShapePolygon.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
        }
        static addElementToArrayWithPosition(array, item, newPointIndex) {
            if (newPointIndex < 0) {
                array.unshift(item);
            }
            else if (newPointIndex >= array.length) {
                array.push(item);
            }
            else {
                let newPoints = [];
                for (let i = 0; i < array.length; i++) {
                    newPoints.push(array[i]);
                    if (i === newPointIndex - 1) {
                        newPoints.push(item);
                    }
                }
                array = newPoints;
            }
            return array;
        }
    }
    exports.AreaShapePolygon = AreaShapePolygon;
});
