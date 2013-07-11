var glob = this;        
//This functions much like jQuery.each.
glob.IterateProperties = function(obj, func) {
    for (propertyName in obj) {
        if (obj.hasOwnProperty(propertyName)) {
            func(propertyName);   
        }
    }
}

glob.RandomFromTo = function(from, to) {
    return Math.floor(Math.random() * to) + from
}

Array.prototype.indexAndRemove = function(itemToRemove) {
    var indexOfItem = this.indexOf(itemToRemove);
    
    if (indexOfItem == -1) {
        return false;
    }
    
    this.splice(indexOfItem, 1);
    return true;
}

// V2.prototype.To = function(target) {
//     //A -> B == B - A
//     var to = new V2();
//     to.InitFromV2(target);
//     return to.Sub(this);
// }

// ImmutableV2.prototype.To = function(target) {
//     //A -> B == B - A
//     return target.Sub(this);
// }

/*Object.prototype.DepthFirstSearch = function(getChildren, action) {
    var children = getChildren(this);
    var extraArgs = arguments.slice(2);
    if (!action.apply(action, [this].concat())) {
        return;
    }
    
    children.forEach(function (child) {
        child.DepthFirstSearch(getChildren, action);
    });
}*/

Array.prototype.contains = function(item) {
    return $.inArray(item, this) !== -1;
}

/*
  Checks to see if the two arrays contain the same elements regardless of order.
*/
Array.prototype.contentEquals = function(otherArray) {
    return ($(this).not(otherArray).length === 0 && $(otherArray).not(this).length === 0);
}

// b2Vec2.prototype.ToV2 = function() {
//     return new V2(this.x, this.y);
// }

// var cached = false;
// V2.prototype.Tob2Vec2 = function() {
//     if (!cached) {
//         cached = true;
//         V2.prototype.Tob2Vec2 = function() {
//             return b2Vec2.Make(this.X, this.Y);
//         };
        
//         return V2.prototype.Tob2Vec2.call(this);
//     }
// }

glob.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}