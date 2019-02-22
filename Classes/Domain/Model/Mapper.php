<?php
namespace Evoweb\Imagemap\Domain\Model;

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

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

class Mapper
{
    /**
     * Generate a HTML-Imagemap using Typolink etc..
     *
     * @param ContentObjectRenderer $cObj cObj cObject we used for genenerating the Links
     * @param string $name Name of the generated map
     * @param string $mapping mapping the XML_pseudo-imagemap
     * @param array $whitelist
     * @param boolean $xhtml
     * @param array $conf
     *
     * @return string the valid HTML-imagemap (hopefully valid)
     */
    public function generateMap(
        ContentObjectRenderer &$cObj,
        $name,
        $mapping = '',
        $whitelist = [],
        $xhtml = false,
        $conf = null
    ) {
        if (is_array($whitelist)) {
            $whitelist = array_flip($whitelist);
        }
        $mapArray = self::map2array($mapping);

        $mapArray['attributes']['name'] = $this->createValidNameAttribute($name);
        // name-attribute is still required due to browser compatibility ;(
        if ($xhtml) {
            $mapArray['attributes']['id'] = $mapArray['attributes']['name'];
        }

        if (!is_array($conf) || !isset($conf['area.'])) {
            $conf = ['area.' => []];
        }

        if (isset($mapArray['areas']) && is_array($mapArray['areas'])) {
            foreach ($mapArray['areas'] as $key => $node) {
                if ((!isset($node['value']) || !$node['value']) && !$node['attributes']['href']) {
                    continue;
                }

                $reg = ['area-href' => $node['value'] ?? ''];
                foreach ($node['attributes'] as $ak => $av) {
                    $reg['area-' . $ak] = htmlspecialchars($av);
                }

                $cObj->cObjGetSingle('LOAD_REGISTER', $reg);
                $tmp = self::map2array(
                    $cObj->typolink(
                        '-',
                        $this->getTypolinkSetup(
                            $node['value'] ? $node['value'] : $node['attributes']['href'],
                            $conf['area.']
                        )
                    ),
                    'a'
                );
                $cObj->cObjGetSingle('RESTORE_REGISTER', $reg);

                if (is_array($tmp['attributes'])) {
                    unset($mapArray['areas'][$key]['attributes']['href']);
                    $mapArray['areas'][$key]['attributes'] = array_merge(
                        array_filter($tmp['attributes']),
                        array_filter($mapArray['areas'][$key]['attributes'])
                    );

                    if (is_array($whitelist)) {
                        $mapArray['areas'][$key]['attributes'] = array_intersect_key(
                            $mapArray['areas'][$key]['attributes'],
                            $whitelist
                        );
                    }
                    // Remove empty attributes
                    $mapArray['areas'][$key]['attributes'] = array_filter($mapArray['areas'][$key]['attributes']);
                }
                unset($mapArray['areas'][$key]['value']);
            }
        }

        return self::isEmptyMap($mapArray) ? '' : self::array2map($mapArray);
    }

    /**
     * Encapsulates the creation of valid HTML-imagemap-names
     *
     * @param string value
     *
     * @return string transformed value
     */
    public function createValidNameAttribute($value)
    {
        if (!preg_match('/\S+/', $value)) {
            $value = GeneralUtility::shortMD5(rand(0, 100));
        }

        // replace any special character with an dash and remove trailing dashes
        $name = preg_replace('/[^a-zA-Z0-9\-_]/i', '-', $value);
        $name = rtrim($name, '-');

        while (!preg_match('/^[a-zA-Z]{3}/', $name)) {
            $name = chr(rand(97, 122)) . $name;
        }
        return $name;
    }

    /**
     * Encapsulates the creation of a valid typolink-conf array
     *
     * @param string $param the parameter which is used for the link-generation
     * @param array $conf
     *
     * @return array typolink-conf array
     */
    protected function getTypolinkSetup($param, $conf = null)
    {
        $ret = ['parameter.' => ['wrap' => $param]];
        if (is_array($conf) && array_key_exists('typolink.', $conf) && is_array($conf['typolink.'])) {
            $ret = array_merge($ret, $conf['typolink.']);
        }
        return $ret;
    }

    /**
     * Convert XML into an array, keep attributes, values etc,
     * is limited to one level (no recursion) since this is enough for the image maps
     *
     * @param string $value the XML-map
     * @param string $baseTag the Root-Tag of the resulting Array
     *
     * @return array transformed Array keys:
     *  'name' string tag name
     *  'value' string tag value
     *  'attributes' array with attributes
     *  'areas' array with child nodes
     */
    public static function map2array($value, $baseTag = 'map')
    {
        if (!is_string($value) || !strlen($value)) {
            $value = '<map></map>';
        }
        $ret = ['name' => $baseTag];
        if (!($xml = @simplexml_load_string($value))) {
            return $ret;
        }

        if (!($xml->getName() == $baseTag)) {
            return $ret;
        }

        if (self::nodeHasAttributes($xml)) {
            $ret['attributes'] = self::getAttributesFromXMLNode($xml);
        }
        $ret['areas'] = [];
        foreach ($xml->children() as $subNode) {
            $newChild = [];
            $newChild['name'] = $subNode->getName();
            if ((string)$subNode) {
                $newChild['value'] = (string)$subNode;
            }
            if (self::nodeHasAttributes($subNode)) {
                $newChild['attributes'] = self::getAttributesFromXMLNode($subNode);
            }
            $ret['areas'][] = $newChild;
        }
        if (!count($ret['areas'])) {
            unset($ret['areas']);
        }
        return $ret;
    }

    /**
     * Convert a PHP-Array into a XML-Structure
     *
     * @param array $value a Array which uses the same notation as described above
     * @param int $level counting the current level for recursion...
     *
     * @return string XML-String
     */
    public static function array2map(array $value, $level = 0)
    {
        if ($level == 0 && (!isset($value['name']) || !$value['name'])) {
            $value['name'] = 'map';
        }

        if ((!isset($value['areas']) || !$value['areas']) && (!isset($value['value']) || !$value['value'])) {
            $result = '<' . $value['name'] . self::implodeXMLAttributes($value['attributes'] ?? []) . ' />';
        } else {
            $result = '<' . $value['name'] . self::implodeXMLAttributes($value['attributes'] ?? []) . '>';
            if (isset($value['areas']) && is_array($value['areas'])) {
                foreach ($value['areas'] as $subNode) {
                    $result .= self::array2map($subNode, $level + 1);
                }
            }
            if (isset($value['value'])) {
                $result .= $value['value'];
            }
            $result .= '</' . $value['name'] . '>';
        }
        return $result;
    }

    /**
     * compare two maps
     *
     * @param string $map1 first imagemap
     * @param string $map2 second imagemap
     *
     * @return bool determines whether the maps match or not
     */
    public function compareMaps($map1, $map2)
    {
        $arrayMap1 = self::map2array($map1);
        $arrayMap2 = self::map2array($map2);
        return self::arraysMatch($arrayMap1, $arrayMap2);
    }

    /**
     * Encapsulate the extraction of Attributes out of the SimpleXML-Structure
     *
     * @param \SimpleXMLElement $node
     * @param string $attr determines if a single of (if empty) all attributes should be extracted
     *
     * @return mixed Extracted attribute(s)
     *
     */
    protected static function getAttributesFromXMLNode($node, $attr = null)
    {
        $tmp = (array)$node->attributes();
        return isset($tmp['@attributes']) ?
            (($attr == null) ? $tmp['@attributes'] : (string)$tmp['@attributes'][$attr]) :
            '';
    }

    /**
     * Check whether a node has any attributes or not
     *
     * @param \SimpleXMLElement $node
     *
     * @return bool
     */
    protected static function nodeHasAttributes($node)
    {
        return is_array(self::getAttributesFromXMLNode($node));
    }

    /**
     * Combines a array of attributes into a HTML-conform list
     *
     * @param array $attributes
     *
     * @return string
     */
    protected static function implodeXMLAttributes(array $attributes)
    {
        $result = '';
        foreach ($attributes as $key => $value) {
            $result .= sprintf(' %s="%s"', $key, htmlspecialchars($value));
        }
        return $result;
    }

    /**
     * compare two element recursive and check whether the content of both match
     * order of elements is not important, just that every content related to a
     * key is matching within these arrays
     *
     * @param array $a first element
     * @param array $b second element
     *
     * @return bool determine whether elements match of not
     */
    protected static function arraysMatch($a, $b)
    {
        if (!is_array($a) || !is_array($b)) {
            return $a == $b;
        }
        $match = true;
        foreach ($a as $key => $value) {
            $match = $match && self::arraysMatch($a[$key] ?? [], $b[$key] ?? []);
        }
        foreach ($b as $key => $value) {
            $match = $match && self::arraysMatch($b[$key] ?? [], $a[$key] ?? []);
        }
        return $match;
    }

    /**
     * check whether a given string is a valid imagemap
     * the check is not very robust so far but it resolves all required situations (see unit-tests)
     *
     * @param array|string $map the value which is supposed to be a imagemap
     *
     * @return bool determine whether the valued passed the test or not
     */
    public static function isEmptyMap($map)
    {
        $arr = is_array($map) ? $map : self::map2array($map);
        return !isset($arr['areas']) || count($arr['areas']) == 0;
    }
}
