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
        constructor(formSelector, modalParent, editor) {
            this.element = modalParent.querySelector(formSelector);
            this.editor = editor;
            this.addFormAsTargetForBrowselink();
        }
        destroy() {
            this.removeFauxForm();
        }
        updateArrowsState() {
            this.editor.areaFieldsets.forEach((area) => {
                area.updateArrowsState();
            });
        }
        addArea(area) {
            area.form = this;
            area.postAddToForm();
            this.updateArrowsState();
        }
        moveArea(area, offset) {
            let index = this.editor.areaFieldsets.indexOf(area), newIndex = index + offset, parent = area.element.parentNode;
            if (newIndex > -1 && newIndex < this.editor.areaFieldsets.length) {
                let removedArea = this.editor.areaFieldsets.splice(index, 1)[0];
                this.editor.areaFieldsets.splice(newIndex, 0, removedArea);
                parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
            }
            this.updateArrowsState();
        }
        openLinkBrowser(link, area) {
            link.blur();
            let data = new FormData(), request = new XMLHttpRequest();
            data.append('P[areaId]', area.id.toString());
            data.append('P[formName]', 'areasForm');
            data.append('P[itemFormElName]', 'href' + area.id);
            data.append('P[currentValue]', area.getLink());
            request.open('POST', window.TYPO3.settings.ajaxUrls.imagemap_browselink_url);
            request.onreadystatechange = this.fetchBrowseLinkCallback.bind(area);
            request.send(data);
        }
        fetchBrowseLinkCallback(e) {
            let request = e.target;
            if (request.readyState === 4 && request.status === 200) {
                let data = JSON.parse(request.responseText), url = data.url
                    + '&P[currentValue]=' + encodeURIComponent(this.getFieldValue('.href'))
                    + '&P[currentSelectedValues]=' + encodeURIComponent(this.getFieldValue('.href'));
                if (window.hasOwnProperty('TBE_EDITOR')
                    && window.TBE_EDITOR.hasOwnProperty('doSaveFieldName')
                    && window.TBE_EDITOR.doSaveFieldName === 'doSave') {
                    // @todo remove once TYPO3 9.x support gets removed
                    let vHWin = window.open(url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1');
                    vHWin.focus();
                }
                else {
                    Modal.advanced({
                        type: Modal.types.iframe,
                        content: url,
                        size: Modal.sizes.large,
                    });
                }
            }
        }
        /**
         * Create form element that is reachable for LinkBrowser.finalizeFunction
         */
        addFormAsTargetForBrowselink() {
            if (top.document !== this.editor.browselinkParent) {
                if (!(this.browselinkTargetForm = this.editor.browselinkParent.querySelector(this.editor.formSelector))) {
                    this.browselinkTargetForm = this.editor.browselinkParent.createElement('form');
                    this.browselinkTargetForm.setAttribute('name', 'areasForm');
                    this.browselinkTargetForm.setAttribute('id', 'browselinkTargetForm');
                    this.editor.browselinkParent.body.appendChild(this.browselinkTargetForm);
                }
                // empty previously created browselinkTargetForm
                while (this.browselinkTargetForm.firstChild) {
                    this.browselinkTargetForm.removeChild(this.browselinkTargetForm.firstChild);
                }
            }
        }
        removeFauxForm() {
            if (this.browselinkTargetForm) {
                this.browselinkTargetForm.remove();
            }
        }
    }
    exports.AreaForm = AreaForm;
});
