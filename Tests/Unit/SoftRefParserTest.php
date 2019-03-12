<?php

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

namespace Evoweb\Imagemap\Tests;

class SoftRefParserTest extends \TYPO3\TestingFramework\Core\Unit\UnitTestCase
{
    /**
     * @var \Evoweb\Imagemap\Database\SoftRefParser|\PHPUnit\Framework\MockObject\MockObject
     */
    protected $processor;

    protected function setUp()
    {
        $this->processor = $this->getMockBuilder(\Evoweb\Imagemap\Database\SoftRefParser::class)
            ->setMethods(['getTypoLinkParts'])
            ->getMock();
    }

    protected function tearDown()
    {
        unset($this->processor);
    }

    /**
     * @test
     */
    public function emptySoftRefsWork()
    {
        $emptyStrings = ['', '<map></map>'];

        foreach ($emptyStrings as $str) {
            $result = $this->processor->findRef('', '', '', $str, '', [], '');
            $this->assertEquals(true, is_array($result), 'array expected');
            $this->assertEquals(true, isset($result['content']), '"content"-part in array expected');
            $this->assertEquals(
                true,
                isset($result['elements']) && is_array($result['elements']),
                '"elements"-part in array as sub-array expected'
            );
        }
    }

    /**
     * @test
     */
    public function basicSoftRefsWork()
    {
        $this->processor
            ->expects($this->any())
            ->method('getTypoLinkParts')
            ->will($this->returnCallback([$this, 'getTypoLinkPartsCallback']));

        $mapContent = '<map><area coords="0,0,100,100" shape="rect">t3://page?uid=1</area></map>';
        $result = $this->processor->findRef('', '', '', $mapContent, '', [], '');

        $this->assertEquals(1, count($result['elements']), 'Wrong Reference-Count found');

        $element = array_pop($result['elements']);
        $this->assertEquals('t3://page?uid=1', $element['matchString'], 'Wrong Reference found');
        $this->assertEquals('string', $element['subst']['type'], 'Wrong Reference-Type found');
        $this->assertEquals('t3://page?uid=1', $element['subst']['tokenValue'], 'Wrong token value found');
        $this->assertContains(
            '{softref:' . $element['subst']['tokenID'] . '}',
            $result['content'],
            'Token not found in parsed content'
        );
    }

    /**
     * @test
     */
    public function multipleSoftRefsWork()
    {
        $this->processor
            ->expects($this->any())
            ->method('getTypoLinkParts')
            ->will($this->returnCallback([$this, 'getTypoLinkPartsCallback']));

        $mapContent = '<map><area>t3://page?uid=1</area><area>t3://page?uid=2</area><area>t3://page?uid=3</area></map>';
        $result = $this->processor->findRef('', '', '', $mapContent, '', [], '');

        $this->assertEquals(3, count($result['elements']), 'Wrong Reference-Count found');

        $supposed = [
            't3://page?uid=1',
            't3://page?uid=2',
            't3://page?uid=3',
        ];
        $index = 0;
        foreach ($result['elements'] as $token => $element) {
            $this->assertEquals('string', $element['subst']['type'], 'Wrong Reference-Type found');
            $this->assertEquals($supposed[$index], $element['matchString'], 'Wrong Reference found');
            $this->assertEquals($supposed[$index], $element['subst']['tokenValue'], 'Wrong token value found');
            $this->assertContains(
                '{softref:' . $element['subst']['tokenID'] . '}',
                $result['content'],
                'Token (' . $index . ') not found in parsed content'
            );
            $index++;
        }
    }

    public function getTypoLinkPartsCallback($typolinkValue)
    {
        return [
            'target' => '',
            'class' => '',
            'title' => '',
            'additionalParams' => '',
            'LINK_TYPE' => 'url',
            'url' => $typolinkValue,
        ];
    }
}
