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
define(["require", "exports", "./AreaShapeFactory", "./AreaFieldsetCircle", "./AreaFieldsetPolygon", "./AreaFieldsetRectangle"], function (require, exports, AreaShapeFactory_1, AreaFieldsetCircle_1, AreaFieldsetPolygon_1, AreaFieldsetRectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetFactory {
        constructor(configurations) {
            this.configurations = configurations;
        }
        createFieldset(area, areaShape) {
            area.color = AreaShapeFactory_1.AreaShapeFactory.getRandomColor(area.color);
            let areaElement, configuration = Object.assign({}, area);
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
        createCircle(configuration, areaShape) {
            return new AreaFieldsetCircle_1.AreaFieldsetCircle(configuration, this.configurations, areaShape);
        }
        createPolygon(configuration, areaShape) {
            return new AreaFieldsetPolygon_1.AreaFieldsetPolygon(configuration, this.configurations, areaShape);
        }
        createRectangle(configuration, areaShape) {
            return new AreaFieldsetRectangle_1.AreaFieldsetRectangle(configuration, this.configurations, areaShape);
        }
    }
    exports.AreaFieldsetFactory = AreaFieldsetFactory;
});
