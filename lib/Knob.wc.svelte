<svelte:options tag="dt-knob" />

<script>
	export let name = '';
	$: isPanKnob = (name.toLowerCase() === "panning" || name.toLowerCase() === "pan");

	export let unit = "%";
	$: if (isPanKnob) {
		if(value === mid) {
			unit = "C";
		} else if(value < mid) {
			unit = "L";
		} else if(value > mid) {
			unit = "R";
		}
	}

	export let step = 1;
	$: decimalPlaces = (step.toString().split(".")[1] ?? []).length;
	$: tens = Math.pow(10, decimalPlaces);

	export let min = 0;
	export let max = 100;
	$: if(typeof min === "string" || typeof max === "string") {
		min = parseFloat(min);
		max = parseFloat(max);
		if(value < min) {
			value = min;
		} else if(value > max) {
			value = max;
		}
		setMid();
	}

	export let mid = 50;
	export let exponent = 1;
	$: if(typeof mid === "string" && typeof exponent !== "string") {
		mid = parseFloat(mid);				
		if (mid >= max || mid <= min)
			console.warn(`Knob ${name}'s 'mid' attribute should not meet or exceed bounds set by min and max.`);		
	} else if(typeof exponent === "string") {
		exponent = parseFloat(exponent);
	}	
	$: setMid(exponent);
	$: setExponent(mid);
	function setMid(newExponent = 1) {
		mid = normalToValue(0.5);
		normalvalue = valueToNormal(value);
	}
	function setExponent(newMid) {
		exponent = Math.log10((newMid - min) / (max - min))/Math.log10(0.5);
		normalvalue = valueToNormal(value);
	}

	export let defaultvalue;
	$: if(typeof defaultvalue === "string") {
		defaultvalue = parseFloat(defaultvalue);
		if (defaultvalue > max || defaultvalue < min)
			console.warn(`Knob ${name}'s 'defaultvalue' attribute should not exceed bounds set by min and max.`);
	}

	export let value = mid;
	export let normalvalue = valueToNormal(value);
	$: if(typeof value === "string" && typeof normalvalue !== "string") {
		value = parseFloat(mid);		
		if (value > max || value <= min)
			console.warn(`Knob ${name}'s 'value' attribute should not exceed bounds set by min and max.`);
	} else if(typeof normalvalue === "string") {
		normalvalue = parseFloat(exponent);
	}
	$: setValue(normalvalue);
	$: setNormal(value);
	function setValue(newNormal) {
		value = parseFloat(normalToValue(newNormal).toFixed(decimalPlaces));
	}
	function setNormal(newValue) {
		normalvalue = valueToNormal(newValue);		
	}	

	//variables to reference knob and numberInput elements
	let knob;

	function valueToNormal(value) {
		return Math.pow((value - min) / (max - min), 1/exponent);
	}//end convert value to normal range

	function normalToValue(normal) {
		let newValue = Math.pow(normal, exponent) * (max - min) + min;
		if(exponent !== 1) {
			newValue = newValue * tens;
			newValue = Math.trunc(newValue) + Math.pow(newValue - Math.trunc(newValue), 1/exponent);
			newValue = newValue / tens;
		}		
		return Math.round(newValue / step) * step;
	}//end convert normal range to value	

	let knobDelta = 0;

	function beginKnobTurn(e) {
		knob.focus();
		knob.onpointermove = handleDrag;
		knob.setPointerCapture(e.pointerId);
		knob.requestPointerLock();
	}//end begin knob turn

	function endKnobTurn(e) {
		knobDelta = 0;
		knob.onpointermove = null;
  		knob.releasePointerCapture(e.pointerId);
		document.exitPointerLock();
	}//end knob turn


	export let sensitivity = 1;
	$: dragDenominator = screen.height / parseFloat(sensitivity);
	function handleDrag(e) {
		if(e.shiftKey) {
			knobDelta -= (e.movementY - e.movementX)/dragDenominator;
		} else {
			knobDelta -= (e.movementY - e.movementX)/(dragDenominator / 3);
		}//end check shift key

		const newNormal = normalvalue + knobDelta;
		const newValue = normalToValue(newNormal);
		if (newValue !== value) {
			if(newNormal >= 1) {
				value = max;
			} else if (newNormal <= 0) {
				value = min;
			} else {
				value = parseFloat(newValue.toFixed(decimalPlaces));
			}//end setting normalValue
			knobDelta = 0;
		}
	}//end handleDrag

	function setToDefault() {
		value = defaultvalue ?? value;
	}//end set to default

	function handleKeyDown(e) {
		if (e.key === "Delete") {
			setToDefault();
		} else if (value < max && e.key === "ArrowUp" || e.key === "ArrowRight") {
			value += step;
		} else if (value > min && e.key === "ArrowDown" || e.key === "ArrowLeft") {
			value -= step;
		} else if (isFinite(e.key) || e.key === '-') {
			input.focus();
		}
	}//end handle key down

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	$:dispatchInputEvent(normalvalue);
	function dispatchInputEvent(normalvalue) {
		dispatch('input', {
				name: name,
				value: value,
				normalvalue: normalvalue,
				min: min,
				max: max,
				mid: mid,
				unit: unit,
				exponent: exponent,
			});
	}//end dispatch input event
	

	let input;

	function inputFocus(e) {
		input.type = "number";
		input.value = value;
		input.select();
	}

	function inputBlur(e) {
		input.type = "text";
		input.value = value + ' ' + unit;
	}

	function inputEnter(e) {
		if(e.key === "Enter") {
			value = Math.round(Math.max(Math.min(max, e.target.value), min) / step) * step;
			knob.focus();
		}
	}
</script>

<label for="knob">{name}</label>
<div id="knob"
	style="--knob-normal: {normalvalue}"
	bind:this={knob}
    tabindex="0"
    draggable="false"
    role="slider"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext={value + ' ' + unit}
	on:pointerdown|preventDefault={beginKnobTurn}
	on:pointerup={endKnobTurn}
	on:dblclick={setToDefault}
	on:keydown={handleKeyDown}>
    <slot>
        <svg viewBox="0 0 100 100">
            <g>
                <circle cx="50" cy="50" r="50"/>
                <rect/>
            </g>
        </svg>
    </slot>
</div>
<input bind:this={input}
	   style="--char-max: {Math.max(Math.trunc(min).toString().length, Math.trunc(max).toString().length) + decimalPlaces + unit.length + 2}ch"	   
	   type="text"
	   tabindex="-1"
	   min={min}
	   max={max}
	   value={(isPanKnob ? Math.abs(value).toFixed(decimalPlaces) : value.toFixed(decimalPlaces)) + ' ' + unit}
	   on:focus={inputFocus}
	   on:blur={inputBlur}
	   on:keyup={inputEnter}>

<style>
	:host {
        --knob-grid-gap: 3px;

        --knob-fill: lightgrey;

        --indicator-width: 7%;
        --indicator-height: 35%;
        --indicator-fill: black;
        --indicator-border-radius: 50%;
        --indicator-margin-top: -1px;

        --knob-label-font-size: 13.3333px;
        --knob-input-font-size: 13.3333px;
		--knob-text-align: center;
		--knob-text-justify: center;

		vertical-align: top;
        display: inline-grid;
		padding: 1px 6px;
        grid-gap: var(--knob-grid-gap);
        grid-template-rows: min-content auto min-content;
		grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
        'label'
        'knob'
        'input';

		--border-thickness:2px;   /* thickness of the border */
		--border-color:black;   /* color of the border */
		--border-width:9px; /* width of border */
		

		border:var(--border-thickness) solid transparent; /* space for the border */
		box-sizing: border-box;		
    }

	:host(:focus-within) {
		background:
			linear-gradient(var(--border-color),var(--border-color)) top left,
			linear-gradient(var(--border-color),var(--border-color)) top left,
			linear-gradient(var(--border-color),var(--border-color)) bottom left,
			linear-gradient(var(--border-color),var(--border-color)) bottom left,
			linear-gradient(var(--border-color),var(--border-color)) top right,
			linear-gradient(var(--border-color),var(--border-color)) top right,
			linear-gradient(var(--border-color),var(--border-color)) bottom right,
			linear-gradient(var(--border-color),var(--border-color)) bottom right;
		background-size:var(--border-thickness) var(--border-width),var(--border-width) var(--border-thickness);
		background-origin:border-box;
		background-repeat:no-repeat;
	}

    label,
    #knob,
    input {
		justify-self: var(--knob-text-justify);
	}

	#knob {
		--knob-rotation: calc(300deg * var(--knob-normal) - 150deg);
		display: flex;
		justify-content: center;
		grid-area: knob;
		width: 100%;
		min-width: calc(4ch + var(--knob-grid-gap));
		aspect-ratio: 1/1;
		
		/*prevent click and drag inner content*/
		touch-action: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-o-user-select: none;
		user-select: none;
	}

	#knob:focus {
		outline: none;
	}

	label,
	input {
		text-align: var(--knob-text-align);
		padding: 0;
	}

	label {
		font-size: var(--knob-label-font-size);
		font-weight: 700;
		grid-area: label;
		-webkit-user-select: none;  /* Safari all */
  		user-select: none;
	}

    input {
        font-size: var(--knob-input-font-size);
		grid-area: input;
		white-space: nowrap;
		background: transparent;
		border: none;
		max-width: var(--char-max);
    }

	input:focus {
		background: white;
	}

	/*Default Knob Styles */
	g {
		transform-origin: center center;
		transform: rotateZ(var(--knob-rotation));
	}
	svg {
		display: block;
	}

	circle {
		fill: var(--knob-fill);
	}

	rect {
		fill: var(--indicator-fill);
        width: var(--indicator-width);
        height:var(--indicator-height);
        x: calc(50% - var(--indicator-width) / 2);
	}

    :host(.text-left),
    :host(.text-right) {
        grid-template-rows: 1fr 1fr;
    }

    :host(.text-left) {
		--knob-text-align: left;
		--knob-text-justify: start;
		grid-template-columns: min-content auto;
        grid-template-areas:
        'label knob'
        'input knob';
    }

    :host(.text-right) {
		--knob-text-align: right;
		--knob-text-justify: end;
		grid-template-columns: auto min-content;
        grid-template-areas:
        'knob label'
        'knob input';
    }

    :host(.text-top) {
		grid-template-rows: min-content min-content auto;
        grid-template-areas:
        'label'
        'input'
        'knob';
    }

    :host(.text-bottom) {
		grid-template-rows: auto min-content min-content;
        grid-template-areas:
        'knob'
        'label'
        'input';
    }

    :host(.text-reverse) {
        grid-template-areas:
        'input'
        'knob'
        'label';
    }
</style>
