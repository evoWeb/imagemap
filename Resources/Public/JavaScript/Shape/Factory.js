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
define(["require", "exports", "../vendor/Fabric.min", "../AreaForm", "./Circle/Area", "./Circle/Shape", "./Circle/Fieldset", "./Polygon/Area", "./Polygon/Shape", "./Polygon/Fieldset", "./Rectangle/Area", "./Rectangle/Shape", "./Rectangle/Fieldset"], function (require, exports, Fabric_min_1, AreaForm_1, Area_1, Shape_1, Fieldset_1, Area_2, Shape_2, Fieldset_2, Area_3, Shape_3, Fieldset_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ShapeFactory {
        constructor(canvas = null, configuration = null) {
            this.canvas = canvas;
            this.configuration = configuration;
        }
        create(areaData, selectable) {
            areaData.color = this.getRandomColor(areaData.color);
            let area, configuration = Object.assign(Object.assign({}, ShapeFactory.shapeConfiguration), { selectable: selectable, hasControls: selectable, stroke: areaData.color, fill: ShapeFactory.hexToRgbA(areaData.color, 0.4), id: ShapeFactory.getObjectId(), canvas: this.canvas });
            switch (areaData.shape) {
                case 'circle':
                    area = this.createCircle(areaData, configuration);
                    break;
                case 'poly':
                    area = this.createPolygon(areaData, configuration);
                    break;
                case 'rect':
                    area = this.createRectangle(areaData, configuration);
                    break;
            }
            return area;
        }
        createCircle(areaData, configuration) {
            let coords = areaData.coords, radius = this.outputiX(coords.radius), left = this.outputiX(coords.left) - radius, top = this.outputiY(coords.top) - radius;
            return new Area_1.CircleArea(areaData, new Fieldset_1.CircleFieldset(this.configuration), new Shape_1.CircleShape(Object.assign(Object.assign({}, configuration), { left: left, top: top, radius: radius, 
                // disable control points as these would stretch the circle
                // to an ellipse which is not possible in html areas
                _controlsVisibility: {
                    ml: false,
                    mt: false,
                    mr: false,
                    mb: false,
                    mtr: false,
                } })));
        }
        createPolygon(areaData, configuration) {
            let points = areaData.points || [], polygonPoints = [];
            points.map((point) => {
                point.id = configuration.id + '-' + ShapeFactory.getObjectId();
                polygonPoints.push({
                    x: this.outputiX(point.x),
                    y: this.outputiY(point.y),
                    id: point.id,
                });
            });
            return new Area_2.PolygonArea(areaData, new Fieldset_2.PolygonFieldset(this.configuration), new Shape_2.PolygonShape(polygonPoints, Object.assign(Object.assign({}, configuration), { objectCaching: false })));
        }
        createRectangle(areaData, configuration) {
            let coords = areaData.coords, left = this.outputiX(coords.left), top = this.outputiY(coords.top), width = this.outputiX(coords.right) - left, height = this.outputiY(coords.bottom) - top;
            return new Area_3.RectangleArea(areaData, new Fieldset_3.RectangleFieldset(this.configuration), new Shape_3.RectangleShape(Object.assign(Object.assign({}, configuration), { left: left, top: top, width: width, height: height, _controlsVisibility: {
                    mtr: false,
                } })));
        }
        outputiX(value) {
            return Math.round(value * AreaForm_1.AreaForm.width);
        }
        outputiY(value) {
            return Math.round(value * AreaForm_1.AreaForm.height);
        }
        getRandomColor(color) {
            while (color === undefined || !(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color))) {
                color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            }
            return color;
        }
        static getObjectId() {
            return Fabric_min_1.Object.__uid++;
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
    exports.ShapeFactory = ShapeFactory;
    ShapeFactory.shapeConfiguration = {
        cornerColor: '#eee',
        cornerStrokeColor: '#bbb',
        cornerSize: 10,
        cornerStyle: 'circle',
        hasBorders: false,
        hasRotatingPoint: false,
        transparentCorners: false,
    };
});
