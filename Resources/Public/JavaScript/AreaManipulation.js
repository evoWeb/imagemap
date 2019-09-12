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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <reference types="../types/index"/>
    var AreaManipulation = /** @class */ (function () {
        function AreaManipulation(container, options) {
            this.preview = false;
            this.container = container;
            this.canvas = this.container.querySelector(options.canvasSelector);
            this.preview = !(options.formSelector || '');
        }
        AreaManipulation.prototype.removeAllAreas = function () {
        };
        AreaManipulation.prototype.initializeAreas = function (areas) {
        };
        AreaManipulation.prototype.getAreasData = function () {
            return [];
        };
        AreaManipulation.prototype.destruct = function () {
            // this.form.destroy();
        };
        return AreaManipulation;
    }());
    exports.default = AreaManipulation;
});
