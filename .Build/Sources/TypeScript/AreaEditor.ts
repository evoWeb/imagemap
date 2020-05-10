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
import * as fabric from './vendor/Fabric';

import { AreaForm } from './AreaForm';
import { AreaShapeFactory } from './AreaShapeFactory';
import { FormElementAbstract } from './FormElementAbstract';

// needed to access top frame elements
fabric.document = top.document || document;
fabric.window = top.window || window;

export class AreaEditor {
  readonly configurations: EditorConfigurations;

  public document: Document;

  public fauxFormDocument: Document;

  public formSelector: string = '';

  readonly preview: boolean = false;

  protected areaShapes: Array<fabric.Object> = [];

  public areaForms: Array<FormElementAbstract> = [];

  public canvas: fabric.Canvas;

  public form: AreaForm;

  constructor(configurations: EditorConfigurations, canvas: HTMLElement, formSelector: string, document: Document) {
    this.configurations = configurations;
    this.document = document;
    this.initializeCanvas(canvas, configurations);
    this.initializeAreaForm(formSelector)
  }

  protected initializeCanvas(canvas: HTMLElement, options: EditorConfigurations) {
    let activePolygon: fabric.Object = null;

    this.canvas = new fabric.Canvas(canvas, {
      ...options.canvas,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: this.preview ? 'default' : 'move',
    });

    this.canvas.on('object:moving', (event: FabricEvent) => {
      let element: fabric.Object = event.target;
      switch (element.type) {
        case 'control':
          let center = element.getCenterPoint();
          element.point.x = center.x - element.polygon.left;
          element.point.y = center.y - element.polygon.top;
          break;

        case 'polygon':
          element.controls.forEach((control: fabric.Object) => {
            control.left = element.left + control.point.x;
            control.top = element.top + control.point.y;
          });
          break;
      }
    });

    this.canvas.on('selection:created', (event: FabricEvent) => {
      if (event.target.type === 'polygon') {
        activePolygon = event.target;
        // show controls of active polygon
        activePolygon.controls.forEach((control: fabric.Object) => {
          control.opacity = 1;
        });
        this.canvas.renderAll();
      }
    });

    this.canvas.on('selection:updated', (event: FabricEvent) => {
      event.deselected.forEach((element: fabric.Object) => {
        if (element.type === 'polygon' && event.selected[0].type !== 'control') {
          // hide controls of active polygon
          element.controls.forEach((control: fabric.Object) => {
            control.opacity = 0;
          });
          activePolygon = null;
          this.canvas.renderAll();
        } else if (element.type === 'control') {
          // hide controls of active polygon
          activePolygon.controls.forEach((control: fabric.Object) => {
            control.opacity = 0;
          });
          activePolygon = null;
          this.canvas.renderAll();
        }
      });
      event.selected.forEach((element: fabric.Object) => {
        if (element.type === 'polygon') {
          activePolygon = element;
          // hide controls of active polygon
          element.controls.forEach((control: fabric.Object) => {
            control.opacity = 1;
          });
          this.canvas.renderAll();
        }
      });
    });
  }

  protected initializeAreaForm(formSelector: string) {
    this.form = new AreaForm(formSelector, this);
  }

  public renderAreas(areas: Array<AreaConfiguration>) {
    if (areas !== undefined) {
      let areaShapeFactory = new AreaShapeFactory(this.configurations);

      areas.forEach((area) => {
        let areaShape = areaShapeFactory.createShape(area, true);
        this.canvas.add(areaShape);
        this.areaShapes.push(areaShape);
        /*areaElement.editor = this;
        if (this.form) {
          this.form.addArea(areaElement);
        }*/
      });
    }
  }

  public removeAreas() {
    this.areaShapes.forEach((area) => {
      area.remove();
    });
  }

  public deleteArea(area: FormElementAbstract) {
    let areas: Array<FormElementAbstract> = [];
    this.areaForms.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areaForms = areas;
    this.canvas.remove(area);
  }

  public getMapData() {
    let areas: object[] = [];

    this.areaForms.forEach((area) => {
      areas.push(area.getData());
    });

    return JSON.stringify(areas);
  }
}
