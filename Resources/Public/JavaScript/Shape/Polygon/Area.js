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
define(["require", "exports", "../../vendor/Fabric.min", "../AbstractArea", "./Shape", "../Factory"], function (require, exports, Fabric_min_1, AbstractArea_1, Shape_1, Factory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PolygonArea extends AbstractArea_1.AbstractArea {
        getData() {
            let data = Object.assign({}, this.areaData);
            data.points.forEach((point) => {
                // @todo remove delete element as these should never be connected
                delete (point.element);
                delete (point.id);
            });
            return data;
        }
        shapeModified(shape) {
            let matrix = shape.calcTransformMatrix(), fieldValues = [];
            shape.points.forEach((point) => {
                let temporaryPoint = new Fabric_min_1.Point(point.x - shape.pathOffset.x, point.y - shape.pathOffset.y), transformed = Fabric_min_1.util.transformPoint(temporaryPoint, matrix), areaPoint = this.areaData.points.find((findPoint) => { return findPoint.id === point.id; });
                if (areaPoint) {
                    areaPoint.x = this.inputX(transformed.x);
                    areaPoint.y = this.inputY(transformed.y);
                    fieldValues.push({
                        id: point.id,
                        x: this.outputX(areaPoint.x),
                        y: this.outputY(areaPoint.y)
                    });
                }
            });
            this.sidebarFieldset.shapeModified(fieldValues);
        }
        fieldsetModified(event) {
            let field = (event.target), point = this.canvasShape.points.find((findPoint) => { return findPoint.id === field.dataset.point; }), areaPoint = this.areaData.points.find((findPoint) => { return findPoint.id === point.id; }), value = parseInt(field.value);
            switch (field.dataset.field) {
                case 'x':
                    areaPoint.x = this.inputX(value);
                    point.x = value;
                    break;
                case 'y':
                    areaPoint.y = this.inputY(value);
                    point.y = value;
                    break;
            }
            this.canvasShape.canvas.renderAll();
        }
        renderNewShape(areaData, selectable) {
            let points = areaData.points || [], polygonPoints = [], configuration = Object.assign(Object.assign({}, Factory_1.ShapeFactory.shapeConfiguration), { selectable: selectable, hasControls: selectable, stroke: areaData.color, strokeWidth: 0, fill: Factory_1.ShapeFactory.hexToRgbA(areaData.color, 0.4), id: this.id, canvas: this.canvasShape.canvas });
            points.map((point) => {
                polygonPoints.push({
                    x: this.outputiX(point.x),
                    y: this.outputiY(point.y),
                    id: point.id,
                });
            });
            this.canvasShape.canvas.remove(this.canvasShape);
            this.canvasShape = new Shape_1.PolygonShape(polygonPoints, Object.assign(Object.assign({}, configuration), { objectCaching: false }));
            this.canvasShape.area = this;
            this.canvasShape.canvas.add(this.canvasShape);
            this.canvasShape.initializeControls();
        }
    }
    exports.PolygonArea = PolygonArea;
});
