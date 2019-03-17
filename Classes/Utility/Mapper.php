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

namespace Evoweb\Imagemap\Utility;

class Mapper
{
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
            \json_decode($map1),
            \json_decode($map2)
        );
    }

    /**
     * Encapsulate the extraction of Attributes out of the SimpleXML-Structure
     *
     * @param \SimpleXMLElement $node
     * @param string $name determines if a single attributes should be extracted
     *
     * @return mixed Extracted attribute(s)
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
}
