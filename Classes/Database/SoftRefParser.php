<?php
namespace Evoweb\Imagemap\Database;

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

class SoftRefParser extends \TYPO3\CMS\Core\Database\SoftReferenceIndex
{
    /**
     * Just overrides the method which normally catches all softref-types
     * In this case we already know what type it is ;)
     *
     * @param string table
     * @param string field
     * @param int uid
     * @param string content
     * @param string spKey
     * @param array spParams
     * @param string structurePath
     *
     * @return array the Array which describes what references we found and where ...
     */
    public function findRef($table, $field, $uid, $content, $spKey, $spParams, $structurePath = ''): array
    {
        $this->tokenID_basePrefix = $table . ':' . $uid . ':' . $field . ':' . $structurePath . ':' . $spKey;

        /** @var \Evoweb\Imagemap\Utility\Mapper $mapper */
        $mapper = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);
        $data = $mapper->map2array($content);

        $elements = [];
        if (isset($data['areas']) && is_array($data['areas'])) {
            $index = 0;
            $zeroToken = $this->makeTokenID('setTypoLinkPartsElement:' . $index) . ':0';
            foreach ($data['areas'] as $key => $value) {
                $retVal = $this->findRef_typolink($value['value'], $spParams);
                $element = $retVal['elements'][$zeroToken];

                $indexToken = $this->makeTokenID('setTypoLinkPartsElement:' . $index);
                $data['areas'][$key]['value'] = str_replace(
                    $element['subst']['tokenID'],
                    $indexToken,
                    $retVal['content']
                );
                $element['subst']['tokenID'] = $indexToken;
                $elements[$indexToken . ':' . $index] = $element;
                $index++;
            }
            reset($elements);
            reset($data['areas']);
        }

        $resultArray = [
            'content' => $mapper->array2map($data),
            'elements' => $elements
        ];
        return $resultArray;
    }
}
