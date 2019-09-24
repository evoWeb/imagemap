/**
 * This file is developed by evoweb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

/// <reference types="../types/index"/>
/// <reference types="fabric"/>

// @ts-ignore
import * as fabric from './vendor/fabric';
// @ts-ignore
import * as Modal from 'TYPO3/CMS/Backend/Modal';
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';

export class AreaUtility {
  static before: number = -1;

  static after: number = 1;

  static getRandomColor(color: string): string {
    if (color === undefined || color === '') {
      let r = (Math.floor(Math.random() * 5) * 3).toString(16),
        g = (Math.floor(Math.random() * 5) * 3).toString(16),
        b = (Math.floor(Math.random() * 5) * 3).toString(16);
      color = '#' + r + r + g + g + b + b;
    }
    return color;
  }

  static hexToRgbA(hex: string, alpha: number): string {
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
    throw new Error('Bad Hex');
  }

  static wait(callback: Function, delay: number) {
    return window.setTimeout(callback, delay);
  }

  static addElementToArrayWithPosition(array: any[], item: any, newPointIndex: number) {
    if (newPointIndex < 0) {
      array.unshift(item);
    } else if (newPointIndex >= array.length) {
      array.push(item);
    } else {
      let newPoints = [];
      for (let i = 0; i < array.length; i++) {
        newPoints.push(array[i]);
        if (i === newPointIndex - 1) {
          newPoints.push(item);
        }
      }
      array = newPoints;
    }
    return array;
  }

  static highestIndexOfArray(array: any[]): number {
    let index: number = 0,
      iterator: IterableIterator<number> = array.keys();
    for (let key of iterator) {
      index = Math.max(index, key);
    }
    return index;
  }
}

abstract class FormArea {
  protected abstract name: string;

  readonly id: number = 0;

  private eventDelay: number;

  private _element: HTMLElement;

  public canvasArea: CanvasRectangle|CanvasCircle|CanvasPolygon|fabric.Object;

  readonly form: AreaForm;

  public configuration: HTML5Area;

  [property: string]: any;

  constructor(form: AreaForm, canvasArea: CanvasRectangle|CanvasCircle|CanvasPolygon, configuration: HTML5Area) {
    this.form = form;
    this.configuration = configuration;

    this.canvasArea = canvasArea;
    this.canvasArea.formArea = this;
    this.id = canvasArea.id;
  }

  public initialize() {
    this.prepareAreaTemplate();
    this.updateFields(this.configuration);
    this.initializeColorPicker();
    this.initializeEvents();
    this.addFauxInput();
  }

  get element() {
    return this._element;
  }

  protected getFormElement(selector: string, id: number, point?: number): HTMLElement {
    let template = this.form.element
      .querySelector(selector)
      .innerHTML.replace(
        new RegExp('_ID', 'g'), String(id ? id : this.id)
      );
    if (typeof point !== 'undefined') {
      template = template.replace(new RegExp('_POINT', 'g'), point.toString());
    }
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
  }

  private prepareAreaTemplate() {
    this._element = this.getFormElement('#' + this.name + 'Form', this.id);
  }

  public getElement(selector: string): HTMLInputElement {
    return this.element.querySelector(selector);
  }

  protected getElements(selector: string) {
    return this.element.querySelectorAll(selector);
  }

  private hideElement(selector: string) {
    this.getElement(selector).classList.add('hide');
  }

  private showElement(selector: string) {
    this.getElement(selector).classList.remove('hide');
  }

  public getFieldValue(selector: string): string {
    return this.getElement(selector).value;
  }

  public setFieldValue(selector: string, value: string|number) {
    this.getElement(selector).value = (value || '').toString();
  }

  private initializeColorPicker() {
    ($(this.getElement('.t3js-color-picker')) as any).minicolors({
      format: 'hex',
      position: 'left',
      theme: 'default',
      changeDelay: 100,
      change: this.colorPickerAction.bind(this)
    });
  }

  private colorPickerAction(value: string) {
    (this.getElement('.t3js-color-picker') as HTMLInputElement).value = value;
    this.canvasArea.setProperties({
      borderColor: value,
      stroke: value,
      fill: AreaUtility.hexToRgbA(value, 0.2),
    });
  }

  private initializeEvents() {
    this.getElements('.basicOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('keyup', this.updateProperties.bind(this));
    });
    this.getElements('.positionOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('input', this.fieldInputHandler.bind(this));
    });
    this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
  }

  protected buttonEventHandler(button: HTMLElement) {
    let action = button.dataset.action + 'Action';
    button.removeEventListener('click', this[action]);
    button.addEventListener('click', this[action].bind(this));
  }

  private fieldInputHandler(event: Event) {
    clearTimeout(this.eventDelay);
    this.eventDelay = AreaUtility.wait(() => { this.updateCanvas(event); }, 500);
  }

  private updateProperties(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      property = field.id;
    if (this.configuration.hasOwnProperty(property)) {
      this.configuration[property] = field.value;
    } else if (this.configuration.coords.hasOwnProperty(property)) {
      this.configuration.coords[property] = field.value;
    } else if (this.configuration.data.hasOwnProperty(property)) {
      this.configuration.data[property] = field.value;
    }
  }

  public updateArrowsState() {
    let areaZone = this.form.areaZone;
    this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
    this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
  }

  private linkAction(event: Event) {
    event.preventDefault();
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  private upAction(event: Event) {
    event.preventDefault();
    this.form.moveArea(this, AreaUtility.before);
  }

  private downAction(event: Event) {
    event.preventDefault();
    this.form.moveArea(this, AreaUtility.after);
  }

  private deleteAction(event: Event) {
    event.preventDefault();
    if (this.element) {
      this.element.remove();
    }
    this.removeFauxInput();
    this.form.deleteArea(this);
  }

  private expandAction(event: Event) {
    event.preventDefault();
    this.showElement('.moreOptions');
    this.hideElement('[data-action="expand"]');
    this.showElement('[data-action="collapse"]');
  }

  private collapseAction(event: Event) {
    event.preventDefault();
    this.hideElement('.moreOptions');
    this.hideElement('[data-action="collapse"]');
    this.showElement('[data-action="expand"]');
  }

  private undoAction() {
  }

  private redoAction() {
  }

  /**
   * Add faux input as target for browselink which listens for changes and writes value to real field.
   *
   * Browselink uses the concept of opener which is a parent frame. In case the browselink was opened
   * in the modal (which resides in the top frame) still the opener frame it the iframe with the "Open
   * Area Editor" button.
   *
   * With help of the faux document and faux input, browselink finds the field to change link in, which
   * is then set in the modal to the originating link field, which then again is used to get the value
   * of once the save button is clicked.
   */
  private addFauxInput() {
    if (this.form.fauxForm) {
      let fauxInput = this.form.fauxDocument.createElement('input');
      fauxInput.setAttribute('id', 'link' + this.id);
      fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
      fauxInput.setAttribute('value', this.configuration.href);
      fauxInput.onchange = this.changedFauxInput.bind(this);
      this.form.fauxForm.appendChild(fauxInput);
    }
  }

  private removeFauxInput() {
    if (this.form && this.form.fauxForm) {
      let field = this.form.fauxForm.querySelector('#link' + this.id);
      if (field) {
        field.remove();
      }
    }
  }

  private changedFauxInput() {
    let field = (this.form.fauxDocument.querySelector('#link' + this.id) as HTMLInputElement);
    this.configuration.href = field.value;
    this.updateFields(this.configuration);
  }

  public abstract updateFields(configuration: HTML5Area): void;

  public abstract updateCanvas(event: Event): void;

  public abstract getData(): HTML5Area;

  public destroy() {
    this.element.remove();
    this.removeFauxInput();
    this.form.deleteArea(this);
  }
}

class FormRectangle extends FormArea {
  protected name: string = 'rectangle';

  public updateFields(configuration: HTML5Area) {
    this.configuration = configuration;

    this.setFieldValue('.color', configuration.data.color);
    this.setFieldValue('.alt', configuration.alt);
    this.setFieldValue('.href', configuration.href);
    this.setFieldValue('#left', configuration.coords.left);
    this.setFieldValue('#top', configuration.coords.top);
    this.setFieldValue('#right', configuration.coords.right);
    this.setFieldValue('#bottom', configuration.coords.bottom);
  }

  public updateCanvas(event: Event) {
    let coords = this.configuration.coords,
      field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value),
      property = '';

    switch (field.id) {
      case 'left':
        coords.right = coords.right - coords.left + value;
        this.getElement('#right').value = coords.right.toString();
        coords.left = value;
        property = 'left';
        break;

      case 'top':
        coords.bottom = coords.bottom - coords.top + value;
        this.getElement('#bottom').value = coords.bottom .toString();
        coords.top = value;
        property = 'top';
        break;

      case 'right':
        if (value <= coords.left) {
          value = coords.left + 10;
          field.value = value.toString();
        }
        coords.right = value;
        value = coords.right - coords.left;
        property = 'width';
        break;

      case 'bottom':
        if (value <= coords.top) {
          value = coords.top + 10;
          field.value = value.toString();
        }
        coords.bottom = value;
        value = coords.bottom - coords.top;
        property = 'height';
        break;
    }

    this.canvasArea.setProperty(property, value);
  }

  public getData(): HTML5Area {
    return this.configuration;
  }
}

class FormCircle extends FormArea {
  protected name: string = 'circle';

  public updateFields(configuration: HTML5Area) {
    this.configuration = configuration;

    this.setFieldValue('.color', configuration.data.color);
    this.setFieldValue('.alt', configuration.alt);
    this.setFieldValue('.href', configuration.href);
    this.setFieldValue('#left', configuration.coords.left);
    this.setFieldValue('#top', configuration.coords.top);
    this.setFieldValue('#radius', configuration.coords.radius);
  }

  public updateCanvas(event: Event) {
    let coords = this.configuration.coords,
      field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value),
      property = '';

    switch (field.id) {
      case 'left':
        coords.left = value;
        property = 'left';
        break;

      case 'top':
        coords.top = value;
        property = 'top';
        break;

      case 'radius':
        coords.radius = value;
        property = 'radius';
        break;
    }

    this.canvasArea.setProperty(property, value);
  }

  public getData(): HTML5Area {
    return this.configuration;
  }
}

class FormPolygon extends FormArea {
  protected name: string = 'polygon';

  public updateFields(configuration: HTML5Area) {
    this.configuration = configuration;

    this.setFieldValue('.color', configuration.data.color);
    this.setFieldValue('.alt', configuration.alt);
    this.setFieldValue('.href', configuration.href);

    let parent = this.getElement('.positionOptions');
    configuration.coords.points.forEach((point: fabric.Point, index: number) => {
      if (!(point.element = parent.querySelector('#p' + point.id))) {
        this.canvasArea.points[index].id = point.id = fabric.Object.__uid++;
        point.element = this.getFormElement('#polyCoords', point.id, index);
        parent.append(point.element);
      }

      this.getElement('#x' + point.id).value = point.x.toString();
      this.getElement('#y' + point.id).value = point.y.toString();
    });
  }

  public updateCanvas(event: Event) {
    let  field = ((event.currentTarget || event.target) as HTMLInputElement),
      point = parseInt(field.dataset.index),
      fields = this.getElements('[data-point="' + field.dataset.index + '"]'),
      x = 0,
      y = 0;

    fields.forEach((field: HTMLInputElement) => {
      if (field.dataset.field == 'x') {
        x = parseInt(field.value);
      }
      if (field.dataset.field == 'y') {
        y = parseInt(field.value);
      }
    });

    this.configuration.coords.points[point] = {x: x, y: y};
    this.canvasArea.setPointProperties(point, this.configuration.coords.points[point]);
  }

  public getData(): HTML5Area {
    this.configuration.coords.points.forEach((point: FabricPoint) => {
      delete point.id;
      delete point.element;
      if (point.hasOwnProperty('control')) {
        delete point.control;
      }
    });
    return this.configuration;
  }

  public initialize() {
    super.initialize();
    this.canvasArea.addControls();
  }

  private addPointBeforeAction(event: Event) {
    this.addPointInDirection(event, AreaUtility.before);
  }

  private addPointAfterAction(event: Event) {
    this.addPointInDirection(event, AreaUtility.after);
  }

  private removePointAction(event: Event) {
    if (this.points.length > 3) {
      let element = (event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement,
        points = ([] as fabric.Point),
        controls = ([] as fabric.Object);

      this.points.forEach((point: fabric.Point, index: number) => {
        if (element.id !== point.id) {
          points.push(point);
          controls.push(this.controls[index]);
        } else {
          point.element.remove();
          this.canvas.remove(this.controls[index]);
        }
      });

      points.forEach((point: fabric.Point, index: number) => {
        let oldId = point.id;
        point.id = 'p' + this.id + '_' + index;
        this.getElement('#' + oldId).id = point.id;
        this.getElement('#x' + oldId).id = 'x' + point.id;
        this.getElement('#y' + oldId).id = 'y' + point.id;
        this.getElement('[for="x' + oldId + '"]').setAttribute('for', 'x' + point.id);
        this.getElement('[for="y' + oldId + '"]').setAttribute('for', 'y' + point.id);
        controls[index].name = index;
      });

      this.points = points;
      this.controls = controls;
      this.canvas.renderAll();
    }
  }

  private addPointInDirection(event: Event, direction: number) {
    let points = this.configuration.coords.points,
      index = AreaUtility.highestIndexOfArray(points) + 1,
      parentElement = this.getElement('.positionOptions'),
      [currentPoint, newPoint, currentPointIndex] = this.getCurrentAndNewPoint(event, direction, index);

    if (direction == AreaUtility.before || currentPoint.element.nextSibling) {
      parentElement.insertBefore(newPoint.element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(newPoint.element);
    }

    this.getElement('#x' + newPoint.id).value = newPoint.x.toString();
    this.getElement('#y' + newPoint.id).value = newPoint.y.toString();
    newPoint.element.querySelectorAll('.t3js-btn').forEach(this.buttonEventHandler.bind(this));

    this.configuration.coords.points = AreaUtility.addElementToArrayWithPosition(
      points,
      newPoint,
      currentPointIndex + direction
    );

    let canvasPoint = {
      x: newPoint.x - this.canvasArea.configuration.left,
      y: newPoint.y - this.canvasArea.configuration.top,
      id: newPoint.id,
    };
    this.canvasArea.points = AreaUtility.addElementToArrayWithPosition(
      this.canvasArea.points,
      canvasPoint,
      currentPointIndex + direction
    );
    this.canvasArea.addControl(this.canvasArea.configuration, canvasPoint, index, currentPointIndex + direction);
  }

  private getCurrentAndNewPoint(
    event: Event,
    direction: number,
    index: number
  ): [FabricPoint, FabricPoint, number] {
    let currentPointId = parseInt((event.currentTarget as HTMLElement).dataset.point),
      [currentPoint, nextPoint, currentPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction),
      id = fabric.Object.__uid++,
      newPoint = {
        x: Math.floor((currentPoint.x + nextPoint.x) / 2),
        y: Math.floor((currentPoint.y + nextPoint.y) / 2),
        id: id,
        element: this.getFormElement('#polyCoords', id, index)
      };

    return [currentPoint, newPoint, currentPointIndex];
  }

  private getCurrentAndNextPoint(currentPointId: number, direction: number): [FabricPoint, FabricPoint, number] {
    let points = this.configuration.coords.points,
      currentPointIndex = 0;

    points.forEach((point, index) => {
      if (point.id === currentPointId) {
        currentPointIndex = index;
      }
    });

    let nextPointIndex = currentPointIndex + direction;
    if (nextPointIndex < 0) {
      nextPointIndex = points.length - 1;
    }
    if (nextPointIndex >= points.length) {
      nextPointIndex = 0;
    }

    return [
      points[currentPointIndex],
      points[nextPointIndex],
      currentPointIndex
    ];
  }
}

class AreaForm {
  readonly _element: HTMLElement;

  readonly _areaZone: HTMLElement;

  readonly options: FormOptions;

  public areas: FormArea[] = [];

  /**
   * Element needed to add inputs that act as target for browselink finalizeFunction target
   */
  readonly fauxDocument: Document;

  public fauxForm: HTMLFormElement;

  constructor(options: FormOptions, editor: AreaManipulation) {
    this.options = options;
    this.fauxDocument = this.options.formDocument;
    this._element = editor.container.querySelector(options.formSelector);
    this._areaZone = this.element.querySelector('#areaZone');

    this.addFauxFormForLinkBrowser();
  }

  get element() {
    return this._element;
  }

  get areaZone() {
    return this._areaZone;
  }

  public addArea(area: HTML5Area, canvasArea: CanvasRectangle|CanvasCircle|CanvasPolygon): FormArea {
    let formArea;

    switch (area.shape) {
      case 'rect':
      case 'rectangle':
        formArea = new FormRectangle(this, canvasArea, area);
        break;

      case 'circ':
      case 'circle':
        formArea = new FormCircle(this, canvasArea, area);
        break;

      case 'poly':
      case 'polygon':
        formArea = new FormPolygon(this, canvasArea, area);
        break;

      case 'default':
    }

    formArea.initialize();
    this._areaZone.append(formArea.element);
    this.areas.push(formArea);
    return formArea;
  }

  public deleteArea(area: FormArea) {
    let areas = ([] as FormArea[]);
    this.areas.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areas = areas;

    area.canvasArea.areaCanvas.canvas.remove(area.canvasArea);
    area = null;
    this.updateArrowsState();
  }

  public moveArea(area: FormArea, offset: number) {
    let index = this.areas.indexOf(area),
      newIndex = index + offset,
      parent = area.element.parentNode;

    if (newIndex > -1 && newIndex < this.areas.length) {
      let removedArea = this.areas.splice(index, 1)[0];
      this.areas.splice(newIndex, 0, removedArea);

      parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
    }

    this.updateArrowsState();
  }

  public updateArrowsState() {
    this.areas.forEach((area: FormArea) => {
      area.updateArrowsState();
    });
  }

  /**
   * Create form element that is reachable for LinkBrowser.finalizeFunction
   */
  private addFauxFormForLinkBrowser() {
    if (top.document !== this.fauxDocument) {
      if (!(this.fauxForm = this.fauxDocument.querySelector(this.options.formSelector))) {
        this.fauxForm = this.fauxDocument.createElement('form');
        this.fauxForm.setAttribute('name', 'areasForm');
        this.fauxForm.setAttribute('id', 'fauxForm');
        this.fauxDocument.body.appendChild(this.fauxForm);
      }

      // empty previously created fauxForm
      while (this.fauxForm.firstChild) {
        this.fauxForm.removeChild(this.fauxForm.firstChild);
      }
    }
  }

  public openLinkBrowser(link: HTMLElement, area: FormArea) {
    link.blur();

    let data = {
      ...this.options.browseLink,
      objectId: area.id,
      formName: 'areasForm',
      itemFormElName: 'link' + area.id
    };

    $.ajax({
      url: this.options.browseLinkUrlAjaxUrl,
      context: area,
      data: data
    }).done((response: {url: string}) => {
      const url = response.url
        + '&P[currentValue]=' + encodeURIComponent(area.getFieldValue('.href'))
        + '&P[currentSelectedValues]=' + encodeURIComponent(area.getFieldValue('.href'));
      window.FormArea = area;

      Modal.advanced({
        type: Modal.types.iframe,
        content: url,
        size: Modal.sizes.large,
      });
    });
  }

  public destroy() {
    this.areas.forEach((area: FormArea) => {
      area.destroy();
    })
  }
}

interface CanvasRectangle {
  canvas: fabric.Canvas;
  left: number;
  top: number;
  width: number;
  height: number;

  on(name: string, callback: Function): void;
  set(value: {}): void;
  getScaledHeight(): number;
  getScaledWidth(): number;
}
class CanvasRectangle extends fabric.Rect {
  public id: number = 0;

  public areaCanvas: AreaCanvas;

  public formArea: FormArea;

  constructor(options: CanvasAreaConfiguration) {
    super(options);
    this.id = fabric.Object.__uid++;

    this.on('modified', this.rectangleMoved.bind(this));
    this.on('moved', this.rectangleMoved.bind(this));
  }

  public setProperty(property: string, value: any) {
    let set = ({} as { [property: string]: any });
    set[property] = value;
    this.set(set);
    this.canvas.renderAll();
  }

  public setProperties(properties: object) {
    this.set(properties);
    this.canvas.renderAll();
  }

  private rectangleMoved() {
    let configuration = JSON.parse(JSON.stringify(this.formArea.configuration));
    configuration.coords = {
      left: Math.round(this.left),
      top: Math.round(this.top),
      right: Math.round(this.getScaledWidth() + this.left),
      bottom: Math.round(this.getScaledHeight() + this.top),
    };
    this.formArea.updateFields(configuration);
  }
}

interface CanvasCircle {
  canvas: fabric.Canvas;
  left: number;
  top: number;

  on(name: string, callback: Function): void;
  set(value: {}): void;
  getRadiusX(): number;
}
class CanvasCircle extends fabric.Circle {
  public id: number = 0;

  public areaCanvas: AreaCanvas;

  public formArea: FormArea;

  constructor(options: CanvasAreaConfiguration) {
    super(options);
    this.id = fabric.Object.__uid++;

    this.on('modified', this.circleMoved.bind(this));
    this.on('moved', this.circleMoved.bind(this));
  }

  public setProperty(property: string, value: any) {
    let set = ({} as { [property: string]: any });
    set[property] = value;
    this.set(set);
    this.canvas.renderAll();
  }

  public setProperties(properties: object) {
    this.set(properties);
    this.canvas.renderAll();
  }

  private circleMoved() {
    let configuration = JSON.parse(JSON.stringify(this.formArea.configuration));
    configuration.coords = {
      left: Math.round(this.left),
      top: Math.round(this.top),
      radius: Math.round(this.getRadiusX()),
    };
    this.formArea.updateFields(configuration);
  }
}

interface CanvasPolygon {
  points: object[];
  canvas: fabric.Canvas;

  on(name: string, callback: Function): void;
  set(value: {}): void;
}
class CanvasPolygon extends fabric.Polygon  {
  readonly configuration: {
    left?: 0,
    top?: 0,
    cornerColor?: '',
    cornerStrokeColor?: '',
    interactive?: false
  };

  public id: number = 0;

  public areaCanvas: AreaCanvas;

  public formArea: FormArea;

  private controls: fabric.Circle[] = [];

  constructor(points: any[], configuration: object) {
    super(points, configuration);
    this.configuration = configuration;
    this.id = fabric.Object.__uid++;

    this.on('modified', this.polygonMoved.bind(this));
    this.on('moved', this.polygonMoved.bind(this));
  }

  public setProperty(property: string, value: any) {
    let set = ({} as { [property: string]: any });
    set[property] = value;
    this.set(set);
    this.canvas.renderAll();
  }

  public setProperties(properties: object) {
    this.set(properties);
    this.canvas.renderAll();
  }

  public setPointProperties(pointIndex: number, properties: {x: number, y: number}) {
    this.points[pointIndex] = {
      x: properties.x - this.configuration.left,
      y: properties.y - this.configuration.top,
    };
    this.controls[pointIndex].set({
      left: properties.x - this.configuration.left,
      top: properties.y - this.configuration.top,
    });
    this.controls[pointIndex].setCoords();
    this.canvas.renderAll();
  }

  public addControls() {
    if (!this.configuration.interactive) {
      return;
    }
    this.points.forEach((point: fabric.Object, index: number) => {
      this.addControl(this.configuration, point, index, 100000);
    });
  }

  private addControl(
    areaConfig: {cornerColor?: '', cornerStrokeColor?: ''},
    point: fabric.Object,
    index: number,
    newControlIndex: number
  ) {
    let circle = new fabric.Circle({
      ...areaConfig,
      hasControls: false,
      radius: 5,
      fill: areaConfig.cornerColor,
      stroke: areaConfig.cornerStrokeColor,
      originX: 'center',
      originY: 'center',
      name: index,
      polygon: this,
      point: point,
      type: 'control',
      opacity: this.controls.length === 0 ? 0 : this.controls[0].opacity,

      // set control position relative to polygon
      left: this.configuration.left + point.x,
      top: this.configuration.top + point.y,
    });
    circle.on('moved', this.pointMoved.bind(this));

    point.control = circle;

    this.controls = AreaUtility.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
    this.areaCanvas.canvas.add(circle);
    this.areaCanvas.canvas.renderAll();
  }

  public removePoint(event: Event) {
    if (this.points.length > 3) {
      let element = (event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement,
        points = ([] as fabric.Point),
        controls = ([] as fabric.Object);

      this.points.forEach((point: fabric.Point, index: number) => {
        if (element.id !== point.id) {
          points.push(point);
          controls.push(this.controls[index]);
        } else {
          point.element.remove();
          this.areaCanvas.canvas.remove(this.controls[index]);
        }
      });

      points.forEach((point: fabric.Point, index: number) => {
        point.id = 'p' + this.id + '_' + index;
        controls[index].name = index;
      });

      this.points = points;
      this.controls = controls;
      this.areaCanvas.canvas.renderAll();
    }
  }

  private pointMoved(event: Event) {
    let configuration = JSON.parse(JSON.stringify(this.formArea.configuration)),
      control: fabric.Object = event.target,
      id = control.point.id,
      center = control.getCenterPoint();

    configuration.coords.points.forEach((point: fabric.Point) => {
      if (point.id == id) {
        point.x = Math.round(center.x);
        point.y = Math.round(center.y);
      }
    });
    this.formArea.updateFields(configuration);
  }

  private polygonMoved() {
    let configuration = JSON.parse(JSON.stringify(this.formArea.configuration));
    this.controls.forEach((control, index) => {
      configuration.coords.points[index] = {
        x: Math.round(control.left),
        y: Math.round(control.top),
        id: control.point.id,
      };
    });
    this.formArea.updateFields(configuration);
  }
}

class AreaCanvas {
  readonly areaConfig = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    strokeWidth: 1,
    transparentCorners: false
  };

  readonly options: CanvasOptions;

  readonly _canvas: fabric.Canvas;

  private areas: Array<CanvasRectangle|CanvasCircle|CanvasPolygon> = [];

  private activePolygon:fabric.Object = null;

  constructor(element: HTMLCanvasElement, options: CanvasOptions) {
    this.options = options;

    this._canvas = new fabric.Canvas(element, options);
    fabric.util.setStyle(this._canvas.wrapperEl, {
      position: 'absolute',
    });

    this._canvas.on('object:moving', this.canvasObjectMoving.bind(this));
    this._canvas.on('selection:created', this.canvasSelectionCreated.bind(this));
    this._canvas.on('selection:updated', this.canvasSelectionUpdated.bind(this));
  }

  get canvas(): fabric.Canvas {
    return this._canvas;
  }

  private canvasObjectMoving(event: FabricEvent) {
    let element = (event.target as fabric.Object);
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
  }

  private canvasSelectionCreated(event: FabricEvent) {
    if ((event.target as fabric.Polygon).type === 'polygon') {
      this.activePolygon = event.target;
      // show controls of active polygon
      this.activePolygon.controls.forEach((control: fabric.Object) => {
        control.opacity = 1;
      });
      this._canvas.renderAll();
    }
  }

  private canvasSelectionUpdated(event: FabricEvent) {
    event.deselected.forEach((element: fabric.Object) => {
      if (element.type === 'polygon' && event.selected[0].type !== 'control') {
        // hide controls of active polygon
        element.controls.forEach((control: fabric.Object) => {
          control.opacity = 0;
        });
        this.activePolygon = null;
        this._canvas.renderAll();
      } else if (element.type === 'control') {
        this.activePolygon = element.polygon;
        // hide controls of active polygon
        this.activePolygon.controls.forEach((control: fabric.Object) => {
          control.opacity = 0;
        });
        this.activePolygon = null;
        this._canvas.renderAll();
      }
    });

    event.selected.forEach((element: fabric.Object) => {
      if (element.type === 'polygon') {
        this.activePolygon = element;
        // hide controls of active polygon
        element.controls.forEach((control: fabric.Object) => {
          control.opacity = 1;
        });
        this._canvas.renderAll();
      }
    });
  }

  public addArea(area: HTML5Area): CanvasRectangle|CanvasCircle|CanvasPolygon {
    let canvasArea,
      configuration = {
        coords: area.coords,
        selectable: this.options.interactive,
        hasControls: this.options.interactive,
        stroke: area.data.color,
        fill: AreaUtility.hexToRgbA(area.data.color, 0.3)
      };

    switch (area.shape) {
      case 'rect':
      case 'rectangle':
        canvasArea = this.createRectangle(configuration);
        break;

      case 'circ':
      case 'circle':
        canvasArea = this.createCircle(configuration);
        break;

      case 'poly':
      case 'polygon':
        canvasArea = this.createPolygon(configuration);
        break;

      case 'default':
    }

    canvasArea.areaCanvas = this;
    this._canvas.add(canvasArea);
    this.areas.push(canvasArea);

    return canvasArea;
  }

  private createRectangle(configuration: CanvasAreaConfiguration): CanvasRectangle {
    let coords = configuration.coords,
      options = {
        ...this.areaConfig,
        ...configuration,
        top: coords.top,
        left: coords.left,
        width: coords.right - coords.left,
        height: coords.bottom - coords.top,
      };

    return new CanvasRectangle(options);
  }

  private createCircle(configuration: CanvasAreaConfiguration): CanvasCircle {
    let coords = configuration.coords,
      options = {
        ...this.areaConfig,
        ...configuration,
        top: coords.top - coords.radius,
        left: coords.left - coords.radius,
        radius: coords.radius,
      },
      canvasArea = new CanvasCircle(options);

    // disable control points as these would stretch the circle
    // to an ellipse which is not possible in html areas
    // @ts-ignore
    canvasArea.setControlVisible('ml', false);
    // @ts-ignore
    canvasArea.setControlVisible('mt', false);
    // @ts-ignore
    canvasArea.setControlVisible('mr', false);
    // @ts-ignore
    canvasArea.setControlVisible('mb', false);

    return canvasArea;
  }

  private createPolygon(configuration: CanvasAreaConfiguration): CanvasPolygon {
    let left = 100000,
      top = 100000,
      options = {
        ...this.areaConfig,
        ...configuration,
        left: 0,
        top: 0,
        selectable: true,
        hasControls: false,
        objectCaching: false,
        controlConfig: this.areaConfig,
        interactive: this.options.interactive,
      };

    // get top and left corner of polygon
    options.coords.points.forEach((point) => {
      left = Math.min(left, point.x);
      top = Math.min(top, point.y);
    });

    // reduce point x/y values by top/left values
    options.coords.points.forEach((point) => {
      point.x = point.x - left;
      point.y = point.y - top;
    });

    options.left = left;
    options.top = top;

    return new CanvasPolygon(options.coords.points, options);
  }

  public deleteArea(area: CanvasRectangle|CanvasCircle|CanvasPolygon) {
    let areas = ([] as Array<CanvasRectangle|CanvasCircle|CanvasPolygon>);
    this.areas.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areas = areas;
    this._canvas.remove(area);
    area = null;
  }

  public destroy() {
    this.areas.forEach((area: CanvasRectangle|CanvasPolygon|CanvasCircle) => {
      this.deleteArea(area);
    })
  }
}

export class AreaManipulation {
  readonly interactive: boolean = false;

  public container: HTMLElement;

  private options: EditorOptions;

  private canvas: AreaCanvas;

  private form: AreaForm;

  constructor(container: HTMLElement, options: EditorOptions) {
    this.options = options;
    this.container = container;
    this.interactive = !!(options.formSelector || '');

    this.initializeCanvas();
    this.initializeForm();
  }

  private initializeCanvas() {
    let canvas: HTMLCanvasElement = this.container.querySelector(this.options.canvasSelector);
    this.canvas = new AreaCanvas(
      canvas,
      {
        width: this.options.canvas.width,
        height: this.options.canvas.height,
        interactive: this.interactive,
        selection: false,
        preserveObjectStacking: true,
        hoverCursor: this.interactive ? 'move' : 'default',
      }
    );
  }

  private initializeForm() {
    if (this.interactive) {
      this.form = new AreaForm({
        formSelector: this.options.formSelector,
        formDocument: this.options.editControlDocument,
        browseLink: this.options.browseLink,
        browseLinkUrlAjaxUrl: this.options.browseLinkUrlAjaxUrl,
      }, this);
    }
  }

  public initializeAreas(areas: HTML5Area[]) {
    areas = areas || [];
    areas.forEach((area: HTML5Area) => {
      area.data.color = AreaUtility.getRandomColor(area.data.color);

      let formArea = JSON.parse(JSON.stringify(area)),
        canvasArea = this.canvas.addArea(area);
      if (this.form) {
        this.form.addArea(formArea, canvasArea);
      }
    });

    if (this.form) {
      this.form.updateArrowsState();
    }
  }

  public removeAllAreas() {
    this.form.areas.forEach((area) => {
      this.canvas.deleteArea(area.canvasArea);
      this.form.deleteArea(area);
    });
  }

  public getAreasData(): HTML5Area[] {
    let data = ([] as HTML5Area[]);
    this.form.areas.forEach((area: FormArea) => {
      data.push(area.getData());
    });
    return data;
  }

  public destroy() {
    this.canvas.destroy();
    this.canvas = null;
    if (this.form) {
      this.form.destroy();
      this.form = null;
    }
  }
}
