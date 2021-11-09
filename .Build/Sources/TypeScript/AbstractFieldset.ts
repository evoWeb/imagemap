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
import { Object } from './vendor/Fabric.min';
import { AreaForm } from './AreaForm';
import { ShapeFactory } from './ShapeFactory';

export abstract class AbstractFieldset {
  static before: number = -1;

  static after: number = 1;

  readonly name: string = '';

  readonly id: number = 0;

  public element: HTMLElement;

  private moveShapeDelay: number = 0;

  protected form: AreaForm;

  public shape: Object;

  public area: {[k: string]: any} = {};

  private configuration: EditorConfiguration;

  [property: string]: any;

  constructor(area: Area, configuration: EditorConfiguration, shape: Object) {
    this.area = area;
    this.configuration = configuration;
    this.shape = shape;
    this.shape.fieldset = this;

    this.id = this.shape.id;
  }

  public addForm(form: AreaForm): void {
    this.form = form;
    this.initializeElement();
    this.updateFields();
    this.initializeColorPicker();
    this.initializeEvents();
    this.addBrowselinkTargetInput();
  }

  private initializeElement(): void {
    this.element = this.getFieldsetElement(`#${this.name}Form`, this.id);
    this.form.element.append(this.element);
  }

  private initializeColorPicker(): void {
    (top.window.$(this.getElement('.t3js-color-picker')) as any).minicolors({
      format: 'hex',
      position: 'bottom left',
      theme: 'bootstrap',
      change: this.colorPickerAction.bind(this),
    });
  }

  private initializeEvents(): void {
    this.initializeInformationFieldEvents(this.getElements('.basicOptions .t3js-field'));
    this.initializeCoordinateFieldEvents(this.getElements('.positionOptions .t3js-field'));
    this.initializeButtonEvents(this.getElements('.t3js-btn'));
  }

  private initializeInformationFieldEvents(fields: NodeListOf<Element>): void {
    fields.forEach((field: HTMLInputElement) => {
      field.removeEventListener('keyup', this.basicOptionsHandler);
      field.addEventListener('keyup', this.basicOptionsHandler.bind(this));
    });
  }

  protected initializeCoordinateFieldEvents(fields: NodeListOf<Element>): void {
    fields.forEach((field: HTMLInputElement) => {
      field.removeEventListener('input', this.positionOptionsHandler);
      field.addEventListener('input', this.positionOptionsHandler.bind(this));
    });
  }

  protected initializeButtonEvents(buttons: NodeListOf<Element>): void {
    buttons.forEach((button: HTMLButtonElement) => {
      let action: string = button.dataset.action + 'Action';
      button.removeEventListener('click', this[action]);
      button.addEventListener('click', this[action].bind(this));
    });
  }

  protected abstract updateFields(): void;

  protected abstract shapeModified(shape: Object): void;

  protected abstract moveShape(event: Event): void;

  private basicOptionsHandler(event: InputEvent): void {
    let field = (event.currentTarget as HTMLInputElement);
    this.area[field.dataset.field] = field.value;
  }

  private positionOptionsHandler(event: InputEvent): void {
    this.moveShapeDelay = AbstractFieldset.wait(
      () => { this.moveShape(event); },
      500,
      this.moveShapeDelay
    );
  }

  public updateArrowsState(): void {
    let areasForm = this.form.element,
      upButton = this.getElement('[data-action="up"]'),
      downButton = this.getElement('[data-action="down"]');

    if (areasForm.firstChild !== this.element) {
      upButton.classList.remove('disabled');
    } else {
      upButton.classList.add('disabled');
    }

    if (areasForm.lastChild !== this.element) {
      downButton.classList.remove('disabled');
    } else {
      downButton.classList.add('disabled');
    }
  }

  protected linkAction(event: Event): void {
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  protected upAction(): void {
    this.form.moveArea(this, AbstractFieldset.before);
  }

  protected downAction(): void {
    this.form.moveArea(this, AbstractFieldset.after);
  }

  public deleteAction(): void {
    this.form.deleteArea(this);
  }

  protected expandAction(): void {
    this.showElement('.moreOptions');
    this.showElement('[data-action="collapse"]');
    this.hideElement('[data-action="expand"]');
  }

  protected collapseAction(): void {
    this.hideElement('.moreOptions');
    this.hideElement('[data-action="collapse"]');
    this.showElement('[data-action="expand"]');
  }

  protected undoAction(): void {
  }

  protected redoAction(): void {
  }

  public colorPickerAction(value: string): void {
    this.area.color = value;
    (this.getElement('.t3js-color-picker') as HTMLInputElement).setAttribute('value', this.area.color);
    this.shape.set('borderColor', this.area.color);
    this.shape.set('stroke', this.area.color);
    this.shape.set('fill', ShapeFactory.hexToRgbA(this.area.color, 0.2));
    this.form.canvas.renderAll();
  }

  protected getFieldsetElement(selector: string, id: number|string): HTMLElement {
    let template = this.form.modalParent.querySelector(selector)
      .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
  }

  public getElement(selector: string): HTMLInputElement {
    return this.element.querySelector(selector);
  }

  private getElements(selector: string): NodeListOf<Element> {
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

  public getData(): Area {
    return this.area as Area;
  }

  /**
   * Add an input as target for browselink which listens for changes and writes value to real field
   */
  private addBrowselinkTargetInput(): void {
    if (this.form.browselinkTargetForm) {
      let input = this.form.browselinkParent.createElement('input');
      input.id = `href${this.id}_target`;
      input.value = this.area.href;
      input.setAttribute('data-formengine-input-name', input.id);
      input.onchange = this.changedBrowselinkTargetInput.bind(this);
      this.form.browselinkTargetForm.appendChild(input);
    }
  }

  public removeBrowselinkTargetInput(): void {
    if (this.form && this.form.browselinkTargetForm) {
      let field = this.form.browselinkTargetForm.querySelector(`#href${this.id}_target`);
      if (field) {
        field.remove();
      }
    }
  }

  private changedBrowselinkTargetInput(): void {
    let field = (this.form.browselinkTargetForm.querySelector(`#href${this.id}_target`) as HTMLInputElement);
    this.area.href = field.value;
    this.updateFields();
  }

  public inputX(value: number): number {
    return value / AreaForm.width;
  }

  public inputY(value: number): number {
    return value / AreaForm.height;
  }

  static wait(callback: Function, delay: number, timer: number): number {
    clearTimeout(timer);
    return window.setTimeout(callback, delay);
  }
}
