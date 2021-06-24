<?php

namespace Evoweb\Imagemap\ViewHelpers;

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

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;
use TYPO3\CMS\Frontend\Service\TypoLinkCodecService;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractTagBasedViewHelper;

/**
 * Area of a <map> element
 *
 * Examples
 * ========
 *
 * Default
 * -------
 *
 * ::
 *
 *    <i:area href="{f:uri.typolink(parameter: area.href)}" shape="{area.shape}"
 *            coords="{area.coords}" alt="{area.alt}" data="{area.data}"/>
 *
 * Output in frontend::
 *
 *    <area href="..." shape="rect" coords="..." alt="..." data-attr1="..." />
 */
class AreaViewHelper extends AbstractTagBasedViewHelper
{
    /**
     * @var string
     */
    protected $tagName = 'area';

    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerUniversalTagAttributes();
        $this->registerTagAttribute('alt', 'string', 'Specifies an alternate text for the area', true);
        $this->registerTagAttribute('download', 'string', 'Filename will be downloaded when link clicked');
        $this->registerTagAttribute('hreflang', 'string', 'Specifies the language of the target URL');
        $this->registerTagAttribute('rel', 'string', 'Specifies the relationship to the target URL');
        $this->registerTagAttribute('target', 'string', 'Specifies where to open the target URL');
        $this->registerTagAttribute('type', 'string', 'Specifies the media type of the target URL');
        $this->registerTagAttribute('media', 'string', 'Specifies what media/device the target URL is optimized for');
        $this->registerArgument('coords', 'array', 'Specifies the coordinates of the area', true);
        $this->registerArgument('href', 'string', 'Specifies the hyperlink target for the area', true);
        $this->registerArgument('shape', 'string', 'Specifies the shape of the area', true);
    }

    /**
     * @return string
     */
    public function render()
    {
        $href = $this->arguments['href'];
        $coords = $this->arguments['coords'];
        $shape = $this->arguments['shape'];

        [$shape, $coords] = static::prepareShape($shape, $coords);

        $this->tag->addAttribute('coords', $coords);
        $this->tag->addAttribute('href', $href);
        $this->tag->addAttribute('shape', $shape);
        return $this->tag->render();
    }

    protected static function prepareShape(string $shape, array $coords): array
    {
        [$width, $height] = self::getTypoScriptFrontendController()->lastImageInfo;
        switch ($shape) {
            case 'rect':
                $coords = $coords['top'] * $height . ',' . $coords['left'] * $width
                    . ',' . $coords['bottom'] * $height . ',' . $coords['right'] * $width;
                break;

            case 'circle':
                $coords = $coords['top'] * $height . ',' . $coords['left'] * $width . ',' . $coords['radius'] * $width;
                break;

            case 'poly':
                $points = [];
                foreach ($coords as $point) {
                    $points[] = $point['x'] * $width . ',' . $point['y'] * $height;
                }
                $coords = implode(',', $points);
                break;
        }
        return [$shape, $coords];
    }

    protected static function getTypoScriptFrontendController(): TypoScriptFrontendController
    {
        return $GLOBALS['TSFE'];
    }
}
