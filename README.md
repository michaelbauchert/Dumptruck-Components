# dumptruck-components

> A base template for building a shareable web components library with [Svelte](https://svelte.dev).

## Components

## Quick Start

## Development

This web component library is built from [svelte-web-components-template](https://github.com/sinedied/svelte-web-components-template)

You can directly create a new GitHub repo from this template by selecting the **Use this template** button on GitHub.

To install and work on Dumptruck Components locally:

```bash
git clone https://github.com/michaelbauchert/dumptruck-components.git
cd dumptruck-components
npm install
```

The components' source code lives in `lib/` folder. Only components with the `.wc.svelte` extension will be exported as web components and available the library. This means that you can also use regular Svelte components with the `.svelte` extension as child components for your implementation details.

You can add additional components by adding them to the `lib` folder and editing `lib/index.js`.

## Testing Components

You can start a development server with:

```bash
npm run dev
```

Then open your browser to [localhost:5000](http://localhost:5000).

This will build the demo application located in the `demo/` folder, in which you can use and test your components during development. 

### Using the Built Web Components with the Demo App

The demo application is provided for development and testing of the components, that's why it imports the `.svelte` files from the `lib/` folder directly by default.

If you prefer, you can import the built web components from the `dist/` folder instead, by editing `demo/src/App.svelte` and replacing the `import '../../lib';` statement with `import '../../dist';` if you have the `bundleComponents` option enabled, or individually import your components with `import import '../../dist/MyComponent.wc.js';` otherwise.

You'll also have to make sure to run the `npm run build` script to generate the `dist/` folder first.

## Building the Library

The command `npm run build` will create the web components library in the `dist/` folder. It creates both a JavaScript module (`dist/index.mjs`) and a regular UMD script (`dist/index.js`).

The build is automatically called when executing `npm publish` or `npm pack` to distribute your library, thanks to the `prepublishOnly` scripts in `package.json`.

## Dev Limitations

Dumptruck Components does not provide any web components polyfills for older browsers support. It's usually best to leave that task to the host application, hence why they're left out.

### Props

Any props accepted by each web component are automatically transformed to element attributes. Since camelCase or PascalCase does not work in HTML, you have to make sure to name your props in lowercase.

```html
<script>
  export let myvalue = "Default";
</script>
```

### Events

The Svelte syntax event for listening to events like `on:myevent` doesnt work with events dispatched from a Svelte web component ([#3119](https://github.com/sveltejs/svelte/issues/3119)).

You need to use a workaround for that, by creating a `CustomEvent` and dispatching it with the `composed: true` option to cross the shadow DOM boundary.

Here's an example:

```html
// MyComponent.wc.svelte
<svelte:options tag="my-component" />
<script>
  import { get_current_component } from "svelte/internal";
  
  const component = get_current_component();
  
  // example function for dispatching events
  const dispatchEvent = (name, detail) => {
    component?.dispatchEvent(new CustomEvent(name, {
      detail,
      composed: true  // propagate across the shadow DOM
    }));
  };
</script>
<button on:click={() => dispatchEvent("test", "Hello!")}>
  Click to dispatch event
</button>
```