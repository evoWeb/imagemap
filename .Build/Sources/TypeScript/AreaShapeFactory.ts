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

/// <reference types="../../types/index"/>

// @ts-ignore
import { Canvas, Object } from './vendor/Fabric';
import { AreaForm } from './AreaForm';
import { AreaShapeCircle } from './AreaShapeCircle';
import { AreaShapePolygon } from './AreaShapePolygon';
import { AreaShapeRectangle } from './AreaShapeRectangle';

export class AreaShapeFactory {
  readonly shapeConfiguration: ShapeConfiguration = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    transparentCorners: false
  };

  readonly canvas: Canvas;

  constructor(canvas: Canvas = null) {
    this.canvas = canvas;
  }

  public createShape(area: Area, selectable: boolean): Object {
    let areaShape: Object,
      configuration: ShapeConfiguration = {
        ...this.shapeConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: area.color,
        strokeWidth: 1,
        fill: AreaShapeFactory.hexToRgbA(area.color, 0.3)
      };

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

  private createCircle(area: Area, configuration: ShapeConfiguration): AreaShapeCircle {
    let coords = area.coords,
      radius = Math.round(coords.radius * AreaForm.width),
      left = Math.round(coords.left * AreaForm.width) - radius,
      top = Math.round(coords.top * AreaForm.height) - radius,
      areaShape = new AreaShapeCircle({
        ...configuration,
        left: left,
        top: top,
        radius: radius,
      });

    areaShape.id = Object.__uid++;

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

  private createPolygon(area: Area, configuration: ShapeConfiguration): AreaShapePolygon {
    let points: Point[] = area.points || [],
      polygonPoints: Point[] = [],
      polygonId = Object.__uid++;

    points.map((point) => {
      point.id = polygonId + '-' + Object.__uid++;
      let polygonPoint = {
        x: Math.round(point.x * AreaForm.width),
        y: Math.round(point.y * AreaForm.height),
        id: point.id,
        areaPoint: point,
      };
      point.polygonPoint = polygonPoint;
      polygonPoints.push(polygonPoint);
    });

    return new AreaShapePolygon(polygonPoints, {
      ...configuration,
      objectCaching: false,
      id: polygonId,
      canvas: this.canvas,
    });
  }

  private createRectangle(area: Area, configuration: ShapeConfiguration): AreaShapeRectangle {
    let coords = area.coords,
      left = Math.round(coords.left * AreaForm.width),
      top = Math.round(coords.top * AreaForm.height),
      width = Math.round(coords.right * AreaForm.width) - left,
      height = Math.round(coords.bottom * AreaForm.height) - top,
      areaShape = new AreaShapeRectangle({
        ...configuration,
        left: left,
        top: top,
        width: width,
        height: height,
      });

    areaShape.id = Object.__uid++;

    if (this.canvas !== null) {
      areaShape.canvas = this.canvas;
    }

    return areaShape;
  }

  static getRandomColor(color: string): string {
    while (color === undefined || !(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color))) {
      color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    return color;
  }

  static hexToRgbA(hex: string, alpha?: number): string {
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
      } else {
        result = 'rgb(' + [r, g, b].join(', ') + ')';
      }
      return result;
    }
    throw new Error('Bad Hex: ' + hex);
  }
}
