<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let 
        value,
        normal,
        name,
        step,
        min,
        max,
        unit,
        sensitivity,
        decimals,
        knobDelta = 0;
	
	$: display = value;
	$: dragDenominator = screen.height / Number(sensitivity);

	let knobState, knob, input;

	function beginKnobTurn(e) {
		if(e.button !== 0) return;//check if left mouse or touch
		knob.focus();
		knob.onpointermove = handleDrag;
		knob.setPointerCapture(e.pointerId);
		knob.requestPointerLock();
	}

	function endKnobTurn(e) {
		knobDelta = 0;
		knob.onpointermove = null;
  		knob.releasePointerCapture(e.pointerId);
		document.exitPointerLock();	
		dispatch('change');	
	}		

	function handleDrag(e) {	
        knobDelta -= e.movementY / (dragDenominator / e.shiftKey ? 3 : 1);

        dispatch('setNormal', knobDelta + normal);			
	}

	function handleKeyDown(e) {
		if (e.key === "Delete") {
			dispatch('setToDefault');
		} else if (e.key === "ArrowUp" || e.key === "ArrowRight") {
			e.preventDefault();
			dispatch('increment', e.repeat);
		} else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
			e.preventDefault();
            dispatch('decrement', e.repeat);
		} else if (isFinite(e.key) || e.key === '-') {
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
		if(e.key === "Enter") {
			knobState.setValue(e.target.value);
			knob.focus();
			dispatchEvent('change');
		}
	}	

    const styles = `
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
        background: blue;
    }

    label {
        width: 100%;
        -webkit-user-select: none;  /* Safari all */
        user-select: none;
    }

    input {
        font-variant-numeric: tabular-nums;
        grid-area: input;
        background: transparent;
        border: none;
        width: 100%;
    }

    input:focus {
        color: #333;
        background: white;
    }`
</script>

<label part="label" for="knob">{name}</label>

<div part="knob" 
	id="knob"
	style:--knob-normal={normal}
	bind:this={knob}
    tabindex="0"
    draggable="false"
    role="slider"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext={display}
	on:dblclick={dispatch('setToDefault')}
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
    {@html `<style>styles}  
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
	   on:keyup={inputSubmit}>