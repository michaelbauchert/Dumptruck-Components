<script>
    export let value;
    export let display; 
    export let normal;
    export let defaultvalue;
    export let scale;
    export let modifier;
    export let unit;
    export let min;
    export let max;
    export let step;
    export let flipped;

    $: decimals = (step.toString().split(".")[1] ?? []).length;    

    $: refreshValue(min, max, step);	
    function refreshValue(min, max, step) {
        value = fitInRange(round(value));
    }
    
    $: refreshNormal(value, scale, modifier, unit);
    function refreshNormal(value, scale, modifier, unit) {      
        value = Number(value);     
        normal = valueToNormal(value);  
        display = value.toLocaleString(undefined, { minimumFractionDigits: decimals,  maximumFractionDigits: decimals,}) + ' ' + unit;   
    }  
    
    $: zeroDB = (Math.pow(10, -max / 20) + 1) / 2;
    function valueToNormal(newValue) {	
        if(newValue >= max) return 1;
        if(newValue <= min) return 0;
        switch (scale) {
            case 'log':
                return (Math.log(newValue) - Math.log(min)) / (Math.log(max) - Math.log(min)); 
            case 'db':
                if (min === -Infinity) {
                    return (newValue > 0) 
                        ? newValue / max * (1 - zeroDB) + zeroDB
                        : Math.pow(10, newValue / 20) * zeroDB;
                }
        }
        let newNormal = (newValue - min) / (max - min);
        
        switch (scale) {
            case 'pow':               
            	return Math.pow(newNormal, 1/modifier); 
            case 'lin':           
			default:
				return newNormal;
        }        
    }
		
    function normalToValue(normal) {
        if(normal >= 1) return max;
        if(normal <= 0) return min;
        let newValue;    
        switch (scale) {
            case 'pow':
                newValue = Math.pow(normal, modifier) * (max - min) + min;
                break;
            case 'log':
                newValue = Math.exp(normal * (Math.log(max) - Math.log(min)) + Math.log(min));
                break;
            case 'db':
                if (min === -Infinity) {
                    newValue = (normal > zeroDB) 
                        ? (normal - zeroDB) / (1 - zeroDB) * max 
                        : 20 * Math.log10(normal / zeroDB);
                    break;
                }	
            case 'lin':					
            default:
                newValue = normal * (max - min) + min;
        }
      	
        return round(newValue);
    }	
    
    function round(value) {
        value = Math.round(value / step) * step;
        return Number(value.toFixed(decimals));
    }

    function fitInRange(value) {
        return Math.min(Math.max(value, min), max);
    }

    export function setValueFromNormal(normal) {
        let newValue = normalToValue(normal);

        let response = {
            minMax: (normal > 1 || normal < 0),
            valueChanged: (value !== newValue),
        };
        
        if(response.valueChanged)
            value = newValue;      

        return response;
    }  
	
    export function setValueFrom7Bit(midi) {
        return setValueFromNormal(midi / 127);	
    }

    export function setValue(newValue) {
        value = round(fitInRange(Number(newValue)));
    }

    export function setValueToDefault() {
        if(defaultvalue)
            value = defaultvalue;
    }
	
    let repeatCount = 1;
    export function increment(repeat) {
        repeatCount = repeat ? repeatCount + 1 : 1;
		let newValue = fitInRange(value + step * repeatCount);
        if (value !== newValue)
			value = newValue;
    }

    export function decrement(repeat) {
        repeatCount = repeat ? repeatCount + 1 : 1;
        let newValue = fitInRange(value - step * repeatCount);
        if (value !== newValue)
			value = newValue;
    }    
</script>


