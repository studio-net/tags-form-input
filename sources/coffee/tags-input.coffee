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
	defaultOptions :
		tooltip       : true
		tooltipText   : "Right click to delete"
		formSeparator : ","
		nextTagCodes  : [13, 188] # ENTER and COMMA

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

	configureOptions : () ->
		options = @defaultOptions

		if typeof(@options) isnt 'object'
			return options

		for key, property of @options
			if not options[key]
				throw "`#{key}` options doesn't exist"

			options[key] = property

		return options

	createTag : ->
		that = @

		# Create a container of our tag
		tag = document.createElement "li"
		tag.classList.add "tag-input"
		tag.classList.add "tag"

		# Create the content of the new tag
		content = document.createElement "span"
		content.classList.add "tag-content"
		content.contentEditable = true

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
			if not tag.firstChild.innerHTML
				tag.remove()

				return

			that.fillInput()

		# When the user press some keys, we need to prevent from default
		# For example, when a user press ENTER key, we don't want the submitting
		# form, we just need create a new tag
		tag.addEventListener "keydown", (event) ->
			# On ENTER key or COMMA key
			if event.keyCode in that.options.nextTagCodes
				event.preventDefault()

				# Prevent from multiple creations and suppressions
				if tag.firstChild.innerHTML
					that.createTag()

					return false

		# Delete a tag on right click on it
		tag.addEventListener "contextmenu", (event) ->
			event.preventDefault()
			tag.remove()
			that.fillInput()

			return false

	createFocus : (tag) ->
		tag.firstChild.focus()

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

new Tag.guess document.querySelectorAll("[data-role=tagsinput]")
