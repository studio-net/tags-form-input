## What is Tags-FormInput ?

Tags-FormInput is a simple Javascript module that convert all corresponding input
form to a tags list input. It's completely open source and is running under MIT
licence. All contributions are welcome.

Tags-FormInput is written in pure JS. There's no dependency.

## Installation

```bash
bower install tags-form-input
```

After bower install, add theses following lines :

```html
<link rel="stylesheet" href="path/to/tags-input/dist/css/tags-input.min.css" />
<script src="path/to/tags-input/dist/js/tags-input.min.js"></script>
```

## How to use

Once you've load the javascript file, you just have to write where
you want tags-input work (HTML5 API selector) :

```javascript
new Tag.guess(document.querySelectorAll("your-element"))

// Defaults options
new Tag.guess(document.querySelectorAll("your-element"), {
	tooltip       : true,
	tooltipText   : "Right click to delete",
	formSeparator : ','
	nextTagCodes  : [13, 188, 9],
	autocomplete  : null,
	autofield     : "value",
	automin       : 3,
	autolimit     : 5,
	placeholder   : null
})
```

That's all! It's pretty simple.

### Options
This is the list of all availabled options :

- `tooltip` Show a tooltip on tag fly (default is : true)
- `tooltipText` Message in tooltip (default is : "Right click to delete")
- `formSeparator` Default separator on real form field
- `nextTagCodes` List of characters that create a new tag (default is
  [13, 88, 9] - ENTER, COMMA and TAB)
- `autocomplete` URL to autocomplete : the URL must provide a
  `%search%` content in order to replace by the value
- `autofield` The field used by autocomplete
- `automin` Minimum-character before starts autocomplete
- `autolimit` Limit the number of result terms
- `placeholder` Show message on empty tags

### Example

```
new Tag.guess(document.querySelectorAll("[data-role=tagsinput]"), {
	tooltip       : false,
	nextTagCodes  : [13, 188, 9],
	autocomplete  : "http://photon.komoot.de/api?q=%search%",
	autofield     : "value",
	automin       : 2,
	autolimit     : 8
})
```

## What's next ?

If needed, the package will be arranged to use as a jQuery plugin

## Contributions

Everyone can fork and propose some modifications of this module.
A Gulpfile is provided in order to accelerate development process. So, just run
theses simples commands to install all dependencies developments packages :

```bash
npm install
gulp build
```

You can also use a watcher with this command :

```bash
gulp watch
```

## License

MIT
