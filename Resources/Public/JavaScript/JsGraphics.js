// based on http://www.walterzorn.de/en/jsgraphics/jsgraphics_e.htm
/* This notice must be untouched at all times.

wz_jsgraphics.js    v. 3.05
The latest version is available at
http://www.walterzorn.com
or http://www.devira.com
or http://www.walterzorn.de

Copyright (c) 2002-2009 Walter Zorn. All rights reserved.
Created 3. 11. 2002 by Walter Zorn (Web: http://www.walterzorn.com )
Last modified: 2. 2. 2009

Performance optimizations for Internet Explorer
by Thomas Frank and John Holdsworth.
fillPolygon method implemented by Matthieu Haller.

High Performance JavaScript Graphics Library.
Provides methods
- to draw lines, rectangles, ellipses, polygons
	with specifiable line thickness,
- to fill rectangles, polygons, ellipses and arcs
- to draw text.
NOTE: Operations, functions and branching have rather been optimized
to efficiency and speed than to shortness of source code.

LICENSE: LGPL

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License (LGPL) as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA,
or see http://www.gnu.org/copyleft/lesser.html
*/


var jg_ok, jg_ie, jg_fast, jg_dom, jg_moz;


function _chkDHTM(wnd, x, i)
// Under XUL, owner of 'document' must be specified explicitly
{
	x = wnd.document.body || null;
	jg_ie = x && typeof x.insertAdjacentHTML != "undefined" && wnd.document.createElement;
	jg_dom = (x && !jg_ie &&
		typeof x.appendChild != "undefined" &&
		typeof wnd.document.createRange != "undefined" &&
		typeof (i = wnd.document.createRange()).setStartBefore != "undefined" &&
		typeof i.createContextualFragment != "undefined");
	jg_fast = jg_ie && wnd.document.all && !wnd.opera;
	jg_moz = jg_dom && typeof x.style.MozOpacity != "undefined";
	jg_ok = !!(jg_ie || jg_dom);
}

function _pntCnvDom()
{
	var x = this.wnd.document.createRange();
	x.setStartBefore(this.cnv);
	x = x.createContextualFragment(jg_fast? this._htmRpc() : this.htm);
	if(this.cnv) this.cnv.appendChild(x);
	this.htm = "";
}

function _pntCnvIe()
{
	if(this.cnv) this.cnv.insertAdjacentHTML("BeforeEnd", jg_fast? this._htmRpc() : this.htm);
	this.htm = "";
}

function _pntDoc()
{
	this.wnd.document.write(jg_fast? this._htmRpc() : this.htm);
	this.htm = '';
}

function _pntN()
{
	;
}

function _mkDiv(x, y, w, h)
{
	this.htm += '<div style="position:absolute;'+
		'left:' + x + 'px;'+
		'top:' + y + 'px;'+
		'width:' + w + 'px;'+
		'height:' + h + 'px;'+
		'clip:rect(0,'+w+'px,'+h+'px,0);'+
		'background-color:' + this.color +
		(!jg_moz? ';overflow:hidden' : '')+
		';"><\/div>';
}

function _mkDivIe(x, y, w, h)
{
	this.htm += '%%'+this.color+';'+x+';'+y+';'+w+';'+h+';';
}

function _mkDivPrt(x, y, w, h)
{
	this.htm += '<div style="position:absolute;'+
		'border-left:' + w + 'px solid ' + this.color + ';'+
		'left:' + x + 'px;'+
		'top:' + y + 'px;'+
		'width:0px;'+
		'height:' + h + 'px;'+
		'clip:rect(0,'+w+'px,'+h+'px,0);'+
		'background-color:' + this.color +
		(!jg_moz? ';overflow:hidden' : '')+
		';"><\/div>';
}

var _regex =  /%%([^;]+);([^;]+);([^;]+);([^;]+);([^;]+);/g;
function _htmRpc()
{
	return this.htm.replace(
		_regex,
		'<div style="overflow:hidden;position:absolute;background-color:'+
		'$1;left:$2px;top:$3px;width:$4px;height:$5px"></div>\n');
}

function _htmPrtRpc()
{
	return this.htm.replace(
		_regex,
		'<div style="overflow:hidden;position:absolute;background-color:'+
		'$1;left:$2px;top:$3px;width:$4px;height:$5px;border-left:$4px solid $1"></div>\n');
}

function _mkLin(x1, y1, x2, y2)
{
	if(x1 > x2)
	{
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
		x = x1, y = y1,
		yIncr = (y1 > y2)? -1 : 1;

	if(dx >= dy)
	{
		var pr = dy<<1,
			pru = pr - (dx<<1),
			p = pr-dx,
			ox = x;
		while(dx > 0)
		{--dx;
			++x;
			if(p > 0)
			{
				this._mkDiv(ox, y, x-ox, 1);
				y += yIncr;
				p += pru;
				ox = x;
			}
			else p += pr;
		}
		this._mkDiv(ox, y, x2-ox+1, 1);
	}

	else
	{
		var pr = dx<<1,
			pru = pr - (dy<<1),
			p = pr-dy,
			oy = y;
		if(y2 <= y1)
		{
			while(dy > 0)
			{--dy;
				if(p > 0)
				{
					this._mkDiv(x++, y, 1, oy-y+1);
					y += yIncr;
					p += pru;
					oy = y;
				}
				else
				{
					y += yIncr;
					p += pr;
				}
			}
			this._mkDiv(x2, y2, 1, oy-y2+1);
		}
		else
		{
			while(dy > 0)
			{--dy;
				y += yIncr;
				if(p > 0)
				{
					this._mkDiv(x++, oy, 1, y-oy);
					p += pru;
					oy = y;
				}
				else p += pr;
			}
			this._mkDiv(x2, oy, 1, y2-oy+1);
		}
	}
}

function _mkLin2D(x1, y1, x2, y2)
{
	if(x1 > x2)
	{
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
		x = x1, y = y1,
		yIncr = (y1 > y2)? -1 : 1;

	var s = this.stroke;
	if(dx >= dy)
	{
		if(dx > 0 && s-3 > 0)
		{
			var _s = (s*dx*Math.sqrt(1+dy*dy/(dx*dx))-dx-(s>>1)*dy) / dx;
			_s = (!(s-4)? Math.ceil(_s) : Math.round(_s)) + 1;
		}
		else var _s = s;
		var ad = Math.ceil(s/2);

		var pr = dy<<1,
			pru = pr - (dx<<1),
			p = pr-dx,
			ox = x;
		while(dx > 0)
		{--dx;
			++x;
			if(p > 0)
			{
				this._mkDiv(ox, y, x-ox+ad, _s);
				y += yIncr;
				p += pru;
				ox = x;
			}
			else p += pr;
		}
		this._mkDiv(ox, y, x2-ox+ad+1, _s);
	}

	else
	{
		if(s-3 > 0)
		{
			var _s = (s*dy*Math.sqrt(1+dx*dx/(dy*dy))-(s>>1)*dx-dy) / dy;
			_s = (!(s-4)? Math.ceil(_s) : Math.round(_s)) + 1;
		}
		else var _s = s;
		var ad = Math.round(s/2);

		var pr = dx<<1,
			pru = pr - (dy<<1),
			p = pr-dy,
			oy = y;
		if(y2 <= y1)
		{
			++ad;
			while(dy > 0)
			{--dy;
				if(p > 0)
				{
					this._mkDiv(x++, y, _s, oy-y+ad);
					y += yIncr;
					p += pru;
					oy = y;
				}
				else
				{
					y += yIncr;
					p += pr;
				}
			}
			this._mkDiv(x2, y2, _s, oy-y2+ad);
		}
		else
		{
			while(dy > 0)
			{--dy;
				y += yIncr;
				if(p > 0)
				{
					this._mkDiv(x++, oy, _s, y-oy+ad);
					p += pru;
					oy = y;
				}
				else p += pr;
			}
			this._mkDiv(x2, oy, _s, y2-oy+ad+1);
		}
	}
}

function _mkLinDott(x1, y1, x2, y2)
{
	if(x1 > x2)
	{
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
		x = x1, y = y1,
		yIncr = (y1 > y2)? -1 : 1,
		drw = true;
	if(dx >= dy)
	{
		var pr = dy<<1,
			pru = pr - (dx<<1),
			p = pr-dx;
		while(dx > 0)
		{--dx;
			if(drw) this._mkDiv(x, y, 1, 1);
			drw = !drw;
			if(p > 0)
			{
				y += yIncr;
				p += pru;
			}
			else p += pr;
			++x;
		}
	}
	else
	{
		var pr = dx<<1,
			pru = pr - (dy<<1),
			p = pr-dy;
		while(dy > 0)
		{--dy;
			if(drw) this._mkDiv(x, y, 1, 1);
			drw = !drw;
			y += yIncr;
			if(p > 0)
			{
				++x;
				p += pru;
			}
			else p += pr;
		}
	}
	if(drw) this._mkDiv(x, y, 1, 1);
}

function _mkOv(left, top, width, height)
{
	var a = (++width)>>1, b = (++height)>>1,
		wod = width&1, hod = height&1,
		cx = left+a, cy = top+b,
		x = 0, y = b,
		ox = 0, oy = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1),
		w, h;
	while(y > 0)
	{
		if(st < 0)
		{
			st += bb2*((x<<1)+3);
			tt += bb4*(++x);
		}
		else if(tt < 0)
		{
			st += bb2*((x<<1)+3) - aa4*(y-1);
			tt += bb4*(++x) - aa2*(((y--)<<1)-3);
			w = x-ox;
			h = oy-y;
			if((w&2) && (h&2))
			{
				this._mkOvQds(cx, cy, x-2, y+2, 1, 1, wod, hod);
				this._mkOvQds(cx, cy, x-1, y+1, 1, 1, wod, hod);
			}
			else this._mkOvQds(cx, cy, x-1, oy, w, h, wod, hod);
			ox = x;
			oy = y;
		}
		else
		{
			tt -= aa2*((y<<1)-3);
			st -= aa4*(--y);
		}
	}
	w = a-ox+1;
	h = (oy<<1)+hod;
	y = cy-oy;
	this._mkDiv(cx-a, y, w, h);
	this._mkDiv(cx+ox+wod-1, y, w, h);
}

function _mkOv2D(left, top, width, height)
{
	var s = this.stroke;
	width += s+1;
	height += s+1;
	var a = width>>1, b = height>>1,
		wod = width&1, hod = height&1,
		cx = left+a, cy = top+b,
		x = 0, y = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1);

	if(s-4 < 0 && (!(s-2) || width-51 > 0 && height-51 > 0))
	{
		var ox = 0, oy = b,
			w, h,
			pxw;
		while(y > 0)
		{
			if(st < 0)
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				w = x-ox;
				h = oy-y;

				if(w-1)
				{
					pxw = w+1+(s&1);
					h = s;
				}
				else if(h-1)
				{
					pxw = s;
					h += 1+(s&1);
				}
				else pxw = h = s;
				this._mkOvQds(cx, cy, x-1, oy, pxw, h, wod, hod);
				ox = x;
				oy = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}
		}
		this._mkDiv(cx-a, cy-oy, s, (oy<<1)+hod);
		this._mkDiv(cx+a+wod-s, cy-oy, s, (oy<<1)+hod);
	}

	else
	{
		var _a = (width-(s<<1))>>1,
			_b = (height-(s<<1))>>1,
			_x = 0, _y = _b,
			_aa2 = (_a*_a)<<1, _aa4 = _aa2<<1, _bb2 = (_b*_b)<<1, _bb4 = _bb2<<1,
			_st = (_aa2>>1)*(1-(_b<<1)) + _bb2,
			_tt = (_bb2>>1) - _aa2*((_b<<1)-1),

			pxl = new Array(),
			pxt = new Array(),
			_pxb = new Array();
		pxl[0] = 0;
		pxt[0] = b;
		_pxb[0] = _b-1;
		while(y > 0)
		{
			if(st < 0)
			{
				pxl[pxl.length] = x;
				pxt[pxt.length] = y;
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				pxl[pxl.length] = x;
				st += bb2*((x<<1)+3) - aa4*(y-1);
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				pxt[pxt.length] = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}

			if(_y > 0)
			{
				if(_st < 0)
				{
					_st += _bb2*((_x<<1)+3);
					_tt += _bb4*(++_x);
					_pxb[_pxb.length] = _y-1;
				}
				else if(_tt < 0)
				{
					_st += _bb2*((_x<<1)+3) - _aa4*(_y-1);
					_tt += _bb4*(++_x) - _aa2*(((_y--)<<1)-3);
					_pxb[_pxb.length] = _y-1;
				}
				else
				{
					_tt -= _aa2*((_y<<1)-3);
					_st -= _aa4*(--_y);
					_pxb[_pxb.length-1]--;
				}
			}
		}

		var ox = -wod, oy = b,
			_oy = _pxb[0],
			l = pxl.length,
			w, h;
		for(var i = 0; i < l; i++)
		{
			if(typeof _pxb[i] != "undefined")
			{
				if(_pxb[i] < _oy || pxt[i] < oy)
				{
					x = pxl[i];
					this._mkOvQds(cx, cy, x, oy, x-ox, oy-_oy, wod, hod);
					ox = x;
					oy = pxt[i];
					_oy = _pxb[i];
				}
			}
			else
			{
				x = pxl[i];
				this._mkDiv(cx-x, cy-oy, 1, (oy<<1)+hod);
				this._mkDiv(cx+ox+wod, cy-oy, 1, (oy<<1)+hod);
				ox = x;
				oy = pxt[i];
			}
		}
		this._mkDiv(cx-a, cy-oy, 1, (oy<<1)+hod);
		this._mkDiv(cx+ox+wod, cy-oy, 1, (oy<<1)+hod);
	}
}

function _mkOvDott(left, top, width, height)
{
	var a = (++width)>>1, b = (++height)>>1,
		wod = width&1, hod = height&1, hodu = hod^1,
		cx = left+a, cy = top+b,
		x = 0, y = b,
		aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
		st = (aa2>>1)*(1-(b<<1)) + bb2,
		tt = (bb2>>1) - aa2*((b<<1)-1),
		drw = true;
	while(y > 0)
	{
		if(st < 0)
		{
			st += bb2*((x<<1)+3);
			tt += bb4*(++x);
		}
		else if(tt < 0)
		{
			st += bb2*((x<<1)+3) - aa4*(y-1);
			tt += bb4*(++x) - aa2*(((y--)<<1)-3);
		}
		else
		{
			tt -= aa2*((y<<1)-3);
			st -= aa4*(--y);
		}
		if(drw && y >= hodu) this._mkOvQds(cx, cy, x, y, 1, 1, wod, hod);
		drw = !drw;
	}
}

function _mkRect(x, y, w, h)
{
	var s = this.stroke;
	this._mkDiv(x, y, w, s);
	this._mkDiv(x+w, y, s, h);
	this._mkDiv(x, y+h, w+s, s);
	this._mkDiv(x, y+s, s, h-s);
}

function _mkRectDott(x, y, w, h)
{
	this.drawLine(x, y, x+w, y);
	this.drawLine(x+w, y, x+w, y+h);
	this.drawLine(x, y+h, x+w, y+h);
	this.drawLine(x, y, x, y+h);
}

function jsgFont()
{
	this.PLAIN = 'font-weight:normal;';
	this.BOLD = 'font-weight:bold;';
	this.ITALIC = 'font-style:italic;';
	this.ITALIC_BOLD = this.ITALIC + this.BOLD;
	this.BOLD_ITALIC = this.ITALIC_BOLD;
}
var Font = new jsgFont();

function jsgStroke()
{
	this.DOTTED = -1;
}
var Stroke = new jsgStroke();

function jsGraphics(cnv, wnd)
{
	this.setColor = function(x)
	{
		this.color = x.toLowerCase();
	};

	this.setStroke = function(x)
	{
		this.stroke = x;
		if(!(x+1))
		{
			this.drawLine = _mkLinDott;
			this._mkOv = _mkOvDott;
			this.drawRect = _mkRectDott;
		}
		else if(x-1 > 0)
		{
			this.drawLine = _mkLin2D;
			this._mkOv = _mkOv2D;
			this.drawRect = _mkRect;
		}
		else
		{
			this.drawLine = _mkLin;
			this._mkOv = _mkOv;
			this.drawRect = _mkRect;
		}
	};

	this.setPrintable = function(arg)
	{
		this.printable = arg;
		if(jg_fast)
		{
			this._mkDiv = _mkDivIe;
			this._htmRpc = arg? _htmPrtRpc : _htmRpc;
		}
		else this._mkDiv = arg? _mkDivPrt : _mkDiv;
	};

	this.setFont = function(fam, sz, sty)
	{
		this.ftFam = fam;
		this.ftSz = sz;
		this.ftSty = sty || Font.PLAIN;
	};

	this.drawPolyline = this.drawPolyLine = function(x, y)
	{
		for (var i=x.length - 1; i;)
		{--i;
			this.drawLine(x[i], y[i], x[i+1], y[i+1]);
		}
	};

	this.fillRect = function(x, y, w, h)
	{
		this._mkDiv(x, y, w, h);
	};

	this.drawPolygon = function(x, y)
	{
		this.drawPolyline(x, y);
		this.drawLine(x[x.length-1], y[x.length-1], x[0], y[0]);
	};

	this.drawEllipse = this.drawOval = function(x, y, w, h)
	{
		this._mkOv(x, y, w, h);
	};

	this.fillEllipse = this.fillOval = function(left, top, w, h)
	{
		var a = w>>1, b = h>>1,
			wod = w&1, hod = h&1,
			cx = left+a, cy = top+b,
			x = 0, y = b, oy = b,
			aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
			st = (aa2>>1)*(1-(b<<1)) + bb2,
			tt = (bb2>>1) - aa2*((b<<1)-1),
			xl, dw, dh;
		if(w) while(y > 0)
		{
			if(st < 0)
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0)
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				xl = cx-x;
				dw = (x<<1)+wod;
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				dh = oy-y;
				this._mkDiv(xl, cy-oy, dw, dh);
				this._mkDiv(xl, cy+y+hod, dw, dh);
				oy = y;
			}
			else
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
			}
		}
		this._mkDiv(cx-a, cy-oy, w, (oy<<1)+hod);
	};

	this.fillArc = function(iL, iT, iW, iH, fAngA, fAngZ)
	{
		var a = iW>>1, b = iH>>1,
			iOdds = (iW&1) | ((iH&1) << 16),
			cx = iL+a, cy = iT+b,
			x = 0, y = b, ox = x, oy = y,
			aa2 = (a*a)<<1, aa4 = aa2<<1, bb2 = (b*b)<<1, bb4 = bb2<<1,
			st = (aa2>>1)*(1-(b<<1)) + bb2,
			tt = (bb2>>1) - aa2*((b<<1)-1),
			// Vars for radial boundary lines
			xEndA, yEndA, xEndZ, yEndZ,
			iSects = (1 << (Math.floor((fAngA %= 360.0)/180.0) << 3))
				| (2 << (Math.floor((fAngZ %= 360.0)/180.0) << 3))
				| ((fAngA >= fAngZ) << 16),
			aBndA = new Array(b+1), aBndZ = new Array(b+1);

		// Set up radial boundary lines
		fAngA *= Math.PI/180.0;
		fAngZ *= Math.PI/180.0;
		xEndA = cx+Math.round(a*Math.cos(fAngA));
		yEndA = cy+Math.round(-b*Math.sin(fAngA));
		_mkLinVirt(aBndA, cx, cy, xEndA, yEndA);
		xEndZ = cx+Math.round(a*Math.cos(fAngZ));
		yEndZ = cy+Math.round(-b*Math.sin(fAngZ));
		_mkLinVirt(aBndZ, cx, cy, xEndZ, yEndZ);

		while(y > 0)
		{
			if(st < 0) // Advance x
			{
				st += bb2*((x<<1)+3);
				tt += bb4*(++x);
			}
			else if(tt < 0) // Advance x and y
			{
				st += bb2*((x<<1)+3) - aa4*(y-1);
				ox = x;
				tt += bb4*(++x) - aa2*(((y--)<<1)-3);
				this._mkArcDiv(ox, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects);
				oy = y;
			}
			else // Advance y
			{
				tt -= aa2*((y<<1)-3);
				st -= aa4*(--y);
				if(y && (aBndA[y] != aBndA[y-1] || aBndZ[y] != aBndZ[y-1]))
				{
					this._mkArcDiv(x, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects);
					ox = x;
					oy = y;
				}
			}
		}
		this._mkArcDiv(x, 0, oy, cx, cy, iOdds, aBndA, aBndZ, iSects);
		if(iOdds >> 16) // Odd height
		{
			if(iSects >> 16) // Start-angle > end-angle
			{
				var xl = (yEndA <= cy || yEndZ > cy)? (cx - x) : cx;
				this._mkDiv(xl, cy, x + cx - xl + (iOdds & 0xffff), 1);
			}
			else if((iSects & 0x01) && yEndZ > cy)
				this._mkDiv(cx - x, cy, x, 1);
		}
	};

	/* fillPolygon method, implemented by Matthieu Haller.
	This javascript function is an adaptation of the gdImageFilledPolygon for Walter Zorn lib.
	C source of GD 1.8.4 found at http://www.boutell.com/gd/

	THANKS to Kirsten Schulz for the polygon fixes!

	The intersection finding technique of this code could be improved
	by remembering the previous intertersection, and by using the slope.
	That could help to adjust intersections to produce a nice
	interior_extrema. */
	this.fillPolygon = function(array_x, array_y)
	{
		var i;
		var y;
		var miny, maxy;
		var x1, y1;
		var x2, y2;
		var ind1, ind2;
		var ints;

		var n = array_x.length;
		if(!n) return;

		miny = array_y[0];
		maxy = array_y[0];
		for(i = 1; i < n; i++)
		{
			if(array_y[i] < miny)
				miny = array_y[i];

			if(array_y[i] > maxy)
				maxy = array_y[i];
		}
		for(y = miny; y <= maxy; y++)
		{
			var polyInts = new Array();
			ints = 0;
			for(i = 0; i < n; i++)
			{
				if(!i)
				{
					ind1 = n-1;
					ind2 = 0;
				}
				else
				{
					ind1 = i-1;
					ind2 = i;
				}
				y1 = array_y[ind1];
				y2 = array_y[ind2];
				if(y1 < y2)
				{
					x1 = array_x[ind1];
					x2 = array_x[ind2];
				}
				else if(y1 > y2)
				{
					y2 = array_y[ind1];
					y1 = array_y[ind2];
					x2 = array_x[ind1];
					x1 = array_x[ind2];
				}
				else continue;

				//  Modified 11. 2. 2004 Walter Zorn
				if((y >= y1) && (y < y2))
					polyInts[ints++] = Math.round((y-y1) * (x2-x1) / (y2-y1) + x1);

				else if((y == maxy) && (y > y1) && (y <= y2))
					polyInts[ints++] = Math.round((y-y1) * (x2-x1) / (y2-y1) + x1);
			}
			polyInts.sort(_CompInt);
			for(i = 0; i < ints; i+=2)
				this._mkDiv(polyInts[i], y, polyInts[i+1]-polyInts[i]+1, 1);
		}
	};

	this.drawString = function(txt, x, y)
	{
		this.htm += '<div style="position:absolute;white-space:nowrap;'+
			'left:' + x + 'px;'+
			'top:' + y + 'px;'+
			'font-family:' +  this.ftFam + ';'+
			'font-size:' + this.ftSz + ';'+
			'color:' + this.color + ';' + this.ftSty + '">'+
			txt +
			'<\/div>';
	};

	/* drawStringRect() added by Rick Blommers.
	Allows to specify the size of the text rectangle and to align the
	text both horizontally (e.g. right) and vertically within that rectangle */
	this.drawStringRect = function(txt, x, y, width, halign)
	{
		this.htm += '<div style="position:absolute;overflow:hidden;'+
			'left:' + x + 'px;'+
			'top:' + y + 'px;'+
			'width:'+width +'px;'+
			'text-align:'+halign+';'+
			'font-family:' +  this.ftFam + ';'+
			'font-size:' + this.ftSz + ';'+
			'color:' + this.color + ';' + this.ftSty + '">'+
			txt +
			'<\/div>';
	};

	this.drawImage = function(imgSrc, x, y, w, h, a)
	{
		this.htm += '<div style="position:absolute;'+
			'left:' + x + 'px;'+
			'top:' + y + 'px;'+
			// w (width) and h (height) arguments are now optional.
			// Added by Mahmut Keygubatli, 14.1.2008
			(w? ('width:' +  w + 'px;') : '') +
			(h? ('height:' + h + 'px;'):'')+'">'+
			'<img src="' + imgSrc +'"'+ (w ? (' width="' + w + '"'):'')+ (h ? (' height="' + h + '"'):'') + (a? (' '+a) : '') + '>'+
			'<\/div>';
	};

	this.clear = function()
	{
		this.htm = "";
		if(this.cnv) this.cnv.innerHTML = "";
	};

	this._mkOvQds = function(cx, cy, x, y, w, h, wod, hod)
	{
		var xl = cx - x, xr = cx + x + wod - w, yt = cy - y, yb = cy + y + hod - h;
		if(xr > xl+w)
		{
			this._mkDiv(xr, yt, w, h);
			this._mkDiv(xr, yb, w, h);
		}
		else
			w = xr - xl + w;
		this._mkDiv(xl, yt, w, h);
		this._mkDiv(xl, yb, w, h);
	};

	this._mkArcDiv = function(x, y, oy, cx, cy, iOdds, aBndA, aBndZ, iSects)
	{
		var xrDef = cx + x + (iOdds & 0xffff), y2, h = oy - y, xl, xr, w;

		if(!h) h = 1;
		x = cx - x;

		if(iSects & 0xff0000) // Start-angle > end-angle
		{
			y2 = cy - y - h;
			if(iSects & 0x00ff)
			{
				if(iSects & 0x02)
				{
					xl = Math.max(x, aBndZ[y]);
					w = xrDef - xl;
					if(w > 0) this._mkDiv(xl, y2, w, h);
				}
				if(iSects & 0x01)
				{
					xr = Math.min(xrDef, aBndA[y]);
					w = xr - x;
					if(w > 0) this._mkDiv(x, y2, w, h);
				}
			}
			else
				this._mkDiv(x, y2, xrDef - x, h);
			y2 = cy + y + (iOdds >> 16);
			if(iSects & 0xff00)
			{
				if(iSects & 0x0100)
				{
					xl = Math.max(x, aBndA[y]);
					w = xrDef - xl;
					if(w > 0) this._mkDiv(xl, y2, w, h);
				}
				if(iSects & 0x0200)
				{
					xr = Math.min(xrDef, aBndZ[y]);
					w = xr - x;
					if(w > 0) this._mkDiv(x, y2, w, h);
				}
			}
			else
				this._mkDiv(x, y2, xrDef - x, h);
		}
		else
		{
			if(iSects & 0x00ff)
			{
				if(iSects & 0x02)
					xl = Math.max(x, aBndZ[y]);
				else
					xl = x;
				if(iSects & 0x01)
					xr = Math.min(xrDef, aBndA[y]);
				else
					xr = xrDef;
				y2 = cy - y - h;
				w = xr - xl;
				if(w > 0) this._mkDiv(xl, y2, w, h);
			}
			if(iSects & 0xff00)
			{
				if(iSects & 0x0100)
					xl = Math.max(x, aBndA[y]);
				else
					xl = x;
				if(iSects & 0x0200)
					xr = Math.min(xrDef, aBndZ[y]);
				else
					xr = xrDef;
				y2 = cy + y + (iOdds >> 16);
				w = xr - xl;
				if(w > 0) this._mkDiv(xl, y2, w, h);
			}
		}
	};

	this.setStroke(1);
	this.setFont("verdana,geneva,helvetica,sans-serif", "12px", Font.PLAIN);
	this.color = "#000000";
	this.htm = "";
	this.wnd = wnd || window;

	if(!jg_ok) _chkDHTM(this.wnd);
	if(jg_ok)
	{
		if(cnv)
		{
			if(typeof(cnv) == "string")
				this.cont = document.all? (this.wnd.document.all[cnv] || null)
					: document.getElementById? (this.wnd.document.getElementById(cnv) || null)
						: null;
			else if(cnv == window.document)
				this.cont = document.getElementsByTagName("body")[0];
			// If cnv is a direct reference to a canvas DOM node
			// (option suggested by Andreas Luleich)
			else this.cont = cnv;
			// Create new canvas inside container DIV. Thus the drawing and clearing
			// methods won't interfere with the container's inner html.
			// Solution suggested by Vladimir.
			this.cnv = this.wnd.document.createElement("div");
			this.cnv.style.fontSize=0;
			this.cont.appendChild(this.cnv);
			this.paint = jg_dom? _pntCnvDom : _pntCnvIe;
		}
		else
			this.paint = _pntDoc;
	}
	else
		this.paint = _pntN;

	this.setPrintable(false);
}

function _mkLinVirt(aLin, x1, y1, x2, y2)
{
	var dx = Math.abs(x2-x1), dy = Math.abs(y2-y1),
		x = x1, y = y1,
		xIncr = (x1 > x2)? -1 : 1,
		yIncr = (y1 > y2)? -1 : 1,
		p,
		i = 0;
	if(dx >= dy)
	{
		var pr = dy<<1,
			pru = pr - (dx<<1);
		p = pr-dx;
		while(dx > 0)
		{--dx;
			if(p > 0)    //  Increment y
			{
				aLin[i++] = x;
				y += yIncr;
				p += pru;
			}
			else p += pr;
			x += xIncr;
		}
	}
	else
	{
		var pr = dx<<1,
			pru = pr - (dy<<1);
		p = pr-dy;
		while(dy > 0)
		{--dy;
			y += yIncr;
			aLin[i++] = x;
			if(p > 0)    //  Increment x
			{
				x += xIncr;
				p += pru;
			}
			else p += pr;
		}
	}
	for(var len = aLin.length, i = len-i; i;)
		aLin[len-(i--)] = x;
};

function _CompInt(x, y)
{
	return(x - y);
}

(function () {
	var a = false, b = /xyz/.test(function () {
		xyz
	}) ? /\b_super\b/ : /.*/;
	this.Class = function () {
	};
	Class.extend = function (g) {
		var f = this.prototype;
		a = true;
		var e = new this();
		a = false;
		for (var d in g) {
			e[d] = typeof g[d] == "function" && typeof f[d] == "function" && b.test(g[d]) ? (function (h, i) {
				return function () {
					var k = this._super;
					this._super = f[h];
					var j = i.apply(this, arguments);
					this._super = k;
					return j
				}
			})(d, g[d]) : g[d]
		}

		function c() {
			if (!a && this.init) {
				this.init.apply(this, arguments)
			}
		}

		c.prototype = e;
		c.constructor = c;
		c.extend = arguments.callee;
		return c
	}
})();
(function (a) {
	a.fn.simpleColor = function (b) {
		var c = ["990033", "ff3366", "cc0033", "ff0033", "ff9999", "cc3366", "ffccff", "cc6699", "993366", "660033", "cc3399", "ff99cc", "ff66cc", "ff99ff", "ff6699", "cc0066", "ff0066", "ff3399", "ff0099", "ff33cc", "ff00cc", "ff66ff", "ff33ff", "ff00ff", "cc0099", "990066", "cc66cc", "cc33cc", "cc99ff", "cc66ff", "cc33ff", "993399", "cc00cc", "cc00ff", "9900cc", "990099", "cc99cc", "996699", "663366", "660099", "9933cc", "660066", "9900ff", "9933ff", "9966cc", "330033", "663399", "6633cc", "6600cc", "9966ff", "330066", "6600ff", "6633ff", "ccccff", "9999ff", "9999cc", "6666cc", "6666ff", "666699", "333366", "333399", "330099", "3300cc", "3300ff", "3333ff", "3333cc", "0066ff", "0033ff", "3366ff", "3366cc", "000066", "000033", "0000ff", "000099", "0033cc", "0000cc", "336699", "0066cc", "99ccff", "6699ff", "003366", "6699cc", "006699", "3399cc", "0099cc", "66ccff", "3399ff", "003399", "0099ff", "33ccff", "00ccff", "99ffff", "66ffff", "33ffff", "00ffff", "00cccc", "009999", "669999", "99cccc", "ccffff", "33cccc", "66cccc", "339999", "336666", "006666", "003333", "00ffcc", "33ffcc", "33cc99", "00cc99", "66ffcc", "99ffcc", "00ff99", "339966", "006633", "336633", "669966", "66cc66", "99ff99", "66ff66", "339933", "99cc99", "66ff99", "33ff99", "33cc66", "00cc66", "66cc99", "009966", "009933", "33ff66", "00ff66", "ccffcc", "ccff99", "99ff66", "99ff33", "00ff33", "33ff33", "00cc33", "33cc33", "66ff33", "00ff00", "66cc33", "006600", "003300", "009900", "33ff00", "66ff00", "99ff00", "66cc00", "00cc00", "33cc00", "339900", "99cc66", "669933", "99cc33", "336600", "669900", "99cc00", "ccff66", "ccff33", "ccff00", "999900", "cccc00", "cccc33", "333300", "666600", "999933", "cccc66", "666633", "999966", "cccc99", "ffffcc", "ffff99", "ffff66", "ffff33", "ffff00", "ffcc00", "ffcc66", "ffcc33", "cc9933", "996600", "cc9900", "ff9900", "cc6600", "993300", "cc6633", "663300", "ff9966", "ff6633", "ff9933", "ff6600", "cc3300", "996633", "330000", "663333", "996666", "cc9999", "993333", "cc6666", "ffcccc", "ff3333", "cc3333", "ff6666", "660000", "990000", "cc0000", "ff0000", "ff3300", "cc9966", "ffcc99", "ffffff", "cccccc", "999999", "666666", "333333", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000", "000000"];
		b = a.extend({colors: this.attr("colors") || c, indicator: this.attr("indicator") || null}, b || {});
		a.simpleColorOptions = b;
		this.each(function (f) {
			var e = a.simpleColorOptions;
			for (var g = 0; g < e.colors.length; g++) {
				var d = a("<div class='colorPickerCell' id='" + e.colors[g] + "'/>");
				d.css("backgroundColor", "#" + e.colors[g]);
				a(this).append(d);
				var h = {color: "#" + e.colors[g]};
				d.data("parent", this).bind("click", h, function (i) {
					if (typeof i.data != "undefined") {
						a(a(this).data("parent")).trigger("click", [i.data.color])
					}
				})
			}
			a(this).append('<br style="clear:both">')
		});
		return this
	}
})(jQuery);
var canvasClass = Class.extend({
	canvasId: null,
	canvasVectors: null,
	pictureId: null,
	imageId: null,
	boxId: null,
	formsId: null,
	boxMarkerCount: null,
	areaCount: null,
	areaObjects: null,
	areaObjectList: null,
	formBlueprints: null,
	scaleFactor: 1,
	imageOrigW: null,
	imageOrigH: null,
	mouseIsDown: false,
	mouseOverCanvas: false,
	mouseCurrentObjectDrag: -1,
	mouseCurrentEdgeDrag: -1,
	mouseCurrentBorderDrag: -1,
	mouseCurrentBorderDragX: -1,
	mouseCurrentBorderDragY: -1,
	init: function (c, a, b) {
		if (c == undefined || a == undefined || b == undefined) {
			return false
		}
		this.canvasId = "#" + c;
		this.pictureId = "#" + a;
		this.formsId = "#" + b;
		this.boxMarkerCount = 0;
		this.areaCount = 0;
		this.canvasVectors = new Object();
		this.areaObjects = new Object();
		this.areaObjectList = new Array();
		this.imageOrigW = parseInt(jQuery(this.pictureId + " > #image > img").attr("width"));
		this.imageOrigH = parseInt(jQuery(this.pictureId + " > #image > img").attr("height"));
		this.formBlueprints = this.parseFormToBluePrint(this.formsId);
		jQuery(this.formsId).empty();
		this.setScale(1)
	},
	initializeScaling: function (b) {
		var a = parseInt(b) / this.imageOrigW;
		var c = parseInt(b) / this.imageOrigH;
		return (a > c) ? c : a
	},
	setScale: function (b) {
		this.scaleFactor = ((b > 1) ? 1 : b);
		jQuery(this.pictureId + " > #image > img").width(this.getMaxW());
		jQuery(this.pictureId + " > #image > img").height(this.getMaxH());
		jQuery(this.pictureId).width(this.getMaxW());
		jQuery(this.pictureId).height(this.getMaxH());
		var a = this;
		jQuery.each(this.areaObjectList, function (d, c) {
			a.areaObjects[c].setScale(a.scaleFactor);
			a.updateCanvas(c)
		});
		jQuery(this.canvasId).width(this.getMaxW()).height(this.getMaxH())
	},
	mousedown: function (c) {
		var a = c.pageX - jQuery(this.canvasId).offset().left;
		var d = c.pageY - jQuery(this.canvasId).offset().top;
		this.mouseIsDown = true;
		var b = this;
		jQuery.each(jQuery(this.formsId + " > div"), function (f, g) {
			if ((b.mouseCurrentObjectDrag == -1) && (b.mouseCurrentEdgeDrag == -1)) {
				var e = b.areaObjects[jQuery(this).attr("id")].hitOnObjectEdge(a, d, 3);
				if (e != -1) {
					b.areaObjects[jQuery(this).attr("id")].pushUndoableAction();
					b.mouseCurrentObjectDrag = jQuery(this).attr("id");
					b.mouseCurrentEdgeDrag = e;
					c.stopPropagation()
				}
			}
			if ((b.mouseCurrentObjectDrag == -1) && (b.mouseCurrentBorderDrag == -1)) {
				var e = b.areaObjects[jQuery(this).attr("id")].hitOnObjectBorder(a, d, 5);
				if (e != -1) {
					b.areaObjects[jQuery(this).attr("id")].pushUndoableAction();
					b.mouseCurrentObjectDrag = jQuery(this).attr("id");
					b.mouseCurrentBorderDrag = e;
					b.mouseCurrentBorderDragX = a;
					b.mouseCurrentBorderDragY = d;
					c.stopPropagation()
				}
			}
		});
		return false
	},
	mouseup: function (a) {
		this.mouseIsDown = false;
		this.mouseCurrentObjectDrag = -1;
		this.mouseCurrentEdgeDrag = -1;
		this.mouseCurrentBorderDrag = -1
	},
	mousemove: function (b) {
		var a = b.pageX - jQuery(this.canvasId).offset().left;
		var c = b.pageY - jQuery(this.canvasId).offset().top;
		this.mouseOverCanvas = true;
		if (a < 0) {
			a = 0;
			this.mouseOverCanvas = false
		}
		if (a > this.getMaxW()) {
			a = this.getMaxW();
			this.mouseOverCanvas = false
		}
		if (c < 0) {
			c = 0;
			this.mouseOverCanvas = false
		}
		if (c > this.getMaxH()) {
			c = this.getMaxH();
			this.mouseOverCanvas = false
		}
		if ((this.mouseCurrentObjectDrag != -1) && (this.mouseCurrentEdgeDrag != -1)) {
			this.mouseCurrentEdgeDrag = this.areaObjects[this.mouseCurrentObjectDrag].performResizeAction(this.mouseCurrentEdgeDrag, a, c);
			this.updateCanvas(this.mouseCurrentObjectDrag);
			this.updateForm(this.mouseCurrentObjectDrag);
			b.stopPropagation()
		} else {
			if ((this.mouseCurrentObjectDrag != -1) && (this.mouseCurrentBorderDrag != -1)) {
				this.mouseCurrentBorderDrag = this.areaObjects[this.mouseCurrentObjectDrag].performDragAction(this.mouseCurrentBorderDrag, a - this.mouseCurrentBorderDragX, c - this.mouseCurrentBorderDragY);
				this.mouseCurrentBorderDragX = a;
				this.mouseCurrentBorderDragY = c;
				this.updateCanvas(this.mouseCurrentObjectDrag);
				this.updateForm(this.mouseCurrentObjectDrag);
				b.stopPropagation()
			}
		}
		return false
	},
	dblclick: function (c) {
		var a = c.pageX - jQuery(this.canvasId).offset().left;
		var d = c.pageY - jQuery(this.canvasId).offset().top;
		var b = this;
		jQuery.each(jQuery(this.formsId + " > div"), function (f, g) {
			var e = b.areaObjects[jQuery(this).attr("id")].hitOnObjectEdge(a, d, 3);
			if (e !== -1) {
				if (b.areaObjects[jQuery(this).attr("id")].edgeWasHit(e)) {
					b.updateCanvas(jQuery(this).attr("id"));
					b.updateForm(jQuery(this).attr("id"))
				}
			}

			e = b.areaObjects[jQuery(this).attr("id")].hitOnObjectBorder(a, d, 5);
			if (e !== -1) {
				if (b.areaObjects[jQuery(this).attr("id")].borderWasHit(e, a, d)) {
					b.updateCanvas(jQuery(this).attr("id"));
					b.updateForm(jQuery(this).attr("id"))
				}
			}
		})
	},
	addArea: function (g, f, c, e, d, b, a) {
		if (f === "") {
			f = g.getStartupCoords(this.getCenterCoords(), this.getDimensions())
		}
		g.init(this, this.getNextId(), f, c, e, d, a);
		g.setScale(this.scaleFactor);
		this.areaObjects[g.getId()] = g;
		this.areaObjectList.push(g.getId());
		if (b) {
			jQuery(this.formsId).prepend(g.formMarkup())
		} else {
			jQuery(this.formsId).append(g.formMarkup())
		}
		jQuery(this.formsId).data("parent", this).sortable({
			distance: 3, start: function (h) {
				jQuery("#" + jQuery(h.target).attr("id") + " > .sortbtn").css("visibility", "hidden");
				jQuery("#" + jQuery(h.target).attr("id") + " > div > .sortbtn").css("visibility", "hidden")
			}, stop: function (h) {
				jQuery(this).data("parent").updateCanvasLayerOrder();
				jQuery(this).data("parent").fixSortbtnVisibility()
			}
		});
		jQuery('#' + g.getId()).data('area', g);
		this.areaObjects[g.getId()].applyBasicAreaActions();
		this.updateForm(g.getId());
		this.addCanvasLayer(g.getId());
		this.updateCanvas(g.getId());
		this.updateCanvasLayerOrder();
		this.fixSortbtnVisibility()
	},
	openPopup: function (link, area) {
		link.blur();

		var data = window.imagemap.browseLink;
		data.objectId = area.getId();
		data.currentValue = area.getLink();

		$.ajax({
			url: TYPO3.settings.ajaxUrls['imagemap_browselink_url'],
			context: area,
			data: data
		}).done(function (response) {
			console.log(response);
			var vHWin = window.open(response.url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1'); vHWin.focus()
		});
	},
	removeArea: function (b) {
		var a = new Array();
		jQuery.each(this.areaObjectList, function (d, c) {
			if (c != b) {
				a.push(c)
			}
		});
		this.areaObjectList = a;
		this.removeCanvasLayer(b);
		this.fixSortbtnVisibility()
	},
	areaUp: function (c) {
		var b = -1;
		var a = -1;
		jQuery.each(jQuery(this.formsId + " > div"), function (d, e) {
			if (jQuery(e).attr("id") == c) {
				a = jQuery(e).attr("id")
			}
			if (a == -1) {
				b = jQuery(e).attr("id")
			}
		});
		if (b != -1) {
			jQuery("#" + a).insertBefore("#" + b);
			this.updateCanvasLayerOrder()
		}
		this.fixSortbtnVisibility()
	},
	areaDown: function (c) {
		var b = -1;
		var a = -1;
		jQuery.each(jQuery(this.formsId + " > div"), function (d, e) {
			if ((a != -1) && (b == -1)) {
				b = jQuery(e).attr("id")
			}
			if (jQuery(e).attr("id") == c) {
				a = jQuery(e).attr("id")
			}
		});
		if (b != -1) {
			jQuery("#" + a).insertAfter("#" + b);
			this.updateCanvasLayerOrder()
		}
		this.fixSortbtnVisibility()
	},
	getCenterCoords: function () {
		return {x: (this.imageOrigW / 2), y: (this.imageOrigH / 2)}
	},
	getDimensions: function () {
		return {w: this.imageOrigW, h: this.imageOrigH}
	},
	fixSortbtnVisibility: function () {
		jQuery(this.formsId + " .sortbtn").removeClass("disabled");
		jQuery(this.formsId + " > div:first .upbtn").addClass("disabled");
		jQuery(this.formsId + " > div:last .downbtn").addClass("disabled")
	},
	persistanceXML: function () {
		var a = "";
		var b = new Array();
		var c = this;
		jQuery.each(jQuery(this.formsId + " > div"), function (d, e) {
			if (typeof c.areaObjects[jQuery(e).attr("id")] != "undefined") {
				c.areaObjects[jQuery(e).attr("id")].updateStatesFromForm();
				a = a + "\n" + c.areaObjects[jQuery(e).attr("id")].persistanceXML()
			}
		});
		return a
	},
	addCanvasLayer: function (a) {
		jQuery(this.canvasId).append('<div id="' + a + '_canvas" class="canvas"><!-- --></div>');
		this.canvasVectors[a] = new jsGraphics(a + "_canvas")
	},
	updateCanvas: function (a) {
		this.canvasVectors[a].clear();
		this.areaObjects[a].drawSelection(this.canvasVectors[a]);
		this.canvasVectors[a].paint()
	},
	removeCanvasLayer: function (a) {
		this.canvasVectors[a].clear();
		jQuery("#" + a + "_canvas").remove()
	},
	updateCanvasLayerOrder: function () {
		var b = 100;
		var a = this;
		jQuery.each(jQuery(this.formsId + " > div"), function (c, d) {
			if (typeof a.areaObjects[jQuery(d).attr("id")] != "undefined") {
				jQuery("#" + jQuery(d).attr("id") + "_canvas").css("z-index", b--)
			}
		})
	},
	updateForm: function (b) {
		var a = this.areaObjects[b].formUpdate();
		jQuery.each(a.split('";'), function (d, e) {
			var c = e.split('="');
			if (c[0]) {
				jQuery("#" + c[0]).attr("value", c[1])
			}
		})
	},
	refreshForm: function (a) {
		this.areaObjects[a].updateStatesFromForm();
		this.areaObjects[a].applyBasicAreaActions(jQuery("#" + a));
		this.updateForm(this.areaObjects[a].getId())
	},
	triggerAreaLinkUpdate: function (a) {
		console.log(this);
		console.log(a);
		this.refreshForm(a)
	},
	getNextId: function () {
		this.areaCount = this.areaCount + 1;
		return "Object" + this.areaCount
	},
	getNextMarkerPointId: function () {
		this.boxMarkerCount = this.boxMarkerCount + 1;
		return "markerPoint" + this.boxMarkerCount
	},
	getFormBlueprint: function (a) {
		return this.formBlueprints[a]
	},
	parseFormToBluePrint: function (b) {
		var a = new Array();
		jQuery(b + " > div").each(function (c) {
			if (jQuery(this).attr("class") == "noIdWrap") {
				a[this.id] = jQuery("#" + this.id).html()
			} else {
				a[this.id] = '<div class="' + this.id + " " + jQuery(this).attr("class") + '" id="MAPFORMID">' + jQuery("#" + this.id).html() + "</div>"
			}
		});
		return a
	},
	getMaxW: function () {
		return this.scaleFactor * this.imageOrigW
	},
	getMaxH: function () {
		return this.scaleFactor * this.imageOrigH
	}
});
var previewCanvasClass = Class.extend({
	canvasId: null,
	canvasVectors: null,
	areaCount: null,
	areaObjects: null,
	areaObjectList: null,
	scale: null,
	init: function (b, a) {
		this.canvasId = "#" + b;
		this.scale = a;
		this.canvasVectors = new jsGraphics(b);
		this.areaCount = 0;
		this.areaObjects = new Array();
		this.areaObjectList = new Array()
	},
	addArea: function (f, e, b, d, c, a) {
		f.init(this, this.getNextId(), e, b, d, c, {});
		f.disableEdges();
		f.setScale(this.scale);
		this.areaObjects[f.getId()] = f;
		if (a) {
			this.areaObjectList.push(f.getId())
		} else {
			this.areaObjectList.unshift(f.getId())
		}
		this.updateCanvas()
	},
	updateCanvas: function () {
		this.canvasVectors.clear();
		var a = this;
		jQuery.each(this.areaObjectList, function (c, b) {
			a.areaObjects[b].drawSelection(a.canvasVectors)
		});
		this.canvasVectors.paint()
	},
	getNextId: function () {
		this.areaCount = this.areaCount + 1;
		return "Object" + this.areaCount
	},
	getMaxW: function () {
		return jQuery(this.canvasId).width()
	},
	getMaxH: function () {
		return jQuery(this.canvasId).height()
	}
});
var areaClass = Class.extend({
	_id: -1,
	_link: -1,
	_label: "",
	_canvas: -1,
	_scale: 1,
	_edges: true,
	_undoStack: new Array(),
	_redoStack: new Array(),
	_moreOptionsInitFlag: false,
	_moreOptionsVisible: false,
	_attr: {},
	_colors: ["990033", "ff9999", "ffccff", "993366", "ff66cc", "ff0066", "ff00cc", "cc0099", "cc99ff", "ff33ff", "cc00cc", "cc99cc", "9933cc", "9966cc", "6600cc", "663366", "6633ff", "9999ff", "6666cc", "333399", "3333ff", "3366ff", "0000ff", "336699", "003366", "0099cc", "0099ff", "66ffff", "009999", "33cccc", "006666", "33cc99", "00ff99", "669966", "339933", "33cc66", "009933", "ccff99", "009900", "00ff00", "009900", "66cc00", "99cc66", "669900", "ccff00", "333300", "666633", "ffff99", "ffcc00", "996600", "993300", "990000", "ff3333", "FF0000", "ff6633", "996633", "cc9999", "cc9966", "eeeeee", "999999", "666666", "333333", "000000"],
	init: function (d, g, f, c, e, b, a) {
		this._canvas = d;
		this._id = g;
		this._attr = (typeof a == "object") ? a : {};
		this.setLabel(c);
		this.setLink(e);
		this.setColor(b);
		this.initCoords(f)
	},
	remove: function () {
		jQuery("#" + this.getFormId()).remove();
		this.getCanvas().removeArea(this.getId())
	},
	getCanvas: function () {
		return this._canvas
	},
	setLabel: function (a) {
		this._label = a
	},
	getLabel: function () {
		return this._label
	},
	setLink: function (a) {
		this._link = a
	},
	getLink: function () {
		return this._link
	},
	setScale: function (a) {
		if (a < 0 || a > 1) {
			return
		}
		this._scale = a
	},
	applyScale: function (a, b) {
		return ((b) ? this._scale : 1) * parseInt(a)
	},
	reverseScale: function (a) {
		return (1 / this._scale) * parseInt(a)
	},
	_color: -1,
	setColor: function (a) {
		this._color = ((typeof a == "string") && a.match(/^#\S{6}$/g)) ? a : ("#" + this._colors[parseInt(Math.random() * 57)])
	},
	updateColor: function (b, a) {
		this.setColor(b);
		jQuery("#" + this.getFormId() + "_main .colorPreview > div").css("backgroundColor", b);
		jQuery("#" + this.getFormId() + "_color .colorBox > div").css("backgroundColor", b);
		if (a == 1) {
			this.getCanvas().updateCanvas(this.getId())
		}
	},
	getColor: function () {
		return this._color
	},
	drawEdge: function (b, a, c) {
		if (!this._edges) {
			return
		}
		b.setColor(this.getColor());
		b.fillRect(a - 3, c - 3, 7, 7);
		b.setColor("#ffffff");
		b.fillRect(a - 2, c - 2, 5, 5)
	},
	disableEdges: function () {
		this._edges = false
	},
	applyBasicAreaActions: function () {
		this._moreOptionsInitFlag = false;
		jQuery("#" + this.getFormId() + " .positionOptions input").data("area", this).on('keyup', function (e) {
			var key = e.charCode || e.keyCode || 0;
			if (!(
				(key >= 48 && key <= 57)
				|| (key >= 96 && key <= 105)
			)) {
				return;
			}
			var a = jQuery(this).data("area");
			a.pushUndoableAction();
			a.updateCoordsFromForm()
		});
		jQuery("#" + this.getFormId() + "_del").data("area", this).click(function (a) {
			jQuery(this).data("area").remove()
		});
		jQuery("#" + this.getFormId() + " .basicOptions .expUpDown").parent().data("obj", this).data("rel", "#" + this.getFormId() + " > .moreOptions").click(function (a) {
			a.stopPropagation();
			if (!jQuery(this).data("obj").isMoreOptionsVisible()) {
				jQuery(this).data("obj").applyAdditionalAreaActions();
				jQuery(jQuery(this).data("rel")).slideDown("fast")
			} else {
				jQuery(jQuery(this).data("rel")).slideUp("fast")
			}
			jQuery(this).data("obj").toogleMoreOptionsFlag()
		});
		jQuery("#" + this.getFormId() + " .basicOptions .colorPreview > div").data("target", this).click(function (b) {
			var a = jQuery(this).data("target");
			var c = jQuery("#" + a.getFormId() + " > .basicOptions .expUpDown:visible").parent();
			jQuery(c).trigger("click")
		});
		jQuery("#" + this.getFormId() + "_link").data("obj", this).change(function (b) {
			jQuery(this).data("obj").updateStatesFromForm();
			var a = jQuery(this).data("obj");
			a.pushUndoableAction()
		});
		jQuery("#" + this.getFormId() + "_label").data("obj", this).change(function (b) {
			jQuery(this).data("obj").updateStatesFromForm();
			var a = jQuery(this).data("obj");
			a.pushUndoableAction()
		});
		jQuery("#" + this.getFormId() + "_up").data("obj", this).click(function (a) {
			if ($(this).hasClass('disabled')) {
				return;
			}
			jQuery(this).data("obj").getCanvas().areaUp(jQuery(this).data("obj").getId())
		});
		jQuery("#" + this.getFormId() + "_down").data("obj", this).click(function (a) {
			if ($(this).hasClass('disabled')) {
				return;
			}
			jQuery(this).data("obj").getCanvas().areaDown(jQuery(this).data("obj").getId())
		});
		jQuery("#" + this.getFormId() + "_undo").data("obj", this).click(function (a) {
			if ($(this).hasClass('disabled')) {
				return;
			}
			jQuery(this).data("obj").performUndo()
		});
		jQuery("#" + this.getFormId() + "_redo").data("obj", this).click(function (a) {
			if ($(this).hasClass('disabled')) {
				return;
			}
			jQuery(this).data("obj").performRedo()
		});
		this.applyBasicTypeActions();
		if (!this._moreOptionsVisible) {
			jQuery("#" + this.getFormId() + " > .moreOptions").hide()
		} else {
			this.applyAdditionalAreaActions()
		}
		this.updateColor(this.getColor(), 0);
		this.changeUndoBtnStates();
		this.refreshExpandButtons()
	},
	updateStatesFromForm: function () {
		this.setLink(jQuery("<div/>").text(jQuery("#" + this.getFormId() + "_link").val()).html());
		this.setLabel(jQuery("<div/>").text(jQuery("#" + this.getFormId() + "_label").val()).html());
		var a = this;
		if (typeof this._attr != "object") {
			return
		}
		jQuery.each(this._attr, function (b, c) {
			a._attr[b] = jQuery("<div/>").text(jQuery("#" + a.getFormId() + "_" + b).val()).html()
		})
	},
	getCommonFormUpdateFields: function () {
		var a = this.getFormId() + '_link="' + this.getLink() + '";';
		a = a + this.getFormId() + '_label="' + this.getLabel() + '";';
		if (typeof this._attr == "object") {
			var b = this;
			jQuery.each(this._attr, function (c, d) {
				a = a + b.getFormId() + "_" + c + '="' + d + '";'
			})
		}
		this.updateColor(this.getColor(), false);
		return a
	},
	getAdditionalAttributeXML: function () {
		var b = 'alt="' + this.getLabel().replace(/"/g, "&quot;") + '" color="' + this.getColor() + '"';
		var a = this;
		if (typeof this._attr != "object") {
			return
		}
		jQuery.each(this._attr, function (c, d) {
			b = b + " " + c + '="' + a._attr[c].replace(/"/g, "&quot;") + '"'
		});
		return b
	},
	applyAdditionalAreaActions: function () {
		if (this._moreOptionsInitFlag == true) {
			return
		}
		jQuery("#" + this.getFormId() + "_color > .colorPicker").data("area", this).simpleColor({colors: this._colors}).click(function (b, c) {
			if (typeof c == "undefined") {
				return
			}
			var a = jQuery(this).data("area");
			a.pushUndoableAction();
			a.updateColor(c, 1)
		});
		this.applyAdditionalTypeActions();
		this._moreOptionsInitFlag = true
	},
	refreshExpandButtons: function () {
		jQuery("#" + this.getFormId() + " .expUpDown").hide();
		if (this.isMoreOptionsVisible()) {
			jQuery("#" + this.getFormId() + " .up").show()
		} else {
			jQuery("#" + this.getFormId() + " .down").show()
		}
	},
	toogleMoreOptionsFlag: function () {
		this._moreOptionsVisible = !this._moreOptionsVisible;
		this.refreshExpandButtons()
	},
	isMoreOptionsVisible: function () {
		return this._moreOptionsVisible
	},
	getId: function () {
		return this._id
	},
	getFormId: function () {
		return this.getId()
	},
	performResizeAction: function (b, a, c) {
	},
	hitOnObjectEdge: function (a, c, b) {
		return -1
	},
	hitEdge: function (e, c, d, b, a) {
		return ((Math.abs(e - d) <= (a)) && (Math.abs(c - b) <= (a)))
	},
	performDragAction: function (b, a, c) {
	},
	hitOnObjectBorder: function (a, c, b) {
		return -1
	},
	hitBorder: function (c, i, a, h, f, e, l) {
		var j = (l / 2);
		var k = (c > a) ? ((f <= c + j) && (f >= a - j)) : ((f >= c - j) && (f <= a + j));
		var b = (i > h) ? ((e <= i + j) && (e >= h - j)) : ((e >= i - j) && (e <= h + j));
		if (k && b) {
			var g = (f * i + a * e + c * h - a * i - f * h - c * e) / Math.sqrt(Math.pow(a - c, 2) + Math.pow(h - i, 2));
			return (Math.abs(g) < (j)) ? true : false
		}
		return false
	},
	edgeWasHit: function (b, a, c) {
	},
	borderWasHit: function (b, a, c) {
	},
	pushUndoableAction: function () {
		this.updateStatesFromForm();
		this._undoStack.push(this.getUndoObject());
		this._redoStack.splice(0, this._redoStack.length);
		this.changeUndoBtnStates()
	},
	performUndo: function () {
		if (this._undoStack.length) {
			var a = this._undoStack.pop();
			this._redoStack.push(this.getUndoObject());
			this.restoreFromUndoOject(a);
			this.getCanvas().updateForm(this.getId());
			this.getCanvas().updateCanvas(this.getId())
		}
		this.changeUndoBtnStates()
	},
	performRedo: function () {
		if (this._redoStack.length) {
			var a = this._redoStack.pop();
			this._undoStack.push(this.getUndoObject());
			this.restoreFromUndoOject(a);
			this.getCanvas().updateForm(this.getId());
			this.getCanvas().updateCanvas(this.getId())
		}
		this.changeUndoBtnStates()
	},
	getUndoObject: function () {
		return {}
	},
	restoreFromUndoOject: function (a) {
	},
	changeUndoBtnStates: function () {
		if (this._undoStack.length) {
			jQuery("#" + this.getFormId() + "_undo").removeClass('disabled');
		} else {
			jQuery("#" + this.getFormId() + "_undo").addClass('disabled');
		}
		if (this._redoStack.length) {
			jQuery("#" + this.getFormId() + "_redo").removeClass('disabled')
		} else {
			jQuery("#" + this.getFormId() + "_redo").addClass('disabled')
		}
	}
});
var areaCircleClass = areaClass.extend({
	_coords: -1, _undoStack: new Array(), _redoStack: new Array(), initCoords: function (b) {
		if (typeof b == "undefined") {
			return
		}
		this._coords = new Array();
		var a = b.split(",");
		this.setX(a[0]);
		this.setY(a[1]);
		this.setRadius(a[2])
	}, getStartupCoords: function (d, c) {
		var a = (c.w > 200) ? 100 : (c.w / 2);
		var b = (c.h > 200) ? 100 : (c.h / 2);
		return d.x + "," + d.y + "," + ((a > b) ? b / 2 : a / 2)
	}, persistanceXML: function () {
		return '<area shape="circle" coords="' + this.getX(0) + "," + this.getY(0) + "," + this.getRadius(0) + '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>"
	}, drawSelection: function (a) {
		a.setColor(this.getColor());
		a.setStroke(1);
		a.drawEllipse(this.getX(1) - this.getRadius(1), this.getY(1) - this.getRadius(1), 2 * this.getRadius(1), 2 * this.getRadius(1));
		this.drawEdge(a, this.getX(1), this.getY(1));
		if ((this.getX(1) - this.getRadius(1)) > 0) {
			this.drawEdge(a, this.getX(1) - this.getRadius(1), this.getY(1))
		}
		if ((this.getX(1) + this.getRadius(1)) < this.getCanvas().getMaxW()) {
			this.drawEdge(a, this.getX(1) + this.getRadius(1), this.getY(1))
		}
		if ((this.getY(1) - this.getRadius(1)) > 0) {
			this.drawEdge(a, this.getX(1), this.getY(1) - this.getRadius(1))
		}
		if ((this.getY(1) + this.getRadius(1)) < this.getCanvas().getMaxH()) {
			this.drawEdge(a, this.getX(1), this.getY(1) + this.getRadius(1))
		}
	}, formMarkup: function (a) {
		return this.getCanvas().getFormBlueprint("circForm").replace(/MAPFORMID/g, this.getFormId()).replace(/MAPAREAVALUE_URL/g, escape(this.getLink())).replace(/MAPAREAVALUE/g, this.getLink())
	}, formUpdate: function () {
		var a = this.getFormId() + '_x="' + this.getX(0) + '";' + this.getFormId() + '_y="' + this.getY(0) + '";' + this.getFormId() + '_radius="' + this.getRadius(0) + '";';
		a = a + this.getCommonFormUpdateFields();
		return a
	}, applyBasicTypeActions: function () {
	}, applyAdditionalTypeActions: function () {
	}, updateCoordsFromForm: function (a) {
		this.setX(parseInt(jQuery("#" + this.getFormId() + "_x").val()));
		this.setY(parseInt(jQuery("#" + this.getFormId() + "_y").val()));
		this.setRadius(parseInt(jQuery("#" + this.getFormId() + "_radius").val()));
		this.getCanvas().updateCanvas(this.getId())
	}, hitOnObjectEdge: function (d, c, b) {
		var a = -1;
		if (this.hitEdge(d, c, this.getX(1), this.getY(1), b)) {
			a = 0
		} else {
			if (this.hitEdge(d, c, this.getX(1) - this.getRadius(1), this.getY(1), b)) {
				a = 1
			} else {
				if (this.hitEdge(d, c, this.getX(1) + this.getRadius(1), this.getY(1), b)) {
					a = 2
				} else {
					if (this.hitEdge(d, c, this.getX(1), this.getY(1) - this.getRadius(1), b)) {
						a = 3
					} else {
						if (this.hitEdge(d, c, this.getX(1), this.getY(1) + this.getRadius(1), b)) {
							a = 4
						}
					}
				}
			}
		}
		return a
	}, performResizeAction: function (b, e, c) {
		var a = this.reverseScale(e);
		var d = this.reverseScale(c);
		if (b == 0) {
			this.setX(a);
			this.setY(d)
		} else {
			if (b == 1 || b == 2) {
				this.setRadius(this.getX(0) - a)
			} else {
				if (b == 3 || b == 4) {
					this.setRadius(this.getY(0) - d)
				}
			}
		}
		return b
	}, performDragAction: function (c, b, a) {
		this.setX(this.getX(0) + this.reverseScale(b));
		this.setY(this.getY(0) + this.reverseScale(a));
		return c
	}, hitOnObjectBorder: function (b, d, c) {
		var a = -1;
		if (this.hitBorder(this.getX(1), this.getY(1), this.getRadius(1), this.getRadius(1), b, d, c)) {
			a = 1
		}
		return a
	}, hitBorder: function (c, f, b, a, h, g, e) {
		var i = Math.sqrt(Math.pow(h - c, 2) + Math.pow(g - f, 2));
		return (Math.abs(i) < (b + (e / 2)) && Math.abs(i) > (b - (e / 2))) ? true : false
	}, getX: function (a) {
		return this.applyScale(this._coords[0], a)
	}, setX: function (a) {
		this._coords[0] = parseInt(a)
	}, getY: function (a) {
		return this.applyScale(this._coords[1], a)
	}, setY: function (a) {
		this._coords[1] = parseInt(a)
	}, getRadius: function (a) {
		return this.applyScale(this._coords[2], a)
	}, setRadius: function (a) {
		this._coords[2] = Math.abs(parseInt(a))
	}, getUndoObject: function () {
		return {
			color: this.getColor(),
			x: this.getX(false),
			y: this.getY(false),
			radius: this.getRadius(false),
			link: this.getLink(),
			label: this.getLabel()
		}
	}, restoreFromUndoOject: function (a) {
		this.setLabel(a.label);
		this.setLink(a.link);
		this.setColor(a.color);
		this.setX(a.x);
		this.setY(a.y);
		this.setRadius(a.radius)
	}
});
var areaPolyClass = areaClass.extend({
	_coords: -1, _undoStack: new Array(), _redoStack: new Array(), initCoords: function (c) {
		if (typeof c == "undefined") {
			return
		}
		this._coords = new Array();
		var b = c.split(",");
		for (var a = 0; a < b.length; a = a + 2) {
			this.addCoord(b[a], b[a + 1], false)
		}
	}, getStartupCoords: function (d, c) {
		var a = (c.w > 200) ? 100 : (c.w / 2);
		var b = (c.h > 200) ? 100 : (c.h / 2);
		return d.x + "," + (d.y - (b / 2)) + "," + (d.x - (a / 2)) + "," + (d.y + (b / 2)) + "," + (d.x + (a / 2)) + "," + (d.y + (b / 2))
	}, persistanceXML: function () {
		return '<area shape="poly" coords="' + this.joinCoords() + '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>"
	}, drawSelection: function (c) {
		c.setStroke(1);
		for (var e = 0; e < this._coords.length; e++) {
			var b = this._coords[e].x;
			var f = this._coords[e].y;
			var a = this._coords[((e > 0) ? e : this._coords.length) - 1].x;
			var d = this._coords[((e > 0) ? e : this._coords.length) - 1].y;
			c.setColor(this.getColor());
			c.drawLine(this.applyScale(b, 1), this.applyScale(f, 1), this.applyScale(a, 1), this.applyScale(d, 1))
		}
		for (var e = 0; e < this._coords.length; e++) {
			this.drawEdge(c, this.applyScale(this._coords[e].x, 1), this.applyScale(this._coords[e].y, 1))
		}
	}, formMarkup: function (a) {
		return this.getCanvas().getFormBlueprint("polyForm").replace(/MAPFORMID/g, this.getFormId()).replace(/MAPAREAVALUE_URL/g, escape(this.getLink())).replace(/MAPAREAVALUE/g, this.getLink()).replace(/POLYCOORDS/g, this.coordMarkup())
	}, coordMarkup: function () {
		var a = "";
		var c = this.getCanvas().getFormBlueprint("polyCoords");
		for (var b = 0; b < this._coords.length; b++) {
			a = a + c.replace(/MAPFORMID/g, this.getFormId()).replace(/vN/g, b).replace(/vX/g, this._coords[b].x).replace(/vY/g, this._coords[b].y)
		}
		return a
	}, formUpdate: function () {
		var a = "";
		for (var b = 0; b < this._coords.length; b++) {
			a = a + this.getFormId() + "_x" + b + '="' + parseInt(this._coords[b].x) + '";';
			a = a + this.getFormId() + "_y" + b + '="' + parseInt(this._coords[b].y) + '";'
		}
		a = a + this.getCommonFormUpdateFields();
		return a
	}, applyBasicTypeActions: function () {
		jQuery("#" + this.getFormId() + "_add").data("obj", this).click(function (a) {
			jQuery(this).data("obj").insertNewCoordAfterPoint(-1)
		})
	}, applyAdditionalTypeActions: function () {
		jQuery("#" + this.getFormId() + "_more > .positionOptions > .addCoord").data("obj", this).click(function (a) {
			if (this.id.match(/^.*_after\d+$/)) {
				jQuery(this).data("obj").insertNewCoordAfterPoint(parseInt(this.id.replace(/^.*_after/g, "")))
			}
			if (this.id.match(/^.*_before\d+$/)) {
				jQuery(this).data("obj").insertNewCoordBeforePoint(parseInt(this.id.replace(/^.*_before/g, "")))
			}
		});
		jQuery("#" + this.getFormId() + "_more > .positionOptions > .rmCoord").data("obj", this).click(function (a) {
			jQuery(this).data("obj").removeCoord(parseInt(this.id.replace(/^.*_rm/g, "")))
		})
	}, updateCoordsFromForm: function (b) {
		for (var a = 0; a < this._coords.length; a++) {
			this._coords[a].x = parseInt(jQuery("#" + this.getFormId() + "_x" + a).val());
			this._coords[a].y = parseInt(jQuery("#" + this.getFormId() + "_y" + a).val())
		}
		this.getCanvas().updateCanvas(this.getId())
	}, hitOnObjectEdge: function (e, c, b) {
		var a = -1;
		for (var d = 0; d < this._coords.length; d++) {
			if ((a == -1) && this.hitEdge(e, c, this.applyScale(this._coords[d].x, 1), this.applyScale(this._coords[d].y, 1), b)) {
				a = d
			}
		}
		return a
	}, performResizeAction: function (b, e, c) {
		var a = this.reverseScale(e);
		var d = this.reverseScale(c);
		if (b >= 0 && b < this._coords.length) {
			this._coords[b].x = a;
			this._coords[b].y = d
		}
		return b
	}, hitOnObjectBorder: function (f, e, d) {
		var a = -1;
		for (var c = 0; c < this._coords.length; c++) {
			var b = ((c + 1) == this._coords.length) ? 0 : c + 1;
			if ((a == -1) && this.hitBorder(this.applyScale(this._coords[c].x, 1), this.applyScale(this._coords[c].y, 1), this.applyScale(this._coords[b].x, 1), this.applyScale(this._coords[b].y, 1), f, e, d)) {
				a = c
			}
		}
		return a
	}, performDragAction: function (c, b, a) {
		for (var d = 0; d < this._coords.length; d++) {
			this._coords[d].x = this._coords[d].x + this.reverseScale(b);
			this._coords[d].y = this._coords[d].y + this.reverseScale(a)
		}
		return c
	}, edgeWasHit: function (a) {
		this.removeCoord(a);
		return true
	}, borderWasHit: function (b, a, c) {
		this._coords.splice(b + 1, 0, {x: this.reverseScale(a), y: this.reverseScale(c)});
		this.getCanvas().updateCanvas(this.getId());
		this.getCanvas().refreshForm(this.getId());
		return true
	}, addCoord: function (b, a) {
		this._coords.push({x: parseInt(b), y: parseInt(a)})
	}, insertNewCoordAfterPoint: function (c) {
		var e, b, a;
		a = this._coords.length - 1;
		if (c == -1 || c >= a) {
			e = 0;
			b = a
		} else {
			e = c;
			b = c + 1
		}
		var f = (this._coords[e].x + this._coords[b].x) / 2;
		var d = (this._coords[e].y + this._coords[b].y) / 2;
		if (e == 0 && b == a) {
			this.addCoord(f, d)
		} else {
			this._coords.splice(b, 0, {x: parseInt(f), y: parseInt(d)})
		}
		this.getCanvas().updateCanvas(this.getId());
		this.getCanvas().refreshForm(this.getId())
	}, insertNewCoordBeforePoint: function (a) {
		this.insertNewCoordAfterPoint(a - 1)
	}, removeCoord: function (a) {
		if (this._coords.length > 3) {
			this._coords.splice(a, 1);
			this.getCanvas().updateCanvas(this.getId());
			this.getCanvas().refreshForm(this.getId())
		} else {
			alert("Polygone needs to have at least 3 Edges")
		}
	}, joinCoords: function () {
		var a = "";
		for (var b = 0; b < this._coords.length; b++) {
			a = a + (a.length ? "," : "") + parseInt(this._coords[b].x) + "," + parseInt(this._coords[b].y)
		}
		return a
	}, getUndoObject: function () {
		return {color: this.getColor(), coords: this.joinCoords(), link: this.getLink(), label: this.getLabel()}
	}, restoreFromUndoOject: function (a) {
		this.setLabel(a.label);
		this.setLink(a.link);
		this.setColor(a.color);
		this.initCoords(a.coords)
	}
});
var areaRectClass = areaClass.extend({
	_coords: -1, _undoStack: new Array(), _redoStack: new Array(), initCoords: function (b) {
		if (typeof b == "undefined") {
			return
		}
		this._coords = new Array();
		var a = b.split(",");
		this.setX(a[0], a[2]);
		this.setY(a[1], a[3])
	}, getStartupCoords: function (d, c) {
		var a = (c.w > 200) ? 100 : (c.w / 2);
		var b = (c.h > 200) ? 100 : (c.h / 2);
		return (d.x - (a / 2)) + "," + (d.y - (b / 2)) + "," + (d.x + (a / 2)) + "," + (d.y + (b / 2))
	}, persistanceXML: function () {
		return '<area shape="rect" coords="' + this.getLeftX(0) + "," + this.getTopY(0) + "," + this.getRightX(0) + "," + this.getBottomY(0) + '" ' + this.getAdditionalAttributeXML() + ">" + this.getLink() + "</area>"
	}, drawSelection: function (a) {
		a.setColor(this.getColor());
		a.setStroke(1);
		a.drawRect(this.getLeftX(1), this.getTopY(1), this.getWidth(1), this.getHeight(1));
		this.drawEdge(a, this.getLeftX(1), this.getTopY(1));
		this.drawEdge(a, this.getRightX(1), this.getTopY(1));
		this.drawEdge(a, this.getRightX(1), this.getBottomY(1));
		this.drawEdge(a, this.getLeftX(1), this.getBottomY(1))
	}, formMarkup: function (a) {
		return this.getCanvas().getFormBlueprint("rectForm").replace(/MAPFORMID/g, this.getFormId()).replace(/MAPAREAVALUE_URL/g, escape(this.getLink())).replace(/MAPAREAVALUE/g, this.getLink())
	}, formUpdate: function () {
		var a = this.getFormId() + '_x1="' + this.getLeftX(0) + '";' + this.getFormId() + '_y1="' + this.getTopY(0) + '";' + this.getFormId() + '_x2="' + this.getRightX(0) + '";' + this.getFormId() + '_y2="' + this.getBottomY(0) + '";';
		a = a + this.getCommonFormUpdateFields();
		return a
	}, applyBasicTypeActions: function () {
	}, applyAdditionalTypeActions: function () {
	}, updateCoordsFromForm: function (a) {
		this.setX(parseInt(jQuery("#" + this.getFormId() + "_x1").val()), parseInt(jQuery("#" + this.getFormId() + "_x2").val()));
		this.setY(parseInt(jQuery("#" + this.getFormId() + "_y1").val()), parseInt(jQuery("#" + this.getFormId() + "_y2").val()));
		this.getCanvas().updateCanvas(this.getId())
	}, hitOnObjectEdge: function (d, c, b) {
		var a = -1;
		if (this.hitEdge(d, c, this.getLeftX(1), this.getTopY(1), b)) {
			a = 0
		} else {
			if (this.hitEdge(d, c, this.getRightX(1), this.getTopY(1), b)) {
				a = 1
			} else {
				if (this.hitEdge(d, c, this.getRightX(1), this.getBottomY(1), b)) {
					a = 2
				} else {
					if (this.hitEdge(d, c, this.getLeftX(1), this.getBottomY(1), b)) {
						a = 3
					}
				}
			}
		}
		return a
	}, performResizeAction: function (b, h, g) {
		var i = this.reverseScale(h);
		var f = this.reverseScale(g);
		var d = this.getLeftX(0);
		var c = this.getTopY(0);
		var e = this.getWidth(0);
		var a = this.getHeight(0);
		if (b == 0 || b == 3) {
			e = e - (i - d)
		}
		if (b == 0 || b == 1) {
			a = a - (f - c)
		}
		if (b == 2 || b == 1) {
			e = i - d
		}
		if (b == 2 || b == 3) {
			a = f - c
		}
		if (b == 0 || b == 3) {
			d = i
		}
		if (b == 0 || b == 1) {
			c = f
		}
		if (e < 0) {
			d = d + e;
			e = -e;
			if (b == 0) {
				b = 1
			} else {
				if (b == 1) {
					b = 0
				} else {
					if (b == 2) {
						b = 3
					} else {
						if (b == 3) {
							b = 2
						}
					}
				}
			}
		}
		if (a < 0) {
			c = c + a;
			a = -a;
			if (b == 0) {
				b = 3
			} else {
				if (b == 1) {
					b = 2
				} else {
					if (b == 2) {
						b = 1
					} else {
						if (b == 3) {
							b = 0
						}
					}
				}
			}
		}
		this.setX(d, d + e);
		this.setY(c, c + a);
		return b
	}, hitOnObjectBorder: function (d, c, b) {
		var a = -1;
		if (this.hitBorder(this.getLeftX(1), this.getTopY(1), this.getRightX(1), this.getTopY(1), d, c, b)) {
			a = 1
		}
		if (this.hitBorder(this.getRightX(1), this.getTopY(1), this.getRightX(1), this.getBottomY(1), d, c, b)) {
			a = 2
		}
		if (this.hitBorder(this.getLeftX(1), this.getBottomY(1), this.getRightX(1), this.getBottomY(1), d, c, b)) {
			a = 3
		}
		if (this.hitBorder(this.getLeftX(1), this.getTopY(1), this.getLeftX(1), this.getBottomY(1), d, c, b)) {
			a = 4
		}
		return a
	}, performDragAction: function (d, c, b) {
		var a = this.getLeftX(0);
		var g = this.getTopY(0);
		var f = this.reverseScale(c);
		var e = this.reverseScale(b);
		this.setX(a + f, a + f + this.getWidth(0));
		this.setY(g + e, g + e + this.getHeight(0));
		return d
	}, getLeftX: function (a) {
		return this.applyScale(this._coords[0], a)
	}, getTopY: function (a) {
		return this.applyScale(this._coords[1], a)
	}, getRightX: function (a) {
		return this.applyScale(this._coords[2], a)
	}, getBottomY: function (a) {
		return this.applyScale(this._coords[3], a)
	}, getWidth: function (a) {
		return this.applyScale(this.getRightX(0) - this.getLeftX(0), a)
	}, getHeight: function (a) {
		return this.applyScale(this.getBottomY(0) - this.getTopY(0), a)
	}, setX: function (b, a) {
		this._coords[0] = parseInt(parseInt(b) > parseInt(a) ? a : b);
		this._coords[2] = parseInt(parseInt(b) > parseInt(a) ? b : a)
	}, setY: function (b, a) {
		this._coords[1] = parseInt(parseInt(b) > parseInt(a) ? a : b);
		this._coords[3] = parseInt(parseInt(b) > parseInt(a) ? b : a)
	}, setW: function (b) {
		var a = this.getLeftX(0);
		this.setX(a, a + b)
	}, setH: function (a) {
		var b = this.getTopY(0);
		this.setY(b, b + a)
	}, getUndoObject: function () {
		return {
			color: this.getColor(),
			x1: this._coords[0],
			x2: this._coords[2],
			y1: this._coords[1],
			y2: this._coords[3],
			link: this.getLink(),
			label: this.getLabel()
		}
	}, restoreFromUndoOject: function (a) {
		this.setLabel(a.label);
		this.setLink(a.link);
		this.setColor(a.color);
		this.setX(a.x1, a.x2);
		this.setY(a.y1, a.y2)
	}
});
