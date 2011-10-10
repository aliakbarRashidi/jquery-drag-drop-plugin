(function($) {
	var defaultOptions = {
		makeClone: false,  // Drag a clone of the source, and not the actual source element
        sourceClass: null, // Class to apply to source element when dragging a clone of the source element
        sourceHide: false, // Specify with true that the source element should hade visibility:hidden while dragging a clone
        dragClass: null,   // Class to apply to the element that is dragged
        canDropClass: null, // Class to apply to the dragged element when dropping is possible
        dropClass: null,
        isActive: true,

        canDrag: function($src) {
            return false;
        },
		canDrop: function($dst) {
			return false;
		},
        didDrop: function($src, $dst) {
            $src.appendTo($dst);
        }
	};

    // Status during a drag-and-drop operation. Only one such operation can be in progress at any given time.
    var $sourceElement = null; // Element that user wanted to drag
	var $activeElement = null; // Element that is shown moving around during drag operation
    var $destElement = null;   // Element currently highlighted as possible drop destination
    var dragOffsetX, dragOffsetY; // Position difference from drag-point to active elements left top corner

    // Private helper methods

    function cancelDestElement(options) {
        if ($destElement!=null) {
            if (options.dropClass)
                $destElement.removeClass(options.dropClass);
            $destElement = null;
        }
        if ($activeElement!=null) {
            if (options.canDropClass) {
                $activeElement.removeClass(options.canDropClass);
            }
        }
    }

    // Public methods

	var methods = {
		init: function(options) {
			options = $.extend({}, defaultOptions, options);
			this.data("options", options);
            this.bind("mousedown.dragdrop touchstart.dragdrop", methods.onStart);

			return this;
		},

		destroy: function() {
            this.unbind("mousedown.dragdrop touchstart.dragdrop");
            return this;
		},
        on: function() {
			this.data("options").isActive = true;
        },
        off: function() {
			this.data("options").isActive = false;
        },

        onStart: function(event) {
            var $me = $(this);
			var options = $me.data("options");
            if (!options.isActive)
                return;

            var $element = $(event.target);
            if (options.canDrag($element)) {
                $sourceElement = $element;
                var offset = $sourceElement.offset();
                var width = $sourceElement.width();
                var height = $sourceElement.height();
                if (event.type=="touchstart") {
                    dragOffsetX = event.originalEvent.touches[0].clientX - offset.left;
                    dragOffsetY = event.originalEvent.touches[0].clientY - offset.top;
                }
                else {
                    dragOffsetX = event.pageX - offset.left;
                    dragOffsetY = event.pageY - offset.top;
                }

                if (options.makeClone) {
                    $activeElement = $sourceElement.clone(false);
                    $activeElement.appendTo($me);
                    if (options.sourceClass)
                        $sourceElement.addClass(options.sourceClass);
                    else if (options.sourceHide)
                        $sourceElement.css("visibility", "hidden");
                }
                else {
                    $activeElement = $sourceElement;
                }

                $activeElement.css("position", "absolute");
                $activeElement.css("left", offset.left + "px");
                $activeElement.css("top", offset.top + "px");
                $activeElement.css("width", width + "px");
                $activeElement.css("height", height + "px");
                if (options.dragClass)
                    $activeElement.addClass(options.dragClass);

                $(window).bind("mousemove.dragdrop touchmove.dragdrop", { source: $me }, methods.onMove);
                $(window).bind("mouseup.dragdrop touchend.dragdrop", { source: $me}, methods.onEnd);

                event.stopPropagation();
                return false;
            }
        },

        onMove: function(event) {
            if (!$activeElement)
                return;

            var $me = event.data.source;
			var options = $me.data("options");
            var posX, posY;
            if (event.type=="touchmove") {
                posX = event.originalEvent.touches[0].clientX;
                posY = event.originalEvent.touches[0].clientY;
            }
            else {
                posX = event.pageX;
                posY = event.pageY;
            }
            $activeElement.css("display", "none");
            var destElement = document.elementFromPoint(posX, posY);
            $activeElement.css("display", "");
            posX -= dragOffsetX;
            posY -= dragOffsetY;
            $activeElement.css("left", posX + "px");
            $activeElement.css("top", posY + "px");

            if (destElement) {
                if ($destElement==null || $destElement.get(0)!=destElement) {
                    var $possibleDestElement = $(destElement);
                    if (options.canDrop($possibleDestElement)) {
                        if (options.dropClass) {
                            if ($destElement!=null)
                                $destElement.removeClass(options.dropClass);
                            $possibleDestElement.addClass(options.dropClass);
                        }
                        if (options.canDropClass) {
                            $activeElement.addClass(options.canDropClass);
                        }
                        $destElement = $possibleDestElement;
                    }
                    else if ($destElement!=null) {
                        cancelDestElement(options);
                    }
                }
            }
            else if ($destElement!=null) {
                cancelDestElement(options);
            }

            event.stopPropagation();
            return false;
        },

        onEnd: function(event) {
            if (!$activeElement)
                return;

            var $me = event.data.source;
			var options = $me.data("options");
            if ($destElement) {
                options.didDrop($sourceElement, $destElement);
            }
            cancelDestElement(options);

            if (options.makeClone) {
                $activeElement.remove();
                if (options.sourceClass)
                    $sourceElement.removeClass(options.sourceClass);
                else if (options.sourceHide)
                    $sourceElement.css("visibility", "visible");
            }
            else {
                $activeElement.css("position", "static");
                $activeElement.css("width", "");
                $activeElement.css("height", "");
                if (options.dragClass)
                    $activeElement.removeClass(options.dragClass);
            }

            $(window).unbind("mousemove.dragdrop touchmove.dragdrop");
            $(window).unbind("mouseup.dragdrop touchend.dragdrop");
            $sourceElement = null;
            $activeElement = null;
        }
	};

	$.fn.dragdrop = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
		else {
			$.error('Method '+method+' does not exist on jQuery.tooltip');
		}
	};
})(jQuery);


var DragDrop = function(sourceElementQuery, customSettings) {
	var settings = {
		makeClone: false,  // Drag a clone of the source, and not the actual source element
        sourceClass: null, // Class to apply to source element when dragging a clone of the source element
        sourceHide: false, // Specify with true that the source element should hade visibility:hidden while dragging a clone
        dragClass: null,   // Class to apply to the element that is dragged
        canDropClass: null, // Class to apply to the dragged element when dropping is possible
        dropClass: null
	};
	var isActive = true;
    var $sourceArea;
    var $sourceElement = null;
	var $activeElement = null;
    var $destElement = null;
    var dragOffsetX, dragOffsetY;
    $.extend(settings, customSettings);

    var myself = {
        on: function() {
			isActive = true;
        },
        off: function() {
			isActive = false;
        },
        canDrag: function(el) {
            return false;
        },
		canDrop: function(el) {
			return false;
		},
        didDrop: function(src, dst) {
        }
    };

	function onStart(event) {
		if (!isActive)
			return;

		var $element = $(event.target);
		if (myself.canDrag($element)) {
			$sourceElement = $element;
			var offset = $sourceElement.offset();
			var width = $sourceElement.width();
			var height = $sourceElement.height();
            if (event.type=="touchstart") {
                dragOffsetX = event.originalEvent.touches[0].clientX - offset.left;
                dragOffsetY = event.originalEvent.touches[0].clientY - offset.top;
            }
            else {
                dragOffsetX = event.pageX - offset.left;
                dragOffsetY = event.pageY - offset.top;
            }

            if (settings.makeClone) {
                $activeElement = $sourceElement.clone(false);
                $activeElement.appendTo($sourceArea);
                if (settings.sourceClass)
                    $sourceElement.addClass(settings.sourceClass);
                else if (settings.sourceHide)
                    $sourceElement.css("visibility", "hidden");
            }
            else {
                $activeElement = $sourceElement;
            }

			$activeElement.css("position", "absolute");
			$activeElement.css("left", offset.left + "px");
			$activeElement.css("top", offset.top + "px");
			$activeElement.css("width", width + "px");
			$activeElement.css("height", height + "px");
			if (settings.dragClass)
				$activeElement.addClass(settings.dragClass);

			$(window).bind("mousemove touchmove", onMove);
			$(window).bind("mouseup touchend", onEnd);

		    event.stopPropagation();
			return false;
		}
	}

    function cancelDestElement() {
        if ($destElement!=null) {
            if (settings.dropClass)
                $destElement.removeClass(settings.dropClass);
            $destElement = null;
        }
        if ($activeElement!=null) {
            if (settings.canDropClass) {
                $activeElement.removeClass(settings.canDropClass);
            }
        }
    }

	function onMove(event) {
        if (!$activeElement)
            return;

        var posX, posY;
        if (event.type=="touchmove") {
            posX = event.originalEvent.touches[0].clientX;
            posY = event.originalEvent.touches[0].clientY;
        }
        else {
            posX = event.pageX;
            posY = event.pageY;
        }
        $activeElement.css("display", "none");
        var destElement = document.elementFromPoint(posX, posY);
        $activeElement.css("display", "");
        posX -= dragOffsetX;
        posY -= dragOffsetY;
        $activeElement.css("left", posX + "px");
        $activeElement.css("top", posY + "px");

        if (destElement) {
            if ($destElement==null || $destElement.get(0)!=destElement) {
                var $possibleDestElement = $(destElement);
                if (myself.canDrop($possibleDestElement)) {
                    if (settings.dropClass) {
                        if ($destElement!=null)
                            $destElement.removeClass(settings.dropClass);
                        $possibleDestElement.addClass(settings.dropClass);
                    }
                    if (settings.canDropClass) {
                        $activeElement.addClass(settings.canDropClass);
                    }
                    $destElement = $possibleDestElement;
                }
                else if ($destElement!=null) {
                    cancelDestElement();
                }
            }
        }
        else if ($destElement!=null) {
            cancelDestElement();
        }

        event.stopPropagation();
        return false;
	}

	function onEnd(event) {
        if (!$activeElement)
            return;

        if ($destElement) {
            myself.didDrop($sourceElement, $destElement);
        }
        cancelDestElement();

        if (settings.makeClone) {
            $activeElement.remove();
            if (settings.sourceClass)
                $sourceElement.removeClass(settings.sourceClass);
            else if (settings.sourceHide)
                $sourceElement.css("visibility", "visible");
        }
        else {
            $activeElement.css("position", "static");
            $activeElement.css("width", "");
            $activeElement.css("height", "");
            if (settings.dragClass)
                $activeElement.removeClass(settings.dragClass);
        }

		$(window).unbind("mousemove touchmove", onMove);
		$(window).unbind("mouseup touchend", onEnd);
        $sourceElement = null;
		$activeElement = null;
	}

    $sourceArea = $(sourceElementQuery);
    $sourceArea.bind("mousedown touchstart", onStart);

    return myself;
};

