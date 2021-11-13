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
import * as Fabric from './vendor/Fabric.min';
import { AreaForm } from './AreaForm';
import { AbstractArea } from './Shape/AbstractArea';
import { ShapeFactory } from './Shape/Factory';

export class Preview {
  private areas: Array<AbstractArea> = [];

  private canvas: Fabric.Canvas;

  constructor(canvas: HTMLElement) {
    this.initializeCanvas(canvas);
  }

  private initializeCanvas(canvas: HTMLElement): void {
    this.canvas = new Fabric.Canvas(canvas, {
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
      let shapeFactory = new ShapeFactory();
      areas.forEach((areaData: Area) => {
        let area = shapeFactory.create(areaData, false);

        this.canvas.add(area.canvasShape);
        this.areas.push(area);
      });
    }
  }

  public removeAreas(): void {
    this.areas.forEach((area: AbstractArea) => {
      this.canvas.remove(area.canvasShape);
      area = null;
    });
    this.areas = [];
  }
}
