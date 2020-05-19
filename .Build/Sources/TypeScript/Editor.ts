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
import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';
import { AreaFieldsetFactory } from './AreaFieldsetFactory';
import { AreaForm } from './AreaForm';
import { AreaShapeFactory } from './AreaShapeFactory';

export class Editor {
  readonly configuration: EditorConfiguration;

  readonly modalParent: Document;

  readonly browselinkParent: Document;

  public areaShapes: Array<Object> = [];

  public canvas: Canvas;

  public formSelector: string = '#areasForm';

  public areaFieldsets: Array<AreaFieldsetAbstract> = [];

  public form: AreaForm;

  private activePolygon: Object = null;

  constructor(
    configuration: EditorConfiguration,
    canvas: HTMLCanvasElement,
    modalParent: Document,
    browselinkParent: Document
  ) {
    this.configuration = configuration;
    this.modalParent = modalParent;
    this.browselinkParent = browselinkParent;

    this.initializeCanvas(canvas);
    this.initializeAreaForm();
  }

  private initializeCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = new Canvas(canvas, {
      width: AreaForm.width,
      height: AreaForm.height,
      top: AreaForm.height * -1,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'move',
    });


    this.canvas.on('object:modified', Editor.objectModified.bind(this));
    this.canvas.on('selection:created', this.selectionCreated.bind(this));
    this.canvas.on('selection:updated', this.selectionUpdated.bind(this));
  }

  static objectModified(event: FabricEvent): void {
    // @todo check these
    console.log(event, 'objectModified');

    let element: Object = event.target;
    if (element.hasOwnProperty('fieldset')) {
      // circle, polygon, rectangle
      element.fieldset.shapeModified(event);
    } else if (element.hasOwnProperty('polygon')) {
      // polygon control
      element.polygon.fieldset.shapeModified(event);
    }
  }

  private selectionCreated(event: FabricEvent): void {
    // @todo check these
console.log(event, 'selectionCreated');
    let element: Object = event.target;
    if (element.type === 'polygon') {
      this.activePolygon = element;
      // show controls of active polygon
      this.activePolygon.controls.forEach((control: Object) => {
        control.opacity = 1;
      });
      this.canvas.renderAll();
    }
  }

  private selectionUpdated(event: FabricEvent): void {
    // @todo check these
console.log(event, 'selectionUpdated');
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
    if (AreaForm.width !== width || AreaForm.height !== height) {
      // @todo resize canvas size
      // @todo resize and reposition shapes on canvas
      // @todo change values in areaFieldset
    }
  }

  public renderAreas(areas: Array<Area>): void {
    if (areas !== undefined) {
      let areaShapeFactory = new AreaShapeFactory(this.canvas);
      let areaFieldsetFactory = new AreaFieldsetFactory(this.configuration);

      areas.forEach((area) => {
        area.color = AreaShapeFactory.getRandomColor(area.color);
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
