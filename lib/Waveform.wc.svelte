<svelte:options tag="dt-waveform" />

<script>
    import WaveformData from 'waveform-data';

    let audioContext = new AudioContext();

    let buffer = [];

    let waveform = [];

    let path = "";

    async function loadAudio(e) {
        buffer = await fetch(window.URL.createObjectURL(e.target.files[0]))
                    .then(response => response.arrayBuffer());
        waveform = await getWaveformData(audioContext, buffer);

        path = getSVGPath(waveform);

        console.log(`Waveform has ${waveform.channels} channels`);
        console.log(`Waveform has length ${waveform.length} points`);
    }

    async function getWaveformData(audio_context, array_buffer, scale = 128) {
        const options = {
            audio_context,
            array_buffer,
            scale,
        };

        console.log(array_buffer)

        return new Promise((resolve, reject) => {
            WaveformData.createFromAudio(options, (err, waveform) => {
                if (err) {
                reject(err);
                }
                else {
                resolve(waveform);
                }
            });
        });
    }

    function getSVGPath(waveform) {
        let newPath = `M0 0`;
        
        const channel = waveform.channel(0) ?? [];

        // Loop forwards, drawing the upper half of the waveform
        for (let x = 0; x < waveform.length; x++) {
            const y = channel.max_sample(x);

            newPath = `${newPath}L${x * waveform.scale} ${y}`;
        }

        // Loop backwards, drawing the lower half of the waveform
        for (let x = waveform.length - 1; x >= 0; x--) {
            const y = channel.min_sample(x);

            newPath = `${newPath}L${x * waveform.scale} ${y}`;
        }

        return `${newPath}Z`;
    }
</script>

<input type="file" on:input={loadAudio} on:click|once={audioContext.resume()} />

<svg viewbox="0 {2 ** (waveform.bits ?? 0) / -2 } {buffer.length} {2 ** (waveform.bits ?? 0)}"
preserveAspectRatio="none">
    <path d={path} fill="black"></path>
</svg>

<style>
    svg {
        width: 100%;
        height: 100px;
    }
</style>