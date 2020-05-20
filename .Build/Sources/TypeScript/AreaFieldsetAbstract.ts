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

import * as $ from 'jquery';
// @ts-ignore
import { Object } from './vendor/Fabric';
import { AreaForm } from './AreaForm';
import { AreaShapeFactory } from './AreaShapeFactory';

export abstract class AreaFieldsetAbstract {
  static before: number = -1;

  static after: number = 1;

  readonly name: string = '';

  readonly id: number = 0;

  public element: HTMLElement;

  private moveShapeDelay: number = 0;

  private form: AreaForm;

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
    ($(this.getElement('.t3js-color-picker')) as any).minicolors({
      format: 'hex',
      position: 'left',
      theme: 'default',
      changeDelay: 100,
      change: this.colorPickerAction.bind(this)
    });
  }

  private initializeEvents(): void {
    this.getElements('.basicOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.removeEventListener('keyup', this.basicOptionsHandler);
      field.addEventListener('keyup', this.basicOptionsHandler.bind(this));
    });
    this.getElements('.positionOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.removeEventListener('input', this.positionOptionsHandler);
      field.addEventListener('input', this.positionOptionsHandler.bind(this));
    });
    this.getElements('.t3js-btn').forEach((field: HTMLInputElement) => {
      let action: string = field.dataset.action + 'Action';
      field.removeEventListener('click', this[action]);
      field.addEventListener('click', this[action].bind(this));
    });
  }

  protected abstract updateFields(): void;

  protected abstract shapeModified(event: FabricEvent): void;

  protected abstract moveShape(event: Event): void;

  private basicOptionsHandler(event: Event): void {
    let field = (event.currentTarget as HTMLInputElement);
    this.area[field.dataset.field] = field.value;
  }

  private positionOptionsHandler(event: Event): void {
    this.moveShapeDelay = AreaFieldsetAbstract.wait(
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
    this.form.moveArea(this, AreaFieldsetAbstract.before);
  }

  protected downAction(): void {
    this.form.moveArea(this, AreaFieldsetAbstract.after);
  }

  public deleteAction(): void {
    if (this.element) {
      this.element.remove();
    }
    if (this.shape) {
      this.shape.canvas.remove(this.shape);
      this.shape = null;
    }

    this.removeBrowselinkTargetInput();
    this.form.updateArrowsState();
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

  private colorPickerAction(value: string) {
    this.area.color = value;
    (this.getElement('.t3js-color-picker') as HTMLInputElement).setAttribute('value', this.area.color);
    this.shape.set('borderColor', this.area.color);
    this.shape.set('stroke', this.area.color);
    this.shape.set('fill', AreaShapeFactory.hexToRgbA(this.area.color, 0.2));
    this.shape.canvas.renderAll();
  }

  protected getFieldsetElement(selector: string, id: number|string): HTMLElement {
    let template = this.form.modalParent.querySelector(selector)
      .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
  }

  public getElement(selector: string): HTMLInputElement {
    return this.element.querySelector(selector);
  }

  private getElements(selector: string) {
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

  protected inputX(value: number): number {
    return value / AreaForm.width;
  }

  protected inputY(value: number): number {
    return value / AreaForm.height;
  }

  protected outputX(value: number): string {
    return Math.round(value * AreaForm.width).toString();
  }

  protected outputY(value: number): string {
    return Math.round(value * AreaForm.height).toString();
  }

  public getData(): object {
    return this.area;
  }

  /**
   * Add an input as target for browselink which listens for changes and writes value to real field
   */
  private addBrowselinkTargetInput(): void {
    if (this.form.browselinkTargetForm) {
      let browselinkTargetInput = this.form.browselinkParent.createElement('input');
      browselinkTargetInput.setAttribute('id', 'href' + this.id);
      browselinkTargetInput.setAttribute('data-formengine-input-name', 'href' + this.id);
      browselinkTargetInput.setAttribute('value', this.area.href);
      browselinkTargetInput.onchange = this.changedBrowselinkTargetInput.bind(this);
      this.form.browselinkTargetForm.appendChild(browselinkTargetInput);
    }
  }

  private removeBrowselinkTargetInput(): void {
    if (this.form && this.form.browselinkTargetForm !== null) {
      let field = this.form.browselinkTargetForm.querySelector(`#href${this.id}`);
      if (field) {
        field.remove();
      }
    }
  }

  private changedBrowselinkTargetInput(): void {
    let field = (this.form.browselinkTargetForm.querySelector(`#href${this.id}`) as HTMLInputElement);
    this.area.href = field.value;
    this.updateFields();
  }

  static wait(callback: Function, delay: number, timer: number): number {
    clearTimeout(timer);
    return window.setTimeout(callback, delay);
  }
}
