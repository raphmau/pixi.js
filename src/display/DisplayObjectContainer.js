var math = require('../math'),
    DisplayObject = require('./DisplayObject');

/**
 * A DisplayObjectContainer represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 * @class
 * @extends DisplayObject
 * @namespace PIXI
 */
function DisplayObjectContainer() {
    DisplayObject.call( this );

    /**
     * The array of children of this container.
     *
     * @member {DisplayObject[]}
     * @readonly
     */
    this.children = [];
}

// constructor
DisplayObjectContainer.prototype = Object.create(DisplayObject.prototype);
DisplayObjectContainer.prototype.constructor = DisplayObjectContainer;
module.exports = DisplayObjectContainer;

Object.defineProperties(DisplayObjectContainer.prototype, {
    /**
     * The width of the displayObjectContainer, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof DisplayObjectContainer#
     */
    width: {
        get: function () {
            return this.scale.x * this.getLocalBounds().width;
        },
        set: function (value) {

            var width = this.getLocalBounds().width;

            if(width !== 0) {
                this.scale.x = value / width;
            }
            else {
                this.scale.x = 1;
            }


            this._width = value;
        }
    },

    /**
     * The height of the displayObjectContainer, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     * @memberof DisplayObjectContainer#
     */
    height: {
        get: function () {
            return  this.scale.y * this.getLocalBounds().height;
        },
        set: function (value) {

            var height = this.getLocalBounds().height;

            if (height !== 0) {
                this.scale.y = value / height ;
            }
            else {
                this.scale.y = 1;
            }

            this._height = value;
        }
    }
});

/**
 * Adds a child to the container.
 *
 * @param child {DisplayObject} The DisplayObject to add to the container
 * @return {DisplayObject} The child that was added.
 */
DisplayObjectContainer.prototype.addChild = function (child) {
    return this.addChildAt(child, this.children.length);
};

/**
 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
 *
 * @param child {DisplayObject} The child to add
 * @param index {Number} The index to place the child in
 * @return {DisplayObject} The child that was added.
 */
DisplayObjectContainer.prototype.addChildAt = function (child, index) {
    if (index >= 0 && index <= this.children.length) {
        if (child.parent) {
            child.parent.removeChild(child);
        }

        child.parent = this;

        this.children.splice(index, 0, child);

        if (this.stage) {
            child.setStageReference(this.stage);
        }

        return child;
    }
    else {
        throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
    }
};

/**
 * Swaps the position of 2 Display Objects within this container.
 *
 * @param child {DisplayObject}
 * @param child2 {DisplayObject}
 */
DisplayObjectContainer.prototype.swapChildren = function (child, child2) {
    if (child === child2) {
        return;
    }

    var index1 = this.getChildIndex(child);
    var index2 = this.getChildIndex(child2);

    if (index1 < 0 || index2 < 0) {
        throw new Error('swapChildren: Both the supplied DisplayObjects must be a child of the caller.');
    }

    this.children[index1] = child2;
    this.children[index2] = child;
};

/**
 * Returns the index position of a child DisplayObject instance
 *
 * @param child {DisplayObject} The DisplayObject instance to identify
 * @return {Number} The index position of the child display object to identify
 */
DisplayObjectContainer.prototype.getChildIndex = function (child) {
    var index = this.children.indexOf(child);

    if (index === -1) {
        throw new Error('The supplied DisplayObject must be a child of the caller');
    }

    return index;
};

/**
 * Changes the position of an existing child in the display object container
 *
 * @param child {DisplayObject} The child DisplayObject instance for which you want to change the index number
 * @param index {Number} The resulting index number for the child display object
 */
DisplayObjectContainer.prototype.setChildIndex = function (child, index) {
    if (index < 0 || index >= this.children.length) {
        throw new Error('The supplied index is out of bounds');
    }

    var currentIndex = this.getChildIndex(child);

    this.children.splice(currentIndex, 1); //remove from old position
    this.children.splice(index, 0, child); //add at new position
};

/**
 * Returns the child at the specified index
 *
 * @param index {Number} The index to get the child from
 * @return {DisplayObject} The child at the given index, if any.
 */
DisplayObjectContainer.prototype.getChildAt = function (index) {
    if (index < 0 || index >= this.children.length) {
        throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject must be a child of the caller');
    }

    return this.children[index];
};

/**
 * Removes a child from the container.
 *
 * @param child {DisplayObject} The DisplayObject to remove
 * @return {DisplayObject} The child that was removed.
 */
DisplayObjectContainer.prototype.removeChild = function (child) {
    var index = this.children.indexOf(child);

    if (index === -1) {
        return;
    }

    return this.removeChildAt(index);
};

/**
 * Removes a child from the specified index position.
 *
 * @param index {Number} The index to get the child from
 * @return {DisplayObject} The child that was removed.
 */
DisplayObjectContainer.prototype.removeChildAt = function (index) {
    var child = this.getChildAt(index);

    if (this.stage) {
        child.removeStageReference();
    }

    child.parent = null;
    this.children.splice(index, 1);

    return child;
};

/**
 * Removes all children from this container that are within the begin and end indexes.
 *
 * @param beginIndex {Number} The beginning position. Default value is 0.
 * @param endIndex {Number} The ending position. Default value is size of the container.
 */
DisplayObjectContainer.prototype.removeChildren = function (beginIndex, endIndex) {
    var begin = beginIndex || 0;
    var end = typeof endIndex === 'number' ? endIndex : this.children.length;
    var range = end - begin;

    if (range > 0 && range <= end) {
        var removed = this.children.splice(begin, range);

        for (var i = 0; i < removed.length; ++i) {
            var child = removed[i];

            if (this.stage) {
                child.removeStageReference();
            }

            child.parent = null;
        }

        return removed;
    }
    else if (range === 0 && this.children.length === 0) {
        return [];
    }
    else {
        throw new RangeError('removeChildren: numeric values are outside the acceptable range.');
    }
};

/*
 * Updates the transform on all children of this container for rendering
 *
 * @private
 */
DisplayObjectContainer.prototype.updateTransform = function () {
    if (!this.visible) {
        return;
    }

    this.displayObjectUpdateTransform();

    if (this._cacheAsBitmap) {
        return;
    }

    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].updateTransform();
    }
};

// performance increase to avoid using call.. (10x faster)
DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform = DisplayObjectContainer.prototype.updateTransform;

/**
 * Retrieves the bounds of the displayObjectContainer as a rectangle. The bounds calculation takes all visible children into consideration.
 *
 * @return {Rectangle} The rectangular bounding area
 */
DisplayObjectContainer.prototype.getBounds = function () {
    if (this.children.length === 0) {
        return math.Rectangle.EMPTY;
    }

    // TODO the bounds have already been calculated this render session so return what we have

    var minX = Infinity;
    var minY = Infinity;

    var maxX = -Infinity;
    var maxY = -Infinity;

    var childBounds;
    var childMaxX;
    var childMaxY;

    var childVisible = false;

    for (var i = 0, j = this.children.length; i < j; ++i) {
        var child = this.children[i];

        if (!child.visible) {
            continue;
        }

        childVisible = true;

        childBounds = this.children[i].getBounds();

        minX = minX < childBounds.x ? minX : childBounds.x;
        minY = minY < childBounds.y ? minY : childBounds.y;

        childMaxX = childBounds.width + childBounds.x;
        childMaxY = childBounds.height + childBounds.y;

        maxX = maxX > childMaxX ? maxX : childMaxX;
        maxY = maxY > childMaxY ? maxY : childMaxY;
    }

    if (!childVisible) {
        return math.Rectangle.EMPTY;
    }

    this._bounds.x = minX;
    this._bounds.y = minY;
    this._bounds.width = maxX - minX;
    this._bounds.height = maxY - minY;

    // TODO: store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    //this._currentBounds = bounds;

    return this._bounds;
};

/**
 * Retrieves the non-global local bounds of the displayObjectContainer as a rectangle.
 * The calculation takes all visible children into consideration.
 *
 * @return {Rectangle} The rectangular bounding area
 */
DisplayObjectContainer.prototype.getLocalBounds = function () {
    var matrixCache = this.worldTransform;

    this.worldTransform = math.Matrix.IDENTITY;

    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].updateTransform();
    }

    this.worldTransform = matrixCache;

    return this.getBounds();
};

/**
 * Sets the containers Stage reference. This is the Stage that this object, and all of its children, is connected to.
 *
 * @param stage {Stage} the stage that the container will have as its current stage reference
 */
DisplayObjectContainer.prototype.setStageReference = function (stage) {
    this.stage = stage;

    if (this._interactive) {
        this.stage.dirty = true;
    }

    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].setStageReference(stage);
    }
};

/**
 * Removes the current stage reference from the container and all of its children.
 *
 */
DisplayObjectContainer.prototype.removeStageReference = function () {
    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].removeStageReference();
    }

    if (this._interactive) {
        this.stage.dirty = true;
    }

    this.stage = null;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderSession {RenderSession}
 * @private
 */
DisplayObjectContainer.prototype._renderWebGL = function (renderSession) {
    if (!this.visible || this.alpha <= 0) {
        return;
    }

    if (this._cacheAsBitmap) {
        this._renderCachedSprite(renderSession);
        return;
    }

    var i, j;

    if (this._mask || this._filters) {
        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (this._filters) {
            renderSession.spriteBatch.flush();
            renderSession.filterManager.pushFilter(this._filterBlock);
        }

        if (this._mask) {
            renderSession.spriteBatch.stop();
            renderSession.maskManager.pushMask(this.mask, renderSession);
            renderSession.spriteBatch.start();
        }

        // simple render children!
        for (i = 0, j = this.children.length; i < j; ++i) {
            this.children[i]._renderWebGL(renderSession);
        }

        renderSession.spriteBatch.stop();

        if (this._mask) {
            renderSession.maskManager.popMask(this._mask, renderSession);
        }

        if (this._filters) {
            renderSession.filterManager.popFilter();
        }

        renderSession.spriteBatch.start();
    }
    else {
        // simple render children!
        for(i = 0, j = this.children.length; i < j; ++i) {
            this.children[i]._renderWebGL(renderSession);
        }
    }
};

/**
 * Renders the object using the Canvas renderer
 *
 * @param renderSession {RenderSession}
 * @private
 */
DisplayObjectContainer.prototype._renderCanvas = function (renderSession) {
    if (this.visible === false || this.alpha === 0) {
        return;
    }

    if (this._cacheAsBitmap) {
        this._renderCachedSprite(renderSession);
        return;
    }

    if (this._mask) {
        renderSession.maskManager.pushMask(this._mask, renderSession);
    }

    for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i]._renderCanvas(renderSession);
    }

    if (this._mask) {
        renderSession.maskManager.popMask(renderSession);
    }
};
