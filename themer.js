(function(){
window.themer = themer




function themer() {
	//return;

	var bucketlums = [2, 5, 7, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
	var colorbuckets = bucketlums.length

	var div
	var originals = {};
	var values = {};

	var valuesjson = localStorage.getItem('themer')
	if(valuesjson) {
		values = JSON.parse(valuesjson)
	}

	if(!values['profile']) {
		values['profile'] = 0
	}
	if(!values['profiles']) {
		values['profiles'] = [{'title':'Profile'}]
	}

	var profile = values['profiles'][values['profile']]

	var save = function() {
		//console.log("saving values", values)
		localStorage.setItem('themer', JSON.stringify(values))
	}

	var rootStyles = document.styleSheets[0].cssRules[0].style
	Object.values(rootStyles).forEach(function(k) {
		if(k.length < 2 || k.substr(0, 2) != "--") {
			return
		}
		var v = rootStyles.getPropertyValue(k).trim()
		originals[k] = v
		if(!profile[k]) {
			profile[k] = v
		}
	})

	var apply = function() {
		//console.log("applying values", values)
		Object.keys(profile).forEach(function(k) {
			if(k.length < 2 || k.substr(0, 2) != "--") {
				return
			}
			rootStyles.setProperty(k, profile[k])

			if(profile[k] && profile[k].substr(0, 1) == '#') {
				var rgb = css2rgb(profile[k])
				var hsl = rgb2hsl(rgb)

				for(var i = 0; i < colorbuckets; i++) {
					var name = k+"-"+numpad(bucketlums[i])
					var light = bucketlums[i] / 100
					var newhsl = [hsl[0], hsl[1], light]

					newhsl = hsl_set_luma(newhsl, light)

					//var txthsl = hsl_set_contrast(newhsl, 7)
					//var bighsl = hsl_set_contrast(newhsl, 4.5)
					//var maxhsl = hsl_set_contrast(newhsl, 40)
					//rootStyles.setProperty(name+"-txt", rgb2css(hsl2rgb(txthsl)))
					//rootStyles.setProperty(name+"-big", rgb2css(hsl2rgb(bighsl)))
					//rootStyles.setProperty(name+"-max", rgb2css(hsl2rgb(maxhsl)))
					rootStyles.setProperty(name, rgb2css(hsl2rgb(newhsl)))
				}
			}
		})
	}

	apply()

	document.body.addEventListener("keydown", function(ev) {
		if(ev.keyCode != 113) {
			return
		}
		ev.preventDefault()
		ev.stopPropagation()
		togglethemer()
	})

	var togglethemer

	var reset = function() {
		//console.log("resetting values", originals)
		Object.keys(profile).forEach(function(k) {
			if(k.length >= 2 && k.substr(0, 2) == '--') {
				delete profile[k]
			}
		})
		Object.keys(originals).forEach(function(k) {
			profile[k] = originals[k]
		})
		apply()
		save()
		if(values['open']) {
			togglethemer() // hide
			togglethemer() // show
		}
	}

	togglethemer = function() {
		if(div) {
			values['open'] = false
			save()
			div.parentNode.removeChild(div)
			div = undefined
			return
		}

		values['open'] = true
		save()

		var explaindiv = document.createElement('div')
		explaindiv.className = 'themer-explain'

		var reexplain = function() {
			var txt = ''
			Object.keys(profile).forEach(function(k) {
				if(k.length < 2 || k.substr(0, 2) != "--") {
					return
				}
				if(profile[k] != originals[k]) {
					txt += "\t" + k + ": " + profile[k] + ";\n"
				}
			})
			if(txt.length > 0) {
				txt = "\n" + txt + "\n" // just make it easier to select for copy/paste
				explaindiv.style.display = 'block'
			} else {
				explaindiv.style.display = 'none'
			}
			explaindiv.innerHTML = ''
			explaindiv.appendChild(document.createTextNode(txt))
		}

		div = document.createElement("div")
		div.className = 'themer-overlay'

		var resetbutton = document.createElement('button')
		resetbutton.style.opacity = 0.25
		resetbutton.appendChild(document.createTextNode('Reset'))
		resetbutton.addEventListener('click', function(ev) {
			reset()
		})
		div.appendChild(resetbutton)

		var delbutton = document.createElement('button')
		delbutton.style.opacity = 0.25
		delbutton.appendChild(document.createTextNode('Delete'))
		delbutton.addEventListener('click', function(ev) {
			save()

			if(values.profiles.length == 1) {
				reset()
				profile.title = 'Profile'
				save()
				apply()
				if(values['open']) {
					togglethemer() // hide
					togglethemer() // show
				}
				return
			}
			var newprofiles = []
			for(var i = 0; i < values.profiles.length; i++) {
				if(i != values.profile) {
					newprofiles.push(values.profiles[i])
				}
			}
			if(values.profile > 0) {
				values.profile--
			}
			values.profiles = newprofiles
			profile = values.profiles[values.profile]
			save()
			apply()
			if(values['open']) {
				togglethemer() // hide
				togglethemer() // show
			}
		})
		div.appendChild(delbutton)

		div.appendChild(document.createTextNode(' '))

		for(var i = 0; i < values.profiles.length; i++) {
			var pbutton = document.createElement('button')
			if(i != values.profile) {
				pbutton.style.opacity = 0.25
			}
			pbutton.appendChild(document.createTextNode(values.profiles[i].title))
			pbutton.addEventListener('click', (function(ii) {
				return function(ev) {
					if(ev.shiftKey) {
						var val = window.prompt('Profile title:', values.profiles[ii].title)
						values.profiles[ii].title = val
					} else {
						save()
						values.profile = ii
						profile = values.profiles[ii]
						apply()
					}
					if(values['open']) {
						togglethemer() // hide
						togglethemer() // show
					}
				}
			})(i))
			pbutton.addEventListener('doubleclick', (function(ii) {
				return function(ev) {
				}
			})(i))
			div.appendChild(pbutton)
		}

		var newpbutton = document.createElement('button')
		newpbutton.appendChild(document.createTextNode('+'))
		newpbutton.style.opacity = 0.25
		newpbutton.addEventListener('click', function(ev) {
			var newp = {'title': 'Copy of ' + profile.title}
			values.profiles.push(newp)
			Object.keys(profile).forEach(function(k) {
				if(k.length >= 2 && k.substr(0, 2) == '--') {
					newp[k] = profile[k]
				}
			})
			if(values['open']) {
				togglethemer() // hide
				togglethemer() // show
			}
		})
		div.appendChild(newpbutton)

		var rootStyles = document.styleSheets[0].cssRules[0].style

		var table = document.createElement('table')
		table.style.margin = '1rem'
		table.setAttribute('border', 0)
		table.setAttribute('cellpadding', 0)
		table.setAttribute('cellspacing', 0)
		var tbody = document.createElement('tbody')
		table.appendChild(tbody)

		var tr = document.createElement('tr')
		var th = document.createElement('th')
		th.appendChild(document.createTextNode('Name'))
		tr.appendChild(th)

		th = document.createElement('th')
		th.appendChild(document.createTextNode('Value'))
		tr.appendChild(th)

		for(var i = 0; i < colorbuckets; i++) {
			th = document.createElement('th')
			th.appendChild(document.createTextNode(numpad(bucketlums[i])))
			tr.appendChild(th)
		}
		tbody.appendChild(tr)

		var setoriginals = false
		if(!originals) {
			originals = {}
			setoriginals = true
		}

		Object.values(rootStyles).forEach(function(v) {
			if(v.substr(0, 2) != "--") {
				return
			}
			if(v.match(/\-\d+$/) || v.match(/\-\d+\-[a-z]{3}$/)) {
				return
			}

			var val = rootStyles.getPropertyValue(v).trim()

			if(setoriginals) {
				originals[v] = val
				profile[v] = val
			}

			var tr = document.createElement('tr')
			var td = document.createElement('td')
			td.style.paddingRight = '1rem'
			td.appendChild(document.createTextNode(v.substr(2)))
			tr.appendChild(td)

			td = document.createElement('td')
			var input = document.createElement('input')
			td.appendChild(input)
			tr.appendChild(td)
			if(val.length > 0 && val.substr(0, 1) == '#') {
				// color mode!
				input.setAttribute('type', 'color')
				input.className = 'themer-color'
				td.style.borderRight = '2px solid black'

				var subdivs = []
				var lumdivs = []

				var recolor;

				for(var i = 0; i < colorbuckets; i++) {
					var name = v+"-"+numpad(bucketlums[i])

					td = document.createElement('td')
					var subdiv = document.createElement('input')
					subdiv.setAttribute('type', 'color')
					subdiv.className = 'themer-color'
					subdiv.addEventListener('change', (function(name) {
						return function(ev) {
							profile[name] = ev.target.value
							recolor(input.value)
							apply()
							reexplain()
							save()
						}
					})(name))
					subdivs.push(subdiv)
					var lumdiv = document.createElement('div');
					lumdiv.className = 'themer-lum'
					lumdivs.push(lumdiv)
					td.appendChild(subdiv)
					//td.appendChild(lumdiv)
					tr.appendChild(td)
				}

				var recolor = function(val) {
					var rgb = css2rgb(val)
					var hsl = rgb2hsl(rgb)

					var max = subdivs.length
					for(var i = 0; i < colorbuckets; i++) {
						var name = v+"-"+numpad(bucketlums[i])

//						var txtname = name + "-txt"
//						var bigname = name + "-big"

						var light = bucketlums[i] / 100
						var newhsl = [hsl[0], hsl[1], light]

						newhsl = hsl_set_luma(newhsl, light)

//						var newtxthsl = hsl_set_contrast(newhsl, 7)
//						var newbighsl = hsl_set_contrast(newhsl, 4.5)

						var defaultcss = rgb2css(hsl2rgb(newhsl))
						var newcss = defaultcss

						var override = profile[name]

						if(override && override != defaultcss) {
							var overridehsl = rgb2hsl(css2rgb(override))
							newhsl[2] = overridehsl[2]
							newcss = rgb2css(hsl2rgb(newhsl))
						}

						if(newcss != defaultcss) {
							subdivs[i].className = 'themer-color themer-color-override'
							profile[name] = newcss
						} else {
							subdivs[i].className = 'themer-color'
							delete profile[name]
						}

						subdivs[i].value = newcss
						lumdivs[i].innerHTML = Math.round(rgb2lum(css2rgb(newcss)) * 100);
					}
				}

				var coloronchange = function(ev) {
					recolor(input.value)
				}

				input.addEventListener('change', coloronchange)
				recolor(val)
			} else {
				td.setAttribute('colspan', colorbuckets + 1)
				input.className = 'themer-text'
			}
			input.setAttribute('value', val)
			input.addEventListener('change', function(ev) {
				profile[v] = input.value
				apply()
				reexplain()
				save()
			})
			tbody.appendChild(tr)
		})

		div.appendChild(table)

		div.appendChild(explaindiv)
		reexplain()

		document.body.appendChild(div)
	}

	if(values['open']) {
		togglethemer()
	}
}

/*function hue2rgb(p, q, t) {
	if(t < 0) t += 1
	if(t > 1) t -= 1
	if(t < 1/6) return p + (q - p) * 6 * t
	if(t < 1/2) return q
	if(t < 2/3) return p + (q - p) * (2/3 - t) * 6
	return p;
}

function hsl2rgb(hsl) {
	var h = hsl[0], s = hsl[1], l = hsl[2]
	var r, g, b

	if(s == 0){
		r = g = b = l
	}else{
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s
		var p = 2 * l - q
		r = hue2rgb(p, q, h + 1/3)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h - 1/3)
	}

	return [r, g, b]
}*/

var hsl2rgb = function(hsl){
	var hue = hsl[0], saturation = hsl[1], lightness = hsl[2]

	hue *= 360

	var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
	var huePrime = hue / 60;
	var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

	huePrime = Math.floor(huePrime);
	var red;
	var green;
	var blue;

	if( huePrime === 0 ){
		red = chroma;
		green = secondComponent;
		blue = 0;
	}else if( huePrime === 1 ){
		red = secondComponent;
		green = chroma;
		blue = 0;
	}else if( huePrime === 2 ){
		red = 0;
		green = chroma;
		blue = secondComponent;
	}else if( huePrime === 3 ){
		red = 0;
		green = secondComponent;
		blue = chroma;
	}else if( huePrime === 4 ){
		red = secondComponent;
		green = 0;
		blue = chroma;
	}else if( huePrime === 5 ){
		red = chroma;
		green = 0;
		blue = secondComponent;
	}

	var lightnessAdjustment = lightness - (chroma / 2);
	red += lightnessAdjustment;
	green += lightnessAdjustment;
	blue += lightnessAdjustment;

	return [red, green, blue]

};


/*function rgb2hsl(rgb){
	var r = rgb[0], g = rgb[1], b = rgb[2]
	var max = Math.max(r, g, b)
	var min = Math.min(r, g, b)
	var h, s, l = (max + min) / 2

	if(max == min){
		h = s = 0
	}else{
		var d = max - min
		s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min)
		switch(max){
			case r: h = ((g - b) / d + 0)*60; break
			case g: h = ((b - r) / d + 2)*60; break
			case b: h = ((r - g) / d + 4)*60; break
		}
	}

	return [h, s, l]
}*/
function rgb2hsl(rgb) {
	var r = rgb[0], g = rgb[1], b = rgb[2]
	var max = Math.max(r, g, b)
	var min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return [ h, s, l ];
}

// https://www.msfw.com/Services/ContrastRatioCalculator
function rgb2lum(rgb) {
	var r = (rgb[0] <= 0.03928) ? rgb[0]/12.92 : Math.pow(((rgb[0] + 0.055)/1.055), 2.4)
	var g = (rgb[1] <= 0.03928) ? rgb[1]/12.92 : Math.pow(((rgb[1] + 0.055)/1.055), 2.4)
	var b = (rgb[2] <= 0.03928) ? rgb[2]/12.92 : Math.pow(((rgb[2] + 0.055)/1.055), 2.4)
	return (0.2126 * r + 0.7152 * g + 0.0722 * b)
}
// https://www.msfw.com/Services/ContrastRatioCalculator
// range is 1-21:1
// normal text:
//   < 4.5:  fail
//   < 7:    AA
// large text:
//   < 3:    fail
//   < 4.5:  AA
function rgbcontrast(c1, c2) {
	var l1 = rgb2lum(c1)
	var l2 = rgb2lum(c2)
	//return Math.round((Math.max(l1, l2) + 0.05)/(Math.min(l1, l2) + 0.05)*10)/10;
	return Math.max(l1, l2) / Math.min(l1, l2)
}

// stupidest function ever, i just don't know how to invert rgb2lum() at the moment
function hsl_set_luma(hsl, luma) {
	// brute force style. UGH.

	var step = 0.001

	var v = [hsl[0], hsl[1], hsl[2]]
	var l = rgb2lum(hsl2rgb(v))
	if(l > luma) {
		while(l > luma && v[2] > step) {
			v[2] -= step
			l = rgb2lum(hsl2rgb(v))
		}
		return v
	}
	if(l < luma) {
		while(l < luma && v[2] < (1 - step)) {
			v[2] += step
			l = rgb2lum(hsl2rgb(v))
		}
		return v
	}
	return v
}
// another stupid function to choose a good contrasting text color
function hsl_set_contrast(hsl, contrast) {
	var step = 0.001

	var ol = rgb2lum(hsl2rgb(hsl))

	var v = [hsl[0], hsl[1], hsl[2]]
	var l = ol
	var c = 0

	//console.log(ol)

	if(ol > 0.5) {
		while(c < contrast && v[2] > step) {
			v[2] -= step
			l = rgb2lum(hsl2rgb(v))
			c = Math.max(l, ol) / Math.min(l, ol)
			if(isNaN(c) || !isFinite(c)) {
				c = 0
			}
		}
	} else {
		while(c < contrast && v[2] < (1 - step)) {
			v[2] += step
			l = rgb2lum(hsl2rgb(v))
			c = Math.max(l, ol) / Math.min(l, ol)
			if(isNaN(c) || !isFinite(c)) {
				c = 0
			}
		}
	}
	return v
}

function css2rgb(s) {
	if(s.length < 1) {
		return
	}
	if(s.substr(0, 1) == '#') {
		s = s.substr(1)
		if(s.length == 3) {
			s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2]
		}
		if(s.length != 6) {
			return
		}
		var r = [0, 0, 0]
		for(var i = 0; i < 3; i++) {
			var v = parseInt(s[i*2]+s[i*2+1], 16)
			r[i] = v / 255.0
		}
		return r
	}
	return
}

function rgb2css(rgb) {
	return '#'+float2hex(rgb[0])+float2hex(rgb[1])+float2hex(rgb[2])
}

function float2hex(v) {
	v *= 255
	v = Math.round(Math.min(Math.max(v, 0), 255))
	return ('0'+v.toString(16)).slice(-2)
}

function numpad(v) {
	if(v >= 100) {
		return v.toString(10)
	}
	return ('0'+v.toString(10)).slice(-2)
}

function tests() {
	var css2hsltests = [
		['#e81756', [342 / 360, 0.82, 0.50]],
		['#44352c', [ 23 / 360, 0.21, 0.22]],
		['#ff0000', [  0 / 360, 1.00, 0.50]],
		['#00ff00', [120 / 360, 1.00, 0.50]],
		['#0000ff', [240 / 360, 1.00, 0.50]],
	]

	var cmp = function(a, b) {
		if(Math.abs(a - b) < 0.01) {
			return true
		}
		return false
	}
	var cmp3 = function(a, b) {
		if(cmp(a[0], b[0]) && cmp(a[1], b[1]) && cmp(a[2], b[2])) {
			return true
		}
		return false
	}

	Object.values(css2hsltests).forEach(function(t) {
		var hsl = rgb2hsl(css2rgb(t[0]))
		if(!cmp3(hsl, t[1])) {
			console.log("test failure: color", t[0], "should calculate hsl", t[1], "but we got", hsl)
		}

		var css = rgb2css(hsl2rgb(t[1]))
		if(css != t[0]) {
			console.log("test failure: hsl", t[1], "should calculate color", t[0], "but we got", css)
		}
	})

/*	console.log(float2hex(0))
	console.log(float2hex(0.5))
	console.log(float2hex(1))
	console.log(css2rgb("#f00"))
	console.log(rgb2css(css2rgb("#f00")))
	console.log(rgb2css(css2rgb("#aabbcc")))
	console.log(rgb2css(css2rgb("#fff")))

	console.log(rgb2hsl([1, 0, 0]))
	console.log(rgb2hsl([1, 0.9, 0.9]))
	console.log(rgb2hsl([0.1, 0, 0]))

	console.log(rgb2hsl([1, 0, 0]))
	console.log(rgb2hsl([0, 1, 0]))
	console.log(rgb2hsl([0, 0, 1]))

	console.log(hsl2rgb(rgb2hsl([1, 0, 0])))
	console.log(hsl2rgb(rgb2hsl([0, 1, 0])))
	console.log(hsl2rgb(rgb2hsl([0, 0, 1])))
*/	

	console.log(
		rgb2css(
			hsl2rgb(
				hsl_set_contrast(
					rgb2hsl(
						css2rgb("#0077cc")
					),
					3
				))))
}

tests()

})()

themer();
