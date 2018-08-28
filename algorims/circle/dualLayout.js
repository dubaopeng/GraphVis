!(function(window){
	var DualCircleLayout = function(nodes,links){
		this.nodes = nodes;
		this.links = links;
		
		this.highdegreeoutside = false;
		this.secondarynodecount = 1;
		this.boolNoOverlap = true;
		this.boolTransition = true;
		this.TWO_PI = Math.PI * 2;
		this.intSteps = 50;
	}
	
	DualCircleLayout.prototype.runLayout = function(){
		this.goAlgo();
	}
	
	DualCircleLayout.prototype.newLayoutData = function(){
		var layoutData = {
			finishx:0.0,
			finishy:0.0,
			xdistance:0.0,
			ydistance:0.0
		};
		return layoutData;
	}
	
	DualCircleLayout.prototype.initAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var length = nodes.length;
		var nodeCoords = [];
		var tmpsecondarycirc = 0,tmpprimarycirc = 0;
		var lasttheta=0,secondary_theta=0,correct_theta=0;
		var primary_scale=1,secondry_scale=1;
		
		_self.secondarynodecount = Math.round(length/3);//可自定义数量
		
		nodes = nodes.sort(function(n1,n2){
			return ((n2.inLinks ||[]).length + (n2.outLinks||[]).length) - ((n1.inLinks||[]).length + (n1.outLinks||[]).length);
		});
		
		var index = 0;
		for(var i=0;i<length;i++){
			//var n = nodes[i];
			if(index < _self.secondarynodecount){
				tmpsecondarycirc += 16 * 2.0;//16表示节点半径
			}else{
				tmpprimarycirc += 16 * 2.0;
			}
			index++;
		}
		
		index = 0;
		var circum_ratio = tmpprimarycirc / tmpsecondarycirc;
		if(circum_ratio < 2){
			primary_scale = 2 / circum_ratio;
			tmpprimarycirc = 2 * tmpsecondarycirc;
		}
		
		if(_self.highdegreeoutside){
			secondry_scale = (2 * tmpprimarycirc) / tmpsecondarycirc;
			tmpsecondarycirc = tmpprimarycirc * 2;
		}else{
			secondry_scale = tmpprimarycirc / (2 * tmpsecondarycirc);
			tmpsecondarycirc = tmpprimarycirc / 2;
		}
		
		tmpprimarycirc *= 1.2;
		primary_theta = _self.TWO_PI / tmpprimarycirc;
		var primaryradius = tmpprimarycirc / Math.PI / 2;
		tmpsecondarycirc *= 1.2;
		secondary_theta = _self.TWO_PI / tmpsecondarycirc;
		var secondaryradius = tmpsecondarycirc / Math.PI / 2;
		var noderadius = 16;
		
		for(var i=0;i<length;i++){
			
			if(index < _self.secondarynodecount){
				if(secondry_scale > 2){
					noderadius = tmpsecondarycirc / ((2 * _self.secondarynodecount) * secondry_scale * 1.2);
				}
				var noderadian = secondary_theta * noderadius * 1.2 * secondry_scale;
				
				if(index == 0){
					correct_theta = noderadian;
				}
				nodeCoords = _self.cartCoors(secondaryradius, 1, (lasttheta + noderadian)-correct_theta);
				lasttheta += noderadius * 2 * secondary_theta * 1.2 * secondry_scale;
			}else{
				var noderadian = primary_theta * noderadius * 1.2 * primary_scale;
				if(index == _self.secondarynodecount){
					lasttheta = 0;
					correct_theta = noderadian;
				}
				nodeCoords = _self.cartCoors(primaryradius, 1, (lasttheta + noderadian)-correct_theta);
				lasttheta += noderadius * 2 * primary_theta * 1.2 * primary_scale;
			}
			
			var n = nodes[i];
			var posData = _self.newLayoutData();
			posData.finishx = nodeCoords[0];
			posData.finishy = nodeCoords[1];
			posData.xdistance = (1.0 / _self.intSteps) * (nodeCoords[0] - n.x);
			posData.ydistance = (1.0 / _self.intSteps) * (nodeCoords[1] - n.y);
			
			n.layoutData = posData;
			index++;
		}
	}
	
	DualCircleLayout.prototype.goAlgo = function(){
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
	
	DualCircleLayout.prototype.cartCoors = function(radius,whichInt,theta){
		var coOrds = [];
		coOrds[0] = (radius * Math.cos(theta * whichInt + Math.PI / 2));
		coOrds[1] = (radius * Math.sin(theta * whichInt + Math.PI / 2));
		return coOrds;
	}
	
	window.DualCircleLayout = DualCircleLayout;
	
})(window);