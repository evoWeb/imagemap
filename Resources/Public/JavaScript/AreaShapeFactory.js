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
define(["require", "exports", "./vendor/Fabric"], function (require, exports, Fabric_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaShapeFactory {
        constructor(configurations, canvas = null) {
            this.areaConfiguration = {
                cornerColor: '#eee',
                cornerStrokeColor: '#bbb',
                cornerSize: 10,
                cornerStyle: 'circle',
                hasBorders: false,
                hasRotatingPoint: false,
                transparentCorners: false
            };
            this.width = configurations.canvas.width;
            this.height = configurations.canvas.height;
            this.canvas = canvas;
        }
        createShape(attributes, selectable) {
            attributes.color = AreaShapeFactory.getRandomColor(attributes.color);
            let areaShape, configuration = Object.assign(Object.assign({}, this.areaConfiguration), { selectable: selectable, hasControls: selectable, stroke: attributes.color, strokeWidth: 1, fill: AreaShapeFactory.hexToRgbA(attributes.color, 0.3) });
            switch (attributes.shape) {
                case 'rect':
                    areaShape = this.createRectangle(attributes, configuration);
                    break;
                case 'circle':
                    areaShape = this.createCircle(attributes, configuration);
                    break;
                case 'poly':
                    areaShape = this.createPolygon(attributes, configuration);
                    break;
            }
            if (this.canvas !== null) {
                areaShape.canvas = this.canvas;
            }
            return areaShape;
        }
        createCircle(attributes, configuration) {
            let coords = attributes.coords, radius = Math.round(coords.radius * this.width), left = Math.round(coords.left * this.width) - radius, top = Math.round(coords.top * this.height) - radius, area = new Fabric_1.Circle(Object.assign(Object.assign({}, configuration), { left: left, top: top, radius: radius }));
            // disable control points as these would stretch the circle
            // to an ellipse which is not possible in html areas
            area.setControlVisible('ml', false);
            area.setControlVisible('mt', false);
            area.setControlVisible('mr', false);
            area.setControlVisible('mb', false);
            return area;
        }
        createPolygon(attributes, configuration) {
            let points = attributes.points || [], area;
            points.map((point) => {
                point.x = Math.round(point.x * this.width);
                point.y = Math.round(point.y * this.height);
            });
            area = new Fabric_1.Polygon(points, Object.assign(Object.assign({}, configuration), { objectCaching: false }));
            area.controls = [];
            if (configuration.selectable) {
                points.forEach((point, index) => {
                    AreaShapeFactory.addControl(area, configuration, point, index, 100000);
                });
            }
            return area;
        }
        createRectangle(attributes, configuration) {
            let coords = attributes.coords, left = Math.round(coords.left * this.width), top = Math.round(coords.top * this.height), width = Math.round(coords.right * this.width) - left, height = Math.round(coords.bottom * this.height) - top;
            return new Fabric_1.Rect(Object.assign(Object.assign({}, configuration), { left: left, top: top, width: width, height: height }));
        }
        static addControl(area, configuration, point, index, newControlIndex) {
            let circle = new Fabric_1.Circle(Object.assign(Object.assign({}, configuration), { hasControls: false, radius: 5, fill: configuration.cornerColor, stroke: configuration.cornerStrokeColor, originX: 'center', originY: 'center', name: index, polygon: area, point: point, type: 'control', opacity: area.opacity, 
                // set control position relative to polygon
                left: point.x, top: point.y }));
            point.control = circle;
            area.controls = AreaShapeFactory.addElementToArrayWithPosition(area.controls, circle, newControlIndex);
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
