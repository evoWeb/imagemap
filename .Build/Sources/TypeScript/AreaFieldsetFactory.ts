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
import { Object } from './vendor/fabric';
import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';
import { AreaFieldsetCircle } from './AreaFieldsetCircle';
import { AreaFieldsetPolygon } from './AreaFieldsetPolygon';
import { AreaFieldsetRectangle } from './AreaFieldsetRectangle';

export class AreaFieldsetFactory {
  readonly configuration: EditorConfiguration;

  constructor(configuration: EditorConfiguration) {
    this.configuration = configuration;
  }

  public createFieldset(area: Area, areaShape: Object): AreaFieldsetAbstract {
    let areaFieldset,
      decoupledArea = {
        ...area,
      };

    switch (decoupledArea.shape) {
      case 'circle':
        areaFieldset = new AreaFieldsetCircle(decoupledArea, this.configuration, areaShape);
        break;

      case 'poly':
        areaFieldset = new AreaFieldsetPolygon(decoupledArea, this.configuration, areaShape);
        break;

      case 'rect':
        areaFieldset = new AreaFieldsetRectangle(decoupledArea, this.configuration, areaShape);
        break;
    }

    return areaFieldset;
  }
}
