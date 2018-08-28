!(function(window){
	var LayerLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.layerDistance = 60;
		this.nodeScale = 2;
		this.nodeSize = 32;
		this.boolTransition = true;
		this.intSteps = 50;
	}
	
	LayerLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	LayerLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	LayerLayout.prototype.initAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var nodeCount = nodes.length;
		var innerCircleRaduis = 0,nextLayerRoundLong=0,currentRoundLong=0;
		var maxTheta=0,theta=0;
		
		nodes = nodes.sort(function(n1,n2){
			return ((n2.inLinks ||[]).length + (n2.outLinks||[]).length) - ((n1.inLinks||[]).length + (n1.outLinks||[]).length);
		});
		
		for(var i=0;i<nodeCount;i++){
			
			var node = nodes[i];
			if(i == 0){
				node.x = 0;
				node.y = 0;
				
				innerCircleRaduis = _self.nodeSize /2;
				continue;
			}
			
			currentRoundLong += _self.nodeSize * _self.nodeScale;
			
			if(currentRoundLong > nextLayerRoundLong){
				nextLayerNodeRaduis = _self.nodeSize/2;
				nextCircleRaduis = innerCircleRaduis + _self.layerDistance + nextLayerNodeRaduis;
				nextLayerRoundLong = 2 * Math.PI * nextCircleRaduis;
				innerCircleRaduis = innerCircleRaduis + _self.layerDistance + _self.nodeSize;
				theta = 1/nextCircleRaduis;
				maxTheta = 0;
				currentRoundLong = _self.nodeSize * _self.nodeScale;
			}
			
			var thisAngle = theta * _self.nodeSize * _self.nodeScale;
			
			var posData = _self.newLayoutData();
			posData.finishx = nextCircleRaduis * Math.cos(maxTheta + Math.PI);
			posData.finishy = nextCircleRaduis * Math.sin(maxTheta + Math.PI);
			posData.xdistance = (1.0 / _self.intSteps) * (posData.finishx - node.x);
			posData.ydistance = (1.0 / _self.intSteps) * (posData.finishy - node.y);
			node.layoutData = posData;
			
			maxTheta += thisAngle;
		}
	}
	
	LayerLayout.prototype.goAlgo = function(){
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
	
	window.LayerLayout = LayerLayout;
	
})(window);