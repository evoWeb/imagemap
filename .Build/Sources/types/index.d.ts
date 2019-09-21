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

declare interface CanvasSize {
  width: number,
  height: number,
}

declare interface EditorOptions {
  editControlDocument?: Document,
  canvas?: CanvasSize,
  previewRerenderAjaxUrl?: string,
  browseLinkUrlAjaxUrl?: string,
  browseLink?: object,
  formSelector?: string,
  canvasSelector: string,
}

declare interface CanvasOptions {
  width: number,
  height: number,
  interactive: boolean,
  selection: boolean,
  preserveObjectStacking: boolean,
  hoverCursor: string,
}

declare interface FormOptions {
  formDocument: Document,
  formSelector: string,
  browseLink: BrowseLinkConfiguration,
  browseLinkUrlAjaxUrl: string,
}

declare interface HTML5Area {
  areaId?: number,
  coords: {
    left?: number,
    top?: number,
    right?: number,
    bottom?: number,
    radius?: number,
    points?: any[],
    [property: string]: any,
  },
  shape: string,

  href?: string,
  alt?: string,
  download?: boolean,
  hreflang?: string,
  media?: string,
  ping?: string,
  rel?: string,
  target?: string,

  data?: {
    color: string,
    [property: string]: any,
  },
  [property: string]: any,
}

declare interface EditorConfiguration {
  existingAreas: any[],
  browseLink?: object,
  itemName: string,
}

declare interface BrowseLinkConfiguration {
  returnUrl?: string,
  formName?: string,
  tableName?: string,
  fieldName?: string,
  pid?: number,
}

declare interface FormAreaConfiguration {
  top?: number,
  left?: number,
  right?: number,
  bottom?: number,
  color?: string,
  shape?: string,
  coords?: {
    top?: number,
    left?: number,
    right?: number,
    bottom?: number,
    radius?: number,
    points?: any[],
  },
  link?: string,
}

declare interface FabricPoint {
  x: number,
  y: number,
  id: number,
  element: HTMLElement,
  control?: object,
}

declare interface CanvasAreaConfiguration {
  coords?: {
    top?: number,
    left?: number,
    right?: number,
    bottom?: number,
    radius?: number,
    points?: any[],
  },
  selectable: boolean,
  hasControls: boolean,
  stroke: string,
  fill: string,
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
  imagemap?: {
    areaEditor: any,
  },
  FormArea?: any,
}

declare interface AreaConfiguration {
  shape?: string,
  color?: string,
  cornerColor?: string,
  cornerStrokeColor?: string,
  editor?: object,
  coords?: string,
  left?: number,
  top?: number,
}

declare interface AreaConfiguration {
  shape?: string,
  color?: string,
  cornerColor?: string,
  cornerStrokeColor?: string,
  editor?: object,
  coords?: string,
  left?: number,
  top?: number,
}
