<svelte:options tag="dt-midi-input" />

<svelte:window on:keydown={handleKeydown}
             on:keyup={handleKeyup}></svelte:window>

<script>
    import { get_current_component } from "svelte/internal";
    import WebMidi from "webmidi";
    
    const component = get_current_component();
    
    // example function for dispatching events
    const dispatchEvent = (name, detail) => {
        component?.dispatchEvent(new CustomEvent(name, {
        detail,
        composed: true  // propagate across the shadow DOM
        }));
    };

	export let disabled = false;
    export let keyboard = true;
    export let inputid, channel;
    export let heldNotes = [];

	let midiAccess = false;
	let midiInputs = [];	
	
	function requestMidiAccess () {
        WebMidi.enable(function(err) {
            if (err) {
                console.log("An error occurred", err);
                return;
            } 
            midiAccess = true;

            WebMidi.addListener('connected', updateMidiInputs);
            WebMidi.addListener('disconnected', updateMidiInputs);
        });		
	}

    function updateMidiInputs() {
        midiInputs = WebMidi.inputs;
        flushHeldNotes();
    }

    $: if(WebMidi.enabled) {
        WebMidi.inputs.forEach(input => input.removeListener());
        flushHeldNotes();

        if(inputid === "all") {
            WebMidi.inputs.forEach(input => addInputListeners(input, channel));
        } else if (inputid !== "none" && inputid !== "keyboard") {
            addInputListeners(WebMidi.getInputById(inputid), channel);
        }
    }    

    function addInputListeners(input, channel) {
        input.addListener("noteon", channel, dispatchNoteOn);
        input.addListener("noteoff", channel, dispatchNoteOff);
        input.addListener("keyaftertouch", channel, (e) => dispatchEvent("keyaftertouch", e));
        input.addListener("pitchbend", channel, (e) => dispatchEvent("pitchbend", e));            
    }    
    
    function flushHeldNotes() {
        console.log("flush")
        const newTimestamp = 0;

        heldNotes.forEach(note => {
            /*let eventData = {note};

            eventData.data[0] -= 16;
            eventData.data[2] = 0;
            eventData.timestamp = newTimestamp;
            eventData.type = "noteoff";
            eventData.velocity = 0;
            eventData.rawVelocity = 0;

            dispatchNoteOff(eventData);*/
        });
    }

    function dispatchNoteOn(e) {
        if (!heldNotes.includes(e.note.number))
            heldNotes.push(e.note.number);
        dispatchEvent("noteon", { ...e, heldNotes});
        console.log(e )
    }

    function dispatchNoteOff(e) {
        heldNotes.splice(heldNotes.indexOf(e.note.number), 1);
        dispatchEvent("noteoff", { ...e, heldNotes});
    }

    /*Computer MIDI Keyboard*/
    let octave = 0;
    $: octaveMod = octave * 12;

    let velocity = 55;

    let activeKeys = [];

    function handleKeydown(e) {
        if(e.repeat || !keyboard || e.target.tagname == "INPUT")
            return;
            
        let pitch;
        switch (e.code) {
            case 'KeyA':
                pitch = 0;
                break;
            case 'KeyW':
                pitch = 1;
                break;
            case 'KeyS':
                pitch = 2;
                break;
            case 'KeyE':
                pitch = 3;
                break;
            case 'KeyD':
                pitch = 4;
                break;
            case 'KeyF':
                pitch = 5;
                break;
            case 'KeyT':
                pitch = 6;
                break;
            case 'KeyG':
                pitch = 7;
                break;
            case 'KeyY':
                pitch = 8;
                break;
            case 'KeyH':
                pitch = 9;
                break;
            case 'KeyU':
                pitch = 10;
                break;
            case 'KeyJ':
                pitch = 11;
                break;
            case 'KeyK':
                pitch = 12;
                break;
            case 'KeyO':
                pitch = 13;
                break;
            case 'KeyL':
                pitch = 14;
                break;
            case 'KeyP':
                pitch = 15;
                break;
            case 'Semicolon':
                pitch = 16;
                break;
            case 'Quote':
                pitch = 17;
                break;
            case 'KeyZ':
                octave = Math.max(octave - 1, 0);
                break;
            case 'KeyX':
                octave = Math.min(octave + 1, 10);
                break;
            case 'KeyC':
                velocity = Math.max(velocity - 18, 1);
                break;
            case 'KeyV':
                velocity = Math.min(velocity + 18, 127);
                break;            
        }

        console.log(e)

        if(pitch >= 0) {
            activeKeys.push({
                code: e.code,
                pitch
            });

            dispatchNoteOn({
                channel: 1,
                data: 0,
                note: {
                    number: pitch,
                    octave

                }
            });
        }
    }

    function handleKeyup(e) {
        const index = activeKeys.findIndex((key) => key.code === e.code);
        if(index === -1)
            return;

        activeKeys.splice(index, 1);
    }
</script>

<!--
    @component
    test
-->

<select on:pointerdown|once={requestMidiAccess}
		bind:value={inputid}
        class="devices"
		disabled>
	<option selected disabled value="">-Select MIDI Input-</option>
	<option value="none">No MIDI Input</option>
	<option value="all">All MIDI Inputs</option>
	{#if midiAccess }
		<optgroup label={(midiInputs.length === 0) ? 'No MIDI Devices' : 'MIDI Devices'} 
				  disabled={midiInputs.length === 0}>
			{#each midiInputs as input}
				<option value={input.id}>{input.name}</option>  
			{/each}
		</optgroup>		
	{:else}
		<option disabled>MIDI Unavailable</option>
	{/if}		
</select>

<button on:click={() => keyboard = !keyboard}
    aria-label="computer keyboard"
    role="switch" 
    aria-checked={keyboard}
    disabled>
    {#if keyboard}
        <svg xmlns="http://www.w3.org/2000/svg"         
            viewBox="0 0 24 24">
            <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M14,14.5h0.25V19h-4.5v-4.5H10 c0.55,0,1-0.45,1-1V5h2v8.5C13,14.05,13.45,14.5,14,14.5z M5,5h2v8.5c0,0.55,0.45,1,1,1h0.25V19H5V5z M19,19h-3.25v-4.5H16 c0.55,0,1-0.45,1-1V5h2V19z"/>
        </svg>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21.19,21.19L2.81,2.81L1.39,4.22L3,5.83V19c0,1.1,0.9,2,2,2h13.17l1.61,1.61L21.19,21.19z M8.25,19H5V7.83l2,2v3.67 c0,0.55,0.45,1,1,1h0.25V19z M9.75,19v-4.5H10c0.46,0,0.82-0.31,0.94-0.73l3.31,3.31V19H9.75z M11,8.17L5.83,3H19c1.1,0,2,0.9,2,2 v13.17l-2-2V5h-2v8.5c0,0.19-0.07,0.36-0.16,0.51L13,10.17V5h-2V8.17z"/>
        </svg>
    {/if}
</button>

<select disabled={(midiAccess && inputid != 'none') ? false : true}
        class="channels"
		bind:value={channel}>
	<option value="all">All Channels</option>
	{#each Array(16) as _, i}
		<option value={i+1}>Channel {i+1}</option>
	{/each}
</select>

<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 25 25">
     <rect width="25" height="6" rx="2" />   
     <rect y="9" width="25" height="6" rx="2" />  
     <rect y="18" width="25" height="6" rx="2" />  
</svg>

<style>
    :host {
        width: max-content;
        margin: 0 0 0.5em 0;
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr min-content;

        grid-gap: 0.3em;
    }

	option[value=""] {
		display: none;
	}

    button {
        padding: 0;
        margin: 0;
        overflow: hidden;
        border: none;
        background: transparent;
    }

    button svg {
        height: 100%;
        width: 100%;
    }

    :host svg, button {
        aspect-ratio: 1/1;
    }

    rect {
        fill: rgb(239, 239, 239);
    }
</style>