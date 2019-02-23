<?php
declare(strict_types = 1);

namespace Evoweb\Imagemap\Utility;

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

class Mapper
{
    /**
     * Generate a HTML-Imagemap using Typolink etc..
     *
     * @param \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer $cObj we used for generating the Links
     * @param string $name Name of the generated map
     * @param string $mapping mapping the XML_pseudo-imagemap
     * @param array $whitelist
     * @param bool $xhtml
     * @param array $conf
     *
     * @return string the valid HTML-imagemap
     */
    public function generateMap(
        \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer &$cObj,
        string $name,
        string $mapping = '',
        array $whitelist = [],
        bool $xhtml = false,
        array $conf = null
    ): string {
        if (is_array($whitelist)) {
            $whitelist = array_flip($whitelist);
        }
        $mapArray = $this->map2array($mapping);

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
                $tmp = $this->map2array(
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

        return $this->isEmptyMap($mapArray) ? '' : $this->array2map($mapArray);
    }

    /**
     * Encapsulates the creation of valid HTML-imagemap-names
     *
     * @param string value
     *
     * @return string transformed value
     */
    public function createValidNameAttribute(string $value): string
    {
        if (!preg_match('/\S+/', $value)) {
            $value = \TYPO3\CMS\Core\Utility\GeneralUtility::shortMD5(rand(0, 100));
        }

        // replace any special character with an dash and remove trailing dashes
        $name = rtrim(preg_replace('/[^a-zA-Z0-9\-_]/i', '-', $value), '-');
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
    protected function getTypolinkSetup(string $param, array $conf = null): array
    {
        $result = ['parameter.' => ['wrap' => $param]];
        if (is_array($conf) && array_key_exists('typolink.', $conf) && is_array($conf['typolink.'])) {
            $result = array_merge($result, $conf['typolink.']);
        }
        return $result;
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
    public function map2array($value, $baseTag = 'map'): array
    {
        $result = ['name' => $baseTag];

        if (!is_string($value) || !strlen($value)) {
            $value = '<map></map>';
        }
        if (!($xml = @simplexml_load_string($value))) {
            return $result;
        }
        if (!($xml->getName() == $baseTag)) {
            return $result;
        }
        if ($this->nodeHasAttributes($xml)) {
            $result['attributes'] = $this->getAttributesFromXMLNode($xml);
        }

        $result['areas'] = [];
        foreach ($xml->children() as $subNode) {
            $newChild = [];
            $newChild['name'] = $subNode->getName();
            if ((string)$subNode) {
                $newChild['value'] = (string)$subNode;
            }
            if ($this->nodeHasAttributes($subNode)) {
                $newChild['attributes'] = $this->getAttributesFromXMLNode($subNode);
            }
            $result['areas'][] = $newChild;
        }
        if (!count($result['areas'])) {
            unset($result['areas']);
        }
        return $result;
    }

    /**
     * Convert a PHP-Array into a XML-Structure
     *
     * @param array $value a Array which uses the same notation as described above
     * @param int $level counting the current level for recursion...
     *
     * @return string XML-String
     */
    public function array2map(array $value, int $level = 0): string
    {
        if ($level == 0 && (!isset($value['name']) || !$value['name'])) {
            $value['name'] = 'map';
        }

        if ((!isset($value['areas']) || !$value['areas']) && (!isset($value['value']) || !$value['value'])) {
            $result = '<' . $value['name'] . $this->implodeXMLAttributes($value['attributes'] ?? []) . ' />';
        } else {
            $result = '<' . $value['name'] . $this->implodeXMLAttributes($value['attributes'] ?? []) . '>';
            if (isset($value['areas']) && is_array($value['areas'])) {
                foreach ($value['areas'] as $subNode) {
                    $result .= $this->array2map($subNode, $level + 1);
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
    public function compareMaps(string $map1, string $map2): bool
    {
        return $this->arraysMatch(
            $this->map2array($map1),
            $this->map2array($map2)
        );
    }

    /**
     * Encapsulate the extraction of Attributes out of the SimpleXML-Structure
     *
     * @param \SimpleXMLElement $node
     * @param string $name determines if a single attributes should be extracted
     *
     * @return mixed Extracted attribute(s)
     *
     */
    protected function getAttributesFromXMLNode($node, string $name = null)
    {
        $attributes = (array)$node->attributes();
        return isset($attributes['@attributes']) ?
            ($name === null ? $attributes['@attributes'] : (string)$attributes['@attributes'][$name]) :
            '';
    }

    /**
     * Check if a node has any attributes or not
     *
     * @param \SimpleXMLElement $node
     *
     * @return bool
     */
    protected function nodeHasAttributes($node): bool
    {
        return is_array($this->getAttributesFromXMLNode($node));
    }

    /**
     * Combines a array of attributes into a HTML-conform list
     *
     * @param array $attributes
     *
     * @return string
     */
    protected function implodeXMLAttributes(array $attributes): string
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
    protected function arraysMatch($a, $b): bool
    {
        if (!is_array($a) || !is_array($b)) {
            return $a == $b;
        }

        $match = true;
        foreach ($a as $key => $value) {
            $match = $match && $this->arraysMatch($a[$key] ?? [], $b[$key] ?? []);
        }
        foreach ($b as $key => $value) {
            $match = $match && $this->arraysMatch($b[$key] ?? [], $a[$key] ?? []);
        }
        return $match;
    }

    /**
     * Check whether a given string is a valid imagemap
     * the check is not very robust so far but it resolves all required situations (see unit-tests)
     *
     * @param array|string $map the value which is supposed to be a imagemap
     *
     * @return bool determine whether the valued passed the test or not
     */
    public function isEmptyMap($map): bool
    {
        $arr = is_array($map) ? $map : $this->map2array($map);
        return !isset($arr['areas']) || count($arr['areas']) == 0;
    }
}
