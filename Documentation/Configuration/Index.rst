.. ==================================================
.. FOR YOUR INFORMATION
.. --------------------------------------------------
.. -*- coding: utf-8 -*- with BOM.

.. include:: ../Includes.txt


Configuration
=============

Configuration is pretty much in par with tt_content.image


TypoScript Constants
--------------------

It's possible to override the templates by copy the template to a sitepackage and add the addition TemplatePath as constant.

::

   styles.templates.templateRootPath = EXT:sitepackage/Resources/Private/Templates/

TypoScript Setup
----------------

The content element comes with an additional DataProcessor to prepare the area map

::

   tt_content.imagemap.dataProcessing.30 {}
