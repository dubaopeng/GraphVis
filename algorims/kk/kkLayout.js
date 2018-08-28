!(function(window){
	var KKLayout = function(_nodes,_links){
		this.nodes = _nodes;
		this.links = _links;
		this.nodeIds = [];
		this.VECTOR_D1 = [];
		this.VECTOR_D2 = [];
		this.lij = [];
		this.kij = [];
		this.tempNodes = [];
		this.realSize = 500.0;
		this.tempSize = 10.0;
	}
	
	KKLayout.prototype.initParams = function(){

	}
	
	KKLayout.prototype.runLayout = function(){
		
		var i = 0;
		while(i++ < 100){
			this.goAlgo();
		}
	}
	
	KKLayout.prototype.initAlgo = function(){
		var _self = this;
		
		var nodes = _self.nodes;
		var nodeCount = nodes.length;
		
		_self.realSize = _self.setCanvasSize(nodeCount);
		var L0 = _self.tempSize;
		
		nodes.forEach(function(node){
			_self.nodeIds.push(node.uniquId);
			_self.tempNodes.push({
				uniquId:node.uniquId,
				x:node.x / (_self.realSize / _self.tempSize),
				y:node.y / (_self.realSize / _self.tempSize)
			});
		});
		
		var lij = [nodeCount];
		var kij = [nodeCount];
		
		var dij = _self.shortPath(nodeCount);
		
		var max_dij = _self.getMaxDij(nodeCount,dij);
		
		_self.getKijLij(L0,max_dij,dij,kij,lij);
		
		var _VECTOR_D1 = [nodeCount];
		var _VECTOR_D2 = [nodeCount];
		
		_self.tempNodes.forEach(function(nodeM,i){
			var myD1=0.0,myD2=0.0;
			
			_self.tempNodes.forEach(function(nodeN,j){
				if(i != j){
					var dx = nodeM.x - nodeN.x;
					var dy = nodeM.y - nodeN.y;
					
					var mi_dist = Math.sqrt(dx * dx + dy * dy);
					
					myD1 += kij[i][j] * (dx - lij[i][j] * dx / mi_dist);
					myD2 += kij[i][j] * (dy - lij[i][j] * dy / mi_dist);
				}
			});
			
			_VECTOR_D1[i] = myD1;
			_VECTOR_D2[i] = myD2;
		});
		
		_self.VECTOR_D1 = _VECTOR_D1;
		_self.VECTOR_D2 = _VECTOR_D2;
		
		_self.lij = lij;
		_self.kij = kij;
	}
	
	KKLayout.prototype.goAlgo = function(){
		var _self = this;
		var nodeCount = _self.tempNodes.length;
		
		var epsilon = 0.00000000001;
		var myD1=0.0,myD2=0.0;
		var A=0.0,B=0.0,C=0.0;
		var delta_x,delta_y;
		var old_x,old_y,new_x,new_y;
		
		var m = 0;
		var max_delta = -1;
		for(var i = 0;i < nodeCount; i++){
			var delta = (_self.VECTOR_D1[i] * _self.VECTOR_D1[i] + _self.VECTOR_D2[i] * _self.VECTOR_D2[i]);
			
			if(delta > max_delta){
				m = i;
				max_delta = delta;
			}
		}
		
		if(max_delta < epsilon){
			return;
		}
		
		var nodeM = _self.tempNodes[m];
		old_x = nodeM.x;
		old_y = nodeM.y;
		
		for(var i=0; i<nodeCount; i++){
			if(i == m){
				continue;
			}
			var nodeI = _self.tempNodes[i];
			var dx = old_x - nodeI.x;
			var dy = old_y - nodeI.y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			var den = dist * (dx * dx + dy * dy);
			A += _self.kij[m][i] * (1 - _self.lij[m][i] * dy * dy /den);
			B += _self.kij[m][i] *  _self.lij[m][i] * dx * dy / den;
			C += _self.kij[m][i] * (1 - _self.lij[m][i] * dx * dx /den);
		}
		
		myD1 = _self.VECTOR_D1[m];
		myD2 = _self.VECTOR_D2[m];
		
		delta_y = (B * myD1 - myD2 * A) / (C * A - B * B);
		delta_x = - (myD1 + B * delta_y) / A;
		
		new_x = old_x + delta_x;
		new_y = old_y + delta_y;
		
		_self.VECTOR_D1[m] = _self.VECTOR_D2[m] = 0.0;
		
		for(var i=0;i < nodeCount;i++){
			if(i==m){
				continue;
			}
			var nodeI = _self.tempNodes[i];
			var old_dx = old_x - nodeI.x;
			var old_dy = old_y - nodeI.y;
			var old_mi_dist = Math.sqrt(old_dx * old_dx + old_dy * old_dy);
			var new_dx = new_x - nodeI.x;
			var new_dy = new_y - nodeI.y;
			var new_mi_dist = Math.sqrt(new_dx * new_dx + new_dy * new_dy);
			
			_self.VECTOR_D1[i] -= _self.kij[m][i] * (-old_dx + _self.lij[m][i] * old_dx / old_mi_dist);
			_self.VECTOR_D2[i] -= _self.kij[m][i] * (-old_dy + _self.lij[m][i] * old_dy / old_mi_dist);
			_self.VECTOR_D1[i] += _self.kij[m][i] * (-new_dx + _self.lij[m][i] * new_dx / new_mi_dist);
			_self.VECTOR_D2[i] += _self.kij[m][i] * (-new_dy + _self.lij[m][i] * new_dy / new_mi_dist);
			
			_self.VECTOR_D1[m] += _self.kij[m][i] * (new_dx - _self.lij[m][i] * new_dx / new_mi_dist);
			_self.VECTOR_D2[m] += _self.kij[m][i] * (new_dy - _self.lij[m][i] * new_dy / new_mi_dist);
		}
		nodeM.x = new_x;
		nodeM.y = new_y;
		
		var index = _self.nodeIds.indexOf(nodeM.uniquId);
		var node = _self.nodes[index];
		node.x = new_x * (_self.realSize / _self.tempSize);
		node.y = new_y * (_self.realSize / _self.tempSize);
	}
	
	KKLayout.prototype.getMaxDij = function(nodeCount,dij){
		var max_dij = 0;
		for(var i=0;i<nodeCount;i++){
			for(var j=i+1;j<nodeCount;j++){
				if(dij[i][j] == Infinity){
					continue;
				}
				if(dij[i][j] > max_dij){
					max_dij = dij[i][j];
				}
			}
		}
		for(var i=0;i<nodeCount;i++){
			for(var j=0;j<nodeCount;j++){
				if(dij[i][j] == Infinity){
					dij[i][j] = max_dij;
				}
			}
		}
		return max_dij;
	}
	
	KKLayout.prototype.getKijLij = function(L0,max_dij,dij,kij,lij){
		var L = L0/max_dij;
		var nodeCount = this.tempNodes.length;
		
		for(var i=0;i<nodeCount;i++){
			kij[i] = [nodeCount];
			lij[i] = [nodeCount];
			
			for(var j=0;j<nodeCount;j++){
				var tmp = dij[i][j] * dij[i][j];
				if(i == j){
					continue;
				}
				kij[i][j] = Math.pow(nodeCount,2) * 1.0 /tmp;
				lij[i][j] = L *dij[i][j];
			}
		}
	}
	
	KKLayout.prototype.shortPath = function(nodeCount){
		var _self = this;
		var dij = [nodeCount];
		for(var i=0;i<nodeCount;i++){
			dij[i] = [nodeCount];
			
			for(var j=0;j<nodeCount;j++){
				if(i == j){
					dij[i][j] = 0;
					continue;
				}
				dij[i][j] = Infinity;
			}
		}
		
		_self.links.forEach(function(link){
			var i = _self.nodeIds.indexOf(link.nodeA.uniquId);
			var j = _self.nodeIds.indexOf(link.nodeZ.uniquId);
			
			dij[i][j] = 1;
			dij[j][i] = 1;
		});
		
		for(var k =0;k < nodeCount;k++){
			for(var i=0;i< nodeCount;i++){
				for(var j=i+1;j< nodeCount;j++){
					var temp = dij[i][k] +dij[k][j];
					if(temp < dij[i][j]){
						dij[i][j] = temp;
						dij[j][i] = temp;
					}
				}
			}
		}
		return dij;
	}
	
	KKLayout.prototype.setCanvasSize = function(nodeCount){
		var maxWidth = 5000;
		var minWidth = 500;
		var widthRange = maxWidth -minWidth;
		
		var shiftLog = 30;
		var maxLog = Math.log(300+shiftLog);
		var minLog = Math.log(shiftLog);
		var logRange = maxLog - minLog;
		
		var canvasWidth = Math.round(((Math.log((Math.min(nodeCount,3000)/15)+shiftLog)-minLog)*widthRange/logRange+minWidth));
		return canvasWidth;
	}
	
	window.KKLayout = KKLayout;
	
})(window);