/**
 * Paper.js Minimal - Custom lightweight version
 * Only includes the features actually used in the portfolio:
 * - paper.setup()
 * - paper.Path()
 * - paper.Point()
 * - paper.Size()
 * - path.smooth()
 * - paper.view (onFrame, viewSize, pause, play)
 * 
 * Original Paper.js: ~500KB minified
 * This version: ~15KB unminified (~5KB minified)
 * 
 * Based on Paper.js v0.12.17
 * Copyright (c) 2011 - 2020, Jürg Lehni & Jonathan Puckey
 * http://paperjs.org/
 * Distributed under the MIT license.
 */

(function(window) {
  'use strict';

  // ============================================================================
  // Base utility functions
  // ============================================================================
  
  function extend(dest, src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dest[key] = src[key];
      }
    }
    return dest;
  }

  // ============================================================================
  // Point class
  // ============================================================================
  
  function Point(x, y) {
    if (typeof x === 'object' && x !== null) {
      this.x = x.x || 0;
      this.y = x.y || 0;
    } else {
      this.x = x || 0;
      this.y = y || 0;
    }
  }

  Point.prototype.clone = function() {
    return new Point(this.x, this.y);
  };

  Point.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };

  // ============================================================================
  // Size class
  // ============================================================================
  
  function Size(width, height) {
    if (typeof width === 'object' && width !== null) {
      this.width = width.width || 0;
      this.height = width.height || 0;
    } else {
      this.width = width || 0;
      this.height = height || 0;
    }
  }

  Size.prototype.clone = function() {
    return new Size(this.width, this.height);
  };

  // ============================================================================
  // Segment class (internal for Path)
  // ============================================================================
  
  function Segment(point, handleIn, handleOut) {
    this.point = point instanceof Point ? point : new Point(point);
    this.handleIn = handleIn instanceof Point ? handleIn : new Point(0, 0);
    this.handleOut = handleOut instanceof Point ? handleOut : new Point(0, 0);
    this._path = null;
  }

  Segment.prototype.clone = function() {
    return new Segment(this.point.clone(), this.handleIn.clone(), this.handleOut.clone());
  };

  // ============================================================================
  // Path class
  // ============================================================================
  
  function Path() {
    this.segments = [];
    this.closed = false;
    this.strokeColor = null;
    this.strokeWidth = 1;
    this.strokeCap = 'butt';
    this.fillColor = null;
    this._view = null;
  }

  Path.prototype.add = function(point) {
    var segment;
    if (point instanceof Segment) {
      segment = point;
    } else if (point instanceof Point) {
      segment = new Segment(point);
    } else if (typeof point === 'object' && point.x !== undefined) {
      segment = new Segment(new Point(point.x, point.y));
    } else {
      return null;
    }
    
    segment._path = this;
    this.segments.push(segment);
    return segment;
  };

  Path.prototype.smooth = function() {
    var segments = this.segments;
    var length = segments.length;
    
    if (length <= 2) return;

    // Catmull-Rom smooth algorithm (simplified)
    for (var i = 0; i < length; i++) {
      var segment = segments[i];
      var prev = segments[i - 1] || (this.closed ? segments[length - 1] : segment);
      var next = segments[i + 1] || (this.closed ? segments[0] : segment);
      var next2 = segments[i + 2] || (this.closed ? segments[(i + 2) % length] : next);
      
      var prevPoint = prev.point;
      var point = segment.point;
      var nextPoint = next.point;
      var next2Point = next2.point;
      
      // Calculate smooth handles using simplified Catmull-Rom spline
      var smoothness = 0.25;
      
      segment.handleIn.x = (prevPoint.x - nextPoint.x) * smoothness;
      segment.handleIn.y = (prevPoint.y - nextPoint.y) * smoothness;
      
      segment.handleOut.x = (nextPoint.x - prevPoint.x) * smoothness;
      segment.handleOut.y = (nextPoint.y - prevPoint.y) * smoothness;
    }
  };

  Path.prototype.remove = function() {
    if (this._view) {
      var index = this._view._items.indexOf(this);
      if (index !== -1) {
        this._view._items.splice(index, 1);
      }
      this._view = null;
    }
  };

  Path.prototype._draw = function(ctx) {
    var segments = this.segments;
    if (segments.length === 0) return;

    ctx.beginPath();
    
    var first = segments[0];
    ctx.moveTo(first.point.x, first.point.y);

    for (var i = 1; i < segments.length; i++) {
      var segment = segments[i];
      var prev = segments[i - 1];
      
      // Use bezier curve if handles are set
      var hasHandles = (prev.handleOut.x !== 0 || prev.handleOut.y !== 0 || 
                        segment.handleIn.x !== 0 || segment.handleIn.y !== 0);
      
      if (hasHandles) {
        ctx.bezierCurveTo(
          prev.point.x + prev.handleOut.x,
          prev.point.y + prev.handleOut.y,
          segment.point.x + segment.handleIn.x,
          segment.point.y + segment.handleIn.y,
          segment.point.x,
          segment.point.y
        );
      } else {
        ctx.lineTo(segment.point.x, segment.point.y);
      }
    }

    if (this.closed) {
      var last = segments[segments.length - 1];
      var hasHandles = (last.handleOut.x !== 0 || last.handleOut.y !== 0 || 
                        first.handleIn.x !== 0 || first.handleIn.y !== 0);
      
      if (hasHandles) {
        ctx.bezierCurveTo(
          last.point.x + last.handleOut.x,
          last.point.y + last.handleOut.y,
          first.point.x + first.handleIn.x,
          first.point.y + first.handleIn.y,
          first.point.x,
          first.point.y
        );
      }
      ctx.closePath();
    }

    // Apply styles and draw
    if (this.fillColor) {
      ctx.fillStyle = this.fillColor;
      ctx.fill();
    }
    
    if (this.strokeColor) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth || 1;
      ctx.lineCap = this.strokeCap || 'butt';
      ctx.stroke();
    }
  };

  // ============================================================================
  // View class
  // ============================================================================
  
  function View(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext('2d');
    this._items = [];
    this._onFrame = null;
    this._animating = false;
    this._animationId = null;
    this._frameHandler = this._handleFrame.bind(this);
    
    // Initialize canvas size from element dimensions
    this.viewSize = new Size(canvas.width || canvas.clientWidth, canvas.height || canvas.clientHeight);
  }

  Object.defineProperty(View.prototype, 'onFrame', {
    get: function() {
      return this._onFrame;
    },
    set: function(callback) {
      this._onFrame = callback;
      if (callback && !this._animating) {
        this._animating = true;
        this._requestFrame();
      } else if (!callback && this._animating) {
        this.pause();
      }
    }
  });

  Object.defineProperty(View.prototype, 'viewSize', {
    get: function() {
      return this._viewSize;
    },
    set: function(size) {
      this._viewSize = size instanceof Size ? size : new Size(size);
      this._canvas.width = this._viewSize.width;
      this._canvas.height = this._viewSize.height;
    }
  });

  View.prototype._requestFrame = function() {
    if (this._animating) {
      this._animationId = requestAnimationFrame(this._frameHandler);
    }
  };

  View.prototype._handleFrame = function(time) {
    if (!this._animating) return;
    
    // Call onFrame callback BEFORE clearing/drawing
    if (this._onFrame) {
      this._onFrame({
        time: time / 1000, // Convert to seconds
        delta: 1 / 60 // Approximate, can be improved
      });
    }
    
    // Clear canvas
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    
    // Draw all paths
    for (var i = 0; i < this._items.length; i++) {
      this._items[i]._draw(this._context);
    }
    
    // Request next frame
    this._requestFrame();
  };

  View.prototype.pause = function() {
    this._animating = false;
    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  };

  View.prototype.play = function() {
    if (!this._animating) {
      this._animating = true;
      this._requestFrame();
    }
  };

  View.prototype._addItem = function(item) {
    if (this._items.indexOf(item) === -1) {
      this._items.push(item);
      item._view = this;
    }
  };

  // ============================================================================
  // PaperScope class (main API)
  // ============================================================================
  
  function PaperScope() {
    this.view = null;
    this.Path = Path;
    this.Point = Point;
    this.Size = Size;
  }

  PaperScope.prototype.setup = function(canvas) {
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas);
    }
    
    if (!canvas || !canvas.getContext) {
      throw new Error('Canvas element required for paper.setup()');
    }
    
    // Set canvas dimensions to match CSS dimensions
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || canvas.clientWidth || window.innerWidth;
    canvas.height = rect.height || canvas.clientHeight || window.innerHeight;
    
    this.view = new View(canvas);
    
    // Override Path constructor to auto-add to view
    var scope = this;
    var OriginalPath = Path;
    
    this.Path = function() {
      var path = new OriginalPath();
      if (scope.view) {
        scope.view._addItem(path);
      }
      return path;
    };
    
    // Copy prototype
    this.Path.prototype = OriginalPath.prototype;
    
    return this;
  };

  // ============================================================================
  // Global paper instance
  // ============================================================================
  
  var paper = new PaperScope();
  
  // Export to global scope
  window.paper = paper;
  
  // Also export constructors for direct access
  window.paper.Point = Point;
  window.paper.Size = Size;
  
})(typeof window !== 'undefined' ? window : this);
