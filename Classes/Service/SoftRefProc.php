<?php
namespace Evoweb\Imagemap\Service;

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

class SoftRefProc extends \TYPO3\CMS\Core\Database\SoftReferenceIndex
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
    public function findRef($table, $field, $uid, $content, $spKey, $spParams, $structurePath = '')
    {
        /** @var \Evoweb\Imagemap\Domain\Model\Mapper $mapper */
        $mapper = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\Evoweb\Imagemap\Domain\Model\Mapper::class);
        $data = $mapper->map2array($content);
        $idx = 0;

        $zeroToken = $this->makeTokenID('setTypoLinkPartsElement:' . $idx) . ':0';
        $elements = [];
        if (is_array($data['#'])) {
            foreach ($data['#'] as $key => $value) {
                $tmp = $this->findRef_typolink($value['value'], $spParams);
                $linkData = $tmp['elements'][$zeroToken];

                $newToken = $this->makeTokenID('setTypoLinkPartsElement:' . $idx);
                $data['#'][$key]['value'] = str_replace($linkData['subst']['tokenID'], $newToken, $tmp['content']);
                $linkData['subst']['tokenID'] = $newToken;
                $elements[$newToken . ':' . $idx] = $linkData;
                $idx++;
            }
            reset($elements);
            reset($data['#']);
        }

        return [
            'content' => $mapper->array2map($data),
            'elements' => $elements
        ];
    }
}
