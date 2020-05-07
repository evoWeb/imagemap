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

/// <reference types="../types/index"/>

import * as $ from 'jquery';
// @ts-ignore
import * as fabric from './vendor/Fabric';
// @ts-ignore
import * as Modal from 'TYPO3/CMS/Backend/Modal';
// @ts-ignore
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';

// needed to access top frame elements
let d = top.document || document,
  w = top.window || window;
if (typeof d !== 'undefined' && typeof w !== 'undefined') {
  fabric.document = d;
  fabric.window = w;
}

let Aggregation = (baseClass: any, ...mixins: Array<any>) => {
  class base extends baseClass {
    constructor (...args: Array<any>) {
      super(...args);
      mixins.forEach((mixin) => {
        copyProperties(this, (new mixin));
      });
    }
  }

  // this function copies all properties and symbols, filtering out some special ones
  let copyProperties = (target: any, source: any) => {
    /** @type {Array} */
    let propertySymbols = (Object.getOwnPropertySymbols(source) as unknown as Array<string>);
    Object.getOwnPropertyNames(source)
      .concat(propertySymbols)
      .forEach((property) => {
        if (!property.match(
          /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
        )) {
          Object.defineProperty(target, property, Object.getOwnPropertyDescriptor(source, property));
        }
      })
  };

  // outside constructor() to allow Aggregation(a, b, c).staticFunction() to be called etc.
  mixins.forEach((mixin) => {
    copyProperties(base.prototype, mixin.prototype);
    copyProperties(base, mixin);
  });

  return base;
};

class AreaFormElement extends fabric.Object {
  static before: number = -1;

  static after: number = 1;

  protected name: string = '';

  public element: HTMLElement;

  private eventDelay: number = 0;

  public form: AreaForm;

  public editor: AreaEditor;

  protected attributes: {[k: string]: any} = {};

  [property: string]: any;

  public postAddToForm() {
    this.id = fabric.Object.__uid++;

    this.initializeElement();
    this.updateFields();
    this.initializeColorPicker();
    this.initializeEvents();
    this.addFauxInput();
  }

  private initializeElement() {
    this.element = this.getFormElement('#' + this.name + 'Form', this.id);
    this.form.areaZone.append(this.element);
    this.form.updateArrowsState();
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

  private initializeEvents() {
    this.on('moved', this.updateFields.bind(this));
    this.on('modified', this.updateFields.bind(this));

    this.getElements('.basicOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('keyup', this.updateProperties.bind(this));
    });
    this.getElements('.positionOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('input', this.fieldInputHandler.bind(this));
    });
    this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
  }

  private fieldInputHandler(event: Event) {
    clearTimeout(this.eventDelay);
    this.eventDelay = AreaFormElement.wait(() => { this.updateCanvas(event); }, 500);
  }

  private buttonEventHandler(button: HTMLElement) {
    let action = button.dataset.action + 'Action';
    button.removeEventListener('click', this[action]);
    button.addEventListener('click', this[action].bind(this));
  }

  public updateArrowsState() {
    let areaZone = this.form.areaZone;
    this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
    this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
  }

  public updateFields() {
  }

  private updateProperties(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      property = field.id;
    if (field.classList.contains('href')) {
      this.href = field.value;
    } else if (this.hasOwnProperty(property)) {
      this[property] = field.value;
    } else if (this.attributes.hasOwnProperty(property)) {
      this.attributes[property] = field.value;
    }
  }

  public updateCanvas(event: Event) {
  }

  private linkAction(event: Event) {
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  private upAction() {
    this.form.moveArea(this, AreaFormElement.before);
  }

  private downAction() {
    this.form.moveArea(this, AreaFormElement.after);
  }

  private deleteAction() {
    if (this.element) {
      this.element.remove();
    }
    if (this.form) {
      this.form.updateArrowsState();
    }
    this.removeFauxInput();
    this.editor.deleteArea(this);
  }

  private expandAction() {
    this.showElement('.moreOptions');
    this.showElement('[data-action="collapse"]');
    this.hideElement('[data-action="expand"]');
  }

  private collapseAction() {
    this.hideElement('.moreOptions');
    this.hideElement('[data-action="collapse"]');
    this.showElement('[data-action="expand"]');
  }

  private undoAction() {
  }

  private redoAction() {
  }

  private colorPickerAction(value: string) {
    (this.getElement('.t3js-color-picker') as HTMLInputElement).value = value;
    this.set('borderColor', value);
    this.set('stroke', value);
    this.set('fill', AreaEditor.hexToRgbA(value, 0.2));
    this.editor.canvas.renderAll();
  }

  protected getFormElement(selector: string, id: number): HTMLElement {
    let template = this.form.element.querySelector(selector)
      .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
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

  public getData(): object {
    let attributes = this.getAdditionalAttributes();
    return {
      ...attributes,
      shape: this.name,
      coords: this.getAreaCoords(),
      href: this.getLink()
    };
  }

  // @todo deprecated
  protected getAreaCoords(): string {
    return '';
  }

  // @todo deprecated
  private getAdditionalAttributes() {
    let result = ({} as any);

    this.getElements('.t3js-field').forEach((field: HTMLInputElement) => {
      if (!field.classList.contains('ignored-attribute')) {
        result[field.id] = field.value;
      }
    });

    return result;
  }

  // @todo deprecated
  public getLink() {
    return this.getElement('.href').value;
  }

  /**
   * Add faux input as target for browselink which listens for changes and writes value to real field
   */
  private addFauxInput() {
    if (this.form.fauxForm) {
      let fauxInput = this.editor.fauxFormDocument.createElement('input');
      fauxInput.setAttribute('id', 'href' + this.id);
      fauxInput.setAttribute('data-formengine-input-name', 'href' + this.id);
      fauxInput.setAttribute('value', this.href);
      fauxInput.onchange = this.changedFauxInput.bind(this);
      this.form.fauxForm.appendChild(fauxInput);
    }
  }

  private removeFauxInput() {
    if (this.form && this.form.fauxForm !== null) {
      let field = this.form.fauxForm.querySelector('#href' + this.id);
      if (field) {
        field.remove();
      }
    }
  }

  private changedFauxInput() {
    let field = (this.form.fauxForm.querySelector('#href' + this.id) as HTMLInputElement);
    this.href = field.value;
    this.updateFields();
  }

  static wait(callback: Function, delay: number) {
    return window.setTimeout(callback, delay);
  }
}

class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
  protected name: string = 'rectangle';

  public updateFields() {
    this.getElement('.color').value = this.data.color;
    this.getElement('.alt').value = this.alt || '';
    this.getElement('.href').value = this.href || '';
    this.getElement('#left').value = Math.floor(this.left + 0);
    this.getElement('#top').value = Math.floor(this.top + 0);
    this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
    this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });
  }

  protected updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.id) {
      case 'left':
        this.getElement('#right').value = value + this.getScaledWidth();
        this.set({left: value});
        break;

      case 'top':
        this.getElement('#bottom').value = value + this.getScaledHeight();
        this.set({top: value});
        break;

      case 'right':
        value -= this.left;
        if (value < 0) {
          value = 10;
          field.value = this.left + value;
        }
        this.set({width: value});
        break;

      case 'bottom':
        value -= this.top;
        if (value < 0) {
          value = 10;
          field.value = this.top + value;
        }
        this.set({height: value});
        break;
    }
    this.canvas.renderAll();
  }

  protected getAreaCoords(): object {
    return {
      left: Math.floor(this.left + 0),
      top: Math.floor(this.top + 0),
      right: Math.floor(this.left + this.getScaledWidth() - 1),
      bottom: Math.floor(this.top + this.getScaledHeight() - 1)
    };
  }
}

class Circle extends Aggregation(fabric.Circle, AreaFormElement) {
  protected name: string = 'circle';

  public updateFields() {
    this.getElement('.color').value = this.data.color;
    this.getElement('.alt').value = this.alt || '';
    this.getElement('.href').value = this.href || '';
    this.getElement('#left').value = Math.floor(this.left + 0);
    this.getElement('#top').value = Math.floor(this.top + 0);
    this.getElement('#radius').value = Math.floor(this.getRadiusX());

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });
  }

  protected updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = 0;

    switch (field.id) {
      case 'left':
        value = parseInt(field.value);
        this.set({left: value});
        break;

      case 'top':
        value = parseInt(field.value);
        this.set({top: value});
        break;

      case 'radius':
        value = parseInt(field.value);
        this.set({radius: value});
        break;
    }
    this.canvas.renderAll();
  }

  protected getAreaCoords(): object {
    return {
      left: Math.floor(this.left + this.getRadiusX()),
      top: Math.floor(this.top + this.getRadiusX()),
      radius: Math.floor(this.getRadiusX())
    };
  }
}

class Poly extends Aggregation(fabric.Polygon, AreaFormElement) {
  protected name: string = 'polygon';

  public controls: Array<any> = [];

  constructor(points: Array<any>, options: AreaConfiguration) {
    super(points, options);
    this.on('moved', this.polygonMoved.bind(this));
  }

  public updateFields() {
    this.getElement('.color').value = this.data.color;
    this.getElement('.alt').value = this.alt || '';
    this.getElement('.href').value = this.href || '';

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });

    let parentElement = this.getElement('.positionOptions');
    this.points.forEach((point: fabric.Point, index: number) => {
      point.id = point.id ? point.id : 'p' + this.id + '_' + index;

      if (!point.hasOwnProperty('element')) {
        point.element = this.getFormElement('#polyCoords', point.id);
        parentElement.append(point.element);
      }

      point.element.querySelector('#x' + point.id).value = point.x + this.left;
      point.element.querySelector('#y' + point.id).value = point.y + this.top;
    });
  }

  protected updateCanvas(event: Event) {
    let field = (event.currentTarget || event.target) as HTMLInputElement,
      [, point] = field.id.split('_'),
      control = this.controls[parseInt(point)],
      x = control.getCenterPoint().x,
      y = control.getCenterPoint().y;

    if (field.id.indexOf('x') > -1) {
      x = parseInt(field.value);
    }
    if (field.id.indexOf('y') > -1) {
      y = parseInt(field.value);
    }

    control.set('left', x);
    control.set('top', y);
    control.setCoords();
    this.points[control.name] = {x: x, y: y};
    this.canvas.renderAll();
  }

  protected getAreaCoords(): object[] {
    let result: object[] = [];

    this.controls.forEach((control) => {
      let center = control.getCenterPoint();
      result.push({x: center.x, y: center.y});
    });

    return result;
  }

  public addControls() {
    this.points.forEach((point: fabric.Object, index: number) => {
      this.addControl(this.controlConfig, point, index, 100000);
    });
  }

  private addControl(areaConfig: AreaConfiguration, point: fabric.Object, index: number, newControlIndex: number) {
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
      left: this.left + point.x,
      top: this.top + point.y,
    });
    circle.on('moved', this.pointMoved.bind(this));

    point.control = circle;

    this.controls = Poly.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
    this.canvas.add(circle);
    this.canvas.renderAll();
  }

  private pointMoved(event: FabricEvent) {
    let control = (event.target as fabric.Object),
      id = 'p' + control.polygon.id + '_' + control.name,
      center = control.getCenterPoint();

    this.getElement('#x' + id).value = center.x;
    this.getElement('#y' + id).value = center.y;
  }

  private polygonMoved() {
    this.points.forEach((point: fabric.Object) => {
      this.getElement('#x' + point.id).value = this.left + point.x;
      this.getElement('#y' + point.id).value = this.top + point.y;
    });
  }

  protected addPointBeforeAction(event: Event) {
    let direction = AreaFormElement.before,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    parentElement.insertBefore(element, currentPoint.element);

    this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
  }

  protected addPointAfterAction(event: Event) {
    let direction = AreaFormElement.after,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
  }

  private getPointElementAndCurrentPoint(event: Event, direction: number) {
    let currentPointId = ((event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement).id,
      [currentPoint, nextPoint, currentPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction),
      index = this.points.length,
      id = 'p' + this.id + '_' + index,
      element = this.getFormElement('#polyCoords', id),
      point = {
        x: Math.floor((currentPoint.x + nextPoint.x) / 2),
        y: Math.floor((currentPoint.y + nextPoint.y) / 2),
        id: id,
        element: element
      };

    element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));

    element.querySelector('#x' + point.id).value = point.x;
    element.querySelector('#y' + point.id).value = point.y;

    return [point, element, currentPointIndex, currentPoint];
  }

  private getCurrentAndNextPoint(currentPointId: string, direction: number) {
    let currentPointIndex = 0;

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].id === currentPointId) {
        break;
      }
      currentPointIndex++;
    }

    let nextPointIndex = currentPointIndex + direction;

    if (nextPointIndex < 0) {
      nextPointIndex = this.points.length - 1;
    }
    if (nextPointIndex >= this.points.length) {
      nextPointIndex = 0;
    }

    return [this.points[currentPointIndex], this.points[nextPointIndex], currentPointIndex, nextPointIndex];
  }

  protected removePointAction(event: Event) {
    if (this.points.length > 3) {
      let element = (event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement,
        points: fabric.Point = [],
        controls: fabric.Object = [];

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
}

class AreaForm {
  public areaZone: HTMLElement;

  public element: HTMLElement;

  private editor: AreaEditor;

  /**
   * Element needed to add inputs that act as target for browselink finalizeFunction target
   */
  public fauxForm: HTMLFormElement;

  constructor(formSelector: string, editor: AreaEditor) {
    this.element = editor.document.querySelector(formSelector);
    this.areaZone = this.element.querySelector('#areaZone');
    this.editor = editor;

    this.addFauxFormForLinkBrowser();
  }

  public destroy() {
    this.removeFauxForm();
  }

  public updateArrowsState() {
    this.editor.areas.forEach((area) => {
      area.updateArrowsState();
    });
  }

  public addArea(area: Rect|Circle|Poly) {
    area.form = this;
    area.postAddToForm();
  }

  public moveArea(area: AreaFormElement|Rect|Circle|Poly, offset: number) {
    let index = this.editor.areas.indexOf(area),
      newIndex = index + offset,
      parent = area.element.parentNode;

    if (newIndex > -1 && newIndex < this.editor.areas.length) {
      let removedArea = this.editor.areas.splice(index, 1)[0];
      this.editor.areas.splice(newIndex, 0, removedArea);

      parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
    }

    this.updateArrowsState();
  }

  public openLinkBrowser(link: HTMLElement, area: AreaFormElement|Rect|Circle|Poly) {
    link.blur();

    let data = {
      ...this.editor.browseLink,
      objectId: area.id,
      formName: 'areasForm',
      itemFormElName: 'href' + area.id,
      currentValue: area.getLink()
    };

    $.ajax({
      url: this.editor.browseLinkUrlAjaxUrl,
      context: area,
      data: data
    }).done((response: {url: string}) => {
      const url = response.url
        + '&P[currentValue]=' + encodeURIComponent(area.getFieldValue('.href'))
        + '&P[currentSelectedValues]=' + encodeURIComponent(area.getFieldValue('.href'));

      if (this.editor.typo3Branch < 10) {
        // @todo remove once TYPO3 9.x support gets removed
        let vHWin = window.open(
          url,
          '',
          'height=600,width=500,status=0,menubar=0,scrollbars=1'
        );
        vHWin.focus()
      } else {
        Modal.advanced({
          type: Modal.types.iframe,
          content: url,
          size: Modal.sizes.large,
        });
      }
    });
  }

  /**
   * Create form element that is reachable for LinkBrowser.finalizeFunction
   */
  private addFauxFormForLinkBrowser() {
    if (top.document !== this.editor.fauxFormDocument) {
      if (!(this.fauxForm = this.editor.fauxFormDocument.querySelector(this.editor.formSelector))) {
        this.fauxForm = this.editor.fauxFormDocument.createElement('form');
        this.fauxForm.setAttribute('name', 'areasForm');
        this.fauxForm.setAttribute('id', 'fauxForm');
        this.editor.fauxFormDocument.body.appendChild(this.fauxForm);
      }

      // empty previously created fauxForm
      while (this.fauxForm.firstChild) {
        this.fauxForm.removeChild(this.fauxForm.firstChild);
      }
    }
  }

  private removeFauxForm() {
    if (this.fauxForm) {
      this.fauxForm.remove();
    }
  }
}

class AreaEditor {
  public areaConfig = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    transparentCorners: false
  };

  public document: Document;

  public fauxFormDocument: Document;

  public formSelector: string = '';

  public typo3Branch: number = 0;

  public browseLinkUrlAjaxUrl: string = '';

  public browseLink: BrowseLinkConfiguration;

  readonly preview: boolean = true;

  public areas: Array<AreaFormElement|Rect|Circle|Poly> = [];

  public canvas: fabric.Canvas;

  public form: AreaForm;

  [property: string]: any;

  constructor(options: EditorOptions, canvas: HTMLElement, formSelector: string, document: Document) {
    this.setOptions(options);

    this.document = document;
    this.preview = formSelector === '';

    this.initializeCanvas(canvas, options);

    if (!this.preview) {
      this.form = new AreaForm(formSelector, this);
    }
  }

  private setOptions(options: object) {
    Object.entries(options).forEach((option) => {
      this[option[0]] = option[1];
    });
  }

  private initializeCanvas(canvas: HTMLElement, options: EditorOptions) {
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

  public initializeAreas(areas: Array<AreaConfiguration>) {
    if (areas !== undefined) {
      areas.forEach((area) => {
        area.data.color = AreaEditor.getRandomColor(area.data.color);
        let areaElement,
          configuration = {
            ...area,
            ...this.areaConfig,
            selectable: !this.preview,
            hasControls: !this.preview,
            stroke: area.data.color,
            strokeWidth: 1,
            fill: AreaEditor.hexToRgbA(area.data.color, 0.3)
          };

        switch (configuration.shape) {
          case 'rect':
          case 'rectangle':
            areaElement = this.createRectangle(configuration);
            break;

          case 'circ':
          case 'circle':
            areaElement = this.createCircle(configuration);
            break;

          case 'poly':
          case 'polygon':
            areaElement = this.createPolygon(configuration);
            break;
        }

        areaElement.editor = this;
        this.areas.push(areaElement);
        if (this.form) {
          this.form.addArea(areaElement);
        }
      });
    }
  }

  public removeAllAreas() {
    this.areas.forEach((area) => { area.deleteAction(); });
  }

  private createRectangle(configuration: AreaConfiguration) {
    let coords = configuration.coords,
      area = new Rect({
        ...configuration,
        left: coords.left,
        top: coords.top,
        width: coords.right - coords.left,
        height: coords.bottom - coords.top,
      });

    this.canvas.add(area);
    return area;
  }

  private createCircle(configuration: AreaConfiguration) {
    let coords = configuration.coords,
      area = new Circle({
        ...configuration,
        left: coords.left - coords.radius,
        top: coords.top - coords.radius,
        radius: coords.radius,
      });

    // disable control points as these would stretch the circle
    // to an ellipse which is not possible in html areas
    area.setControlVisible('ml', false);
    area.setControlVisible('mt', false);
    area.setControlVisible('mr', false);
    area.setControlVisible('mb', false);

    this.canvas.add(area);
    return area;
  }

  private createPolygon(configuration: AreaConfiguration) {
    let points = configuration.coords.points || [],
      area = new Poly(points, {
        ...configuration,
        selectable: true,
        hasControls: false,
        objectCaching: false,
        controlConfig: this.areaConfig,
      });

    this.canvas.add(area);
    if (this.form) {
      area.addControls();
    }
    return area;
  }

  public deleteArea(area: AreaFormElement|Rect|Circle|Poly) {
    let areas: Array<AreaFormElement|Rect|Circle|Poly> = [];
    this.areas.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areas = areas;
    this.canvas.remove(area);
  }

  public getMapData() {
    let areas: object[] = [];

    this.areas.forEach((area) => {
      areas.push(area.getData());
    });

    return JSON.stringify(areas);
  }

  static getRandomColor(color: string) {
    if (color === undefined) {
      let r = (Math.floor(Math.random() * 5) * 3).toString(16),
        g = (Math.floor(Math.random() * 5) * 3).toString(16),
        b = (Math.floor(Math.random() * 5) * 3).toString(16);
      color = '#' + r + r + g + g + b + b;
    }
    return color;
  }

  static hexToRgbA(hex: string, alpha: number) {
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
}

export = AreaEditor;
