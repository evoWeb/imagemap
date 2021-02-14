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
        $this->registerArgument('shape', 'string', 'Specifies the shape of the area', true);
        $this->registerArgument('coords', 'array', 'Specifies the coordinates of the area', true);
        $this->registerArgument('href', 'string', 'Specifies the hyperlink target for the area', true);
        $this->registerArgument('dimensions', 'array', 'Width and height of image', false, ['width' => 1, 'height' => 1]);
    }

    /**
     * @return string
     */
    public function render()
    {
        $parameter = $this->arguments['href'];
        $absolute = (bool) $this->arguments['absolute'];
        $coords = $this->arguments['coords'];
        $shape = $this->arguments['shape'];
        $dimensions = $this->arguments['dimensions'];

        $coords = static::prepareShape($shape, $coords, $dimensions);

        if ($parameter) {
            $typoLinkCodec = GeneralUtility::makeInstance(TypoLinkCodecService::class);
            $typoLinkConfiguration = $typoLinkCodec->decode($parameter);
            $typoLinkParameter = $typoLinkCodec->encode($typoLinkConfiguration);
            $href = static::invokeContentObjectRenderer($typoLinkParameter, $absolute);

            if ($href) {
                $this->tag->addAttribute('href', $href);
            }
        }

        $this->tag->addAttribute('coords', $coords);
        $this->tag->addAttribute('shape', $shape);
        return $this->tag->render();
    }

    protected static function prepareShape(string $shape, array $coords, array $dimensions): string
    {
        $width = $dimensions['width'];
        $height = $dimensions['height'];

        switch ($shape) {
            case 'rect':
                $coords['left'] = $coords['left'] * $width;
                $coords['top'] = $coords['top'] * $height;
                $coords['right'] = $coords['right'] * $width;
                $coords['bottom'] = $coords['bottom'] * $height;
                $coords = implode(',', $coords);
                break;

            case 'circle':
                $coords['left'] = $coords['left'] * $width;
                $coords['top'] = $coords['top'] * $height;
                $coords['radius'] = $coords['radius'] * $width;
                $coords = implode(',', $coords);
                break;

            case 'poly':
                $points = [];
                foreach ($coords as $point) {
                    $point['x'] = $point['x'] * $width;
                    $point['y'] = $point['y'] * $height;
                    $points[] = implode(',', $point);
                }
                $coords = implode(',', $points);
                break;
        }
        return $coords;
    }

    protected static function invokeContentObjectRenderer(string $typoLinkParameter, bool $absolute): string
    {
        $instructions = [
            'parameter' => $typoLinkParameter,
            'forceAbsoluteUrl' => $absolute,
        ];

        /** @var ContentObjectRenderer $contentObject */
        $contentObject = GeneralUtility::makeInstance(ContentObjectRenderer::class);
        return $contentObject->typoLink_URL($instructions);
    }
}
