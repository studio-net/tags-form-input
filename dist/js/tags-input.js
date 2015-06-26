
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - Studionet
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function() {
  var Tag,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.Tag = Tag = (function() {
    Tag.prototype.element = null;

    Tag.prototype.options = null;

    Tag.prototype.deleted = false;

    Tag.prototype.terms = null;

    Tag.prototype.requestInstances = [];

    Tag.prototype.defaultOptions = {
      tooltip: true,
      tooltipText: "Right click to delete",
      formSeparator: ",",
      nextTagCodes: [13, 188, 9],
      autocomplete: null,
      autofield: "value",
      automin: 3,
      autolimit: 5,
      placeholder: null
    };

    function Tag(element1, options1) {
      var i, len, placeholder, ref, tag, tags, that;
      this.element = element1;
      this.options = options1;
      that = this;
      this.options = this.configureOptions();
      this.container = document.createElement("ul");
      placeholder = this.createPlaceHolder();
      this.element.parentNode.insertBefore(this.container, this.element.nextSibling);
      this.container.style.position = "relative";
      this.container.style.left = 0;
      this.container.style.height = "auto";
      this.container.style.minHeight = this.element.offsetHeight + "px";
      this.container.classList.add("tag-input");
      this.container.classList.add("container");
      this.container.addEventListener("click", function(event) {
        if (event.target !== that.container) {
          return;
        }
        return that.createTag();
      });
      this.container.addEventListener("DOMNodeInserted", function(event) {
        placeholder = document.querySelector(".tag-input > .placeholder");
        if (event.target === placeholder) {
          return;
        }
        if (placeholder && that.container.children.length > 1) {
          placeholder.remove();
        }
      });
      this.container.addEventListener("DOMNodeRemoved", function(event) {
        if (that.container.childNodes.length - 1 === 0) {
          that.createPlaceHolder();
        }
      });
      this.container.addEventListener("mousedown", function(event) {
        if (event.target !== that.container) {
          return;
        }
        return event.preventDefault();
      });
      tags = this.element.getAttribute("value");
      if (!tags) {
        return;
      }
      ref = tags.split(this.options.formSeparator);
      for (i = 0, len = ref.length; i < len; i++) {
        tag = ref[i];
        this.createTag(tag);
      }
      this.container.lastChild.firstChild.blur();
    }

    Tag.prototype.configureOptions = function() {
      var key, options, property, ref;
      options = this.defaultOptions;
      if (typeof this.options !== 'object') {
        return options;
      }
      ref = this.options;
      for (key in ref) {
        property = ref[key];
        if (options[key] === 'undefined') {
          throw "`" + key + "` option doesn't exist";
        }
        options[key] = property;
      }
      return options;
    };

    Tag.prototype.createPlaceHolder = function() {
      var placeholder;
      if (this.options.placeholder) {
        placeholder = document.createElement("span");
        placeholder.innerHTML = this.options.placeholder;
        placeholder.classList.add("placeholder");
        this.container.appendChild(placeholder);
        return placeholder;
      }
      return null;
    };

    Tag.prototype.createTag = function(value) {
      var content, tag, that, tooltip;
      that = this;
      tag = document.createElement("li");
      tag.classList.add("tag-input");
      tag.classList.add("tag");
      content = document.createElement("span");
      content.classList.add("tag-content");
      content.contentEditable = true;
      if (value) {
        content.innerHTML = value;
      }
      tag.appendChild(content);
      this.container.appendChild(tag);
      if (this.options.tooltip) {
        tooltip = document.createElement("span");
        tooltip.classList.add("tag-tooltip");
        tooltip.innerHTML = this.options.tooltipText;
        tag.appendChild(tooltip);
      }
      this.createFocus(tag);
      tag.firstChild.addEventListener("blur", function() {
        if (!this.innerHTML) {
          this.parentNode.remove();
          return;
        }
        sessionStorage.removeItem("tags-input-autocomplete");
        return that.fillInput();
      });
      tag.addEventListener("keydown", function(event) {
        var ref;
        if (ref = event.keyCode, indexOf.call(that.options.nextTagCodes, ref) >= 0) {
          event.preventDefault();
          value = sessionStorage.getItem("tags-input-autocomplete");
          if (value) {
            this.firstChild.innerHTML = value;
          }
          if (this.firstChild.innerHTML) {
            that.createTag();
            return false;
          }
        }
        return sessionStorage.removeItem("tags-input-autocomplete");
      });
      tag.firstChild.addEventListener("input", function(event) {
        var min, range;
        min = that.options.automin;
        sessionStorage.setItem("tags-input-value", this.innerHTML);
        range = window.getSelection().getRangeAt(0);
        that.clearRequests();
        if (!that.options.autocomplete) {
          return;
        }
        if (this.innerHTML.length < min) {
          return;
        }
        if (range.startOffset !== this.innerHTML.length) {
          return;
        }
        clearTimeout(that.timer);
        return that.requestTerm(this.parentNode);
      });
      return tag.addEventListener("contextmenu", function(event) {
        this.remove();
        that.fillInput();
        event.preventDefault();
        return false;
      });
    };

    Tag.prototype.createFocus = function(tag) {
      if (this.terms) {
        this.terms.remove();
      }
      this.terms = null;
      return tag.firstChild.focus();
    };

    Tag.prototype.requestTerm = function(tag) {
      var permalink, request, that, value;
      that = this;
      value = tag.firstChild.innerHTML;
      permalink = this.options.autocomplete.replace("%search%", value);
      request = new XMLHttpRequest();
      request.open("GET", permalink, true);
      request.addEventListener("readystatechange", function(event) {
        var data, response, terms;
        response = event.target;
        if (response.readyState !== 4) {
          return;
        }
        if (response.status !== 200) {
          return;
        }
        data = JSON.parse(response.responseText);
        terms = that.autocomplete(data, value);
        return that.showTerms(terms, tag);
      });
      request.send(null);
      return this.requestInstances.push(request);
    };

    Tag.prototype.clearRequests = function() {
      var i, instance, len, ref, results;
      if (this.requestInstances.length > 0) {
        ref = this.requestInstances;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          instance = ref[i];
          instance.abort();
          results.push(this.requestInstances.slice(this.requestInstances.indexOf(instance), 1));
        }
        return results;
      }
    };

    Tag.prototype.searchTerm = function(value, search) {
      var found, key, list, term;
      list = [];
      for (key in value) {
        term = value[key];
        if (term instanceof Object) {
          found = this.searchTerm(term, search);
          if (found.length) {
            list = list.concat(found);
          }
        }
        if (key !== this.options.autofield) {
          continue;
        }
        list = list.concat(term);
      }
      return list;
    };

    Tag.prototype.autocomplete = function(values, search) {
      var key, terms, value;
      if (!values || !search) {
        return;
      }
      terms = [];
      for (key in values) {
        value = values[key];
        if (!(value instanceof Array)) {
          continue;
        }
        terms = terms.concat(this.searchTerm(value, search));
      }
      return terms.slice(0, this.options.autolimit);
    };

    Tag.prototype.showTerms = function(terms, tag) {
      var i, len, node, results, term, that;
      that = this;
      if (!this.terms) {
        this.terms = document.createElement("div");
        this.terms.classList.add("tag-input");
        this.terms.classList.add("terms");
        this.container.appendChild(this.terms);
      }
      while (this.terms.firstChild) {
        this.terms.removeChild(this.terms.firstChild);
      }
      results = [];
      for (i = 0, len = terms.length; i < len; i++) {
        term = terms[i];
        node = document.createElement("div");
        node.classList.add("tag-input");
        node.classList.add("link-term");
        node.innerHTML = term;
        node.addEventListener("click", function(event) {
          tag.firstChild.innerHTML = event.target.innerHTML;
          that.terms.remove();
          return that.terms = null;
        });
        results.push(this.terms.appendChild(node));
      }
      return results;
    };

    Tag.prototype.fillInput = function() {
      var content, i, len, tag, tags;
      tags = this.container.childNodes;
      content = [];
      for (i = 0, len = tags.length; i < len; i++) {
        tag = tags[i];
        content.push(tag.firstChild.innerHTML);
      }
      return this.element.setAttribute("value", content.join(this.options.formSeparator));
    };

    Tag.guess = function(elements, options) {
      var element, i, len, results;
      results = [];
      for (i = 0, len = elements.length; i < len; i++) {
        element = elements[i];
        results.push(new Tag(element, options));
      }
      return results;
    };

    return Tag;

  })();

}).call(this);
