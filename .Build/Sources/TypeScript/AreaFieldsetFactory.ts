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
import { AreaShapeFactory } from './AreaShapeFactory';
import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';
import { AreaFieldsetCircle } from './AreaFieldsetCircle';
import { AreaFieldsetPolygon } from './AreaFieldsetPolygon';
import { AreaFieldsetRectangle } from './AreaFieldsetRectangle';

export class AreaFieldsetFactory {
  readonly configurations: EditorConfigurations;

  constructor(configurations: EditorConfigurations) {
    this.configurations = configurations;
  }

  public createFieldset(area: AreaAttributes, areaShape: Object): AreaFieldsetAbstract {
    area.color = AreaShapeFactory.getRandomColor(area.color);
    let areaElement,
      configuration = {
        ...area,
      };

    switch (configuration.shape) {
      case 'rect':
        areaElement = this.createRectangle(configuration, areaShape);
        break;

      case 'circle':
        areaElement = this.createCircle(configuration, areaShape);
        break;

      case 'poly':
        areaElement = this.createPolygon(configuration, areaShape);
        break;
    }

    return areaElement;
  }

  protected createCircle(configuration: AreaAttributes, areaShape: Object): AreaFieldsetCircle {
    return new AreaFieldsetCircle(configuration, this.configurations, areaShape);
  }

  protected createPolygon(configuration: AreaAttributes, areaShape: Object): AreaFieldsetPolygon {
    return new AreaFieldsetPolygon(configuration, this.configurations, areaShape);
  }

  protected createRectangle(configuration: AreaAttributes, areaShape: Object): AreaFieldsetRectangle {
    return new AreaFieldsetRectangle(configuration, this.configurations, areaShape);
  }
}
