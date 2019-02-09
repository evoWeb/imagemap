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
        $mapContent = '<map><area coords="0,0,100,100" shape="rect">1</area></map>';
        $result = $this->processor->findRef('', '', '', $mapContent, '', [], '');

        $this->assertEquals(1, count($result['elements']), 'Wrong Reference-Count found');

        $elem = array_pop($result['elements']);
        $this->assertEquals(
            true,
            stristr($result['content'], '{softref:' . $elem['subst']['tokenID'] . '}'),
            'Token not found in parsed content'
        );
        $this->assertEquals('1', $elem['matchString'], 'Wrong Reference found');
        $this->assertEquals('db', $elem['subst']['type'], 'Wrong Reference-Type found');
        $this->assertEquals('pages:1', $elem['subst']['recordRef'], 'Wrong Reference-Records found');
    }

    /**
     * @test
     */
    public function multipleSoftRefsWork()
    {
        $mapContent = '<map><area>1</area><area>2</area><area>3</area></map>';
        $result = $this->processor->findRef('', '', '', $mapContent, '', [], '');

        $this->assertEquals(3, count($result['elements']), 'Wrong Reference-Count found');

        $supposed = [
            ['1', 'db', 'pages:1'],
            ['2', 'db', 'pages:2'],
            ['3', 'db', 'pages:3'],
        ];
        $i = 0;
        foreach ($result['elements'] as $token => $elem) {
            $this->assertEquals($supposed[$i][0], $elem['matchString'], 'Wrong Reference found');
            $this->assertEquals($supposed[$i][1], $elem['subst']['type'], 'Wrong Reference-Type found');
            $this->assertEquals($supposed[$i][2], $elem['subst']['recordRef'], 'Wrong Reference-Records found');
            $this->assertEquals(
                true,
                stristr($result['content'], '{softref:' . $elem['subst']['tokenID'] . '}'),
                'Token (' . $i . ') not found in parsed content'
            );
            $i++;
        }
    }
}
