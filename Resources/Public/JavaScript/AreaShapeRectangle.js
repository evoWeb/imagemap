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
define(["require", "exports", "./vendor/Fabric.min"], function (require, exports, Fabric_min_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaShapeRectangle extends Fabric_min_1.Rect {
        constructor(options) {
            super(options);
        }
    }
    exports.AreaShapeRectangle = AreaShapeRectangle;
});
