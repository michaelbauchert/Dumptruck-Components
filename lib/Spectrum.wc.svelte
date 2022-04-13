<svelte:options tag="dt-spectrum" />

<script>
	import { onMount } from 'svelte';
	
	export let linear = false;
	export let lines = false;

	export let context;
	export let analyser = {};	

	export let fftsize = 4096;
	$: analyser.fftSize = parseInt(fftsize);	

	export let mindecibels = -105;
	$: analyser.minDecibels = parseFloat(mindecibels);

	export let maxdecibels = 15;
	$: analyser.maxDecibels = parseFloat(maxdecibels);

	export let decibeldivisions = 7;

	export let smoothingtimeconstant = 0.8;
	$: analyser.smoothingTimeConstant = parseFloat(smoothingtimeconstant);
	
	$: binLength = fftsize / 2;
    $: minFrequency = context ? context.sampleRate / fftsize : 0;
    $: maxFrequency = context ? context.sampleRate / 2 : 0;
	$: frequencyWidth = maxFrequency - minFrequency;
	$: frequencyWidthLog = Math.log10(maxFrequency) - Math.log10(minFrequency);

	$: dataArray = new Uint8Array(fftsize / 2);	
	
	let canvas, canvasWidth, canvasContext;
	
	onMount(() => {
		analyser = context.createAnalyser();
		analyser.fftSize = fftsize;
		analyser.smoothingTimeConstant = smoothingtimeconstant;
		analyser.maxDecibels = maxdecibels;
		analyser.minDecibels = mindecibels;
		canvasContext = canvas.getContext("2d");
		canvasContext.lineWidth = 0;
		canvasContext.strokeStyle = '#d3d3d3';		
		draw();
	});
	
	function draw() {
  		requestAnimationFrame(draw);

		analyser.getByteFrequencyData(dataArray);

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;		

		canvasContext.clearRect(0,0,canvas.width,canvas.height);
		canvasContext.beginPath();		

		const widthMod = linear ? canvas.width / binLength : canvas.width / Math.log10(binLength);

		if(lines)
			drawLines();
		else
			drawCurve();

		function drawCurve() {
			canvasContext.moveTo(0,canvas.height);
			canvasContext.lineTo(getX(0),getY(dataArray[0]));

			let xOld = getX(1);
			let yOld = getY(dataArray[1]);

			canvasContext.lineTo(
				(getX(0) + xOld) / 2,
				(getY(dataArray[0]) + yOld) / 2
			);
			
			for(let i = 2; i < binLength; i++) {
				const xNew = getX(i);
				const yNew = getY(dataArray[i]);

				if((xNew - xOld) > 1) {
					canvasContext.quadraticCurveTo(
						xOld,
						yOld,
						(xNew + xOld) / 2,
						(yNew + yOld) / 2
					);				
				} else {
					canvasContext.lineTo(xNew,yNew);
				}
				xOld = xNew;
				yOld = yNew;						
			}
			canvasContext.lineTo(0, canvas.height);		
			canvasContext.closePath();
			canvasContext.fillStyle = "#a9aaab";
			canvasContext.fill();
		}//drawCurve

		function drawLines() {
			for(let i = 0; i < binLength; i++) {
				const x = getX(i);
				const y = getY(dataArray[i]);
				canvasContext.moveTo(x,canvas.height);
				canvasContext.lineTo(x,y);
			}
			canvasContext.stroke();
		}//drawLines		

		function getX(band) {
			return linear ? band * widthMod : Math.log10(band + 1) * widthMod;
		}//getX

		function getY(amplitude) {
			return canvas.height - (canvas.height * (amplitude / 255));
		}//getY
	}//draw
	
	const logMarkers = [
		{frequency: 10, text: "10"},
		{frequency: 20, text: "20"},
		{frequency: 50, text: "50"},
		{frequency: 100, text: "100"},
		{frequency: 200, text: "200"},
		{frequency: 500, text: "500"},
		{frequency: 1000, text: "1k"},
		{frequency: 2000, text: "2k"},
		{frequency: 5000, text: "5k"},
		{frequency: 10000, text: "10k"},
		{frequency: 20000, text: "20k"}
	];
	const logLines = [
		10,20,30,40,50,60,70,80,90,
		100,200,300,400,500,600,700,800,900,
		1000,2000,3000,4000,5000,6000,7000,8000,9000,
		10000,20000
	];
	const linearMarkers = [
		{frequency: 2000, text: "2k"},
		{frequency: 4000, text: "4k"},
		{frequency: 6000, text: "6k"},
		{frequency: 8000, text: "8k"},
		{frequency: 10000, text: "10k"},
		{frequency: 12000, text: "12k"},
		{frequency: 14000, text: "14k"},
		{frequency: 16000, text: "16k"},
		{frequency: 18000, text: "18k"},
		{frequency: 20000, text: "20k"},
		{frequency: 22000, text: "22k"},
	];
	const linearLines = [
		1000,2000,3000,4000,5000,6000,7000,8000,9000,
		10000,11000,12000,13000,14000,15000,16000,17000,18000,19000,
		20000, 21000,22000,23000,24000
	];	
</script>

<canvas bind:this={canvas} 
	bind:clientWidth={canvasWidth}
	width={0} 
	height={0}></canvas>

<div>
	<!--<span>{maxdecibels}</span>-->
	{#each  Array(decibeldivisions) as _, i}
		<span class="db"
			style="top: calc({100 / (decibeldivisions + 1) * (i+1)}% - 0.5em)">
			{maxdecibels - ((maxdecibels - mindecibels) / (decibeldivisions + 1) * (i+1))}
		</span>
	{/each}	
	<!--<span>{mindecibels}</span>-->

	{#if linear}
		<svg viewBox="{minFrequency} 0 {frequencyWidth} {decibeldivisions + 1}"
			preserveAspectRatio="none">
			{#each linearLines as frequency, i}
				<line x1={frequency} 
					x2={frequency} 
					y1="0" 
					y2={decibeldivisions + 1} />
			{/each}
			{#each Array(decibeldivisions) as _, i}
				<line x1="0" 
					x2="100%" 
					y1={i + 1} 
					y2={i + 1} />
			{/each}
		</svg>		

		{#each linearMarkers as marker}
			<span class="hz"
				style="left:calc({(marker.frequency - minFrequency) / frequencyWidth * 100}% - 1.5ch)">
				{marker.text}
			</span>
		{/each}
	{:else}
		<svg viewBox="{Math.log10(minFrequency)} 0 {frequencyWidthLog} {decibeldivisions + 1}"
			preserveAspectRatio="none">
			{#each logLines as frequency}
				<line x1={Math.log10(frequency)} 
					x2={Math.log10(frequency)} 
					y1="0" 
					y2={decibeldivisions + 1} />
			{/each}
			{#each Array(decibeldivisions) as _, i}
				<line x1="0" 
					x2={decibeldivisions + 1} 
					y1={i + 1} 
					y2={i + 1} />
			{/each}
		</svg>		

		{#each logMarkers as marker, i}
			<span class="hz"
				style="left:calc({(Math.log10(marker.frequency) - Math.log10(minFrequency)) / frequencyWidthLog * 100}% - 1.5ch)">
				{marker.text}
			</span>
		{/each}
	{/if}	
</div>


<style>
	:host {
		background: #f1f3f4;
		display: grid;
		width: 100%;
		overflow: hidden;
		position: relative;
	}

	div {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		mix-blend-mode: multiply;
	}

	div, canvas {
		grid-area: 1/1/1/1;				
	}

	svg, div, canvas {
		width: 100%;
		height: 100%;
	}

	span, svg {
		z-index: 0;
		background: white;
	}

	svg {
		z-index: -1;
		position: absolute;
	}

	span {
		height: min-content;	
		width: min-content;			
		font-family: 'Courier New', monospace;
		font-size: 1rem;
	}

	span.hz, span.db {
		position: absolute;		
	}

	span.hz {		
		text-align: center;
		width: 3ch;
		bottom: 0;
	}

	span.db {
		left: 0;
	}
	
	line {
		vector-effect: non-scaling-stroke;
		stroke-width: 1px;
		stroke: black;
	}
</style>