<script>
  import '../../lib';

  export let name;

  /*import { onMount } from 'svelte';
    let audio;
    
    function loadAudio(e) {
      audio.src = window.URL.createObjectURL(e.target.files[0]);
      audio.load();
    }
    
    const audioContext = new AudioContext();	
    let track, spectrum;	
    
    onMount(() => {
      track = audioContext.createMediaElementSource(audio);
      track.connect(spectrum.analyser);
      track.connect(audioContext.destination);		
    })*/

    let sliders = 10;
</script>

<main>
  <select></select>

  <!-- <dt-midi-input on:noteon={(e) => console.log("noteon", e.detail.heldNotes)}
                 on:noteoff={(e) => console.log("noteoff", e.detail.heldNotes)}>
  </dt-midi-input>

  <dt-multi-slider {sliders}></dt-multi-slider>
  <input bind:value={sliders} type="number">
  
  <input on:input={loadAudio} type="file"><br>
  
  <audio on:click|once={() => audioContext.resume()} bind:this={audio} controls>
  </audio><br>
  
  <dt-spectrum context={audioContext} bind:this={spectrum} smoothingtimeconstant="0.9"></dt-spectrum><br> -->

  <dt-dial></dt-dial>

  <div class="container">
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
    <dt-knob on:change={() => alert('change')} on:input={(e) => console.log(e)} defaultvalue="100" max="20" min="20000" scale="log" unit="Hz" label="Frequency"></dt-knob>
    <dt-knob>
      <img alt="kitty" src="http://placekitten.com/102/102">
    </dt-knob>
    <dt-knob label="Gain" scale="db" min="-Infinity" max="0" step="0.01" unit="dB">
      <img alt="kitty" src="http://placekitten.com/103/103">
    </dt-knob>

    <dt-multi-slider></dt-multi-slider>
  </div>

  <dt-waveform></dt-waveform>

  
</main>

<style>

  img {
    transform-origin: center center;
		transform: rotateZ(var(--knob-rotation));
    clip-path: circle(at center);
  }

  dt-spectrum {
    height: 50vh;
  }

  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;

    perspective: 100px;
    perspective-origin: bottom right;
    transform-style: preserve-3d !important;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }

    .container {
      display: inline-block;
      max-width: 640px;
    }
  }

  :global(dt-midi-input button) {
    background: green;
  }
</style>
