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
define(["require", "exports", "./vendor/Fabric", "./AreaFieldsetAbstract", "./AreaForm", "./AreaShapeFactory", "./AreaShapePolygon"], function (require, exports, Fabric_1, AreaFieldsetAbstract_1, AreaForm_1, AreaShapeFactory_1, AreaShapePolygon_1) {
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
                let attributeValue = this.area[attributeKey] || '', element = this.getElement(`.${attributeKey}`);
                if (element !== null) {
                    if (typeof attributeValue === 'number') {
                        attributeValue = attributeValue.toString();
                    }
                    element.value = attributeValue;
                }
            }
            let parentElement = this.getElement('.positionOptions');
            this.area.points.forEach((point) => {
                if (!point.hasOwnProperty('element')) {
                    point.element = this.getFieldsetElement('#polygonCoords', point.id);
                    parentElement.append(point.element);
                }
                let xField = point.element.querySelector('[data-field="x"]'), yField = point.element.querySelector('[data-field="y"]');
                xField.dataset.point = point.id;
                yField.dataset.point = point.id;
                xField.value = AreaForm_1.AreaForm.outputX(point.x);
                yField.value = AreaForm_1.AreaForm.outputY(point.y);
            });
        }
        shapeModified(event) {
            let areaShape = event.target, matrix = areaShape.calcTransformMatrix();
            areaShape.points.forEach((point) => {
                let temporaryPoint = new Fabric_1.Point(point.x - areaShape.pathOffset.x, point.y - areaShape.pathOffset.y), transformed = Fabric_1.util.transformPoint(temporaryPoint, matrix), areaPoint = this.area.points.find((findPoint) => { return findPoint.id === point.id; });
                if (areaPoint) {
                    let xField = areaPoint.element.querySelector('[data-field="x"]'), yField = areaPoint.element.querySelector('[data-field="y"]');
                    areaPoint.x = AreaForm_1.AreaForm.inputX(transformed.x);
                    areaPoint.y = AreaForm_1.AreaForm.inputY(transformed.y);
                    xField.value = AreaForm_1.AreaForm.outputX(areaPoint.x);
                    yField.value = AreaForm_1.AreaForm.outputY(areaPoint.y);
                }
            });
        }
        moveShape(event) {
            let field = (event.target), point = this.shape.points.find((findPoint) => { return findPoint.id === field.dataset.point; }), areaPoint = this.area.points.find((findPoint) => { return findPoint.id === point.id; }), left, top;
            if (point !== null) {
                left = field.dataset.field === 'x' ? parseInt(field.value) : point.x;
                top = field.dataset.field === 'y' ? parseInt(field.value) : point.y;
                areaPoint.x = AreaForm_1.AreaForm.inputX(left);
                areaPoint.y = AreaForm_1.AreaForm.inputY(top);
                point.x = left;
                point.y = top;
                this.form.canvas.renderAll();
            }
        }
        getData() {
            let data = Object.assign({}, this.area);
            data.points.forEach((point) => {
                delete (point.element);
                delete (point.id);
            });
            return data;
        }
        addPointAfterAction(event) {
            let currentElement = event.currentTarget, parentElement = this.getElement('.positionOptions'), [currentPoint, nextPoint, newIndex] = this.getCurrentAndNextIndex(currentElement.dataset.point, AreaFieldsetAbstract_1.AreaFieldsetAbstract.after), areaPoint = {
                x: (currentPoint.x + nextPoint.x) / 2,
                y: (currentPoint.y + nextPoint.y) / 2,
                id: this.id + '-' + Fabric_1.Object.__uid++,
                element: null,
            };
            areaPoint.element = this.getPointFields(areaPoint);
            if (currentPoint.element.nextSibling) {
                parentElement.insertBefore(areaPoint.element, currentPoint.element.nextSibling);
            }
            else {
                parentElement.append(areaPoint.element);
            }
            this.area.points = AreaFieldsetPolygon.addElementWithPosition(this.area.points, areaPoint, newIndex);
            this.renderNewShape(this.area, true);
        }
        removePointAction(event) {
            if (this.area.points.length > 3) {
                let element = (event.currentTarget);
                this.area.points.forEach((findPoint, index) => {
                    if (findPoint.id === element.dataset.point) {
                        this.area.points[index].element.remove();
                        delete (this.area.points[index]);
                    }
                });
                this.area.points = this.area.points.filter((findPoint) => { return findPoint !== null; });
                this.renderNewShape(this.area, true);
            }
        }
        renderNewShape(area, selectable) {
            let points = area.points || [], polygonPoints = [], configuration = Object.assign(Object.assign({}, AreaShapeFactory_1.AreaShapeFactory.shapeConfiguration), { selectable: selectable, hasControls: selectable, stroke: area.color, strokeWidth: 0, fill: AreaShapeFactory_1.AreaShapeFactory.hexToRgbA(area.color, 0.4), id: this.id, canvas: this.canvas });
            points.map((point) => {
                polygonPoints.push({
                    x: AreaForm_1.AreaForm.outputiX(point.x),
                    y: AreaForm_1.AreaForm.outputiY(point.y),
                    id: point.id,
                });
            });
            this.form.canvas.remove(this.shape);
            this.shape = new AreaShapePolygon_1.AreaShapePolygon(polygonPoints, Object.assign(Object.assign({}, configuration), { objectCaching: false }));
            this.shape.fieldset = this;
            this.form.canvas.add(this.shape);
            this.shape.initializeControls();
        }
        getCurrentAndNextIndex(currentId, direction) {
            let currentIndex = 0;
            this.area.points.forEach((findPoint, index) => {
                if (findPoint.id === currentId) {
                    currentIndex = index;
                }
            });
            let nextPointIndex = currentIndex + direction;
            if (nextPointIndex < 0) {
                nextPointIndex = this.area.points.length - 1;
            }
            if (nextPointIndex >= this.area.points.length) {
                nextPointIndex = 0;
            }
            return [this.area.points[currentIndex], this.area.points[nextPointIndex], nextPointIndex];
        }
        getPointFields(point) {
            let element = this.getFieldsetElement('#polygonCoords', point.id), xField = element.querySelector('[data-field="x"]'), yField = element.querySelector('[data-field="y"]');
            xField.dataset.point = point.id;
            yField.dataset.point = point.id;
            xField.value = AreaForm_1.AreaForm.outputX(point.x);
            yField.value = AreaForm_1.AreaForm.outputY(point.y);
            this.initializeCoordinateFieldEvents(element.querySelectorAll('.t3js-field'));
            this.initializeButtonEvents(element.querySelectorAll('.t3js-btn'));
            return element;
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
    exports.AreaFieldsetPolygon = AreaFieldsetPolygon;
});
