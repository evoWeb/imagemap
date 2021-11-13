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
define(["require", "exports", "TYPO3/CMS/Backend/Modal"], function (require, exports, Modal) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaForm {
        constructor(element, canvas, configuration, modalParent, browselinkParent) {
            this.areaFieldsets = [];
            this.browselinkTargetFormSelector = '#browselinkTargetForm';
            this.canvas = canvas;
            this.configuration = configuration;
            this.element = element;
            this.modalParent = modalParent;
            this.browselinkParent = browselinkParent;
            this.addBrowselinkTargetForm();
        }
        destroy() {
            this.removeFauxForm();
        }
        updateArrowsState() {
            this.areaFieldsets.forEach((area) => {
                area.updateArrowsState();
            });
        }
        addArea(area) {
            this.areaFieldsets.push(area);
            area.addForm(this);
            this.updateArrowsState();
        }
        moveArea(area, offset) {
            let index = this.areaFieldsets.indexOf(area), newIndex = index + offset, parent = area.element.parentNode;
            if (newIndex > -1 && newIndex < this.areaFieldsets.length) {
                let removedArea = this.areaFieldsets.splice(index, 1)[0];
                this.areaFieldsets.splice(newIndex, 0, removedArea);
                parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
            }
            this.updateArrowsState();
        }
        deleteArea(area) {
            let areaFieldsets = [];
            this.areaFieldsets.forEach((currentArea, index) => {
                if (area === currentArea) {
                    if (currentArea.element) {
                        currentArea.element.remove();
                    }
                    if (currentArea.area.canvasShape) {
                        this.canvas.remove(currentArea.area.canvasShape);
                        currentArea.area.canvasShape = null;
                    }
                    currentArea.removeBrowselinkTargetInput();
                    delete (this.areaFieldsets[index]);
                }
                else {
                    areaFieldsets.push(currentArea);
                }
            });
            this.areaFieldsets = areaFieldsets;
            this.updateArrowsState();
        }
        openLinkBrowser(link, fieldset) {
            link.blur();
            let data = new FormData(), request = new XMLHttpRequest();
            data.append('P[areaId]', fieldset.area.id.toString());
            data.append('P[formName]', 'areasForm');
            data.append('P[itemFormElName]', `href${fieldset.area.id}_target`);
            data.append('P[currentValue]', fieldset.area.areaData.href);
            data.append('P[tableName]', this.configuration.tableName);
            data.append('P[fieldName]', this.configuration.fieldName);
            data.append('P[uid]', this.configuration.uid.toString());
            data.append('P[pid]', this.configuration.pid.toString());
            request.open('POST', window.TYPO3.settings.ajaxUrls.imagemap_browselink_url);
            request.onreadystatechange = this.fetchBrowseLinkCallback.bind(fieldset);
            request.send(data);
        }
        fetchBrowseLinkCallback(e) {
            let request = e.target;
            if (request.readyState === 4 && request.status === 200) {
                let data = JSON.parse(request.responseText), url = data.url + '&P[currentValue]=' + encodeURIComponent(this.getFieldValue('.href'));
                Modal.advanced({
                    type: Modal.types.iframe,
                    content: url,
                    size: Modal.sizes.large,
                });
            }
        }
        /**
         * Create form element that is reachable for LinkBrowser.finalizeFunction
         */
        addBrowselinkTargetForm() {
            if (!(this.browselinkTargetForm = this.browselinkParent.querySelector(this.browselinkTargetFormSelector))) {
                this.browselinkTargetForm = this.browselinkParent.createElement('form');
                this.browselinkTargetForm.name = 'areasForm';
                this.browselinkTargetForm.id = 'browselinkTargetForm';
                this.browselinkParent.body.appendChild(this.browselinkTargetForm);
            }
            // empty previously created browselinkTargetForm
            while (this.browselinkTargetForm.firstChild) {
                this.browselinkTargetForm.removeChild(this.browselinkTargetForm.firstChild);
            }
        }
        removeFauxForm() {
            if (this.browselinkTargetForm) {
                this.browselinkTargetForm.remove();
            }
        }
        getMapData() {
            let areas = [];
            this.areaFieldsets.forEach((areaFieldset) => {
                areas.push(areaFieldset.area.getData());
            });
            return JSON.stringify(areas);
        }
    }
    exports.AreaForm = AreaForm;
});
