<?php
namespace Evoweb\Imagemap\Tests;

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

class MappingsTest extends \TYPO3\TestingFramework\Core\Functional\FunctionalTestCase
{
    /**
     * @var array
     */
    protected $testExtensionsToLoad = ['typo3conf/ext/imagemap'];

    /**
     * @var \Evoweb\Imagemap\Utility\Mapper
     */
    protected $mapper;

    /**
     * @var \TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer|\PHPUnit\Framework\MockObject\MockObject
     */
    protected $cObj;

    protected function setUp()
    {
        parent::setUp();
        $this->importDataSet(__DIR__ . '/../Fixtures/pages.xml');
        $this->importDataSet(__DIR__ . '/../Fixtures/sys_template.xml');

        $this->mapper = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\Evoweb\Imagemap\Utility\Mapper::class);
        $this->cObj = $this->getMockBuilder(\TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer::class)
            ->setMethods(['typoLink', 'LOAD_REGISTER'])
            ->getMock();
    }

    protected function tearDown()
    {
        unset($this->mapper);
    }

    /**
     * @test
     */
    public function creatingEmptyMap()
    {
        $this->cObj
            ->expects($this->never())
            ->method('typoLink');

        $supposedOutput = '';
        $this->assertEquals(
            $supposedOutput,
            $this->mapper->generateMap($this->cObj, 'testname'),
            'Empty Map is not created as supposed'
        );
        $this->assertEquals(
            $supposedOutput,
            $this->mapper->generateMap($this->cObj, 'testname', []),
            'Empty Map is not created as supposed'
        );
    }

    /**
     * @test
     */
    public function emptyMapNameDoesntHurt()
    {
        $input = '<map></map>';
        $this->assertEquals(
            '',
            $this->mapper->generateMap($this->cObj, '', $input),
            'Empty Map-Name inputs are not processed as supposed'
        );
    }

    /**
     * @test
     */
    public function creatingValidMapNames()
    {
        $strings = ['test name', 'test näme', 'ÄÖÜ..', '1234', 'おはようございます'];

        $regExAttr = '/^[a-zA-Z][a-zA-Z0-9\-_]+[a-zA-Z0-9]$/i';
        foreach ($strings as $key => $string) {
            $this->assertEquals(
                1,
                preg_match($regExAttr, $this->mapper->createValidNameAttribute($string)),
                'Attribute (' . $key . ') is not cleaned as supposed...['
                . $this->mapper->createValidNameAttribute($string) . ']'
            );
        }
    }

    /**
     * @test
     */
    public function creatingSimpleRectMap()
    {
        $this->cObj
            ->expects($this->atLeastOnce())
            ->method('typoLink')
            ->will($this->returnValue('<a href="http://www.foo.org" title="tt">text</a>'));

        $input = '<map><area shape="rect">1</area></map>';
        $output = '<map name="test"><area href="http://www.foo.org" title="tt" shape="rect" /></map>';
        $this->assertEquals(
            $output,
            $this->mapper->generateMap($this->cObj, 'test', $input, ['href', 'title', 'shape']),
            'Generator Output looks not as supposed'
        );
    }

    /**
     * @test
     */
    public function creatingMapGeneratorKeepsIndividualAttributes()
    {
        $this->cObj
            ->expects($this->atLeastOnce())
            ->method('typoLink')
            ->will($this->returnValue('<a href="http://www.foo.org" title="tt">text</a>'));

        $input = '<map><area shape="rect" title="individual title" xyz="1">1</area></map>';
        $output = '<map name="test"><area href="http://www.foo.org" '
            . 'title="individual title" shape="rect" xyz="1" /></map>';
        $this->assertEquals(
            $output,
            $this->mapper->generateMap($this->cObj, 'test', $input, ['href', 'title', 'shape', 'xyz']),
            'Individual Attributes are lost after Generation'
        );
    }

    /**
     * @test
     */
    public function creatingMapRemovesEmptyAttributes()
    {
        $this->cObj
            ->expects($this->atLeastOnce())
            ->method('typoLink')
            ->will($this->returnValue('<a href="http://www.foo.org" title="tt">text</a>'));

        $input = '<map><area shape="rect" title="individual title" xyz="">1</area></map>';
        $output = '<map name="test"><area href="http://www.foo.org" title="individual title" shape="rect" /></map>';
        $this->assertEquals(
            $output,
            $this->mapper->generateMap($this->cObj, 'test', $input, ['href', 'title', 'shape', 'xyz']),
            'Empty Attribute should be removed during Generation'
        );
    }

    /**
     * @test
     */
    public function creatingMapGeneratorAcceptsAttributeWhitelist()
    {
        $this->cObj
            ->expects($this->atLeastOnce())
            ->method('typoLink')
            ->will($this->returnValue('<a href="http://www.foo.org" title="tt">text</a>'));

        $whitelist = ['href', 'shape'];

        $input = '<map><area shape="rect" title="individual title" xyz="1">1</area></map>';
        $output = '<map name="test"><area href="http://www.foo.org" shape="rect" /></map>';
        $this->assertEquals(
            $output,
            $this->mapper->generateMap($this->cObj, 'test', $input, $whitelist),
            'Individual Attributes are lost after Generation'
        );
    }

    /**
     * @test
     */
    public function creatingMapUsingHrefAttrIfNoValueExists()
    {
        $this->cObj
            ->expects($this->atLeastOnce())
            ->method('typoLink')
            ->will($this->returnValue('<a href="http://www.foo.org">text</a>'));

        // stupid href-value but this proves that the typoLink-function is really used
        $input = '<map><area href="1" shape="rect" /></map>';
        $output = '<map name="test"><area href="http://www.foo.org" shape="rect" /></map>';
        $this->assertEquals(
            $output,
            $this->mapper->generateMap($this->cObj, 'test', $input, ['href', 'shape']),
            'Href-Attribute is not recognized for the area-link creation.'
        );
    }

    /**
     * @test
     */
    public function xhtmlSwitchWorks()
    {
        $input = '<map><area href="1" shape="rect" /></map>';
        $name = 'testname';
        $htmlOutput = '<map name="' . $name . '"><area href="1" shape="rect" /></map>';
        $xhtmlOutput = '<map  id="' . $name . '" name="' . $name . '"><area href="1" shape="rect" /></map>';
        $this->assertEquals(
            true,
            $this->mapper->compareMaps($htmlOutput, $this->mapper->generateMap($this->cObj, $name, $input, [], false)),
            ' HTML mapname is not generated as supposed'
        );
        $this->assertEquals(
            true,
            $this->mapper->compareMaps($xhtmlOutput, $this->mapper->generateMap($this->cObj, $name, $input, [], true)),
            ' XHTML mapname is not generated as supposed'
        );
    }

    /**
     * @test
     */
    public function simpleComparingWorks()
    {
        $map1 = '<map><area>1</area></map>';
        $map2 = '<map><area>2</area></map>';

        $this->assertEquals(
            true,
            $this->mapper->compareMaps($map1, $map1),
            'Equal maps are not recognized when compared...'
        );
        $this->assertEquals(
            false,
            $this->mapper->compareMaps($map1, $map2),
            'Different maps are not recognized when compared...'
        );
    }

    /**
     * @test
     */
    public function complexerComparingWithVariousAttributeOrderWorks()
    {
        $map1 = '<map><area coords="abc" shape="circle">1</area></map>';
        $map2 = '<map><area shape="circle" coords="abc">1</area></map>';

        $this->assertEquals(
            true,
            $this->mapper->compareMaps($map1, $map2),
            'Equal maps are not recognized when compared...'
        );
    }

    /**
     * @test
     */
    public function compairingDifferentStructures()
    {
        $map1 = '<map></map>';
        $map2 = '<map><area xxx="abc" color="green">1</area></map>';
        $map3 = '<map attr="value" />';

        $this->assertEquals(
            false,
            $this->mapper->compareMaps($map1, $map2),
            'Different structured maps are not processed as supposed'
        );
        $this->assertEquals(
            false,
            $this->mapper->compareMaps($map1, $map3),
            'Different structured maps are not processed as supposed'
        );
        $this->assertEquals(
            false,
            $this->mapper->compareMaps($map2, $map3),
            'Different structured maps are not processed as supposed'
        );
    }

    /**
     * @test
     */
    public function detectEmptyMaps()
    {
        $map1 = '<map></map>';
        $map2 = '<map><area xxx="abc" color="green">1</area></map>';
        $map3 = '<map attr="value" />';

        $this->assertEquals(true, $this->mapper->isEmptyMap($map1), 'Empty map1 is  not recognized.');
        $this->assertEquals(false, $this->mapper->isEmptyMap($map2), 'Map2 is recognized to be empty by mistake.');
        $this->assertEquals(true, $this->mapper->isEmptyMap($map3), 'Empty map3 is  not recognized.');
        $this->assertEquals(true, $this->mapper->isEmptyMap(''), 'Empty string is  not recognized.');
    }
}
