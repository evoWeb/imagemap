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
import { AreaShapeCircle } from './AreaShapeCircle';
import { AreaShapePolygon } from './AreaShapePolygon';
import { AreaShapeRectangle } from './AreaShapeRectangle';

export class AreaShapeFactory {
  readonly areaConfiguration = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    transparentCorners: false
  };

  readonly width: number;

  readonly height: number;

  readonly canvas: Canvas;

  constructor(configurations: EditorConfigurations, canvas: Canvas = null) {
    this.width = configurations.canvas.width;
    this.height = configurations.canvas.height;
    this.canvas = canvas;
  }

  public createShape(attributes: AreaAttributes, selectable: boolean): Object {
    attributes.color = AreaShapeFactory.getRandomColor(attributes.color);
    let areaShape: Object,
      configuration: ShapeConfiguration = {
        ...this.areaConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: attributes.color,
        strokeWidth: 1,
        fill: AreaShapeFactory.hexToRgbA(attributes.color, 0.3)
      };

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

  private createCircle(attributes: AreaAttributes, configuration: ShapeConfiguration): AreaShapeCircle {
    let coords = attributes.coords,
      radius = Math.round(coords.radius * this.width),
      left = Math.round(coords.left * this.width) - radius,
      top = Math.round(coords.top * this.height) - radius,
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

    return areaShape;
  }

  private createPolygon(attributes: AreaAttributes, configuration: ShapeConfiguration): AreaShapePolygon {
    let points: Point[] = attributes.points || [],
      polygonPoints: Point[] = [],
      polygonId = Object.__uid++,
      areaShape: AreaShapePolygon;

    points.map((point) => {
      point.id = polygonId + '-' + Object.__uid++;
      polygonPoints.push({
        x: Math.round(point.x * this.width),
        y: Math.round(point.y * this.height),
        id: point.id,
      });
    });

    areaShape = new AreaShapePolygon(polygonPoints, {
      ...configuration,
      objectCaching: false,
    });

    areaShape.id = polygonId;

    return areaShape;
  }

  private createRectangle(attributes: AreaAttributes, configuration: ShapeConfiguration): AreaShapeRectangle {
    let coords = attributes.coords,
      left = Math.round(coords.left * this.width),
      top = Math.round(coords.top * this.height),
      width = Math.round(coords.right * this.width) - left,
      height = Math.round(coords.bottom * this.height) - top,
      areaShape = new AreaShapeRectangle({
        ...configuration,
        left: left,
        top: top,
        width: width,
        height: height,
      });

    areaShape.id = Object.__uid++;

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
