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

class Data
{
    /**
     * @var \Evoweb\Imagemap\Service\Environment
     */
    protected $environment;

    /**
     * @var array
     */
    protected $row;

    /**
     * @var array
     */
    protected $liveRow;

    /**
     * @var string
     */
    protected $table;

    /**
     * @var string
     */
    protected $mapField;

    /**
     * @var string
     */
    protected $backPath;

    /**
     * @var bool
     */
    protected $modifiedFlag = false;

    /**
     * @var array
     */
    protected $fieldConf;

    /**
     * @var array
     */
    protected $map;

    /**
     * @param string $table
     * @param string $field
     * @param int $uid
     * @param $currentValue
     */
    public function __construct($table, $field, $uid, $currentValue = null)
    {
        if (!in_array($table, array_keys($GLOBALS['TCA']))) {
            throw new \Exception('table (' . $table . ') not defined in TCA');
        }
        $this->table = $table;

        if (!in_array($field, array_keys($GLOBALS['TCA'][$table]['columns']))) {
            throw new \Exception('field (' . $field . ') unknown for table in TCA');
        }
        $this->mapField = $field;

        $this->row = \TYPO3\CMS\Backend\Utility\BackendUtility::getRecordWSOL($table, intval($uid));
        if ($currentValue) {
            $this->useCurrentData($currentValue);
        }
        $this->liveRow = $this->row;

        \TYPO3\CMS\Backend\Utility\BackendUtility::fixVersioningPid($table, $this->liveRow);
        $this->map = GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class)->map2array(
            $this->getFieldValue($this->mapField)
        );

        $this->environment = GeneralUtility::makeInstance(\Evoweb\Imagemap\Service\Environment::class);
    }

    /**
     * @param string $field
     * @param int $listNum
     *
     * @return string
     */
    public function getFieldValue($field, $listNum = -1)
    {
        if (!is_array($this->row)) {
            return null;
        }

        $dbField = $field;
        if (!array_key_exists($dbField, $this->row)) {
            return null;
        }

        $data = $this->row[$dbField];
        if ($listNum == -1) {
            return $data;
        } else {
            $tmp = preg_split('/,/', $data);
            return $tmp[$listNum];
        }
    }

    /**
     * Retrieves current image location
     * if multiple files are stored in the field only the first is recognized
     *
     * @param int $uid
     *
     * @return \TYPO3\CMS\Core\Resource\File
     */
    public function getImageFile($uid)
    {
        $imageField = $this->determineImageFieldName();
        /** @var \TYPO3\CMS\Core\Resource\FileRepository $fileRepository */
        $fileRepository = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\FileRepository::class);
        /** @var \TYPO3\CMS\Core\Resource\FileReference $fileReference */
        $fileReference = current($fileRepository->findByRelation('tt_content', $imageField, $uid));
        return $fileReference ? $fileReference->getOriginalFile() : null;
    }

    /**
     * @return bool
     */
    public function hasValidImageFile()
    {
        $uid = (int) $this->getFieldValue('uid');
        $image = $this->getImageFile($uid);
        return $uid && $image !== null && $image->exists();
    }

    /**
     * Renders the image within a frontend-like context
     *
     * @return string
     */
    public function getImage()
    {
        $this->environment->initializeTSFE($this->getLivePid());
        $cObj = $this->getTypoScriptFrontendController()->cObj;

        $conf = [
            'table' => $this->table,
            'select.' => [
                'uidInList' => $this->getLiveUid(),
                'pidInList' => $this->getLivePid(),
            ],
        ];

        // render like in FE with WS-preview etc...
        $this->environment->pushEnvironment();
        $this->environment->prepareEnvironment(PATH_site);
        $this->environment->resetEnableColumns('pages');
        $this->environment->resetEnableColumns($this->table);
        $cObj->cObjGetSingle('LOAD_REGISTER', ['keepUsemapMarker' => '1']);
        $result = $cObj->cObjGetSingle('CONTENT', $conf);
        $this->environment->popEnvironment();

        // extract the image
        $matches = [];
        if (!preg_match('/(<img[^>]+usemap="#[^"]+"[^>]*\/>)/', $result, $matches)) {
            return 'No Image rendered from TSFE. :(<br/>Error was:' . $this->environment->getLastError();
        }
        $result = str_replace('src="', 'src="' . $this->environment->getBackPath(), $matches[1]);
        return $result;
    }

    /**
     * Renders a thumbnail with preconfigured dimensions
     *
     * @param string $confKey
     * @param mixed $defaultMaxWH
     *
     * @return string
     */
    public function renderThumbnail($confKey, $defaultMaxWH)
    {
        $maxSize = $this->environment->getExtConfValue($confKey, $defaultMaxWH);
        $img = $this->getImage();
        $matches = [];
        if (preg_match('/width="(\d+)" height="(\d+)"/', $img, $matches)) {
            $width = intval($matches[1]);
            $height = intval($matches[2]);
            if (($width > $maxSize) && ($width >= $height)) {
                $height = ($maxSize / $width) * $height;
                $width = $maxSize;
            } elseif ($height > $maxSize) {
                $width = ($maxSize / $height) * $width;
                $height = $maxSize;
            }
            return preg_replace(
                '/width="(\d+)" height="(\d+)"/',
                'width="' . $width . '" height="' . $height . '"',
                $img
            );
        } else {
            return '';
        }
    }

    /**
     * Calculates the scale-factor which is required to scale down the imagemap to the thumbnail
     *
     * @param string $confKey
     * @param mixed $defaultMaxWH
     *
     * @return float
     */
    public function getThumbnailScale($confKey, $defaultMaxWH)
    {
        $maxSize = $this->environment->getExtConfValue($confKey, $defaultMaxWH);
        $img = $this->getImage();
        $matches = [];
        $ret = 1;
        if (preg_match('/width="(\d+)" height="(\d+)"/', $img, $matches)) {
            $width = intval($matches[1]);
            $height = intval($matches[2]);
            if (($width > $maxSize) && ($width >= $height)) {
                $ret = ($maxSize / $width);
            } elseif ($height > $maxSize) {
                $ret = ($maxSize / $height);
            }
        }
        return $ret;
    }

    /**
     * @param string $template
     *
     * @return string
     */
    public function listAreas($template = '')
    {
        if (!is_array($this->map['areas'])) {
            return '';
        }
        $result = '';
        foreach ($this->map['areas'] as $area) {
            $attributes = $area['attributes'];
            $markers = [
                '##coords##' => $attributes['coords'],
                '##shape##' => ucfirst($attributes['shape']),
                '##color##' => $this->attributize($attributes['color']),
                '##link##' => $this->attributize($area['value']),
                '##alt##' => $this->attributize($attributes['alt']),
                '##attributes##' => $this->listAttributesAsSet($area),
            ];

            $result .= str_replace(array_keys($markers), array_values($markers), $template);
        }
        return $result;
    }

    /**
     * @param array $area
     *
     * @return string
     */
    protected function listAttributesAsSet($area)
    {
        $relAttr = $this->getAttributeKeys();
        $ret = [];
        foreach ($relAttr as $key) {
            $ret[] = $key . ':\''
                . $this->attributize(isset($area['attributes'][$key]) ? $area['attributes'][$key] : '') . '\'';
        }
        return implode(',', $ret);
    }

    /**
     * @return string
     */
    public function emptyAttributeSet()
    {
        $relAttr = $this->getAttributeKeys();
        $ret = [];
        foreach ($relAttr as $key) {
            if ($key) {
                $ret[] = $key . ':\'\'';
            }
        }
        return implode(',', $ret);
    }

    /**
     * @param string $v
     *
     * @return string
     */
    protected function attributize($v)
    {
        $attr = preg_replace(
            '/([^\\\\])\\\\\\\\\'/',
            '\1\\\\\\\\\\\'',
            str_replace('\'', '\\\'', $v)
        );

        return $attr;
    }

    /**
     * @return array
     */
    public function getAttributeKeys()
    {
        $keys = GeneralUtility::trimExplode(
            ',',
            $this->environment->getExtConfValue('additionalAttributes', '')
        );
        $keys = array_diff($keys, ['alt', 'href', 'shape', 'coords']);
        $keys = array_map('strtolower', $keys);
        return array_filter($keys);
    }

    /**
     * @return int
     */
    protected function getLivePid()
    {
        return (int) ($this->row['pid'] > 0 ? $this->row['pid'] : $this->liveRow['pid']);
    }

    /**
     * @return int
     */
    protected function getLiveUid()
    {
        return ($GLOBALS['BE_USER']->workspace === 0 || $this->row['t3ver_oid'] == 0) ?
            $this->row['uid'] :
            $this->row['t3ver_oid'];
    }

    /**
     * @return string
     */
    protected function determineImageFieldName()
    {
        $imgField = $this->getFieldConf('config/userImage/field') ?? 'image';
        return $imgField;
    }

    /**
     * @return string
     */
    public function getTable()
    {
        return $this->table;
    }

    /**
     * @return array
     */
    public function getMap()
    {
        return $this->map;
    }

    /**
     * @return string
     */
    public function getMapField()
    {
        return $this->mapField;
    }

    /**
     * @return array
     */
    public function getRow()
    {
        return $this->row;
    }

    /**
     * @return int
     */
    public function getUid()
    {
        return (int) $this->row['uid'];
    }

    /**
     * @param $value
     */
    public function useCurrentData($value)
    {
        $cur = $this->getCurrentData();
        if (!GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class)->compareMaps($cur, $value)) {
            $this->modifiedFlag = true;
        }

        $this->row[$this->mapField] = $value;
    }

    /**
     * @return string
     */
    public function getCurrentData()
    {
        return $this->row[$this->mapField];
    }

    /**
     * @return boolean
     */
    public function hasDirtyState()
    {
        return $this->modifiedFlag;
    }

    /**
     * @param array $fieldConf
     */
    public function setFieldConf($fieldConf)
    {
        $this->fieldConf = $fieldConf;
    }

    /**
     * @param string $subKey
     *
     * @return array
     */
    public function getFieldConf($subKey = null)
    {
        if ($subKey == null) {
            return $this->fieldConf;
        }
        $tools = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Configuration\FlexForm\FlexFormTools::class);
        return $tools->getArrayValueByPath($subKey, $this->fieldConf);
    }

    /**
     * @return \Evoweb\Imagemap\Service\Environment
     */
    public function getEnvironment()
    {
        return $this->environment;
    }

    /**
     * @return \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController
     */
    protected function getTypoScriptFrontendController()
    {
        return $GLOBALS['TSFE'];
    }
}
