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

import { AreaForm } from '../AreaForm';
import { ShapeFactory } from './Factory';
import { AbstractArea } from './AbstractArea';

export abstract class AbstractFieldset {
  static before: number = -1;

  static after: number = 1;

  readonly name: string = '';

  public element: HTMLElement;

  private moveShapeDelay: number = 0;

  protected form: AreaForm;

  public area: AbstractArea;

  private configuration: EditorConfiguration;

  [property: string]: any;

  constructor(area: AbstractArea, configuration: EditorConfiguration) {
    this.area = area;
    this.configuration = configuration;
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
    this.element = this.getFieldsetElement(`#${this.name}Form`, this.area.id);
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

  protected abstract fieldsetModified(event: Event): void;

  private basicOptionsHandler(event: InputEvent): void {
    let field = (event.currentTarget as HTMLInputElement);
    // @todo check if these are only values not related to movement or size
    if (this.area.areaData.hasOwnProperty(field.dataset.field)) {
      this.area.areaData[field.dataset.field] = field.value;
    }
  }

  private positionOptionsHandler(event: InputEvent): void {
    this.moveShapeDelay = AbstractFieldset.wait(
      () => { this.fieldsetModified(event); },
      300,
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

  // @todo make this work
  protected undoAction(): void {
  }

  // @todo make this work
  protected redoAction(): void {
  }

  public colorPickerAction(value: string): void {
    this.area.areaData.color = value;
    this.getElement('.t3js-color-picker').setAttribute('value', value);
    this.area.canvasShape.set('borderColor', value);
    this.area.canvasShape.set('stroke', value);
    this.area.canvasShape.set('fill', ShapeFactory.hexToRgbA(value, 0.2));
    this.form.canvas.renderAll();
  }

  protected getFieldsetElement(selector: string, id: number|string): HTMLElement {
    let template = this.form.modalParent.querySelector(selector)
      .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.area.id));
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

  /**
   * Add an input as target for browselink which listens for changes and writes value to real field
   */
  private addBrowselinkTargetInput(): void {
    if (this.form.browselinkTargetForm) {
      let input = this.form.browselinkParent.createElement('input');
      input.id = `href${this.area.id}_target`;
      input.value = this.area.areaData.href;
      input.setAttribute('data-formengine-input-name', input.id);
      input.onchange = this.changedBrowselinkTargetInput.bind(this);
      this.form.browselinkTargetForm.appendChild(input);
    }
  }

  public removeBrowselinkTargetInput(): void {
    if (this.form && this.form.browselinkTargetForm) {
      let field = this.form.browselinkTargetForm.querySelector(`#href${this.area.id}_target`);
      if (field) {
        field.remove();
      }
    }
  }

  private changedBrowselinkTargetInput(): void {
    let field = (this.form.browselinkTargetForm.querySelector(`#href${this.area.id}_target`) as HTMLInputElement);
    this.area.areaData.href = field.value;
    this.updateFields();
  }

  static wait(callback: Function, delay: number, timer: number): number {
    clearTimeout(timer);
    return window.setTimeout(callback, delay);
  }
}
