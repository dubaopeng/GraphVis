!(function(window){
	var ARFLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.neighborAttraction = 3.0;
		this.attraction = 0.2;
		this.forceScale = 0.0;
		this.deltaT = 2.0;
		this.forceCutoff = 7.0;
	}
	
	ARFLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	ARFLayout.prototype.runLayout = function(){
		var i =0;
		while(i++ < 10){
			this.goAlgo();
		}
	}
	
	ARFLayout.prototype.initAlgo = function(){
		var _self = this;
		
		_self.neighborAttraction = 3.0;
		_self.attraction = 0.09;
		_self.forceScale = 6.0;
		_self.deltaT = 7.0;
		_self.forceCutoff = 10.0;
		
		_self.nodes.forEach(function(n){
			var inLinks = n.inLinks || [];
			var outLinks = n.outLinks || [];
			
			n.degree = inLinks.length + outLinks.length;
			var neighbers = [];
			
			inLinks.forEach(function(l){
				neighbers.push(l.sourceId);
			});
			outLinks.forEach(function(l){
				neighbers.push(l.targetId);
			});
			
			n.neighbers = neighbers;
		});
	}
	
	ARFLayout.prototype.goAlgo = function(){
		var _self = this;
		var minX = Infinity,minY = Infinity;
		
		_self.nodes.forEach(function(node){
			var f = _self.getForceforNode(node);
			var degree = node.degree;
			var deltaIndividual = degree <= 1?_self.deltaT:_self.deltaT/Math.pow(degree,0.4);
			
			f = {
				x : f.x * deltaIndividual,
				y : f.y * deltaIndividual
			}
			
			node.x += f.x;
			node.y += f.y;
			
			minX = Math.min(minX,node.x);
			minY = Math.min(minY,node.y);
		});
		
		_self.nodes.forEach(function(node){
			node.x += (100 - minX);
			node.y += (100 - minY);
		});
	}
	
	ARFLayout.prototype.getForceforNode = function(node){
		var _self = this;
		var numNodes = _self.nodes.length;
		var mDot = {x:0,y:0};
		
		if(node.x == 0 && node.y == 0){
			return mDot;
		}
		
		_self.nodes.forEach(function(n){
			if(node.uniquId != n.uniquId && (n.x != 0 || n.y != 0)){
				var tempX = n.x - node.x;
				var tempY = n.y - node.y;
				
				if(tempX == 0 && tempY == 0){
					tempX = 10;
					tempY = 10;
				}
				
				var multiplier = _self.isAdjacent(node,n)?_self.neighborAttraction : 1.0;
				multiplier = multiplier * (_self.attraction / Math.sqrt(numNodes));
				
				mDot = {
					x : mDot.x + tempX * multiplier,
					y : mDot.y + tempY * multiplier
				};
				
				multiplier = 1.0 / Math.sqrt(tempX * tempX +  tempY * tempY);
				mDot = {
					x : mDot.x - tempX * multiplier * _self.forceScale,
					y : mDot.y - tempY * multiplier * _self.forceScale
				};
			}
		});
		var distance = _self.distance(0.0,0.0,mDot.x,mDot.y);
		if(distance > _self.forceCutoff){
			var mult = _self.forceCutoff / distance;
			mDot = {
				x : mDot.x * mult,
				y : mDot.y * mult
			}
		}
		return mDot;
	}
	
	ARFLayout.prototype.getDegree = function(node){
		return 1;
	}
	
	ARFLayout.prototype.isAdjacent = function(node,otherNode){
		var neighbers = node.neighbers;
		if(neighbers.indexOf(otherNode.uniquId) != -1){
			return true;
		}
		return false;
	}
	
	ARFLayout.prototype.distance = function(px,py,x,y){
		px -= x;
		py -= y;
		return Math.sqrt(px*px + py*py);
	}
	
	window.ARFLayout = ARFLayout;
	
})(window);