import Knob from "./Knob.svelte";

class KnobElement extends HTMLElement {  
    #element;
    #shadowRoot;

    #value;
    #default;
    #normal;
    #name;
    #unit;
    #scale;
    #modifier;
    #step;
    #min;
    #max;
    #sensitivity; 

    #zeroDB = 0.5;
    #decimals = 0;
      
    constructor() {
        super();

        this.#shadowRoot = this.attachShadow({ mode: 'open' });

        this.#value = 0;
        this.#default = null;
        this.#normal = 0;
        this.#name = "test";
        this.#unit = '%'
        this.#scale = 'lin';
        this.#modifier = 1;
        this.#step = 1;
        this.#min = 0;
        this.#max = 100;
        this.#sensitivity = 1;  
        
        this.#element = new Knob({
            target: this.#shadowRoot,
            props : {
                value: this.#value,
                normal: this.#normal,
                name: this.#name,
                unit: this.#unit,
                min: this.#min,
                max: this.#max,
                step: this.#step,
                sensitivity: this.#sensitivity,
                decimals: this.#decimals
            }
        }); 

        this.#element.$on('setNormal', (e) => this.normal = e.detail);
        //this.#element.$on('setValue', this.#setNormal);
        //this.#element.$on('inputEnd', this.#setNormal);
        //this.#element.$on('setToDefault')
        //this.#element.$on('increment', this.#setNormal);
        //this.#element.$on('decrement', this.#setNormal);
    }

    static get observedAttributes() {
        return [
            'value', 
            'default',
            'normal',
            'name',
            'unit',
            'scale',
            'modifier',
            'step',
            'min',
            'max',
            'sensitivity'];
      }

    connectedCallback() {
        Object.values(this.attributes).forEach(
            attribute => {
                this[attribute.name] = attribute.value;
            }
        );        
    }

    disconnectedCallback() {
        this.#element?.$destroy();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }

    #setNormal(e) {
        const newNormal = e.detail;

        if(this.#normal !== 0 )
        
        if(normal > 1 || normal < 0) {
            this.#element.$set({ knobDelta: 0 });
            return;
        }
            
    }

    #valueToNormal(newValue) {	
        if(newValue >= this.#max) return 1;
        if(newValue <= this.#min) return 0;
        switch (this.#scale) {
            case 'log':
                return (Math.log(newValue) - Math.log(this.#min)) / (Math.log(this.#max) - Math.log(this.#min)); 
            case 'db':
                if (this.#min === -Infinity) {
                    return (newValue > 0) 
                        ? newValue / this.#max * (1 - this.#zeroDB) + this.#zeroDB
                        : Math.pow(10, newValue / 20) * this.#zeroDB;
                }
        }
        let newNormal = (newValue - this.#min) / (this.#max - this.#min);
        
        switch (this.#scale) {
            case 'pow':               
            	return Math.pow(newNormal, 1/this.#modifier);  
            case 'lin':          
			default:
				return newNormal;
        }        
    }
		
    #normalToValue(normal) {
        if(normal >= 1) return this.#max;
        if(normal <= 0) return this.#min;
        let newValue;    
        switch (this.#scale) {
            case 'pow':
                newValue = Math.pow(normal, this.#modifier) * (this.#max - this.#min) + this.#min;
                break;
            case 'log':
                newValue = Math.exp(normal * (Math.log(this.#max) - Math.log(this.#min)) + Math.log(this.#min));
                break;
            case 'db':
                if (min === -Infinity) {
                    newValue = (normal > this.#zeroDB) 
                        ? (normal - this.#zeroDB) / (1 - this.#zeroDB) * this.#max 
                        : 20 * Math.log10(normal / this.#zeroDB);
                    break;
                }	
            case 'lin':					
            default:
                newValue = normal * (this.#max - this.#min) + this.#min;
        }
      	
        return this.#round(newValue);
    }

    #round(value) {
        value = Math.round(value / this.#step) * this.#step;
        return Number(value.toFixed(this.#decimals));
    }

    #fitInRange(value) {
        return Math.min(Math.max(value, this.#min), this.#max);
    }

    get value() {
        return this.#value;
    }

    set value(value) {   
        value = Number(value);

        this.#value = value;
        this.#normal = this.#valueToNormal(this.#value);

        this.#element.$set({
            value: this.#value,
            normalvalue: this.#normal
        });
        //this.setAttribute('value', this.#value);
        //this.setAttribute('normal', this.#value);
    }

    get normal() {
        return this.#normal;
    }

    set normal(normal) {
        normal = Number(normal);

        const newValue = this.#normalToValue(normal);
        if(newValue === this.#value) {
            if (normal > 1 || normal < 0)
                this.#element.$set({
                    knobDelta: 0
                });
            return;
        }

        this.#normal = this.#valueToNormal(newValue);
        this.#value = newValue;

        this.#element.$set({
            value: this.#value,
            normalvalue: this.#normal,
            knobDelta: 0
        });
    }

    get default() {
        return this.#default;
    }

    set default(defaultvalue) {
        this.#default = Number(defaultvalue);
    }

    get scale() {
        return this.#scale;
    }

    set scale(scale) {
        this.#scale = scale;
    }

    get modifier() {
        return this.#modifier;
    }

    set modifier(modifier) {
        this.#modifier = Number(modifier);
    }

    get unit() {
        return this.#unit;
    }

    set unit(unit) {
        this.#unit = unit;
        this.#element.$set({unit: this.#unit});
    }

    get min() {
        return this.#min;
    }

    set min(min) {
        this.#min = min;
        this.#element.$set({min: this.#min});
    }

    get max() {
        return this.#max;
    }

    set max(max) {
        this.#max = max;
        this.#element.$set({max: this.#max});
    }

    get step() {
        return this.#step;
    }

    set step(step) {
        this.#step = step;
        this.#element.$set({step: this.#step});
    }  
    
    get sensitivity() {
        return this.#sensitivity;
    }

    set sensitivity(sensitivity) {
        this.#sensitivity = sensitivity;
        this.#element.$set({sensitivity: this.#sensitivity});
    }
}

export default customElements.define('dt-knob', KnobElement);