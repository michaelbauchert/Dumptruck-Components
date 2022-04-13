<svelte:options tag="dt-knob" />

<!--
TODO:
-Reversable min and max
-mulitple unitsp
-threshold to set value to -Infinity
-docs
-publish to npm
-->


<script>		
	import ValueScaling from "./ValueScaling.svelte";

	import { get_current_component } from "svelte/internal";    
    const component = get_current_component();

	const dispatchEvent = (name) => {
        component?.dispatchEvent(new CustomEvent(name, {
        detail: {
			label,
			value,
			normal,
			scale,
			modifier,
			min,
			max,
			step,
			unit,
		},
        composed: true  // propagate across the shadow DOM
        }));
    };

	/**
	 * The selected value.
	 * @type {number}
	 */
	export let value = 0;
	
	/**
	 * 
	 * @type {number | null}
	 */
	export let defaultvalue = null;	

	let display;

	/**
	 * The value between 0 and 1, representing `value`'s position relative to `min` and `max` according to the defined `mode`.
	 * @type {number}
	 */
	let normal;

	Object.defineProperty(component, 'normal', {
		get: () => { return normal },
		set: (newNormal) => { knobState.setValueFromNormal(newNormal) }
	});

	/**
	 * Optional identifier
	 * @type {string}
	 */
	export let label;

	/**
	 * @type {"lin" | "pow" | "log" | "db"}
	 */
	export let scale = "lin";

	/**
	 * @type {number}
	 */
	export let modifier = 1;

	/**
	 * The granularity that the value must adhere to.
	 * @type {number}
	 */
	export let step = 1;

	/**
	 * The lowest value in the range of permitted values.
	 * @type {number}
	 */
	export let min = 0;

	/**
	 * The greatest value in the range of permitted values.
	 * @type {number}
	 */
	export let max = 100;

	/**
	 * The determiner of quantity appended to the displayed value.
	 * @type {string}
	 */
	export let unit = '%';
	
	/**
	 * @type {number}
	 */
	export let sensitivity = 1;
	$: dragDenominator = screen.height / Number(sensitivity);

	let knobState, knob, input;
	let knobDelta = 0;
	let valueOld;
	
	function beginKnobTurn(e) {
		if(e.button !== 0) return;//check if left mouse or touch
		valueOld = value;		
		knob.focus();
		knob.setPointerCapture(e.pointerId);
		knob.addEventListener('pointermove', handleDrag);		
		knob.requestPointerLock();		
	}

	function endKnobTurn(e) {
		knobDelta = 0;  		
		document.exitPointerLock();	
		knob.removeEventListener('pointermove', handleDrag);
		knob.releasePointerCapture(e.pointerId);
		if(value !== valueOld)
			dispatchEvent('change');
	}		
	
	async function handleDrag(e) {
		if(Math.abs(e.movementY) > 250) return;//fixes weird jumping bug		
		knobDelta -= e.movementY / (dragDenominator / (e.shiftKey ? 3 : 1));
		
		const response = knobState.setValueFromNormal(knobDelta + normal);
		
		if(response.minMax || response.valueChanged)
			knobDelta = 0;

		if(response.valueChanged) 
			dispatchEvent('input');			
	}

	function handleKeyDown(e) {
		switch(e.key) {
			case 'Delete':
				knobState.setValueToDefault();
				break;
			case 'ArrowUp':
				e.preventDefault();
				knobState.increment(e.repeat);
				break;
			case 'ArrowDown':
				e.preventDefault();
				knobState.decrement(e.repeat);
				break;
			case 'Home':
				knobState.setValueFromNormal(0);
				break;
			case 'End':
				knobState.setValueFromNormal(1);
				break;
			default:
				if (isFinite(e.key) || 
					e.key === '-' || 
					e.key === 'ArrowLeft' || 
					e.key == 'ArrowRight')
					input.focus();
		} 
	}		

	function inputFocus(e) {
		input.type = "number";
		input.value = value;
		input.select();
	}

	function inputBlur(e) {
		input.type = "text";
		input.value = display;
	}

	function inputSubmit(e) {
		switch(e.key) {
			case 'Escape':
				knob.focus();
				break;
			case 'Enter':							
				if(input.value != value) {
					knobState.setValue(input.value);					
					dispatchEvent('change');
				}
				knob.focus();
				break;
		}		
	}    	
</script>

<ValueScaling
	bind:this={knobState}
	bind:value
	bind:display
	bind:normal
	defaultvalue={Number(defaultvalue)}
	scale={scale}	
	modifier={Number(modifier)}	
	min={Math.min(Number(min), Number(max))}
	max={Math.max(Number(min), Number(max))}
	flipped={Number(min) > Number(max)}
	step={Number(step)}
	unit={unit} />



<label part="label" for="knob">{label ?? ""}</label>


<div part="knob" 
	id="knob"
	style="--knob-normal: {normal}"
	bind:this={knob}
    tabindex="0"
    draggable="false"
    role="slider"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext={display}
	aria-orientation="vertical"
	on:pointerdown|preventDefault={beginKnobTurn}
	on:pointerup={endKnobTurn}	
	on:keydown={handleKeyDown}>
    <slot>
        <svg part="svg"
			 viewBox="0 0 100 100" >
            <g style:transform-origin="center center"
			   style:transform="rotateZ(var(--knob-rotation)" >
                <circle cx="50" cy="50" r="50" fill="lightgrey"/>
                <rect width="7" height="35" fill="#333" x="47.5"/>
            </g>
        </svg>
    </slot>
</div>

<input part="input" 
	   bind:this={input}	   
	   type="text"
	   tabindex="-1"
	   min={min}
	   max={max}
	   step={step}
	   value={display}
	   on:focus={inputFocus}
	   on:blur={inputBlur}
	   on:change|stopPropagation 
	   on:input|stopPropagation 
	   on:keyup={inputSubmit}>

<style>
	:host {
        display: inline-grid;
		padding: 1px 6px;
		width: 4em;       
        grid-template-rows: min-content auto min-content;
		grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
        'label'
        'knob'
        'input';
		gap: 3px;
		overflow: hidden;
    }

	:host(:focus-within) {
		outline: -webkit-focus-ring-color auto 1px;
	}

	:host([disabled]) {
		opacity: 0.5;
		pointer-events: none;
	}

	:host(:has(input:focus)) {
		outline: none;
	}

    label,
    input {
		justify-self: center;
	}

	#knob {
		--knob-rotation: calc(300deg * var(--knob-normal) - 150deg);
		grid-area: knob;
		display: flex;
		
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

	::slotted(*:first-of-type) {
		width: 100%;
	}

	label,
	input {
		text-align: center;
		width: 100%;
	}

	label {		
		-webkit-user-select: none;  /* Safari all */
  		user-select: none;
	}

    input {
		font-variant-numeric: tabular-nums;
		grid-area: input;
		background: transparent;
		border: none;
    }

	input:focus {
		color: initial;
		background: white;
	}
</style>
