<?php
declare(strict_types = 1);

/**
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

namespace Evoweb\Imagemap\DataProcessing;

class ImagemapProcessor implements \TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface
{
    /**
     * @var array
     */
    protected $attributes = [
        'shape',
        'coords',
        'href',
        'target',
        'nohref',
        'alt',
        'title',
        'accesskey',
        'tabindex',
        'onfocus',
        'onblur',
        'id',
        'class',
        'style',
        'lang',
        'dir',
        'onclick',
        'ondblclick',
        'onmousedown',
        'onmouseup',
        'onmouseover',
        'onmousemove',
        'onmouseout',
        'onkeypress',
        'onkeydown',
        'onkeyup',
    ];

    /**
     * Process data of a record to resolve imagemap
     *
     * @param \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer $cObj The data of the content element or page
     * @param array $contentObjectConfiguration The configuration of Content Object
     * @param array $processorConfiguration The configuration of this processor
     * @param array $processedData Key/value store of processed data (e.g. to be passed to a Fluid View)
     *
     * @return array the processed data as key/value store
     */
    public function process(
        \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer $cObj,
        array $contentObjectConfiguration,
        array $processorConfiguration,
        array $processedData
    ): array {
        if (!empty($processedData['files'])) {
            $mapName = $cObj->cObjGetSingle(
                $processorConfiguration['name'],
                $processorConfiguration['name.']
            );

            /* @var $mapper \Evoweb\Imagemap\Utility\Mapper */
            $mapper = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);
            $mapName = $mapper->createValidNameAttribute($mapName);

            $mapData = $cObj->getData($processorConfiguration['data'], $cObj->data);
            $mapArray = $mapper->map2array($mapData);
            if (isset($mapArray['areas']) && count($mapArray['areas'])) {
                $mapArray['attributes']['name'] = $mapName;

                if ($this->getTypoScriptFrontendController()->config['config']['xhtmlDoctype'] !== '') {
                    // remove target attribute to have xhtml-strict output
                    $this->attributes = array_diff($this->attributes, ['target']);
                    $mapArray['attributes']['id'] = $mapArray['attributes']['name'];
                }

                $processedData['imageMap'] = $mapArray;
                $processedData['imageMapName'] = $mapName;
                $processedData['imageMapAttributes'] = $this->attributes;
            }
        }
        return $processedData;
    }

    /**
     * Returns global frontend controller
     *
     * @return \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController|null
     */
    protected function getTypoScriptFrontendController()
    {
        return $GLOBALS['TSFE'] ?? null;
    }
}
