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

// @ts-ignore
import { Object } from './vendor/Fabric.min';
import { AbstractFieldset } from './AbstractFieldset';
import { CircleFieldset } from './CircleFieldset';
import { PolygonFieldset } from './PolygonFieldset';
import { RectangleFieldset } from './RectangleFieldset';

export class FieldsetFactory {
  readonly configuration: EditorConfiguration;

  constructor(configuration: EditorConfiguration) {
    this.configuration = configuration;
  }

  public createFieldset(area: Area, areaShape: Object): AbstractFieldset {
    let areaFieldset;

    switch (area.shape) {
      case 'circle':
        areaFieldset = new CircleFieldset(area, this.configuration, areaShape);
        break;

      case 'poly':
        areaFieldset = new PolygonFieldset(area, this.configuration, areaShape);
        break;

      case 'rect':
        areaFieldset = new RectangleFieldset(area, this.configuration, areaShape);
        break;
    }

    return areaFieldset;
  }
}
