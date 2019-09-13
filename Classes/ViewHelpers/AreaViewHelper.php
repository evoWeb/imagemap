<?php
namespace Evoweb\Imagemap\ViewHelpers;

/***************************************************************
 * Copyright notice
 *
 * (c) 2019 Sebastian Fischer <typo3@evoweb.de>
 * All rights reserved
 *
 * This script is part of the TYPO3 project. The TYPO3 project is
 * free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * The GNU General Public License can be found at
 * http://www.gnu.org/copyleft/gpl.html.
 *
 * This script is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * This copyright notice MUST APPEAR in all copies of the script!
 ***************************************************************/

class AreaViewHelper extends \TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper
{
    use \TYPO3Fluid\Fluid\Core\ViewHelper\Traits\CompileWithRenderStatic;

    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('href', 'string', 'Link of the area');
        $this->registerArgument('shape', 'string', 'Shape of the area');
        $this->registerArgument('alt', 'string', 'Alternative text of the area');
        $this->registerArgument('coords', 'array', 'Coordinates of the area');
        $this->registerArgument('data', 'array', 'Additional data information');
    }

    /**
     * @param array $arguments
     * @param \Closure $renderChildrenClosure
     * @param \TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface $renderingContext
     *
     * @return string
     */
    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        \TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface $renderingContext
    ) {
        $shape = $arguments['shape'];
        $coords = $arguments['coords'];
        $href = $arguments['href'];
        $alt = $arguments['alt'];
        $data = $arguments['data'];

        switch ($shape) {
            case 'rect':
            case 'rectangle':
            case 'circ':
            case 'circle':
                $coords = implode(',', $coords);
                break;

            case 'poly':
            case 'polygon':
                $points = [];
                foreach ($coords['points'] as $point) {
                    $points[] = implode(',', $point);
                }
                $coords = implode(',', $points);
                break;
        }

        $tag = [
            '<area',
            ' href="' . $href . '"',
            ' shape="' . $shape . '"',
            ' coords="' . $coords . '"',
        ];

        if ($alt) {
            $tag[] = ' alt="' . $alt . '"';
        }

        foreach ($data as $key => $value) {
            $tag[] = ' data-' . $key . '="' . $value . '"';
        }

        $tag[] = '>';

        return implode('', $tag);
    }
}
