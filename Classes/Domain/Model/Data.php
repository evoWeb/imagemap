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
    protected $modified = false;

    /**
     * @var array
     */
    protected $fieldConf;

    /**
     * @var \Evoweb\Imagemap\Utility\Mapper
     */
    protected $mapper;

    /**
     * @var array
     */
    protected $map;

    /**
     * @param string $table
     * @param string $field
     * @param int $uid
     * @param mixed $currentValue
     */
    public function __construct(string $table, string $field, int $uid, $currentValue = null)
    {
        if (!in_array($table, array_keys($GLOBALS['TCA']))) {
            throw new \Exception('table (' . $table . ') not defined in TCA');
        }
        $this->table = $table;

        if (!in_array($field, array_keys($GLOBALS['TCA'][$table]['columns']))) {
            throw new \Exception('field (' . $field . ') unknown for table in TCA');
        }

        $this->mapper = GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);
        $this->mapField = $field;

        $this->row = \TYPO3\CMS\Backend\Utility\BackendUtility::getRecordWSOL($table, $uid);
        if ($currentValue) {
            $this->useCurrentData($currentValue);
        }
        $this->liveRow = $this->row;
        \TYPO3\CMS\Backend\Utility\BackendUtility::fixVersioningPid($table, $this->liveRow);

        $this->map = $this->mapper->map2array($this->getFieldValue($this->mapField));

        $this->environment = GeneralUtility::makeInstance(\Evoweb\Imagemap\Service\Environment::class);
    }

    /**
     * @param string $field
     * @param int $listNum
     *
     * @return mixed
     */
    public function getFieldValue(string $field, int $listNum = -1)
    {
        if (!is_array($this->row)) {
            return null;
        }
        if (!array_key_exists($field, $this->row)) {
            return null;
        }

        $data = $this->row[$field];
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
    public function getImageFile(int $uid)
    {
        $imageField = $this->determineImageFieldName();
        /** @var \TYPO3\CMS\Core\Resource\FileRepository $fileRepository */
        $fileRepository = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\FileRepository::class);
        /** @var \TYPO3\CMS\Core\Resource\FileReference $fileReference */
        $fileReference = current($fileRepository->findByRelation('tt_content', $imageField, $uid));
        return $fileReference ? $fileReference->getOriginalFile() : null;
    }

    public function hasValidImageFile(): bool
    {
        $uid = $this->getFieldValue('uid');
        $image = $this->getImageFile((int) $uid);
        return $uid && $image !== null && $image->exists();
    }

    /**
     * Renders the image within a frontend context
     */
    public function getImage(): string
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
    public function renderThumbnail(string $confKey, $defaultMaxWH): string
    {
        $image = $this->getImage();
        $matches = [];
        $result = '';
        if (preg_match('/width="(\d+)" height="(\d+)"/', $image, $matches)) {
            $maxSize = $this->environment->getExtConfValue($confKey, $defaultMaxWH);

            $width = intval($matches[1]);
            $height = intval($matches[2]);
            if (($width > $maxSize) && ($width >= $height)) {
                $height = ($maxSize / $width) * $height;
                $width = $maxSize;
            } elseif ($height > $maxSize) {
                $width = ($maxSize / $height) * $width;
                $height = $maxSize;
            }
            $result = preg_replace(
                '/width="(\d+)" height="(\d+)"/',
                'width="' . $width . '" height="' . $height . '"',
                $image
            );
        }
        return $result;
    }

    /**
     * Calculates the scale-factor which is required to scale down the imagemap to the thumbnail
     *
     * @param string $confKey
     * @param mixed $defaultMaxWH
     *
     * @return float
     */
    public function getThumbnailScale(string $confKey, $defaultMaxWH): float
    {
        $image = $this->getImage();
        $matches = [];
        $result = 1;
        if (preg_match('/width="(\d+)" height="(\d+)"/', $image, $matches)) {
            $maxSize = $this->environment->getExtConfValue($confKey, $defaultMaxWH);

            $width = intval($matches[1]);
            $height = intval($matches[2]);
            if (($width > $maxSize) && ($width >= $height)) {
                $result = ($maxSize / $width);
            } elseif ($height > $maxSize) {
                $result = ($maxSize / $height);
            }
        }
        return (float)$result;
    }

    public function listAreas(string $template = ''): string
    {
        $result = '';
        if (is_array($this->map['areas'])) {
            foreach ($this->map['areas'] as $area) {
                $attributes = $area['attributes'];
                $markers = [
                    '##coords##' => $attributes['coords'],
                    '##shape##' => ucfirst($attributes['shape']),
                    '##color##' => $this->convertToAttributeValue($attributes['color']),
                    '##link##' => $this->convertToAttributeValue($area['value']),
                    '##alt##' => $this->convertToAttributeValue($attributes['alt']),
                    '##attributes##' => $this->listAttributesAsSet($area),
                ];

                $result .= str_replace(array_keys($markers), array_values($markers), $template);
            }
        }
        return $result;
    }

    protected function listAttributesAsSet(array $area): string
    {
        $relAttr = $this->getAttributeKeys();
        $result = [];
        foreach ($relAttr as $key) {
            $result[] = $key . ':\''
                . $this->convertToAttributeValue(isset($area['attributes'][$key]) ? $area['attributes'][$key] : '')
                . '\'';
        }
        return implode(',', $result);
    }

    public function emptyAttributeSet(): string
    {
        $attributeKeys = $this->getAttributeKeys();
        $result = [];
        foreach ($attributeKeys as $key) {
            if ($key) {
                $result[] = $key . ':\'\'';
            }
        }
        return implode(',', $result);
    }

    protected function convertToAttributeValue(string $value): string
    {
        $attribute = preg_replace(
            '/([^\\\\])\\\\\\\\\'/',
            '\1\\\\\\\\\\\'',
            str_replace('\'', '\\\'', $value)
        );

        return $attribute;
    }

    public function getAttributeKeys(): array
    {
        $keys = GeneralUtility::trimExplode(
            ',',
            $this->environment->getExtConfValue('additionalAttributes', '')
        );
        $keys = array_diff($keys, ['alt', 'href', 'shape', 'coords']);
        $keys = array_map('strtolower', $keys);
        return array_filter($keys);
    }

    protected function getLivePid(): int
    {
        return (int) ($this->row['pid'] > 0 ? $this->row['pid'] : $this->liveRow['pid']);
    }

    protected function getLiveUid(): int
    {
        return (int)($GLOBALS['BE_USER']->workspace === 0 || $this->row['t3ver_oid'] == 0) ?
            $this->row['uid'] :
            $this->row['t3ver_oid'];
    }

    protected function determineImageFieldName(): string
    {
        return $this->getFieldConf('config/userImage/field') ?? 'image';
    }

    public function getTable(): string
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

    public function getMapField(): string
    {
        return $this->mapField;
    }

    public function getRow(): array
    {
        return $this->row;
    }

    public function getUid(): int
    {
        return (int) $this->row['uid'];
    }

    /**
     * @param mixed $value
     */
    public function useCurrentData($value)
    {
        if (!$this->mapper->compareMaps($this->getCurrentData(), $value)) {
            $this->modified = true;
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

    public function hasDirtyState(): bool
    {
        return $this->modified;
    }

    public function setFieldConf(array $fieldConf)
    {
        $this->fieldConf = $fieldConf;
    }

    /**
     * @param string $path
     *
     * @return mixed
     */
    public function getFieldConf(string $path = null)
    {
        if ($path === null) {
            return $this->fieldConf;
        }
        return \TYPO3\CMS\Core\Utility\ArrayUtility::getValueByPath($this->fieldConf, $path, '/');
    }

    public function getEnvironment(): \Evoweb\Imagemap\Service\Environment
    {
        return $this->environment;
    }

    /**
     * @return \TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController|null
     */
    protected function getTypoScriptFrontendController()
    {
        return $GLOBALS['TSFE'] ?? null;
    }
}
