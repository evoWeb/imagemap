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
  id?: string|number,
  element?: any
}

declare interface Coordinate {
  left: number,
  top: number,
  right?: number,
  bottom?: number,
  radius?: number,
}

declare interface Area {
  shape: string,
  href?: string,
  alt?: string,
  color?: string,
  coords?: Coordinate,
  points?: Point[]
}

declare interface ShapeConfiguration {
  cornerColor: string,
  cornerStrokeColor: string,
  cornerSize: number,
  cornerStyle: string,
  hasBorders: boolean,
  hasRotatingPoint: boolean,
  transparentCorners: boolean
  selectable?: boolean,
  hasControls?: boolean,
  stroke?: string,
  strokeWidth?: number,
  fill?: string,
  id?: number,
  canvas?: string
}

declare interface EditorConfiguration {
  browseLink?: object,
  formSelector?: string,
  cornerColor?: string,
  cornerStrokeColor?: string,
  tableName?: string,
  fieldName?: string,
  uid?: number,
  pid?: number,
  width?: number,
  height?: number
}

declare interface FabricEvent {
  e: MouseEvent,
  target?: any,
  deselected?: any[],
  selected?: any[]
}

declare interface Window {
  $?: Function,
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
