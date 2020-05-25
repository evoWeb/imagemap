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
define(["require", "exports", "./vendor/Fabric.min", "./AreaForm", "./AreaShapeCircle", "./AreaShapePolygon", "./AreaShapeRectangle"], function (require, exports, Fabric_min_1, AreaForm_1, AreaShapeCircle_1, AreaShapePolygon_1, AreaShapeRectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaShapeFactory {
        constructor(canvas = null) {
            this.canvas = canvas;
        }
        createShape(area, selectable) {
            let areaShape, configuration = Object.assign(Object.assign({}, AreaShapeFactory.shapeConfiguration), { selectable: selectable, hasControls: selectable, stroke: area.color, fill: AreaShapeFactory.hexToRgbA(area.color, 0.4), id: Fabric_min_1.Object.__uid++, canvas: this.canvas });
            switch (area.shape) {
                case 'circle':
                    areaShape = AreaShapeFactory.createCircle(area, configuration);
                    break;
                case 'poly':
                    areaShape = AreaShapeFactory.createPolygon(area, configuration);
                    break;
                case 'rect':
                    areaShape = AreaShapeFactory.createRectangle(area, configuration);
                    break;
            }
            return areaShape;
        }
        static createCircle(area, configuration) {
            let coords = area.coords, radius = AreaForm_1.AreaForm.outputiX(coords.radius), left = AreaForm_1.AreaForm.outputiX(coords.left) - radius, top = AreaForm_1.AreaForm.outputiY(coords.top) - radius;
            return new AreaShapeCircle_1.AreaShapeCircle(Object.assign(Object.assign({}, configuration), { left: left, top: top, radius: radius, 
                // disable control points as these would stretch the circle
                // to an ellipse which is not possible in html areas
                _controlsVisibility: {
                    ml: false,
                    mt: false,
                    mr: false,
                    mb: false,
                    mtr: false,
                } }));
        }
        static createPolygon(area, configuration) {
            let points = area.points || [], polygonPoints = [];
            points.map((point) => {
                point.id = configuration.id + '-' + Fabric_min_1.Object.__uid++;
                polygonPoints.push({
                    x: AreaForm_1.AreaForm.outputiX(point.x),
                    y: AreaForm_1.AreaForm.outputiY(point.y),
                    id: point.id,
                });
            });
            return new AreaShapePolygon_1.AreaShapePolygon(polygonPoints, Object.assign(Object.assign({}, configuration), { objectCaching: false }));
        }
        static createRectangle(area, configuration) {
            let coords = area.coords, left = AreaForm_1.AreaForm.outputiX(coords.left), top = AreaForm_1.AreaForm.outputiY(coords.top), width = AreaForm_1.AreaForm.outputiX(coords.right) - left, height = AreaForm_1.AreaForm.outputiY(coords.bottom) - top;
            return new AreaShapeRectangle_1.AreaShapeRectangle(Object.assign(Object.assign({}, configuration), { left: left, top: top, width: width, height: height, _controlsVisibility: {
                    mtr: false,
                } }));
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
    AreaShapeFactory.shapeConfiguration = {
        cornerColor: '#eee',
        cornerStrokeColor: '#bbb',
        cornerSize: 10,
        cornerStyle: 'circle',
        hasBorders: false,
        hasRotatingPoint: false,
        transparentCorners: false,
        // needs to be 0 to keep polygon from sliding
        strokeWidth: 0
    };
});
