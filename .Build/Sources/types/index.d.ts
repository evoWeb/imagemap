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

declare interface EditorOptions {
  fauxFormDocument?: Document,
  canvas?: {
  }
  previewRerenderAjaxUrl?: string,
  browseLinkUrlAjaxUrl?: string,
  browseLink?: object
  formSelector?: string
  canvasSelector: string
}

declare interface EditorConfiguration {
  existingAreas: Array<any>,
  browseLink?: object,
  itemName: string
}

declare interface BrowseLinkConfiguration {
  returnUrl: string,
  formName: string,
  tableName: string,
  fieldName: string,
  pid: number,
}

declare interface AreaConfiguration {
  top?: number,
  left?: number,
  right?: number,
  bottom?: number,
  color?: string,
  shape: string,
  coords?: string,
  link?: string,
  editor?: any,
  selectable?: boolean,
  hasControls?: boolean,
  objectCaching?: boolean,
  controlConfig?: object,
  cornerColor?: string,
  cornerStrokeColor?: string,
}

declare interface FabricEvent {
  target?: {
    type: string
  },
  transform?: object,
  deselected?: Array<any>
  selected?: Array<any>
}

declare interface Window {
  TYPO3?: {
    settings: {
      ajaxUrls: {
        imagemap_preview_rerender?: '',
        imagemap_browselink_url?: '',
      }
    }
  },
  imagemap: {
    areaEditor: any
  }
}
