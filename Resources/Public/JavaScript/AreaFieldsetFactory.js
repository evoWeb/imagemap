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
define(["require", "exports", "./AreaFieldsetCircle", "./AreaFieldsetPolygon", "./AreaFieldsetRectangle"], function (require, exports, AreaFieldsetCircle_1, AreaFieldsetPolygon_1, AreaFieldsetRectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaFieldsetFactory {
        constructor(configuration) {
            this.configuration = configuration;
        }
        createFieldset(area, areaShape) {
            let areaFieldset, decoupledArea = Object.assign({}, area);
            switch (decoupledArea.shape) {
                case 'circle':
                    areaFieldset = new AreaFieldsetCircle_1.AreaFieldsetCircle(decoupledArea, this.configuration, areaShape);
                    break;
                case 'poly':
                    areaFieldset = new AreaFieldsetPolygon_1.AreaFieldsetPolygon(decoupledArea, this.configuration, areaShape);
                    break;
                case 'rect':
                    areaFieldset = new AreaFieldsetRectangle_1.AreaFieldsetRectangle(decoupledArea, this.configuration, areaShape);
                    break;
            }
            return areaFieldset;
        }
    }
    exports.AreaFieldsetFactory = AreaFieldsetFactory;
});
