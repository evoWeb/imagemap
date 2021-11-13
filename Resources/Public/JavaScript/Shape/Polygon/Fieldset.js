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
define(["require", "exports", "../AbstractFieldset", "../Factory"], function (require, exports, AbstractFieldset_1, Factory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PolygonFieldset extends AbstractFieldset_1.AbstractFieldset {
        constructor() {
            super(...arguments);
            this.name = 'polygon';
        }
        updateFields() {
            for (let attributeKey in this.area.areaData) {
                if (!this.area.areaData.hasOwnProperty(attributeKey)) {
                    continue;
                }
                let attributeValue = this.area.areaData[attributeKey] || '', element = this.getElement(`.${attributeKey}`);
                if (element !== null) {
                    if (typeof attributeValue === 'number') {
                        attributeValue = attributeValue.toString();
                    }
                    element.value = attributeValue;
                }
            }
            let parentElement = this.getElement('.positionOptions');
            this.area.areaData.points.forEach((point) => {
                if (!point.hasOwnProperty('element')) {
                    point.element = this.getFieldsetElement('#polygonCoords', point.id);
                    parentElement.append(point.element);
                }
                let xField = point.element.querySelector('[data-field="x"]'), yField = point.element.querySelector('[data-field="y"]');
                xField.dataset.point = point.id;
                yField.dataset.point = point.id;
                this.getElement('#x' + point.id).setAttribute('value', this.area.outputX(point.x));
                this.getElement('#y' + point.id).setAttribute('value', this.area.outputY(point.y));
            });
        }
        shapeModified(fieldValues) {
            fieldValues.forEach((field) => {
                this.getElement('#x' + field.id).setAttribute('value', field.x);
                this.getElement('#y' + field.id).setAttribute('value', field.y);
            });
        }
        fieldsetModified(event) {
            this.area.fieldsetModified(event);
        }
        addPointAfterAction(event) {
            let currentElement = event.currentTarget, parentElement = this.getElement('.positionOptions'), [currentPoint, nextPoint, newIndex] = this.getCurrentAndNextIndex(currentElement.dataset.point, AbstractFieldset_1.AbstractFieldset.after), areaPoint = {
                x: (currentPoint.x + nextPoint.x) / 2,
                y: (currentPoint.y + nextPoint.y) / 2,
                id: this.area.id + '-' + Factory_1.ShapeFactory.getObjectId(),
                element: null,
            };
            areaPoint.element = this.getPointFields(areaPoint);
            if (currentPoint.element.nextSibling) {
                parentElement.insertBefore(areaPoint.element, currentPoint.element.nextSibling);
            }
            else {
                parentElement.append(areaPoint.element);
            }
            this.area.areaData.points = this.addElementWithPosition(this.area.areaData.points, areaPoint, newIndex);
            this.area.renderNewShape(this.area.areaData, true);
        }
        removePointAction(event) {
            if (this.area.areaData.points.length > 3) {
                let element = (event.currentTarget);
                this.area.areaData.points.forEach((findPoint, index) => {
                    if (findPoint.id === element.dataset.point) {
                        this.area.areaData.points[index].element.remove();
                        delete (this.area.areaData.points[index]);
                    }
                });
                this.area.areaData.points = this.area.areaData.points.filter((findPoint) => { return findPoint !== null; });
                this.area.renderNewShape(this.area.areaData, true);
            }
        }
        getCurrentAndNextIndex(currentId, direction) {
            let currentIndex = 0;
            this.area.areaData.points.forEach((findPoint, index) => {
                if (findPoint.id === currentId) {
                    currentIndex = index;
                }
            });
            let nextPointIndex = currentIndex + direction;
            if (nextPointIndex < 0) {
                nextPointIndex = this.area.areaData.points.length - 1;
            }
            if (nextPointIndex >= this.area.areaData.points.length) {
                nextPointIndex = 0;
            }
            return [this.area.areaData.points[currentIndex], this.area.areaData.points[nextPointIndex], nextPointIndex];
        }
        getPointFields(point) {
            let element = this.getFieldsetElement('#polygonCoords', point.id);
            this.getElement('#x' + point.id).setAttribute('value', this.area.outputX(point.x));
            this.getElement('#y' + point.id).setAttribute('value', this.area.outputY(point.y));
            this.initializeCoordinateFieldEvents(element.querySelectorAll('.t3js-field'));
            this.initializeButtonEvents(element.querySelectorAll('.t3js-btn'));
            return element;
        }
        addElementWithPosition(array, newPoint, newIndex) {
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
    exports.PolygonFieldset = PolygonFieldset;
});
