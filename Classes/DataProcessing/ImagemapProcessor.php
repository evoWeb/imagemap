<?php
declare(strict_types = 1);
namespace Evoweb\Imagemap\DataProcessing;

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

class ImagemapProcessor implements \TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface
{
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
            $attributes = $contentObjectConfiguration['variables.']['imageMapAttributes.'] ?? [];
            $mapName = $cObj->cObjGetSingle(
                $processorConfiguration['name'],
                $processorConfiguration['name.']
            );

            /* @var $mapper \Evoweb\Imagemap\Utility\Mapper */
            $mapper = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);
            $mapName = $mapper->createValidNameAttribute($mapName);

            $mapData = $cObj->getData($processorConfiguration['data'], $cObj->data);
            $mapArray = $mapData ? \json_decode($mapData, true) : [];
            if (count($mapArray)) {
                if ($this->getTypoScriptFrontendController()->config['config']['xhtmlDoctype'] !== '') {
                    // remove target attribute to have xhtml-strict output
                    $attributes = array_diff($attributes, ['target']);
                }

                $processedData['imageMap'] = $mapArray;
                $processedData['imageMapAttributes'] = $attributes;
            }
            $processedData['imageMapName'] = $mapName;
        }
        return $processedData;
    }

    protected function getTypoScriptFrontendController():? \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController
    {
        return $GLOBALS['TSFE'] ?? null;
    }
}
