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
define(["require", "exports", "./vendor/Fabric", "./AreaForm", "./AreaShapeCircle", "./AreaShapePolygon", "./AreaShapeRectangle"], function (require, exports, Fabric_1, AreaForm_1, AreaShapeCircle_1, AreaShapePolygon_1, AreaShapeRectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaShapeFactory {
        constructor(canvas = null) {
            this.shapeConfiguration = {
                cornerColor: '#eee',
                cornerStrokeColor: '#bbb',
                cornerSize: 10,
                cornerStyle: 'circle',
                hasBorders: false,
                hasRotatingPoint: false,
                transparentCorners: false
            };
            this.canvas = canvas;
        }
        createShape(area, selectable) {
            let areaShape, configuration = Object.assign(Object.assign({}, this.shapeConfiguration), { selectable: selectable, hasControls: selectable, stroke: area.color, strokeWidth: 1, fill: AreaShapeFactory.hexToRgbA(area.color, 0.3) });
            switch (area.shape) {
                case 'rect':
                    areaShape = this.createRectangle(area, configuration);
                    break;
                case 'circle':
                    areaShape = this.createCircle(area, configuration);
                    break;
                case 'poly':
                    areaShape = this.createPolygon(area, configuration);
                    break;
            }
            return areaShape;
        }
        createCircle(area, configuration) {
            let coords = area.coords, radius = Math.round(coords.radius * AreaForm_1.AreaForm.width), left = Math.round(coords.left * AreaForm_1.AreaForm.width) - radius, top = Math.round(coords.top * AreaForm_1.AreaForm.height) - radius, areaShape = new AreaShapeCircle_1.AreaShapeCircle(Object.assign(Object.assign({}, configuration), { left: left, top: top, radius: radius }));
            areaShape.id = Fabric_1.Object.__uid++;
            // disable control points as these would stretch the circle
            // to an ellipse which is not possible in html areas
            areaShape.setControlVisible('ml', false);
            areaShape.setControlVisible('mt', false);
            areaShape.setControlVisible('mr', false);
            areaShape.setControlVisible('mb', false);
            if (this.canvas !== null) {
                areaShape.canvas = this.canvas;
            }
            return areaShape;
        }
        createPolygon(area, configuration) {
            let points = area.points || [], polygonPoints = [], polygonId = Fabric_1.Object.__uid++;
            points.map((point) => {
                point.id = polygonId + '-' + Fabric_1.Object.__uid++;
                let polygonPoint = {
                    x: Math.round(point.x * AreaForm_1.AreaForm.width),
                    y: Math.round(point.y * AreaForm_1.AreaForm.height),
                    id: point.id,
                    areaPoint: point,
                };
                point.polygonPoint = polygonPoint;
                polygonPoints.push(polygonPoint);
            });
            return new AreaShapePolygon_1.AreaShapePolygon(polygonPoints, Object.assign(Object.assign({}, configuration), { objectCaching: false, id: polygonId, canvas: this.canvas }));
        }
        createRectangle(area, configuration) {
            let coords = area.coords, left = Math.round(coords.left * AreaForm_1.AreaForm.width), top = Math.round(coords.top * AreaForm_1.AreaForm.height), width = Math.round(coords.right * AreaForm_1.AreaForm.width) - left, height = Math.round(coords.bottom * AreaForm_1.AreaForm.height) - top, areaShape = new AreaShapeRectangle_1.AreaShapeRectangle(Object.assign(Object.assign({}, configuration), { left: left, top: top, width: width, height: height }));
            areaShape.id = Fabric_1.Object.__uid++;
            if (this.canvas !== null) {
                areaShape.canvas = this.canvas;
            }
            return areaShape;
        }
        static getRandomColor(color) {
            while (color === undefined || !(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color))) {
                color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            }
            return color;
        }
        static hexToRgbA(hex, alpha) {
            let chars, r, g, b, result;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                chars = hex.substring(1).split('');
                if (chars.length === 3) {
                    chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
                }
                r = parseInt(chars[0] + chars[1], 16);
                g = parseInt(chars[2] + chars[3], 16);
                b = parseInt(chars[4] + chars[5], 16);
                if (alpha) {
                    result = 'rgba(' + [r, g, b, alpha].join(', ') + ')';
                }
                else {
                    result = 'rgb(' + [r, g, b].join(', ') + ')';
                }
                return result;
            }
            throw new Error('Bad Hex: ' + hex);
        }
    }
    exports.AreaShapeFactory = AreaShapeFactory;
});
