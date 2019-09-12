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

export default class AreaManipulation {
  private container: HTMLElement;

  private canvas: HTMLElement;

  private form: HTMLElement;

  private preview: boolean = false;

  constructor(container: HTMLElement, options: EditorOptions) {
    this.container = container;
    this.canvas = (this.container.querySelector(options.canvasSelector) as HTMLElement);
    this.preview = !(options.formSelector || '');
  }

  removeAllAreas() {

  }

  initializeAreas(areas: Array<any>) {

  }

  getAreasData(): Array<any> {
    return [];
  }

  destruct() {
    // this.form.destroy();
  }
}
