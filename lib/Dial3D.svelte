<script>
	export let sides = 6;
	$: externalAngle = 180 - (sides - 2) * (180 / sides);
	$: divisorS = 2 * Math.sin(Math.PI / sides);
	$: divisorA = Math.cos(Math.PI / sides);
	
	$: polygonSide = 50 * divisorS;
	$: vectorO = Math.sin(externalAngle) * polygonSide;
	$: vectorA = Math.cos(externalAngle) * polygonSide;
	
	$: path = polygon(50, 50, sides, 50);
	
	/* polarToCartesian() and polygon() taken from 
		 Ted Goodridge's (aka zeroskillz) React stackblitz project, svg-polygon-generator	
		 https://stackblitz.com/edit/svg-polygon-generator?file=index.js */
	
	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}//end polarToCartesian


	function polygon(centerX, centerY, points, radius) {
		const degreeIncrement = 360 / (points);
		const d = new Array(points).fill('foo').map((p, i) => {
			const point = polarToCartesian(centerX, centerY, radius, degreeIncrement * i);
			return `${point.x},${point.y}`;
		});
		return `M${d}Z`;
	}//end polygon
</script>

<div class="poly-prism"
		 style="--divisor-s: {divisorS};
						--divisor-a: {divisorA};
						--adjustAngle: {externalAngle / 2}deg;">
	<!--Polygon Knob Face-->
	<svg viewBox="0 0 100 100" 
			 xmlns="http://www.w3.org/2000/svg"
			 id="prism">
		<path d={path}></path>
        
	</svg>	

	<!--Prism Sides-->
	{#each {length: sides} as _, i}
		<div class="side"
				 style="--angle-no-units: {externalAngle * i};
								--angle: calc(var(--angle-no-units) * 1deg)"></div>
	{/each}

	<!--Indicator-->
	<div class="indicator">
		<div class="face front"></div>
		<div class="face bottom"></div>
		<div class="face left"></div>
		<div class="face right"></div>
		<div class="face top"></div>
	</div>
</div>

<style>
    .poly-prism {
        --prism-depth: 40px;
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
    }

    svg path {
        fill: lightblue;
    }

    .side {	
		--background: var(--prism-background);
		--hue: calc(var(--angle-no-units) + (var(--normal) * 300 - 150));		
		--width: calc(50% * var(--divisor-s));
		
		height: var(--prism-depth);
		width: var(--width);
		position: absolute;
		transform-origin: 50% 50%;
		top: calc(50% - var(--prism-depth) / 2);
		right: calc(50% - var(--width) / 2);
		transform: translateY(calc(50% - var(--prism-depth) / 2));			
			
	}
	
</style>
