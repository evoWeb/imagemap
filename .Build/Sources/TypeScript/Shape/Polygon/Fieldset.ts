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

// @ts-ignore
import { Object, Point, util } from '../../vendor/Fabric.min';
import { AbstractFieldset } from '../AbstractFieldset';
import { ShapeFactory } from '../Factory';
import { PolygonArea } from './Area';

export class PolygonFieldset extends AbstractFieldset {
  readonly name: string = 'polygon';

  public area: PolygonArea;

  protected updateFields(): void {
    for (let attributeKey in this.area.areaData) {
      if (!this.area.areaData.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.area.areaData[attributeKey] || '',
        element = this.getElement(`.${attributeKey}`);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.value = attributeValue;
      }
    }

    let parentElement = this.getElement('.positionOptions');
    this.area.areaData.points.forEach((point: Point) => {
      if (!point.hasOwnProperty('element')) {
        point.element = this.getFieldsetElement('#polygonCoords', point.id);
        parentElement.append(point.element);
      }

      let xField = point.element.querySelector('[data-field="x"]'),
        yField = point.element.querySelector('[data-field="y"]');
      xField.dataset.point = point.id;
      yField.dataset.point = point.id;

      this.getElement('#x' + point.id).setAttribute('value', this.area.outputX(point.x).toString());
      this.getElement('#y' + point.id).setAttribute('value', this.area.outputY(point.y).toString());
    });
  }

  public shapeModified(fieldValues: {id: string, x: string, y: string}[]): void {
    fieldValues.forEach((field) => {
      this.getElement('#x' + field.id).setAttribute('value', field.x.toString());
      this.getElement('#y' + field.id).setAttribute('value', field.y.toString());
    });
  }

  protected fieldsetModified(event: InputEvent): void {
    this.area.fieldsetModified(event);
  }

  protected addPointAfterAction(event: Event): void {
    let currentElement = (event.currentTarget as HTMLElement),
      parentElement = this.getElement('.positionOptions'),
      [currentPoint, nextPoint, newIndex] = this.getCurrentAndNextIndex(
        currentElement.dataset.point,
        AbstractFieldset.after
      ),
      areaPoint: Point = {
        x: (currentPoint.x + nextPoint.x) / 2,
        y: (currentPoint.y + nextPoint.y) / 2,
        id: this.area.id + '-' + ShapeFactory.getObjectId(),
        element: null,
      };
    areaPoint.element = this.getPointFields(areaPoint);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(areaPoint.element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(areaPoint.element);
    }

    this.area.areaData.points = this.addElementWithPosition(this.area.areaData.points, areaPoint, newIndex);

    this.area.renderNewShape(this.area.areaData as Area, true);
  }

  protected removePointAction(event: Event): void {
    if (this.area.areaData.points.length > 3) {
      let element = (event.currentTarget) as HTMLElement;
      this.area.areaData.points.forEach((findPoint: Point, index: number) => {
        if (findPoint.id === element.dataset.point) {
          this.area.areaData.points[index].element.remove();
          delete(this.area.areaData.points[index]);
        }
      });
      this.area.areaData.points = this.area.areaData.points.filter((findPoint: Point) => { return findPoint !== null; });

      this.area.renderNewShape(this.area.areaData as Area, true);
    }
  }

  private getCurrentAndNextIndex(currentId: string, direction: number): any[] {
    let currentIndex = 0;

    this.area.areaData.points.forEach((findPoint: Point, index: number) => {
      if (findPoint.id === currentId) {
        currentIndex = index;
      }
    })

    let nextPointIndex = currentIndex + direction;
    if (nextPointIndex < 0) {
      nextPointIndex = this.area.areaData.points.length - 1;
    }
    if (nextPointIndex >= this.area.areaData.points.length) {
      nextPointIndex = 0;
    }

    return [this.area.areaData.points[currentIndex], this.area.areaData.points[nextPointIndex], nextPointIndex];
  }

  private getPointFields(point: Point) {
    let element = this.getFieldsetElement('#polygonCoords', point.id);

    this.getElement('#x' + point.id).setAttribute('value', this.area.outputX(point.x).toString());
    this.getElement('#y' + point.id).setAttribute('value', this.area.outputY(point.y).toString());

    this.initializeCoordinateFieldEvents(element.querySelectorAll('.t3js-field'));
    this.initializeButtonEvents(element.querySelectorAll('.t3js-btn'));

    return element;
  }

  protected addElementWithPosition(array: any[], newPoint: any, newIndex: number): any[] {
    if (newIndex < 0) {
      array.unshift(newPoint);
    } else if (array.length <= newIndex) {
      array.push(newPoint);
    } else {
      let points: any[] = [];
      array.forEach((point: Point, index: number) => {
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
