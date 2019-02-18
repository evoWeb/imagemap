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

class SoftRefTest extends \TYPO3\TestingFramework\Core\Unit\UnitTestCase
{
    /**
     * @var \Evoweb\Imagemap\Service\SoftRefProc
     */
    protected $processor;

    protected function setUp()
    {
        $this->processor = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
            \Evoweb\Imagemap\Service\SoftRefProc::class
        );
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
            $this->assertEquals(true, isset($result['content']), ' \'content\'-part in array expected');
            $this->assertEquals(
                true,
                isset($result['elements']) && is_array($result['elements']),
                ' \'elements\'-part in array  as sub-array expected'
            );
        }
    }

    /**
     * @test
     */
    public function basicSoftRefsWork()
    {
        $mapContent = '<map><area coords="0,0,100,100" shape="rect">t3://page?uid=1</area></map>';
        $result = $this->processor->findRef('', '', '', $mapContent, '', [], '');

        $this->assertEquals(1, count($result['elements']), 'Wrong Reference-Count found');

        $elem = array_pop($result['elements']);
        $this->assertEquals('t3://page?uid=1', $elem['matchString'], 'Wrong Reference found');
        $this->assertEquals('string', $elem['subst']['type'], 'Wrong Reference-Type found');
        $this->assertEquals('t3://page?uid=1', $elem['subst']['tokenValue'], 'Wrong token value found');
        $this->assertContains(
            '{softref:' . $elem['subst']['tokenID'] . '}',
            $result['content'],
            'Token not found in parsed content'
        );
    }

    /**
     * @test
     */
    public function multipleSoftRefsWork()
    {
        $mapContent = '<map><area>t3://page?uid=1</area><area>t3://page?uid=2</area><area>t3://page?uid=3</area></map>';
        $result = $this->processor->findRef('', '', '', $mapContent, '', [], '');

        $this->assertEquals(3, count($result['elements']), 'Wrong Reference-Count found');

        $supposed = [
            ['t3://page?uid=1', 'string', 'pages:1'],
            ['t3://page?uid=2', 'string', 'pages:2'],
            ['t3://page?uid=3', 'string', 'pages:3'],
        ];
        $i = 0;
        foreach ($result['elements'] as $token => $elem) {
            $this->assertEquals($supposed[$i][0], $elem['matchString'], 'Wrong Reference found');
            $this->assertEquals($supposed[$i][1], $elem['subst']['type'], 'Wrong Reference-Type found');
            $this->assertEquals($supposed[$i][0], $elem['subst']['tokenValue'], 'Wrong token value found');
            $this->assertContains(
                '{softref:' . $elem['subst']['tokenID'] . '}',
                $result['content'],
                'Token (' . $i . ') not found in parsed content'
            );
            $i++;
        }
    }
}
