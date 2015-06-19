(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

    Tag.prototype.requestInstances = [];

    Tag.prototype.defaultOptions = {
      tooltip: true,
      tooltipText: "Right click to delete",
      formSeparator: ",",
      nextTagCodes: [13, 188, 9],
      autocomplete: null,
      autofield: "value",
      automin: 5
    };

    function Tag(element1, options1) {
      var i, len, ref, tag, tags, that;
      this.element = element1;
      this.options = options1;
      that = this;
      this.options = this.configureOptions();
      this.container = document.createElement("ul");
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
          throw "`" + key + "` options doesn't exist";
        }
        options[key] = property;
      }
      return options;
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
        if (!tag.firstChild.innerHTML) {
          tag.remove();
          return;
        }
        return that.fillInput();
      });
      tag.addEventListener("keydown", function(event) {
        var ref;
        if (ref = event.keyCode, indexOf.call(that.options.nextTagCodes, ref) >= 0) {
          event.preventDefault();
          that.clearRequests();
          if (tag.firstChild.innerHTML) {
            that.createTag();
            return false;
          }
        }
      });
      tag.firstChild.addEventListener("input", function(event) {
        var min;
        min = that.options.automin;
        sessionStorage.setItem("tags-input-value", this.innerHTML);
        if (!that.options.autocomplete) {
          return;
        }
        if (this.innerHTML.length % 2 !== 1 || this.innerHTML.length < min) {
          return;
        }
        clearTimeout(that.timer);
        that.clearRequests();
        return that.timer = setTimeout(function() {
          return that.requestTerm(tag);
        }, 500);
      });
      return tag.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        tag.remove();
        that.fillInput();
        return false;
      });
    };

    Tag.prototype.createFocus = function(tag) {
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
        var child, data, e, range, response, selection, term;
        response = event.target;
        if (response.readyState !== 4 || response.status !== 200) {
          return;
        }
        if (response.readyState === 4) {
          if (response.status === 200) {
            data = JSON.parse(response.responseText);
            term = that.autocomplete(data, value);
            term = term[0];
            if (term === void 0) {
              return;
            }
            value = sessionStorage.getItem("tags-input-value");
            term = term.substr(value.length);
            child = tag.firstChild;
            child.innerHTML = child.innerHTML + term;
            try {
              range = document.createRange();
              range.setStart(child.firstChild, value.length);
              range.setEnd(child.firstChild, value.length + term.length);
              selection = window.getSelection();
              selection.removeAllRanges();
              return selection.addRange(range);
            } catch (_error) {
              e = _error;
            }
          }
        }
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
          instance.removeEventListener("readystatechange");
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
      return terms.slice(0, 1);
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

  new Tag.guess(document.querySelectorAll("[data-role=tagsinput]"), {
    autocomplete: "http://photon.komoot.de/api?q=%search%",
    autofield: "name"
  });

}).call(this);

},{}]},{},[1])