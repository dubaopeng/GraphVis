!(function(window){
	var BalloonLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.nodeIds = [];
		this.nodeNeighbers = [];
		
		this.distX = 5;
		this.distY = 5;
		this.currentX = 0;
		this.currentY = 0;
		
		this.boolTransition = true;
		this.intSteps = 50;
	}
	
	BalloonLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	BalloonLayout.prototype.initAlgo = function(){
		var _self = this;
		
		_self.nodes.forEach(function(node){
			_self.nodeIds.push(node.uniquId);
			var neighbers = _self.initNodeNeighbers(node);
			_self.nodeNeighbers.push(neighbers);
		});
		
		_self.buildTree();
		_self.setRootPolars();
	}
	
	BalloonLayout.prototype.initNodeNeighbers = function(node){
		var _self = this;
		var nodeNeighbers = [];
		var outLinks = node.outLinks || [];
		
		outLinks.forEach(function(link){
			var nodeZ = link.nodeZ;
			var nodeA = link.nodeA;
			
			if(nodeA.uniquId != nodeZ.uniquId){
				
				var index = _self.nodeIds.indexOf(nodeZ.uniquId);
				var childNodes = _self.nodeNeighbers[index] || [];
				
				var childNodeIds = [];
				childNodes.forEach(function(n){
					childNodeIds.push(n.uniquId);
				});
				
				if(childNodeIds.indexOf(node.uniquId) == -1){
					nodeNeighbers.push(nodeZ);
				}
			}
		});
		return nodeNeighbers;
	}
	
	BalloonLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	BalloonLayout.prototype.setRootPolars = function() {
		var _self = this;
		var roots = _self.getRoots();
        if(roots.length == 1) {
    		var root = roots[0];
    		_self.setRootPolar(root);
    		var childNodes = _self.getSuccessors(root);
    		var center = _self.getCenter();
    		_self.setPolars(childNodes,center, center.x);
    	} else if (roots.length > 1) {
    		var center = _self.getCenter();
    		_self.setPolars(roots, center, center.x);
    	}
    }
	
	BalloonLayout.prototype.setRootPolar = function(root){
		root.x = 0;
		root.y = 0;
    }
	
	BalloonLayout.prototype.setPolars = function(kids, parentLocation, parentRadius) {
		var _self = this;
	    var childCount = kids.length;
    	if(childCount == 0) {
    		return;
    	}
    	var angle = Math.max(0, Math.PI / 2 * (1 - 2.0/childCount));
    	var childRadius = parentRadius*Math.cos(angle) / (1 + Math.cos(angle));
    	var radius = parentRadius - childRadius;

    	var rand = Math.random();

    	for(var i=0; i< childCount; i++) {
    		var node = kids[i];
    		var theta = i* 2*Math.PI/childCount + rand;

    		var x = radius * Math.cos(theta);
    		var y = radius * Math.sin(theta);
    		
    		//node.x = x + parentLocation.x;
    		//node.y = y + parentLocation.y;
    		
    		x = x + parentLocation.x;
    		y = y + parentLocation.y;
    		
    		var posData = _self.newLayoutData();
			posData.finishx = x;
			posData.finishy = y;
			posData.xdistance = (1.0 / _self.intSteps) * (x - node.x);
			posData.ydistance = (1.0 / _self.intSteps) * (y - node.y);
			node.layoutData = posData;
    		
    		//var p = {x:node.x,y:node.y};
    		var p = {x:x,y:y};
    		
    		var childNodes = _self.getSuccessors(node);
    		_self.setPolars(childNodes, p, childRadius);
    	}
    }
	
	BalloonLayout.prototype.getCenter = function(node){
		var _self = this;
		var parent = _self.getParent(node);
		if(parent == null) {
			return _self.getCenter();
		}
		return {x : parent.x, y:parent.y};
	}
	
	BalloonLayout.prototype.getCenter = function(){
		var _self = this;
		var maxx = 0;
		var maxy = 0;
		_self.nodes.forEach(function(node){
			maxx = Math.max(maxx, node.tempx);
			maxy = Math.max(maxy, node.tempy);
		});
		maxx = maxx/2;
		maxy = maxy/2;
		return {x : maxx, y:maxy};
	}
	
	BalloonLayout.prototype.getParent = function(node){
		var inLinks = node.inLinks || [];
		if(inLinks.length > 0){
			return inLinks[0].nodeA;
		}
		return null;
	}
	
	BalloonLayout.prototype.buildTree = function(){
		var _self = this;
		var roots = _self.getRoots();
        if (roots.length > 0) {
        	_self.calculateRootsX(roots);
        	roots.forEach(function(node){
        		_self.calculateNodeX(node);
        		_self.currentX += node.sizeT/2 + _self.distX;
        		_self.buildNodeTree(node,_self.currentX);
        	});
        }
	}
	
	BalloonLayout.prototype.getRoots = function(){
		var _self = this;
		var roots = [];
		_self.nodes.forEach(function(node){
			if((node.inLinks || []).length == 0){
				roots.push(node);
			}
		});
		return roots;
	}
	
	BalloonLayout.prototype.calculateRootsX = function(roots){
		var _self = this;
		var size = 0;
		roots.forEach(function(node){
			var childNodes =  _self.getSuccessors(node);
			var childrenNum = childNodes.length;

    		if (childrenNum != 0) {
    			childNodes.forEach(function(node){
    				size += _self.calculateNodeX(node) + _self.distX;
    			});
    		}
    		size = Math.max(0, size - _self.distX);
    		node.sizeT = size;
		});
    	return size;
	}
	
	BalloonLayout.prototype.calculateNodeX = function(node){
		var _self = this;
		var size = 0;
		var childNodes =  _self.getSuccessors(node);
		var childrenNum = childNodes.length;

        if (childrenNum != 0) {
            childNodes.forEach(function(node){
				size += _self.calculateNodeX(node) + _self.distX;
			});
        }
        size = Math.max(0, size - _self.distX);
        node.sizeT = size;
        return size;
	}
	
	BalloonLayout.prototype.buildNodeTree = function(node,x) {
		var _self = this;
		_self.currentY += _self.distY;
		_self.currentX = x;

        _self.setCurrentPositionFor(node);

        var sizeXofCurrent = node.sizeT;

        var lastX = x - sizeXofCurrent / 2;

        var sizeXofChild;
        var startXofChild;
        
        var childNodes = _self.getSuccessors(node);
        
        childNodes.forEach(function(n){
        	sizeXofChild = n.sizeT;
            startXofChild = lastX + sizeXofChild / 2;
            _self.buildNodeTree(n, startXofChild);
            lastX = lastX + sizeXofChild + _self.distX;
        });

        _self.currentY -= _self.distY;
	}
	
	BalloonLayout.prototype.setCurrentPositionFor = function(node) {
    	var _self = this;
		var x = _self.currentX;
    	var y = _self.currentY;
    	/*node.x = x;
    	node.y = y;*/
    	node.tempx = x;
    	node.tempy = y;
	}
	
	//获取节点指向的节点集合
	BalloonLayout.prototype.getSuccessors = function(node){
		var _self = this;
		var index = _self.nodeIds.indexOf(node.uniquId);
		var childNodes = _self.nodeNeighbers[index];
		return childNodes;
	}

	BalloonLayout.prototype.goAlgo = function(){
		var _self = this;
		var position = null;
		var nodes = _self.nodes;
		var length = nodes.length;
		
		for(var i=0;i<length;i++){
			var n = nodes[i];
			
			position = n.layoutData;
			
			if(position == null){
				continue;
			}
			
			if(_self.boolTransition){
				var currentDistance = Math.abs(n.x - position.finishx);
				var nextDistance = Math.abs((n.x + position.xdistance) - position.finishx);
				if(nextDistance < currentDistance){
					n.x += position.xdistance;
				}else{
					n.x = position.finishx;
				}
				
				currentDistance = Math.abs(n.y - position.finishy);
				nextDistance = Math.abs((n.y + position.ydistance) - position.finishy);
				if(nextDistance < currentDistance){
					n.y += position.ydistance;
				}else{
					n.y = position.finishy;
				}
				
				if(n.x == position.finishx && n.y == position.finishy){
					n.layoutData = null;
				}
			}else{
				n.x = position.finishx;
				n.y = position.finishy;
				n.layoutData = null;
			}
		}
	}
	
	window.BalloonLayout = BalloonLayout;
	
})(window);