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
define(["require", "exports", "./CircleFieldset", "./PolygonFieldset", "./RectangleFieldset"], function (require, exports, CircleFieldset_1, PolygonFieldset_1, RectangleFieldset_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FieldsetFactory {
        constructor(configuration) {
            this.configuration = configuration;
        }
        createFieldset(area, areaShape) {
            let areaFieldset;
            switch (area.shape) {
                case 'circle':
                    areaFieldset = new CircleFieldset_1.CircleFieldset(area, this.configuration, areaShape);
                    break;
                case 'poly':
                    areaFieldset = new PolygonFieldset_1.PolygonFieldset(area, this.configuration, areaShape);
                    break;
                case 'rect':
                    areaFieldset = new RectangleFieldset_1.RectangleFieldset(area, this.configuration, areaShape);
                    break;
            }
            return areaFieldset;
        }
    }
    exports.FieldsetFactory = FieldsetFactory;
});
