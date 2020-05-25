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
  static shapeConfiguration: ShapeConfiguration = {
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

  readonly canvas: Canvas;

  constructor(canvas: Canvas = null) {
    this.canvas = canvas;
  }

  public createShape(area: Area, selectable: boolean): Object {
    let areaShape: Object,
      configuration: ShapeConfiguration = {
        ...AreaShapeFactory.shapeConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: area.color,
        fill: AreaShapeFactory.hexToRgbA(area.color, 0.4),
        id: Object.__uid++,
        canvas: this.canvas
      };

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

  static createCircle(area: Area, configuration: ShapeConfiguration): AreaShapeCircle {
    let coords = area.coords,
      radius = AreaForm.outputiX(coords.radius),
      left = AreaForm.outputiX(coords.left) - radius,
      top = AreaForm.outputiY(coords.top) - radius;

    return new AreaShapeCircle({
      ...configuration,
      left: left,
      top: top,
      radius: radius,
      // disable control points as these would stretch the circle
      // to an ellipse which is not possible in html areas
      _controlsVisibility: {
        ml: false,
        mt: false,
        mr: false,
        mb: false,
        mtr: false,
      }
    });
  }

  static createPolygon(area: Area, configuration: ShapeConfiguration): AreaShapePolygon {
    let points: Point[] = area.points || [],
      polygonPoints: Point[] = [];

    points.map((point) => {
      point.id = configuration.id + '-' + Object.__uid++;
      polygonPoints.push({
        x: AreaForm.outputiX(point.x),
        y: AreaForm.outputiY(point.y),
        id: point.id,
      });
    });

    return new AreaShapePolygon(polygonPoints, {
      ...configuration,
      objectCaching: false,
    });
  }

  static createRectangle(area: Area, configuration: ShapeConfiguration): AreaShapeRectangle {
    let coords = area.coords,
      left = AreaForm.outputiX(coords.left),
      top = AreaForm.outputiY(coords.top),
      width = AreaForm.outputiX(coords.right) - left,
      height = AreaForm.outputiY(coords.bottom) - top;

    return new AreaShapeRectangle({
      ...configuration,
      left: left,
      top: top,
      width: width,
      height: height,
      _controlsVisibility: {
        mtr: false,
      }
    });
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
