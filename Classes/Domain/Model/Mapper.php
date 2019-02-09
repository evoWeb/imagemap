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
        $mapping = null,
        $whitelist = [],
        $xhtml = null,
        $conf = null
    ) {
        if (is_array($whitelist)) {
            $whitelist = array_flip($whitelist);
        }
        $mapArray = self::map2array($mapping);

        $mapArray['@']['name'] = $this->createValidNameAttribute($name);
        // use id-attribute if XHTML is required see issue #2525
        // name-attribute is still required due to browser compatibility ;(
        if ($xhtml) {
            $mapArray['@']['id'] = $mapArray['@']['name'];
        }

        if (!is_array($conf) || !array_key_exists('area.', $conf)) {
            $conf = ['area.' => []];
        }

        if (is_array($mapArray['#'])) {
            foreach ($mapArray['#'] as $nodeData) {
                list($key, $node) = $nodeData;
                if (!$node['value'] && !$node['@']['href']) {
                    continue;
                }

                $reg = ['area-href' => $node['value']];
                foreach ($node['@'] as $ak => $av) {
                    $reg['area-' . $ak] = htmlspecialchars($av);
                }

                $cObj->cObjGetSingle('LOAD_REGISTER', $reg);
                $tmp = self::map2array(
                    $cObj->typolink(
                        '-',
                        $this->getTypolinkSetup(($node['value'] ? $node['value'] : $node['@']['href']), $conf['area.'])
                    ),
                    'a'
                );
                $cObj->cObjGetSingle('RESTORE_REGISTER', $reg);

                if (is_array($tmp['@'])) {
                    unset($mapArray['#'][$key]['@']['href']);
                    $mapArray['#'][$key]['@'] = array_merge(
                        array_filter($tmp['@']),
                        array_filter($mapArray['#'][$key]['@'])
                    );

                    if (is_array($whitelist)) {
                        $mapArray['#'][$key]['@'] = array_intersect_key($mapArray['#'][$key]['@'], $whitelist);
                    }
                    // Remove empty attributes
                    $mapArray['#'][$key]['@'] = array_filter($mapArray['#'][$key]['@']);
                }
                unset($mapArray['#'][$key]['value']);
            }
        }

        return (self::isEmptyMap($mapArray) ? '' : self::array2map($mapArray));
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
     * @param string $param the paramater which is used for the link-generation
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
     * Convert XML into a lightweight Array, keep Attributes, Values etc,
     * is limited to one level (no recursion) since this is enough for the imagemap
     *
     * @param string $value the XML-map
     * @param string $baseTag the Root-Tag of the resulting Array
     *
     * @return array transformed Array keys:
     *  'name'~Tagname,
     *  'value'~Tagvalue,
     *  '@'~Sub-Array with Attributes,
     *  '#'~Sub-Array with Childnodes
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
            $ret['@'] = self::getAttributesFromXMLNode($xml);
        }
        $ret['#'] = [];
        foreach ($xml->children() as $subNode) {
            $newChild = [];
            $newChild['name'] = $subNode->getName();
            if ((string)$subNode) {
                $newChild['value'] = (string)$subNode;
            }
            if (self::nodeHasAttributes($subNode)) {
                $newChild['@'] = self::getAttributesFromXMLNode($subNode);
            }
            $ret['#'][] = $newChild;
        }
        if (!count($ret['#'])) {
            unset($ret['#']);
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
    public static function array2map($value, $level = 0)
    {
        if (!$value['name'] && $level == 0) {
            $value['name'] = 'map';
        }
        $ret = null;
        if (!$value['#'] && !$value['value']) {
            $ret = '<' . $value['name'] . self::implodeXMLAttributes($value['@']) . ' />';
        } else {
            $ret = '<' . $value['name'] . self::implodeXMLAttributes($value['@']) . '>';
            if (is_array($value['#'])) {
                foreach ($value['#'] as $subNode) {
                    $ret .= self::array2map($subNode[1], $level + 1);
                }
            }
            $ret .= $value['value'];
            $ret .= '</' . $value['name'] . '>';
        }
        return $ret;
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
        return ($attr == null) ? $tmp['@attributes'] : (string)$tmp['@attributes'][$attr];
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
    protected static function implodeXMLAttributes($attributes)
    {
        $ret = '';
        if (is_array($attributes)) {
            foreach ($attributes as $key => $value) {
                $ret .= sprintf(' %s="%s"', $key, htmlspecialchars($value));
            }
        }
        return $ret;
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
            $match = $match && self::arraysMatch($a[$key], $b[$key]);
        }
        foreach ($b as $key => $value) {
            $match = $match && self::arraysMatch($b[$key], $a[$key]);
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
        return !isset($arr['#']) || count($arr['#']) == 0;
    }
}
