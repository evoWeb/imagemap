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
define(["require", "exports", "./vendor/Fabric", "./AreaFieldsetAbstract"], function (require, exports, Fabric_1, AreaFieldsetAbstract_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetPolygon extends AreaFieldsetAbstract_1.AreaFieldsetAbstract {
        constructor() {
            super(...arguments);
            this.name = 'polygon';
        }
        updateFields() {
            for (let attributeKey in this.area) {
                if (!this.area.hasOwnProperty(attributeKey)) {
                    continue;
                }
                let attributeValue = this.area[attributeKey] || '', element = this.getElement('.' + attributeKey);
                if (element !== null) {
                    if (typeof attributeValue === 'number') {
                        attributeValue = attributeValue.toString();
                    }
                    element.setAttribute('value', attributeValue);
                }
            }
            let parentElement = this.getElement('.positionOptions');
            this.shape.points.forEach((point) => {
                if (!point.hasOwnProperty('element')) {
                    point.element = this.getFieldsetElement('#polygonCoords', point.id);
                    parentElement.append(point.element);
                }
                let xField = this.getElement(`#x${point.id}`), yField = this.getElement(`#y${point.id}`);
                xField.dataset.point = point.id;
                yField.dataset.point = point.id;
                xField.setAttribute('value', this.outputX(point.areaPoint.x));
                yField.setAttribute('value', this.outputY(point.areaPoint.y));
            });
        }
        shapeModified(event) {
            let element = event.target;
            let matrix = element.calcTransformMatrix();
            element.points.forEach((point) => {
                let temporaryPoint = new Fabric_1.Point(point.x - element.pathOffset.x, point.y - element.pathOffset.y), transformed = Fabric_1.util.transformPoint(temporaryPoint, matrix);
                point.areaPoint.x = this.inputX(transformed.x);
                point.areaPoint.y = this.inputX(transformed.y);
                console.log(this.getElement(`#x${point.id}`));
                console.log(this.getElement(`#y${point.id}`));
                let xField = this.getElement(`#x${point.id}`), yField = this.getElement(`#y${point.id}`);
                xField.value = transformed.x.toString();
                yField.value = transformed.y.toString();
            });
        }
        moveShape(event) {
            let field = (event.target), point = null, left, top;
            this.shape.points.forEach((pointToCheck) => {
                if (pointToCheck.id === field.dataset.point) {
                    point = pointToCheck;
                }
            });
            if (point !== null) {
                left = parseInt(field.dataset.field === 'x' ? field.value : point.x);
                top = parseInt(field.dataset.field === 'y' ? field.value : point.y);
                point.areaPoint.x = this.inputX(left);
                point.areaPoint.y = this.inputY(top);
                point.x = left;
                point.y = top;
                this.shape.canvas.renderAll();
            }
        }
        getData() {
            let data = Object.assign({}, this.area);
            data.points.forEach((point) => {
                delete (point.polygonPoint);
                delete (point.id);
            });
            return data;
        }
        addPointAfterAction(event) {
            let direction = AreaFieldsetAbstract_1.AreaFieldsetAbstract.after, parentElement = this.getElement('.positionOptions'), [polygonPoint, element, currentPoint, nextPointIndex] = this.getPointElementAndCurrentPoint(event, direction), areaPoint = {
                x: this.inputX(polygonPoint.x),
                y: this.inputY(polygonPoint.y),
                id: polygonPoint.id,
                polygonPoint: polygonPoint,
            };
            polygonPoint.areaPoint = areaPoint;
            if (currentPoint.element.nextSibling) {
                parentElement.insertBefore(element, currentPoint.element.nextSibling);
            }
            else {
                parentElement.append(element);
            }
            this.area.points = AreaFieldsetPolygon.addElementToArrayWithPosition(this.area.points, areaPoint, nextPointIndex);
            this.shape.points = AreaFieldsetPolygon.addElementToArrayWithPosition(this.shape.points, polygonPoint, nextPointIndex);
        }
        removePointAction(event) {
            if (this.points.length > 3) {
                let element = event.currentTarget.parentNode.parentNode, points = [];
                this.points.forEach((point) => {
                    if (element.id !== point.id) {
                        points.push(point);
                    }
                    else {
                        point.element.remove();
                    }
                });
                points.forEach((point, index) => {
                    let oldId = point.id;
                    point.id = `p${this.id}_${index}`;
                    this.getElement(`#${oldId}`).id = point.id;
                    this.getElement(`#x${oldId}`).id = 'x' + point.id;
                    this.getElement(`#y${oldId}`).id = 'y' + point.id;
                    this.getElement(`[for="x${oldId}"]`).setAttribute('for', 'x' + point.id);
                    this.getElement(`[for="y${oldId}"]`).setAttribute('for', 'y' + point.id);
                });
                this.points = points;
                this.canvas.renderAll();
            }
        }
        getPointElementAndCurrentPoint(event, direction) {
            let currentPointId = event.currentTarget.parentNode.parentNode.id, [currentPoint, nextPoint, nextPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction), id = this.id + '_' + Fabric_1.Object.__uid++, element = this.getFieldsetElement('#polygonCoords', id), point = {
                x: Math.floor((currentPoint.x + nextPoint.x) / 2),
                y: Math.floor((currentPoint.y + nextPoint.y) / 2),
                id: id,
                element: element
            };
            this.initializeCoordinateFieldEvents(element.querySelectorAll('.t3js-field'));
            this.initializeButtonEvents(element.querySelectorAll('.t3js-btn'));
            let xField = element.querySelector(`#x${point.id}`), yField = element.querySelector(`#y${point.id}`);
            xField.dataset.point = point.id;
            yField.dataset.point = point.id;
            xField.value = point.x.toString();
            yField.value = point.y.toString();
            return [point, element, currentPoint, nextPointIndex];
        }
        getCurrentAndNextPoint(currentPointId, direction) {
            let points = this.shape.points, currentPoint = null, currentPointIndex = 0;
            points.forEach((point, index) => {
                if (point.id === currentPointId) {
                    currentPoint = point;
                    currentPointIndex = index;
                }
            });
            let nextPointIndex = currentPointIndex + direction;
            if (nextPointIndex < 0) {
                nextPointIndex = points.length - 1;
            }
            if (nextPointIndex >= points.length) {
                nextPointIndex = 0;
            }
            return [currentPoint, points[nextPointIndex], nextPointIndex];
        }
        static addElementToArrayWithPosition(array, item, index) {
            if (index < 0) {
                array.unshift(item);
            }
            else if (index >= array.length) {
                array.push(item);
            }
            else {
                let newPoints = [];
                for (let i = 0; i < array.length; i++) {
                    newPoints.push(array[i]);
                    if (i === index - 1) {
                        newPoints.push(item);
                    }
                }
                array = newPoints;
            }
            return array;
        }
    }
    exports.AreaFieldsetPolygon = AreaFieldsetPolygon;
});
