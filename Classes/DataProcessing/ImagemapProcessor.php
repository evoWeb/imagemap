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

use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

class ImagemapProcessor implements \TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface
{
    /**
     * Process data of a record to resolve imagemap
     *
     * @param ContentObjectRenderer $cObj The data of the content element or page
     * @param array $contentObjectConfiguration The configuration of Content Object
     * @param array $processorConfiguration The configuration of this processor
     * @param array $processedData Key/value store of processed data (e.g. to be passed to a Fluid View)
     *
     * @return array the processed data as key/value store
     */
    public function process(
        ContentObjectRenderer $cObj,
        array $contentObjectConfiguration,
        array $processorConfiguration,
        array $processedData
    ): array {
        if (!empty($processedData['files'])) {
            $attributes = $contentObjectConfiguration['variables.']['imageMapAttributes.'] ?? [];
            $mapName = $this->getMapName($cObj, $processorConfiguration);

            $mapData = $cObj->getData($processorConfiguration['data'], $cObj->data);
            $mapArray = $mapData ? \json_decode($mapData, true) : [];
            if (isset($mapArray['areas']) && count($mapArray['areas'])) {
                if ($this->getTypoScriptFrontendController()->xhtmlDoctype !== '') {
                    // remove target attribute to have xhtml-strict output
                    $attributes = array_diff($attributes, ['target']);
                }

                $areas = [];
                foreach ($mapArray['areas'] as &$area) {
                    $areaAttributes = $area;

                    foreach ($areaAttributes as $key => $value) {
                        if (!in_array($key, $attributes)) {
                            $areaAttributes['data'][$key] = $value;
                            unset($areaAttributes[$key]);
                        }
                    }

                    $areas[] = $areaAttributes;
                }

                $processedData['imageMap'] = $areas;
                $processedData['imageMapAttributes'] = $attributes;
            }
            $processedData['imageMapName'] = $mapName;
        }
        return $processedData;
    }

    protected function getMapName(ContentObjectRenderer $cObj, array $processorConfiguration): string
    {
        $mapName = $cObj->cObjGetSingle($processorConfiguration['name'], $processorConfiguration['name.']);
        $mapName = rtrim(preg_replace('/[^a-zA-Z0-9\-_]/i', '-', $mapName), '-');
        while (!preg_match('/^[a-zA-Z]{3}/', $mapName)) {
            $mapName = chr(rand(97, 122)) . $mapName;
        }
        return $mapName;
    }

    protected function getTypoScriptFrontendController():? \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController
    {
        return $GLOBALS['TSFE'] ?? null;
    }
}
