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
    class AreaShapePolygon extends Fabric_1.Polygon {
        constructor(points, options) {
            super(points, options);
            this.controls = [];
        }
        initializeControls() {
            let lastControl = this.points.length - 1;
            this.edit = true;
            this.hasBorders = false;
            this.cornerStyle = 'circle';
            this.controls = this.points.reduce((acc, point, index) => {
                acc['p' + index] = new Fabric_1.Control({
                    positionHandler: this.polygonPositionHandler,
                    actionHandler: this.anchorWrapper(index > 0 ? index - 1 : lastControl, this.actionHandler),
                    actionName: 'modifyPolygon',
                    pointIndex: index
                });
                return acc;
            }, {});
            this.canvas.requestRenderAll();
        }
        addPoint(newPoint, newIndex) {
            this.points = AreaShapePolygon.addElementWithPosition(this.points, newPoint, newIndex);
            this.initializeControls();
        }
        removePoint(pointToRemove) {
            this.points.forEach((point, index) => {
                if (pointToRemove === point) {
                    delete (this.points[index]);
                }
            });
            this.initializeControls();
        }
        // from example
        // define a function that can locate the controls.
        // this function will be used both for drawing and for interaction.
        polygonPositionHandler(dim, finalMatrix, fabricObject) {
            let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x), y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
            return Fabric_1.util.transformPoint({ x: x, y: y }, fabricObject.calcTransformMatrix());
        }
        // from example
        // define a function that will define what the control does
        // this function will be called on every mouse move after a control has been
        // clicked and is being dragged.
        // The function receive as argument the mouse event, the current transform object
        // and the current position in canvas coordinate
        // transform.target is a reference to the current object being transformed,
        actionHandler(eventData, transform, x, y) {
            let polygon = transform.target, currentControl = polygon.controls[polygon.__corner], mouseLocalPosition = polygon.toLocalPoint(new Fabric_1.Point(x, y), 'center', 'center'), size = polygon._getTransformedDimensions(0, 0);
            polygon.points[currentControl.pointIndex] = {
                x: mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x,
                y: mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y
            };
            return true;
        }
        // from example
        // define a function that can keep the polygon in the same position when we change its
        // width/height/top/left.
        anchorWrapper(anchorIndex, fn) {
            return function (eventData, transform, x, y) {
                let fabricObject = transform.target, absolutePoint = Fabric_1.util.transformPoint({
                    x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                    y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                }, fabricObject.calcTransformMatrix()), actionPerformed = fn(eventData, transform, x, y);
                fabricObject._setPositionDimensions({});
                let newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / fabricObject.width, newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / fabricObject.height;
                fabricObject.setPositionByOrigin(absolutePoint, (newX + 0.5).toString(), (newY + 0.5).toString());
                return actionPerformed;
            };
        }
        static addElementWithPosition(array, newPoint, newIndex) {
            if (newIndex < 0) {
                array.unshift(newPoint);
            }
            else if (array.length <= newIndex) {
                array.push(newPoint);
            }
            else {
                let points = [];
                array.forEach((point, index) => {
                    if (index === newIndex) {
                        points.push(newPoint);
                    }
                    points.push(point);
                });
                array = points;
            }
            return array;
        }
    }
    exports.AreaShapePolygon = AreaShapePolygon;
});
