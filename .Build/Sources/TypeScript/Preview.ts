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
import { Canvas, Object } from './vendor/Fabric.min';
import { AreaForm } from './AreaForm';
import { AreaShapeFactory } from './AreaShapeFactory';

export class Preview {
  private areaShapes: Array<Object> = [];

  private canvas: Canvas;

  constructor(canvas: HTMLElement) {
    this.initializeCanvas(canvas);
  }

  private initializeCanvas(canvas: HTMLElement): void {
    this.canvas = new Canvas(canvas, {
      width: AreaForm.width,
      height: AreaForm.height,
      top: AreaForm.height * -1,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'default',
    });
  }

  public renderAreas(areas: Array<Area>): void {
    if (areas !== undefined) {
      let areaShapeFactory = new AreaShapeFactory();
      areas.forEach((area: Area) => {
        area.color = AreaShapeFactory.getRandomColor(area.color);
        let areaShape = areaShapeFactory.createShape(area, false);

        this.canvas.add(areaShape);
        this.areaShapes.push(areaShape);
      });
    }
  }

  public removeAreas(): void {
    this.areaShapes.forEach((areaShape: Object) => {
      this.canvas.remove(areaShape);
      areaShape = null;
    });
    this.areaShapes = [];
  }
}
