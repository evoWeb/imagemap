<?php

declare(strict_types=1);

namespace Evoweb\Imagemap\Hooks;

/*
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Page\PageRenderer;

class BackendHook
{
    protected PageRenderer $pageRenderer;

    public function __construct(PageRenderer $pageRenderer)
    {
        $this->pageRenderer = $pageRenderer;
    }

    public function addPageRendererResources()
    {
        $this->pageRenderer->loadRequireJsModule('TYPO3/CMS/Core/Contrib/jquery.minicolors');
    }
}