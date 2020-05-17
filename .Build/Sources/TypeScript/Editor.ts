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
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';
// @ts-ignore
import { Canvas, Object } from './vendor/Fabric';
import { AreaForm } from './AreaForm';
import { AreaShapeFactory } from './AreaShapeFactory';
import { AreaFieldsetFactory } from './AreaFieldsetFactory';
import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';

export class Editor {
  readonly configurations: EditorConfigurations;

  readonly width: number;

  readonly height: number;

  readonly modalParent: Document;

  readonly browselinkParent: Document;

  public areaShapes: Array<Object> = [];

  public canvas: Canvas;

  public formSelector: string = '#areasForm';

  public areaFieldsets: Array<AreaFieldsetAbstract> = [];

  public form: AreaForm;

  private activePolygon: Object = null;

  constructor(
    configurations: EditorConfigurations,
    canvas: HTMLCanvasElement,
    modalParent: Document,
    browselinkParent: Document
  ) {
    this.configurations = configurations;
    this.width = configurations.canvas.width;
    this.height = configurations.canvas.height;
    this.modalParent = modalParent;
    this.browselinkParent = browselinkParent;

    this.initializeCanvas(canvas, configurations.canvas);
    this.initializeAreaForm();
  }

  private initializeCanvas(canvas: HTMLCanvasElement, configurations: CanvasSize): void {
    this.canvas = new Canvas(canvas, {
      ...configurations,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'move',
    });

    // @todo check these
    this.canvas.on('object:moving', this.objectMoving.bind(this));
    this.canvas.on('selection:created', this.selectionCreated.bind(this));
    this.canvas.on('selection:updated', this.selectionUpdated.bind(this));
  }

  private objectMoving(event: FabricEvent): void {
    let element: Object = event.target;
    switch (element.type) {
      case 'control':
        let center = element.getCenterPoint();
        element.point.x = center.x - element.polygon.left;
        element.point.y = center.y - element.polygon.top;
        break;

      case 'polygon':
        element.controls.forEach((control: Object) => {
          control.left = element.left + control.point.x;
          control.top = element.top + control.point.y;
        });
        break;
    }
  }

  private selectionCreated(event: FabricEvent): void {
    if (event.target.type === 'polygon') {
      this.activePolygon = event.target;
      // show controls of active polygon
      this.activePolygon.controls.forEach((control: Object) => {
        control.opacity = 1;
      });
      this.canvas.renderAll();
    }
  }

  private selectionUpdated(event: FabricEvent): void {
    event.deselected.forEach((element: Object) => {
      if (element.type === 'polygon' && event.selected[0].type !== 'control') {
        // hide controls of active polygon
        element.controls.forEach((control: Object) => {
          control.opacity = 0;
        });
        this.activePolygon = null;
        this.canvas.renderAll();
      } else if (element.type === 'control') {
        // hide controls of active polygon
        this.activePolygon.controls.forEach((control: Object) => {
          control.opacity = 0;
        });
        this.activePolygon = null;
        this.canvas.renderAll();
      }
    });
    event.selected.forEach((element: Object) => {
      if (element.type === 'polygon') {
        this.activePolygon = element;
        // hide controls of active polygon
        element.controls.forEach((control: Object) => {
          control.opacity = 1;
        });
        this.canvas.renderAll();
      }
    });
  }

  private initializeAreaForm(): void {
    this.form = new AreaForm(this.formSelector, this.modalParent, this);
  }

  public resize(width: number, height: number): void {
    if (this.width !== width || this.height !== height) {
      // @todo resize canvas size
      // @todo resize and reposition shapes on canvas
      // @todo change values in areaFieldset
    }
  }

  public renderAreas(areas: Array<AreaAttributes>): void {
    if (areas !== undefined) {
      let areaShapeFactory = new AreaShapeFactory(this.configurations, this.canvas);
      let areaFieldsetFactory = new AreaFieldsetFactory(this.configurations);

      areas.forEach((area) => {
        let areaShape = areaShapeFactory.createShape(area, true),
          areaFieldset = areaFieldsetFactory.createFieldset(area, areaShape);

        this.canvas.add(areaShape);
        this.areaShapes.push(areaShape);
        this.areaFieldsets.push(areaFieldset);
        this.form.addArea(areaFieldset);
      });
    }
  }

  public removeAreas(): void {
    this.areaFieldsets.forEach((area) => {
      area.deleteAction();
    });
  }

  public deleteArea(area: AreaFieldsetAbstract): void {
    let areas: Array<AreaFieldsetAbstract> = [];
    this.areaFieldsets.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areaFieldsets = areas;
    this.canvas.remove(area.shape);
  }

  public getMapData(): string {
    let areas: object[] = [];

    this.areaFieldsets.forEach((area) => {
      areas.push(area.getData());
    });

    return JSON.stringify(areas);
  }

  public destroy(): void {
    this.canvas = null;
    this.form.destroy();
  }
}
