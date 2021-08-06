<svelte:options tag="dt-spectrum" />

<script>
	import { onMount } from 'svelte';
	
	export let context;
	export let analyser = {};
	export let fftsize = 2048;
	export let linear = false;
	export let lines = false;
	$: analyser.fftSize = fftsize;
	$: binLength = fftsize / 2;
    $: minFrequency = context ? context.sampleRate / fftsize : 0;
    $: maxFrequency = context ? context.sampleRate / 2 : 0;

	$: dataArray = new Uint8Array(fftsize / 2);	
	
	let canvas, canvasContext;
	
	onMount(() => {
		analyser = context.createAnalyser();
		analyser.fftSize = fftsize;
		analyser.maxDecibels = -15;
		analyser.minDecibels = -120;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
		canvasContext = canvas.getContext("2d");
		canvasContext.lineWidth = 0;
		canvasContext.strokeStyle = '#d3d3d3';
		canvasContext.fillStyle = "#fff000";
		draw();
	});
	
	function draw() {
  	requestAnimationFrame(draw);
		analyser.getByteFrequencyData(dataArray);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

		const widthMod = canvas.width / Math.log10(binLength);

		canvasContext.clearRect(0,0,canvas.width,canvas.height);
		canvasContext.beginPath();
		canvasContext.moveTo(0,canvas.height);
		canvasContext.lineTo(getX(0),getY(dataArray[0]));

		let xOld = getX(1);
		let yOld = getY(dataArray[1]);

		canvasContext.lineTo(
			(getX(0) + xOld) / 2,
			(getY(dataArray[0]) + yOld) / 2
		);
		let i;
		for(i = 2; i < binLength; i++) {
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
		}//for
		canvasContext.lineTo(0, canvas.height);		
		canvasContext.closePath();
		canvasContext.fillStyle = 'green';
		canvasContext.fill();

		function getX(band) {
			return Math.log10(band + 1) * widthMod;
		}

		function getY(amplitude) {
			return canvas.height - (canvas.height * (amplitude / 255));
		}
	}
	
	const markers = [{frequency: 10, text: "10"},
									 {frequency: 100, text: "100"},
									{frequency: 1000, text: "1k"},
									{frequency: 10000, text: "10k"},
									{frequency: 20000, text: "20k"}];
	const frequencyLines = [10,20,30,40,50,60,70,80,90,
													100,200,300,400,500,600,700,800,900,
													1000,2000,3000,4000,5000,6000,7000,8000,9000,
													10000,20000];
	
	
</script>

	<canvas bind:this={canvas} width={0} height={0}></canvas>
	
	<svg class="outer">
		<svg class="inner"
				 viewBox="{Math.log10(minFrequency)} 0 {Math.log10(maxFrequency) - Math.log10(minFrequency)} {1}"
				 preserveAspectRatio="none">
			{#each frequencyLines as frequency, i}
				<line stroke="grey" x1={Math.log10(frequency)} x2={Math.log10(frequency)} y1={0} y2={1} />
			{/each}
		</svg>	

		<text x="0%" y="70%">{minFrequency}</text>
		
		{#each markers as marker, i}
				<text x="{(Math.log10(marker.frequency) - Math.log10(minFrequency)) / (Math.log10(maxFrequency) - Math.log10(minFrequency)) * 100}%" y="70%">{marker.text}</text>
		{/each}
	</svg>	


<style>
	:host {
		display: grid;
		width: 100%;
		overflow: hidden;
	}
	svg.outer, canvas {
		grid-area: 1 / 1 / 1 / 1;
		width: 100%;
		height: 100%;
	}
	
	svg.inner {
	}
	
	text {		
		font-family: 'Courier New', monospace;
		font-size: 1rem;
	}
	
	line {
		vector-effect: non-scaling-stroke;
		stroke-width: 2px;
	}
	
	canvas {
		background: transparent;
		z-index: -1;		
	}
</style>