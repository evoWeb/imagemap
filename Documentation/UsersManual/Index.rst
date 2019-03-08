.. ==================================================
.. FOR YOUR INFORMATION
.. --------------------------------------------------
.. -*- coding: utf-8 -*- with BOM.

.. include:: ../Includes.txt
.. include:: Images.txt


Users manual
============

.. contents::
   :local:
   :depth: 1


Create new elements:
--------------------

By using the new content element wizard and choose "ImageMap" there you get a new element that has all the fields like
an image element with the addition of a preview of the image with areas applied on it and a "open area editor" button.

|img-1| *Abbildung 1: new content element wizard

The preview is only present after an image was chosen and the element was stored once at least. This step is needed
because the preview image relies on a rendering of the image in frontend context. This respects cropping too.


Adding areas:
-------------

By using the "open area editor" button a modal opens with the area editor. In this it's possible to add new areas. Once
they are added you can move and resize them by clicking the area on the image and use the handles.

The forms on the right are used to modify values individually. There you can change the color by clicking on the color
swatch. Also a link can be picked/entered. The alternative text is entered as label. The arrow down to the right opens
secondary options with details coordinates fields and title field.

In case of poly areas the secondary options contain the poly corners. There additional corners can be added.

|img-2| *Abbildung 1: open area editor modal
