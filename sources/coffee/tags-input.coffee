###
# The MIT License (MIT)
#
# Copyright (c) 2015 - Studionet
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
###

window.Tag = class Tag
	element : null
	options : null
	deleted : false
	requestInstances : []

	defaultOptions   :
		tooltip       : true
		tooltipText   : "Right click to delete"
		formSeparator : ","
		nextTagCodes  : [13, 188, 9] # ENTER, COMMA and TAB
		autocomplete  : null
		autofield     : "value"
		automin       : 5

	constructor : (@element, @options) ->
		that = @

		# Construct options
		@options = @configureOptions()

		# Create the real container of all tags
		@container = document.createElement "ul"

		# Insert it just after the @element
		@element.parentNode.insertBefore @container, @element.nextSibling

		@container.style.position = "relative"
		@container.style.left     = 0
		@container.style.height   = "auto"
		@container.style.minHeight = @element.offsetHeight + "px"

		@container.classList.add "tag-input"
		@container.classList.add "container"

		# On container click, add a new tag
		@container.addEventListener "click", (event) ->
			if event.target isnt that.container
				return

			that.createTag()

		# Prevent from content editable focus on container click
		@container.addEventListener "mousedown", (event) ->
			if event.target isnt that.container
				return

			event.preventDefault()

		# Get existing values
		tags = @element.getAttribute "value"
		return if not tags

		for tag in tags.split @options.formSeparator
			@createTag tag

		# Blur the last tag
		@container.lastChild.firstChild.blur()

	configureOptions : () ->
		options = @defaultOptions

		if typeof(@options) isnt 'object'
			return options

		for key, property of @options
			if options[key] is 'undefined'
				throw "`#{key}` option doesn't exist"

			options[key] = property

		return options

	createTag : (value) ->
		that = @

		# Create a container of our tag
		tag = document.createElement "li"
		tag.classList.add "tag-input"
		tag.classList.add "tag"

		# Create the content of the new tag
		content = document.createElement "span"
		content.classList.add "tag-content"
		content.contentEditable = true
		content.innerHTML = value if value

		# Append the content into the tag and the whole into the global
		# container
		tag.appendChild content
		@container.appendChild tag

		if @options.tooltip
			# Create tooltip
			tooltip = document.createElement "span"
			tooltip.classList.add "tag-tooltip"
			tooltip.innerHTML = @options.tooltipText

			tag.appendChild tooltip

		# Let's create a focus into the newer tag
		@createFocus tag

		tag.firstChild.addEventListener "blur", ->
			# Remove on empty content
			if not @innerHTML
				@parentNode.remove()
				return

			that.fillInput()

		# When the user press some keys, we need to prevent from default
		# For example, when a user press ENTER key, we don't want the submitting
		# form, we just need create a new tag
		tag.addEventListener "keydown", (event) ->
			# On ENTER key or COMMA key
			if event.keyCode in that.options.nextTagCodes
				event.preventDefault()

				value = sessionStorage.getItem "tags-input-autocomplete"
				@firstChild.innerHTML = value if value

				# Prevent from multiple creations and suppressions
				if @firstChild.innerHTML
					that.createTag()
					return false

		# On content editable change
		tag.firstChild.addEventListener "input", (event) ->
			min = that.options.automin
			sessionStorage.setItem "tags-input-value", @innerHTML

			range = window.getSelection().getRangeAt 0
			that.clearRequests()

			return if not that.options.autocomplete
			return if @innerHTML.length % 2 isnt 1 or @innerHTML.length < min
			return if range.startOffset isnt @innerHTML.length
			clearTimeout that.timer

			that.timer = setTimeout =>
				that.requestTerm @parentNode
			, 500

		# Delete a tag on right click on it
		tag.addEventListener "contextmenu", (event) ->
			@remove()
			that.fillInput()

			event.preventDefault()
			return false

	createFocus : (tag) ->
		tag.firstChild.focus()

	requestTerm : (tag) ->
		that  = @
		value = tag.firstChild.innerHTML

		permalink = @options.autocomplete.replace "%search%", value
		request   = new XMLHttpRequest()
		request.open "GET", permalink, true
		request.addEventListener "readystatechange", (event) ->
			response = event.target
			return if response.readyState isnt 4 or response.status isnt 200

			if response.readyState is 4
				if response.status is 200
					data = JSON.parse response.responseText
					term = that.autocomplete data, value
					term = term[0]

					return if term is undefined

					value = sessionStorage.getItem "tags-input-value"
					sessionStorage.setItem "tags-input-autocomplete", term

					term  = term.substr value.length
					child = tag.firstChild

					child.innerHTML = child.innerHTML + term.toLowerCase()

					try
						# Create selection on added content
						range = document.createRange()
						range.setStart child.firstChild, value.length
						range.setEnd   child.firstChild, value.length + term.length

						selection = window.getSelection()
						selection.removeAllRanges()
						selection.addRange range
					catch e

		request.send null
		@requestInstances.push request

	clearRequests : ->
		# Abort all existing instances of XMLHttpRequest
		if @requestInstances.length > 0
			for instance in @requestInstances
				instance.abort()
				instance.removeEventListener "readystatechange"

				@requestInstances.slice @requestInstances.indexOf(instance), 1

	searchTerm : (value, search) ->
		list = []

		for key, term of value

			if term instanceof Object
				found = @searchTerm term, search
				list  = list.concat found if found.length

			continue if key isnt @options.autofield
			list = list.concat term

		return list

	autocomplete : (values, search) ->
		return if not values or not search
		terms = []

		for key, value of values
			continue if value not instanceof Array
			terms = terms.concat @searchTerm(value, search)

		return terms.slice 0, 1

	fillInput : ->
		# Fill the given input (element) with tags
		tags    = @container.childNodes
		content = []
		for tag in tags
			content.push tag.firstChild.innerHTML

		@element.setAttribute "value", content.join @options.formSeparator

	@guess : (elements, options) ->
		# As the class Tag represent an input, we need a guess function to allow
		# user fetching multiple inputs
		for element in elements
			new Tag element, options
