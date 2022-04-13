<svelte:options tag="dt-multi-slider" />

<script>
	import ValueScaling from "./ValueScaling.svelte";

	export let sliders = 16;
	export let vertical = false;

	export let values = [];
	export let displays = [];
	export let normals = [];
	export let defaultvalue = null;	
	export let mode = 'linear';
	export let modifier = 1;
	export let step = 1;
	export let min = 0;
	export let max = 10;
	export let unit = '%';

	let multiSlider, input;

	let index = 0;
	
	let sliderStates = [];
	let valuesOld = [];

	$: if ( sliders > 0 ) {
		if( values.length < sliders ) {
			for( let i = values.length; i < sliders; i++ ) {
				values[i] = valuesOld.pop() ?? 0;
			}
		} else if ( values.length > sliders ) {
			for( let i = values.length; i > sliders; i-- ) {
				valuesOld.push(values.pop());
			}
			values = values;
		}
	} else {
		console.error("Value of sliders must me greater than 0.");
	}

	function beginMultiSlide(e) {
		if(e.button !== 0) return;//check if left mouse or touch
		handleDrag(e);
		multiSlider.onpointermove = handleDrag;
		multiSlider.setPointerCapture(e.pointerId);
	}

	function endMultiSlide(e) {
		multiSlider.onpointermove = null;
  		multiSlider.releasePointerCapture(e.pointerId);
	}

	function handleDrag(e) {
		let y = minMax(e.offsetY / e.target.clientHeight);
		let x = minMax(e.offsetX / e.target.clientWidth);
		
		let newindex = vertical ? Math.round(y * sliders) : Math.trunc(x * sliders);
		index = Math.min(newindex, sliders - 1);

		let value = vertical ? x : Math.abs(1 - y);

		sliderStates[index].setValueFromNormal(value);

		function minMax(num) {
			return Math.min(1, Math.max(0, num));
		}
	}

	Number.prototype.mod = function(n) {
		return ((this%n)+n)%n;
	}

	function handleKeyDown(e) {
		switch (e.key) {
			case "Delete":
				sliderStates[index].setValueToDefault();
				break;
			case "ArrowUp":
				e.preventDefault();
				sliderStates[index].incrementValue();
				break;
			case "ArrowDown":
				e.preventDefault();
				sliderStates[index].decrementValue();
				break;
			case "ArrowRight":
				index = (index + 1).mod(sliders);
				break;
			case "ArrowLeft":
				index = (index - 1).mod(sliders);
				console.log(index)
				break;
			default:
				if (isFinite(e.key) || e.key === '-')
					input.focus();
				break;
		}
	}

	function inputFocus(e) {
		input.type = "number";
		input.value = values[index];
		input.select();
	}

	function inputBlur(e) {
		input.type = "text";
		input.value = displays[index];
	}

	function inputSubmit(e) {
		if(e.key === "Enter") {
			sliderStates[index].setValue(e.target.value);
			multiSlider.focus();
		}
	}
</script>

<div class="multi-slider"
	tabindex="0"
	class:vertical
	bind:this={multiSlider}	
	on:pointerdown={beginMultiSlide}
	on:pointerup={endMultiSlide}
	on:keydown={handleKeyDown}>

	{#each values as value, i}
		<div style:--slider-normal={normals[i]}
			role="slider"></div>
		<ValueScaling
			bind:this={sliderStates[i]}
			bind:value={value}
			bind:display={displays[i]}
			bind:normal={normals[i]}
			defaultvalue={Number(defaultvalue)}
			mode={mode}	
			modifier={Number(modifier)}	
			min={Number(min)}
			max={Number(max)}
			step={Number(step)}
			unit={unit} />
	{/each}
</div>

<label>
	{index + 1}:
	<input part="input" 
		bind:this={input}	   
		type="text"
		tabindex="-1"
		min={min}
		max={max}
		step={step}
		value={displays[index]}
		on:focus={inputFocus}
		on:blur={inputBlur}
		on:keyup={inputSubmit}>
	</label>

<style>
	:host  {
		--multi-slider-color: grey;
		--multi-slider-gap: 2px;
		--multi-slider-border-radius: 0;
		
		display: grid;
		grid-template-rows: 1fr min-content;		
		width: 400px;
		height: 200px;

		counter-reset: sliders;
	}

	:host(:focus-within) {
		outline: -webkit-focus-ring-color auto 1px;
	}

	label {
		display: flex;
		justify-content: end;
		width: 100%;
		padding: 1px 2px;
	}

	input {
		font-variant-numeric: tabular-nums;
		background: transparent;
		border: none;
		width: 5ch;		
		text-align: right;
		padding: 0;
    }

	input:focus {
		color: #333;
		background: white;
	}

	div.multi-slider {
		grid-template-areas: 1/1/1/1;
		background: #f1f3f4;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0%, 1fr));
		gap: var(--multi-slider-gap);
		align-items: flex-end;

		/*prevent click and drag inner content*/
		touch-action: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-o-user-select: none;
		user-select: none;
	}

	div.multi-slider div {
		counter-increment: sliders;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		border-radius: var(--multi-slider-border-radius);	
		height: calc( 100% * var(--slider-normal) );
		background: var(--multi-slider-color);
		overflow: hidden;
					
	}

	div.multi-slider div::before {
		color: #ccc;
		content: counter(sliders);
		mix-blend-mode: difference;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* vertical mode */
	div.multi-slider.vertical {
		grid-template-rows: repeat(auto-fit, minmax(0%, 1fr));
		grid-template-columns: 1fr;
	}

	div.multi-slider.vertical div {
		justify-content: flex-start;
		align-items: center;
		height: auto;
		min-width: 0;
		min-height: 0;
		width: calc( 100% * var(--value) );
	}
</style>
