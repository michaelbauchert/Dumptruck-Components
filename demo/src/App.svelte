<script>
  import '../../lib';

</script>


<dt-knob label="octaves" value="6" scale="log" min="0.5" max="2" step="0.01">
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="arc-indicator">
      <circle cx="50"	cy="50" r="45" pathLength="360"/>
      <circle cx="50"	cy="50" r="45" pathLength="360"/>
    </g>
    
    <g class="dial">			
      <circle cx="50" cy="50" r="50" fill="lightgrey"/>
      <line x1="50" y1="5" x2="50" y2="30" stroke="black" stroke-width="12" />
    </g>	
    
    <style>
      g {
        --max-rotation: 270;
        --rotation: calc(var(--knob-normal) * var(--max-rotation));
        transform-origin: center;
        stroke-linecap: round;
      }
      
      g.arc-indicator {
        transform: rotate(135deg);
        fill: none
      }
      
      g.arc-indicator circle:first-child {
        stroke-dasharray: var(--max-rotation) calc(360 - var(--max-rotation));
        stroke: black;
        stroke-width: 8;
      }
      
      g.arc-indicator circle:last-child {
        stroke-dasharray: var(--rotation) calc(360 - var(--rotation));
        stroke: lightgrey;
        stroke-width: 8.5;
      }
      
      g.dial {
        transform: scale(0.6) rotate(calc(1deg * (var(--rotation) - var(--max-rotation) / 2)));
      }
    </style>
</dt-knob>

<dt-knob defaultvalue="100" max="20" min="20000" scale="log" unit="Hz" label="Frequency"></dt-knob>

<dt-knob>
  <img alt="kitty" src="http://placekitten.com/102/102">
</dt-knob>

<dt-knob label="Gain" scale="db" min="-Infinity" max="0" step="0.01" unit="dB">
  <img alt="kitty" src="http://placekitten.com/103/103">
</dt-knob>


<style>

  img {
    transform-origin: center center;
		transform: rotateZ(var(--knob-rotation));
    clip-path: circle(at center);
  }

</style>
