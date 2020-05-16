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

declare interface Point {
  x: number,
  y: number,
  id?: string|number
}

declare interface AreaConfiguration {
  shape: string,
  href?: string,
  alt?: string,
  color?: string,
  coords?: {
    left?: number,
    top?: number,
    right?: number,
    bottom?: number,
    radius?: number,
  },
  points?: Point[]
}

declare interface ShapeConfiguration {
  selectable: boolean,
  hasControls: boolean,
  stroke: string,
  strokeWidth: number,
  fill: string,
  cornerColor: string,
  cornerStrokeColor: string,
}

declare interface BrowseLinkConfiguration {
  returnUrl?: string,
  formName?: string,
  tableName?: string,
  fieldName?: string,
  pid?: number,
}

declare interface CanvasSize {
  width: number,
  height: number,
  top?: number,
}

declare interface EditorConfiguration {
  existingAreas: any[],
  browseLink?: object,
  itemName: string,
}

declare interface EditorConfigurations {
  canvas?: CanvasSize,
  browselinkTargetDocument?: Document,
  previewRerenderAjaxUrl?: string,
  browseLink?: object,
  browseLinkUrlAjaxUrl?: string,
  formSelector?: string,
}

declare interface FabricEvent {
  target?: {
    type: string
  },
  transform?: object,
  deselected?: any[],
  selected?: any[],
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
  },
  FormArea?: any,
  TBE_EDITOR?: {
    doSaveFieldName?: any
  }
}
