<script>
  import '../../lib';
  export let name;

  import { onMount } from 'svelte';
    let audio;
    
    function loadAudio(e) {
      audio.src = window.URL.createObjectURL(e.target.files[0]);
      audio.load();
    }
    
    const audioContext = new AudioContext();	
    let analyser, track, spectrum;	
    
    onMount(() => {
      track = audioContext.createMediaElementSource(audio);
      analyser = spectrum.analyser;
      track.connect(analyser);
      track.connect(audioContext.destination);		
    })
</script>

<main>
  <script>
    
  </script>
  
  <input on:input={loadAudio} type="file"><br>
  
  <audio on:click|once={() => audioContext.resume()} bind:this={audio} controls>
  </audio><br>
  
  <dt-spectrum context={audioContext} bind:this={spectrum}></dt-spectrum><br>

  <div class="container">
    <dt-knob sensitivity={0.3}>
      <img alt="kitty" src="http://placekitten.com/100/100">
    </dt-knob>
    <dt-knob class="text-right" name="Text Right"></dt-knob>
    <dt-knob class="text-left" name="Text Left"></dt-knob>
    <dt-knob class="text-top" name="Text Top"></dt-knob>
    <dt-knob class="text-reverse" name="Text Bottom"></dt-knob>
  </div>
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
</style>
