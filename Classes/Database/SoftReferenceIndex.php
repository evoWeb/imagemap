<?php

declare(strict_types=1);

namespace Evoweb\Imagemap\Database;

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

use TYPO3\CMS\Core\LinkHandling\LinkService;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;

class SoftReferenceIndex extends \TYPO3\CMS\Core\Database\SoftReferenceIndex
{
    /**
     * Just overrides the method which normally catches all softref-types
     * In this case we already know what type it is ;)
     *
     * @param string $table
     * @param string $field
     * @param int $uid
     * @param string $content
     * @param string $spKey
     * @param array $spParams
     * @param string $structurePath
     *
     * @return array the Array which describes what references we found and where ...
     */
    public function findRef($table, $field, $uid, $content, $spKey, $spParams, $structurePath = '')
    {
        $this->tokenID_basePrefix = $table . ':' . $uid . ':' . $field . ':' . $structurePath . ':' . $spKey;
        $linkService = GeneralUtility::makeInstance(LinkService::class);
        $areas = \json_decode($content, true);

        $elements = [];
        if (is_array($areas)) {
            foreach ($areas as $key => &$area) {
                $areaString = \json_encode($area);
                if (isset($area['href'])) {
                    try {
                        $linkDetails = $linkService->resolve($area['href']);
                        if (
                            $linkDetails['type'] === LinkService::TYPE_FILE
                            && preg_match('/file\?uid=(\d+)/', $area['href'], $fileIdMatch)
                        ) {
                            $token = $this->makeTokenID($key);
                            $elements[$key]['matchString'] = $areaString;
                            $area['href'] = '{softref:' . $token . '}';
                            $elements[$key]['subst'] = [
                                'type' => 'db',
                                'recordRef' => 'sys_file:' . $fileIdMatch[1],
                                'tokenID' => $token,
                                'tokenValue' => 'file:' . (
                                    $linkDetails['file'] instanceof File ?
                                    $linkDetails['file']->getUid() :
                                    $fileIdMatch[1]
                                )
                            ];
                        } elseif (
                            $linkDetails['type'] === LinkService::TYPE_PAGE
                            && preg_match('/page\?uid=(\d+)#?(\d+)?/', $area['href'], $pageAndAnchorMatches)
                        ) {
                            $token = $this->makeTokenID($key);
                            $content = '{softref:' . $token . '}';
                            $elements[$key]['matchString'] = $areaString;
                            $elements[$key]['subst'] = [
                                'type' => 'db',
                                'recordRef' => 'pages:' . $linkDetails['pageuid'],
                                'tokenID' => $token,
                                'tokenValue' => $linkDetails['pageuid']
                            ];
                            if (isset($pageAndAnchorMatches[2]) && $pageAndAnchorMatches[2] !== '') {
                                // Anchor is assumed to point to a content elements:
                                if (MathUtility::canBeInterpretedAsInteger($pageAndAnchorMatches[2])) {
                                    // Initialize a new entry because we have a new relation:
                                    $newTokenID = $this->makeTokenID('setTypoLinkPartsElement:anchor:' . $key);
                                    $elements[$newTokenID . ':' . $key] = [];
                                    $elements[$newTokenID . ':' . $key]['matchString'] = 'Anchor Content Element: '
                                        . $pageAndAnchorMatches[2];
                                    $content .= '#{softref:' . $newTokenID . '}';
                                    $elements[$newTokenID . ':' . $key]['subst'] = [
                                        'type' => 'db',
                                        'recordRef' => 'tt_content:' . $pageAndAnchorMatches[2],
                                        'tokenID' => $newTokenID,
                                        'tokenValue' => $pageAndAnchorMatches[2]
                                    ];
                                } else {
                                    // Anchor is a hardcoded string
                                    $content .= '#' . $pageAndAnchorMatches[2];
                                }
                            }
                            $area['href'] = $content;
                        } elseif ($linkDetails['type'] === LinkService::TYPE_URL) {
                            $token = $this->makeTokenID($key);
                            $elements[$key]['matchString'] = $areaString;
                            $area['href'] = '{softref:' . $token . '}';
                            $elements[$key]['subst'] = [
                                'type' => 'external',
                                'tokenID' => $token,
                                'tokenValue' => $linkDetails['url']
                            ];
                        } elseif ($linkDetails['type'] === LinkService::TYPE_EMAIL) {
                            $token = $this->makeTokenID($key);
                            $elements[$key]['matchString'] = $areaString;
                            $area['href'] = '{softref:' . $token . '}';
                            $elements[$key]['subst'] = [
                                'type' => 'string',
                                'tokenID' => $token,
                                'tokenValue' => $linkDetails['email']
                            ];
                        } elseif ($linkDetails['type'] === LinkService::TYPE_TELEPHONE) {
                            $token = $this->makeTokenID($key);
                            $elements[$key]['matchString'] = $areaString;
                            $area['href'] = '{softref:' . $token . '}';
                            $elements[$key]['subst'] = [
                                'type' => 'string',
                                'tokenID' => $token,
                                'tokenValue' => $linkDetails['telephone']
                            ];
                        }
                    } catch (\Exception $e) {
                        // skip invalid links
                    }
                }
            }
        }

        // Return output:
        if (!empty($elements)) {
            return [
                'content' => \json_encode($areas),
                'elements' => $elements
            ];
        }

        return null;
    }
}
