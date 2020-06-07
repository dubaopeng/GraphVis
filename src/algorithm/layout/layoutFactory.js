;(function(){
  var ARFLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links; 
    this.neighborAttraction = 3.0;
    this.attraction = 0.03;
    this.forceScale = 0.0;
    this.deltaT = 5.0;
    this.forceCutoff = 10.0;
    this.neighbers = {};
    this.inited=false;
  };

  ARFLayout.prototype.getConfig = function(){
    return [
      {'label':'邻点引力','neighborAttraction':8.0},
      {'label':'引力','attraction':0.05},
      {'label':'力缩放系数','forceScale':8.0}
    ];
  };

  ARFLayout.prototype.resetConfig = function(layoutConfig){
    var _self = this;
    if(layoutConfig){
      this.neighborAttraction = Number(layoutConfig['neighborAttraction'])||8.0;
      this.attraction = Number(layoutConfig['attraction'])||0.05;
      this.forceScale = Number(layoutConfig['forceScale'])||8.0;

      this.neighbers = {};
      _self.nodes.forEach(function(n){
        n.degree = (n.inLinks || []).length + (n.outLinks || []).length;
      });
    }
    this.inited=true;
  };
  
  ARFLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  ARFLayout.prototype.runLayout = function(){
      if(this.inited){
        this.goAlgo();
      }
  };
  
  ARFLayout.prototype.initAlgo = function(){
    var _self = this; 
    _self.neighborAttraction = 8.0;
    _self.attraction = 0.12;
    _self.forceScale = 5.0;
    _self.deltaT = 5.0;
    _self.forceCutoff = 10.0;
    
    _self.nodes.forEach(function(n){
      var inLinks = n.inLinks || [];
      var outLinks = n.outLinks || [];
      n.degree = inLinks.length + outLinks.length;
    });
    this.inited=true;
  };
  
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
      };
      
      node.x += f.x;
      node.y += f.y;
      
      minX = Math.min(minX,node.x);
      minY = Math.min(minY,node.y);
    });
    
    _self.nodes.forEach(function(node){
      node.x += (100 - minX);
      node.y += (100 - minY);
    });
  };
  
  ARFLayout.prototype.getForceforNode = function(node){
    var _self = this;
    var numNodes = _self.nodes.length;
    var mDot = {x:0,y:0};
    
    if(node.x == 0 && node.y == 0){
      return mDot;
    }
    
    _self.nodes.forEach(function(n){
      if(node.id != n.id && (n.x != 0 || n.y != 0)){
        var tempX = n.x - node.x;
        var tempY = n.y - node.y;
        
        if(tempX == 0 && tempY == 0){
          tempX = 50;
          tempY = 50;
        }
        var multiplier = 1.0;
        if(_self.isAdjacent(node,n)){
          multiplier = _self.neighborAttraction;
        }
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
  };
  
  ARFLayout.prototype.getDegree = function(node){
    return (node.inLinks || []).length + (node.outLinks || []).length;
  };
  
  ARFLayout.prototype.isAdjacent = function(node,otherNode){
    var neighbers = [];
    (node.inLinks||[]).forEach(function(l){
      neighbers.push(l.source);
    });
    (node.outLinks||[]).forEach(function(l){
      neighbers.push(l.target);
    });
    var flag = false;
    neighbers.forEach(function(n){
      if(n.id == otherNode.id){
        flag = true;
      }
    });
    return flag;
  };
  
  ARFLayout.prototype.distance = function(px,py,x,y){
    px -= x;
    py -= y;
    return Math.sqrt(px*px + py*py);
  };
  
  var CircleLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.diameter = 500;
    this.boolfixeddiameter = false;
    this.boolTransition = true;

    this.cumethod='auto';
    this.scale = 1.2;
    this.TWO_PI = Math.PI * 2;
    this.intSteps = 50;
    this.inited=false;
  };

  CircleLayout.prototype.getConfig = function(){
    return [
            {'label':'直径计算',
              'cumethod':[{label:'自动',value:'auto'},
                    {label:'指定',value:'metal'}]
            },
            {'label':'直径大小','diameter':500}
    ];
  };

  CircleLayout.prototype.resetConfig = function(layoutConfig){
    this.diameter = Number(layoutConfig['diameter'])||500;
    this.cumethod = layoutConfig['cumethod'] || 'auto';
    if(this.cumethod == 'auto'){
      this.boolfixeddiameter = false;
    }else{
      this.boolfixeddiameter = true;
    }
    this.initAlgo();
  };
  
  CircleLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };

  CircleLayout.prototype.runLayout = function(){
      if(this.inited){
        this.goAlgo();
      }
  };
  
  CircleLayout.prototype.initAlgo = function(){
    var _self = this;
    
    var nodes = _self.nodes;
    var nodeCount = nodes.length;
    
    var nodeCoords = [];
    var tempcirc = 0.0;
    var temdiameter = 0.0;
    var index = 0;
    var noderadius = 0.0;
    var theta = _self.TWO_PI / nodeCount;
    var lasttheta = 0.0;
    
    nodes = nodes.sort(function(n1,n2){
      var x = (n1.inLinks||[]).length + (n1.outLinks||[]).length;
      var y = (n2.inLinks ||[]).length + (n2.outLinks||[]).length;
      if (x > y) {
            return -1;
        } else if (x < y) {
            return 1;
        } else {
            return 0;
        }
    });
    
    if(!_self.boolfixeddiameter){   
      for(var i=0;i<nodeCount;i++){
        var n = nodes[i];
        tempcirc += (n.scaleX * n.radius) * 1.2;
      }
    
      tempcirc *= _self.scale;
      temdiameter = tempcirc / Math.PI;
      theta = _self.TWO_PI / tempcirc;
    }else{
      temdiameter = _self.diameter;
    }
    
    var radius = temdiameter / 2;
    
    for(var i=0;i<nodeCount;i++){
      var n = nodes[i];
      if(!_self.boolfixeddiameter){
        noderadius = n.scaleX * n.radius;
        var noderadian = theta * noderadius * _self.scale;
        nodeCoords = _self.cartCoors(radius,1,lasttheta + noderadian);
        
        lasttheta += noderadius * 1.2 * theta * _self.scale;
      }else{
        nodeCoords =  _self.cartCoors(radius,index,theta);
      }
      
      var posData = _self.newLayoutData();
      posData.finishx = nodeCoords[0];
      posData.finishy = nodeCoords[1];
      posData.xdistance = (1.0 / _self.intSteps) * (nodeCoords[0] - n.x);
      posData.ydistance = (1.0 / _self.intSteps) * (nodeCoords[1] - n.y);
      
      n.layoutData = posData;
      index++;
    }
    this.inited=true;
  };
  
  CircleLayout.prototype.goAlgo = function(){
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
  };
  
  CircleLayout.prototype.cartCoors = function(radius,whichInt,theta){
    var coOrds = [];
    coOrds[0] = (radius * Math.cos(theta * whichInt + Math.PI / 2));
    coOrds[1] = (radius * Math.sin(theta * whichInt + Math.PI / 2));
    return coOrds;
  };

  var DualCircleLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.highdegreeoutside = false;
    this.secondarynodecount = 15;
    this.boolNoOverlap = true;
    this.boolTransition = true;
    this.TWO_PI = Math.PI * 2;
    this.intSteps = 50;
    this.inited=false;
  };

  DualCircleLayout.prototype.getConfig = function(){
    return [
            {'label':'分布位置','position':[{label:'环内部',value:'inside'},
                    {label:'环外部',value:'outside'}]
            },
            {'label':'核心数','secondarynodecount':15}
    ];
  };

  DualCircleLayout.prototype.resetConfig = function(layoutConfig){
    this.secondarynodecount = Number(layoutConfig['secondarynodecount'])||15;
    this.position = layoutConfig['position'] || 'inside';
    if(this.position == 'inside'){
      this.highdegreeoutside = false;
    }else{
      this.highdegreeoutside = true;
    }
    this.initAlgo();
  };
  
  DualCircleLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  DualCircleLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  DualCircleLayout.prototype.initAlgo = function(){
    var _self = this;
    
    var nodes = _self.nodes;
    var nodeCounts = nodes.length;
    var nodeCoords = [];
    var tmpsecondarycirc = 0,tmpprimarycirc = 0;
    var lasttheta=0,secondary_theta=0,correct_theta=0;
    var primary_scale=1,secondry_scale=1;
    
    if(_self.secondarynodecount > nodeCounts){
      _self.secondarynodecount = 1;
    }
    
    nodes = nodes.sort(function(n1,n2){
      var x = (n1.inLinks||[]).length + (n1.outLinks||[]).length;
      var y = (n2.inLinks ||[]).length + (n2.outLinks||[]).length;
      if (x > y) {
            return -1;
        } else if (x < y) {
            return 1;
        } else {
            return 0;
        }
    });
    
    for(var i=0;i<nodeCounts;i++){
      var n = nodes[i];
      var noderadius = n.scaleX * n.radius;
      if(i < _self.secondarynodecount){
        tmpsecondarycirc += noderadius * 2.0;
      }else{
        tmpprimarycirc += noderadius * 2.0;
      }
    }
    
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

    for(var i=0;i<nodeCounts;i++){
      var n = nodes[i];
      var noderadius = n.scaleX * n.radius;
      
      if(i < _self.secondarynodecount){
        if(secondry_scale > 2){
          noderadius = tmpsecondarycirc / ((2 * _self.secondarynodecount) * secondry_scale * 1.2);
        }
        var noderadian = secondary_theta * noderadius * 1.2 * secondry_scale;
        
        if(i == 0){
          correct_theta = noderadian;
        }
        nodeCoords = _self.cartCoors(secondaryradius, 1, (lasttheta + noderadian)-correct_theta);
        lasttheta += noderadius * 2 * secondary_theta * 1.2 * secondry_scale;
      }else{
        var noderadian = primary_theta * noderadius * 1.2 * primary_scale;
        if(i == _self.secondarynodecount){
          lasttheta = 0;
          correct_theta = noderadian;
        }
        nodeCoords = _self.cartCoors(primaryradius, 1, (lasttheta + noderadian)-correct_theta);
        lasttheta += noderadius * 2 * primary_theta * 1.2 * primary_scale;
      }
      
      var posData = _self.newLayoutData();
      posData.finishx = nodeCoords[0];
      posData.finishy = nodeCoords[1];
      posData.xdistance = (1.0 / _self.intSteps) * (nodeCoords[0] - n.x);
      posData.ydistance = (1.0 / _self.intSteps) * (nodeCoords[1] - n.y);
      
      n.layoutData = posData;
    }
    this.inited=true;
  };
  
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
  };
  
  DualCircleLayout.prototype.cartCoors = function(radius,whichInt,theta){
    var coOrds = [];
    coOrds[0] = (radius * Math.cos(theta * whichInt + Math.PI / 2));
    coOrds[1] = (radius * Math.sin(theta * whichInt + Math.PI / 2));
    return coOrds;
  };

  var LayerLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.outCircleNodes = 11;
    this.layerDistance = 30;
    this.boolTransition = true;
    this.intSteps = 50;
    this.inited=false;
  };

  LayerLayout.prototype.getConfig = function(){
    return [
      {'label':'外层点数','outCircleNodes':11},
      {'label':'层间距','layerDistance':30}
    ];
  };

  LayerLayout.prototype.resetConfig = function(layoutConfig){
    this.outCircleNodes = Number(layoutConfig['outCircleNodes'])||11;
    this.layerDistance = Number(layoutConfig['layerDistance'])||30;
    this.initAlgo();
  };
  
  LayerLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  LayerLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  LayerLayout.prototype.initAlgo = function(){
    var _self = this;
    
    var nodes = _self.nodes;
    var nodeCount = nodes.length;
    var innerCircleRaduis = 0,nextLayerRoundLong=0,currentRoundLong=0;
    var maxTheta=0,theta=0;
    
    nodes = nodes.sort(function(n1,n2){
      var x = (n1.inLinks||[]).length + (n1.outLinks||[]).length;
      var y = (n2.inLinks ||[]).length + (n2.outLinks||[]).length;
      if (x < y) {
            return -1;
        } else if (x > y) {
            return 1;
        } else {
            return 0;
        }
    });
    if(_self.outCircleNodes > nodeCount){
      _self.outCircleNodes = 0;
    }
    
    for(var i=0;i < nodeCount;i++){ 
      var node = nodes[i];
      currentRoundLong += node.radius * node.scaleX ;
      
      if(currentRoundLong > nextLayerRoundLong){
        nextLayerNodeRaduis = node.radius * node.scaleX  ;

        nextCircleRaduis = innerCircleRaduis + _self.layerDistance + nextLayerNodeRaduis;
        nextLayerRoundLong = 2 * Math.PI * nextCircleRaduis;
        innerCircleRaduis = innerCircleRaduis + _self.layerDistance + node.radius * node.scaleX;
        theta = 1.0 / nextCircleRaduis ;
        maxTheta = 0;
        currentRoundLong = node.radius * node.scaleX ;
      }
      var thisAngle=0;
      if(i < (nodeCount - _self.outCircleNodes)){
        thisAngle = theta * node.radius * node.scaleX;
      }else{
        nextCircleRaduis = innerCircleRaduis + _self.layerDistance + nextLayerNodeRaduis;
        thisAngle = 2 * Math.PI / _self.outCircleNodes;
      }
      maxTheta += thisAngle;

      var posData = _self.newLayoutData();
      posData.finishx = nextCircleRaduis * 2.4 * Math.cos(maxTheta + Math.PI);
      posData.finishy = nextCircleRaduis * 2.4 * Math.sin(maxTheta + Math.PI);
      posData.xdistance = (1.0 / _self.intSteps) * (posData.finishx - node.x);
      posData.ydistance = (1.0 / _self.intSteps) * (posData.finishy - node.y);
      node.layoutData = posData;
    }
    this.inited=true;
  };
  
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
  };

  var FRlayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.AREA_MULTIPLICATOR = 10000;
    this.area = 800;
    this.gravity = 1.2;
    this.SPEED_DIVISOR = 800.0;
    this.speed = 10;
    this.inited=false;
  };
  
  FRlayout.prototype.newLayoutData = function(){
    var layoutData = {
      dx:0.0,
      dy:0.0,
      old_dx:0.0,
      old_dy:0.0,
      freeze:0.0
    };
    return layoutData;
  };
  
  FRlayout.prototype.runLayout = function(){
    if(this.inited){
        this.goAlgo();
    }
  };

  FRlayout.prototype.getConfig = function(){
    return [
      {'label':'区域大小','area':500},
      {'label':'重力','gravity':2.0}
    ];
  };

  FRlayout.prototype.resetConfig = function(layoutConfig){
    var _self = this;
    if(layoutConfig){
      this.area = Number(layoutConfig['area'])||500;
      this.gravity = Number(layoutConfig['gravity'])||1.5;

      this.nodes.forEach(function(n){
        n.layoutData = _self.newLayoutData();
      });
    }
    this.inited=true;
  };
  
  FRlayout.prototype.initAlgo = function(){
    var _self = this;
    _self.area = _self.nodes.length / 2;
    
    _self.nodes.forEach(function(n){
      n.layoutData = _self.newLayoutData();
    });
    this.inited=true;
  };
  
  FRlayout.prototype.goAlgo = function(){
    
    var _self = this;
    
    var nodes = _self.nodes;
    var nodeCount = nodes.length;
    
    var maxDisplace = Math.sqrt(_self.AREA_MULTIPLICATOR * _self.area) /10.0;
    
    var k = Math.sqrt((_self.AREA_MULTIPLICATOR * _self.area) / (1.0 + nodeCount));

    nodes.forEach(function(N1,i){
      
      N1.layoutData.dx = 0;
      N1.layoutData.dy = 0;
          
      nodes.forEach(function(N2,j){
        if(i != j){
          var xDist = N1.x - N2.x;
          var yDist = N1.y - N2.y;
          var dist = Math.sqrt(xDist * xDist + yDist * yDist);
          
          if(dist > 0){
            var repulsiveF = k * k /dist;
            var layoutData = N1.layoutData;
            
            layoutData.dx += (xDist /dist * repulsiveF);
            layoutData.dy += (yDist /dist * repulsiveF);
          }
        }
      });
    });
        
    var links = _self.links;
    links.forEach(function(E){
      var Nf = E.source;
      var Nt = E.target;
      
      var xDist = Nf.x - Nt.x;
      var yDist = Nf.y - Nt.y;
      
      var dist = Math.sqrt(xDist * xDist + yDist * yDist);
      var attractiveF = dist * dist / k;
      
      if(dist > 0){
        var sourceLayoutData = Nf.layoutData;
        var targetLayoutData = Nt.layoutData;
        
        sourceLayoutData.dx -= (xDist / dist * attractiveF);
        sourceLayoutData.dy -= (yDist / dist * attractiveF);
        targetLayoutData.dx += (xDist / dist * attractiveF);
        targetLayoutData.dy += (yDist / dist * attractiveF);
      }
    });
    
    nodes.forEach(function(n){
      
      var layoutData = n.layoutData;
      
      var d = Math.sqrt(n.x * n.x + n.y * n.y);
      var gf = 0.01 * k * _self.gravity * d;
      
      layoutData.dx -= gf * n.x /d;
      layoutData.dy -= gf * n.y /d;
      
      layoutData.dx *= _self.speed / _self.SPEED_DIVISOR;
      layoutData.dy *= _self.speed / _self.SPEED_DIVISOR;
      
      var dist = Math.sqrt(layoutData.dx * layoutData.dx + layoutData.dy * layoutData.dy);
      
      if(dist > 0){
        var limitedDist = Math.min(maxDisplace * (_self.speed / _self.SPEED_DIVISOR),dist);
        
        n.x += (layoutData.dx /dist * limitedDist);
        n.y += (layoutData.dy /dist * limitedDist);
      }
    });
  };

  var FruchtermanReingoldLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    this.config = {
        autoArea: true,
        area: 1000,
        gravity: 3,
        speed: 0.08,
        iterations: 1000
    };
    this.maxDisplace = 10;
    this.k = 120.0;
    this.currentIter = 0;
    this.inited=false;
  };

  FruchtermanReingoldLayout.prototype.getConfig = function(){
    var self = this;
    return [
      {'label':'重力','gravity':0.5},
      {'label':'边长度','k':self.k},
      {'label':'收敛速度','speed':0.50}
    ];
  };

  FruchtermanReingoldLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.nodes.forEach(function(node){
          node.fr_x = node.x;
          node.fr_y = node.y;
          node.fr = { dx: 0, dy: 0};
      });

      this.config.gravity = Number(layoutConfig['gravity'])||0.5;
      this.config.speed = Number(layoutConfig['speed'])||0.08;
      this.k = Number(layoutConfig['k'])||120;
      this.currentIter = 0;
    }
    this.inited=true;
  };
  
  FruchtermanReingoldLayout.prototype.initAlgo = function(){
    var self = this;
    var nodesCount = this.nodes.length;
    self.nodes.forEach(function(node){
       node.fr_x = node.x;
       node.fr_y = node.y;
       node.fr = { dx: 0, dy: 0};
    });
    self.config.area = self.config.autoArea ? (nodesCount * nodesCount) : self.config.area;
    self.maxDisplace = Math.sqrt(self.config.area) / 8;
    self.k = Math.sqrt(self.config.area / (1 + nodesCount));

    if(self.maxDisplace < 150){
      self.maxDisplace = 150;
    }

    if(self.k < 40){
      self.k = 40;
    }
    self.currentIter = 0;
    this.inited=true;
  };

  FruchtermanReingoldLayout.prototype.runLayout = function(){
    if(this.currentIter > this.config.iterations){
      return;
    }
    if(this.inited){
      this.goAlgo();
      this.currentIter++;
    }
  };
  
  FruchtermanReingoldLayout.prototype.goAlgo = function(){
    var self = this;
    
    var nodes = self.nodes;
    var links = self.links;

    var nodesCount = self.nodes.length;
        
        for (var i = 0; i < nodesCount; i++) {
          var n = nodes[i];
          for (var j = 0; j < nodesCount; j++) {
            var n2 = nodes[j];

            if (n.id != n2.id) {
              var xDist = n.fr_x - n2.fr_x;
              var yDist = n.fr_y - n2.fr_y;
              var dist = Math.sqrt(xDist * xDist + yDist * yDist) + 0.01;

              if (dist > 0) {
                var repulsiveF = self.k * self.k / dist;
                n.fr.dx += xDist / dist * repulsiveF;
                n.fr.dy += yDist / dist * repulsiveF;
              }
            }
          }
        };

        var edgesCount = links.length;
      for (i = 0; i < edgesCount; i++) {
          var link = links[i];
          var nSource = link.source;
          var nTarget = link.target;

          var xDist = nSource.fr_x - nTarget.fr_x;
          var yDist = nSource.fr_y - nTarget.fr_y;
          var dist = Math.sqrt(xDist * xDist + yDist * yDist) + 0.01;
          var attractiveF = dist * dist / self.k;
          if (dist > 0) {
            nSource.fr.dx -= xDist / dist * attractiveF;
            nSource.fr.dy -= yDist / dist * attractiveF;
            nTarget.fr.dx += xDist / dist * attractiveF;
            nTarget.fr.dy += yDist / dist * attractiveF;
          }
      };

        for (var i = 0; i < nodesCount; i++) {
          var n = nodes[i];

          var d = Math.sqrt(n.fr_x * n.fr_x + n.fr_y * n.fr_y);
          var gf = 0.01 * self.k * self.config.gravity * d;
          n.fr.dx -= gf * n.fr_x / d;
          n.fr.dy -= gf * n.fr_y / d;

          n.fr.dx *= self.config.speed;
          n.fr.dy *= self.config.speed;

          if (!n.fixed) {
            var xDist = n.fr.dx;
            var yDist = n.fr.dy;
            dist = Math.sqrt(xDist * xDist + yDist * yDist);

            if (dist > 0) {
              var limitedDist = Math.min(self.maxDisplace * self.config.speed, dist);
              n.fr_x += xDist / dist * limitedDist;
              n.fr_y += yDist / dist * limitedDist;
            }
          }
      }

      for (var i = 0; i < nodesCount; i++) {
          nodes[i].x = nodes[i].fr_x;
          nodes[i].y = nodes[i].fr_y;
        }
  };
  
  var GirdLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.xOrigin = -1200;
    this.yOrigin = -1000;
    
    this.horizontalScale = 60;
    this.verticalScale = 60;
    this.horizontal = false;
    
    this.boolTransition = true;
    this.intSteps = 50;
    this.inited=false;
  };

  GirdLayout.prototype.getConfig = function(){
    return [
      {'label':'水平间距','horizontalScale':100},
      {'label':'垂直间距','verticalScale':100}
    ];
  };

  GirdLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.horizontalScale =  Number(layoutConfig['horizontalScale'])||100;
      this.verticalScale =  Number(layoutConfig['verticalScale'])||100;

      this.initAlgo();
    }
  };
  
  GirdLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  GirdLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  GirdLayout.prototype.initAlgo = function(){
    var _self = this;
    var nodes = _self.nodes;
    var nodeCount = nodes.length;   
    var xGridScales = Math.round(Math.sqrt(nodeCount))+ 1;
    var yGridScales = Math.round(Math.sqrt(nodeCount))+ 1;
    this.inited=true;
    nodes = nodes.sort(function(n1,n2){
      var x = (n1.inLinks||[]).length + (n1.outLinks||[]).length;
      var y = (n2.inLinks ||[]).length + (n2.outLinks||[]).length;
      if (x > y) {
            return -1;
        } else if (x < y) {
            return 1;
        } else {
            return 0;
        }
    });
    
    var k = 0;
    for(var i=0;i<xGridScales;i++){
      
      for(var j=0;j<yGridScales;j++){
        
        if(k >= nodeCount){
          continue;
        }
        
        var tempX,tempY;
        if(_self.horizontal){
          tempX = _self.xGridToScreen(i,j);
          tempY = _self.yGridToScreen(i,j);
        }else{
          tempX = _self.yGridToScreen(i,j);
          tempY = -_self.xGridToScreen(i,j);
        }
        
        var node = nodes[k];
        var posData = _self.newLayoutData();
        posData.finishx = tempX;
        posData.finishy = tempY;
        posData.xdistance = (1.0 / _self.intSteps) * (tempX - node.x);
        posData.ydistance = (1.0 / _self.intSteps) * (tempY - node.y);
        node.layoutData = posData;
        
        k++;
      }
    }
  };
  
  GirdLayout.prototype.goAlgo = function(){
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
  };
  
  GirdLayout.prototype.xGridToScreen = function(xg,yg){
    return this.xOrigin + xg * this.horizontalScale;
  };
  
  GirdLayout.prototype.yGridToScreen = function(xg,yg){
    return this.yOrigin + yg * this.verticalScale;
  };

  var KKLayout = function(_nodes,_links){
    this.nodes = _nodes;
    this.links = _links;
    this.nodeIds = [];
    this.VECTOR_D1 = [];
    this.VECTOR_D2 = [];
    this.lij = [];
    this.kij = [];
    this.tempNodes = [];
    this.realSize = 3000.0;
    this.tempSize = 5.0;
    this.inited=false;
  };

  KKLayout.prototype.getConfig = function(){
    var canvasWidth = this.setCanvasSize(this.nodes.length);
    return [
      {'label':'区域大小','realSize':canvasWidth}
    ];
  };

  KKLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.realSize = Number(layoutConfig['realSize'])||1000;
      this.initAlgo();
    }
  };
  
  KKLayout.prototype.runLayout = function(){
    var i = 0;
    while(i++ < 100 && this.inited){
      this.goAlgo();
    }
  };
  
  KKLayout.prototype.initAlgo = function(){
    var _self = this;
    var nodes = _self.nodes;
    var nodeCount = nodes.length;
    this.inited=true;
    var L0 = _self.tempSize;
    _self.nodeIds=[];
    _self.tempNodes=[];
    _self.VECTOR_D1 = [];
    _self.VECTOR_D2 = [];
    _self.lij = [];
    _self.kij = [];

    nodes.forEach(function(node){
      _self.nodeIds.push(node.id);
      _self.tempNodes.push({
        id:node.id,
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
  };
  
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
      A += _self.kij[m][i] * (1.0 - _self.lij[m][i] * dy * dy /den);
      B += _self.kij[m][i] * (_self.lij[m][i] * dx * dy / den);
      C += _self.kij[m][i] * (1.0 - _self.lij[m][i] * dx * dx /den);
    }
    
    myD1 = _self.VECTOR_D1[m];
    myD2 = _self.VECTOR_D2[m];
    
    delta_y = (B * myD1 - myD2 * A) / (C * A - B * B);
    delta_x = -(myD1 + B * delta_y) / A;
    
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
    
    var index = _self.nodeIds.indexOf(nodeM.id);
    var node = _self.nodes[index];
    node.x = new_x * (_self.realSize / _self.tempSize);
    node.y = new_y * (_self.realSize / _self.tempSize);
  };
  
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
  };
  
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
  };
  
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
      var i = _self.nodeIds.indexOf(link.source.id);
      var j = _self.nodeIds.indexOf(link.target.id);
      
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
  };
  
  KKLayout.prototype.setCanvasSize = function(nodeCount){
    var maxWidth = 8000;
    var minWidth = 1500;
    var widthRange = maxWidth -minWidth;
    
    var shiftLog = 5;
    var maxLog = Math.log(800+shiftLog);
    var minLog = Math.log(shiftLog);
    var logRange = maxLog - minLog;
    
    var canvasWidth = Math.round(((Math.log((Math.min(nodeCount,8000)/10)+shiftLog)-minLog)*widthRange/logRange+minWidth));
    return canvasWidth;
  };

  var LayeredLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.layerDistance = 80;
    this.ajustSize = true;
    this.boolTransition = true;
    this.intSteps = 50;
    this.inited=false;
  };

  LayeredLayout.prototype.getConfig = function(){
    return [
      {'label':'层间距','layerDistance':80}
    ];
  };

  LayeredLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.layerDistance = Number(layoutConfig['layerDistance'])||100;
      this.initAlgo();
    }
  };
  
  LayeredLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  LayeredLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  LayeredLayout.prototype.initAlgo = function(){
    var _self = this;
    
    var nodes = _self.nodes;
    var nodeCount = nodes.length;
    var innerCircleRaduis = 0,nextLayerRoundLong=0,currentRoundLong=0;
    var maxTheta=0,theta=0;
    this.inited=true;
    
    nodes = nodes.sort(function(n1,n2){
      var x = (n1.inLinks||[]).length + (n1.outLinks||[]).length;
      var y = (n2.inLinks ||[]).length + (n2.outLinks||[]).length;
      if (x < y) {
            return -1;
        } else if (x > y) {
            return 1;
        } else {
            return 0;
        }
    });

        var startValue = _self.getValue(nodes[0]);
        var startX = nodes[0].x;
        var startY = nodes[0].y;
        var currentValue = startValue;

        var isFirstlayer = true;
        var shiftFirstlayer = 0;

        var currentOrbit = [];
        nodes.forEach(function(n){
          if (_self.getValue(n) != currentValue) {
                if (isFirstlayer && currentOrbit.length > 1) {
                    shiftFirstlayer = 1;
                }
        
                isFirstlayer = false;

                _self.renderOrbit(currentOrbit, startX, startY, shiftFirstlayer + (currentValue - startValue));
                currentOrbit = [];
                currentValue = _self.getValue(n);
            }
            currentOrbit.push(n);
        });
  
        if (currentOrbit.length > 0) {
            _self.renderOrbit(currentOrbit, startX, startY, shiftFirstlayer + (currentValue - startValue));
        }
  };

  LayeredLayout.prototype.getValue = function(node){
    return (node.inLinks||[]).length + (node.outLinks||[]).length;
  };
  
  LayeredLayout.prototype.goAlgo = function(){
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
  };

  LayeredLayout.prototype.renderOrbit = function( currentOrbit,  startX,  startY, radius) { 
        var _self = this;             
        if (_self.ajustSize) {
            
            let length = 0;
            currentOrbit.forEach(function(n){
              length += n.radius;
            });           
            var currentAngle = 0;
            var shift = 360 / length;
            currentOrbit.forEach(function(o,i){
                currentAngle += (shift * o.radius)/2;
                var noise = 0;
                if (i % 3 == 1) {
                    noise = o.radius * (-1);
                }
                if (i % 3 == 2) {
                    noise = o.radius;
                }

                var x = startX + ((_self.layerDistance * radius) + noise) * Math.cos(currentAngle * (Math.PI / 180));
                var y = startY + ((_self.layerDistance * radius) + noise) * Math.sin(currentAngle * (Math.PI / 180));

               currentAngle += (shift * o.radius)/2;

                var posData = _self.newLayoutData();
        posData.finishx = x;
        posData.finishy = y;
        posData.xdistance = (1.0 / _self.intSteps) * (x - o.x);
        posData.ydistance = (1.0 / _self.intSteps) * (y - o.y);
        o.layoutData = posData;
            });

        } else {
            var currentAngle = 0;
            var shift = 360 / currentOrbit.length;
            currentOrbit.forEach(function(o){
                var x = startX + (_self.layerDistance * (radius) * Math.cos(currentAngle * (Math.PI / 180)));
                var y = startY + (_self.layerDistance * (radius) * Math.sin(currentAngle * (Math.PI / 180)));
        
                var posData = _self.newLayoutData();
        posData.finishx = x;
        posData.finishy = y;
        posData.xdistance = (1.0 / _self.intSteps) * (x - o.x);
        posData.ydistance = (1.0 / _self.intSteps) * (y - o.y);
        o.layoutData = posData;

                currentAngle += shift;
            });
        }
    };
  
  var ConcentricLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.defaults = {
      startAngle: Math.PI,
      clockwise: true, 
      equidistant: false,
      avoidOverlap: true, 
      minNodeSpacing: 10, 
      maxNodeSize:50,
      levelWidth:1
    };

    this.boolTransition = true;
    this.intSteps = 50;
    this.inited=false;
  };

  ConcentricLayout.prototype.getConfig = function(){
    return [
      {'label':'节点大小','maxNodeSize':50},
      {'label':'分层系数','levelWidth':1}
    ];
  };

  ConcentricLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.defaults.maxNodeSize = Number(layoutConfig['maxNodeSize'])||50;
      this.defaults.levelWidth = Number(layoutConfig['levelWidth'])||1;
    }
    this.initAlgo();
  };

  ConcentricLayout.prototype.runLayout = function(){
    if( this.inited){
      this.goAlgo();
    }
  };
  
  ConcentricLayout.prototype.initAlgo = function(){
    var self = this;
    let options = self.defaults;
    let nodes = self.nodes;

    var bb = {
      x1: 0, y1: 0, w:options.maxNodeSize*5, h:options.maxNodeSize*5
    };

    let center = {
       x: bb.x1 + bb.w / 2,
       y: bb.y1 + bb.h / 2
    };

    let nodeValues = [];
    for( let i = 0; i < nodes.length; i++ ){
        let node = nodes[ i ];
        let value;
        value = (node.inLinks||[]).length + (node.outLinks||[]).length;
        nodeValues.push( {value: value,node: node});
    }

    nodeValues.sort( function( a, b ){
        return b.value - a.value;
    });

    let levelWidth = options.levelWidth;
    let levels = [ [] ];
    let currentLevel = levels[0];
    for( let i = 0; i < nodeValues.length; i++ ){
        let val = nodeValues[ i ];

        if( currentLevel.length > 0 ){
          let diff = Math.abs( currentLevel[0].value - val.value );

          if( diff >= levelWidth ){
            currentLevel = [];
            levels.push( currentLevel );
          }
        }
        currentLevel.push( val );
    }

    let minDist =  options.maxNodeSize + options.minNodeSpacing;
    if( options.avoidOverlap ){ 
        let firstLvlHasMulti = levels.length > 0 && levels[0].length > 1;
        let maxR = ( Math.min( bb.w, bb.h ) / 2 - minDist );
        let rStep = maxR / ( levels.length + firstLvlHasMulti ? 1 : 0 );
        minDist = Math.min( minDist, rStep );
    }

    let r = 0;
    for( let i = 0; i < levels.length; i++ ){
        let level = levels[ i ];
        let sweep = 2 * Math.PI - 2 * Math.PI / level.length;
        let dTheta = level.dTheta = sweep / ( Math.max( 1, level.length - 1 ) );

        if( level.length > 1 && options.avoidOverlap ){ 
          let dcos = Math.cos( dTheta ) - Math.cos( 0 );
          let dsin = Math.sin( dTheta ) - Math.sin( 0 );
          let rMin = Math.sqrt( minDist * minDist / ( dcos * dcos + dsin * dsin ) ); 

          r = Math.max( rMin, r );
        }

        level.r = r;
        r += minDist;
    }

    if( options.equidistant ){
        let rDeltaMax = 0;
        let r = 0;
        for( let i = 0; i < levels.length; i++ ){
          let level = levels[ i ];
          let rDelta = level.r - r;
          rDeltaMax = Math.max( rDeltaMax, rDelta );
        }
        r = 0;
        for( let i = 0; i < levels.length; i++ ){
          let level = levels[ i ];
          if( i === 0 ){
            r = level.r;
          }
          level.r = r;
          r += rDeltaMax;
        }
    }

    for( let i = 0; i < levels.length; i++ ){
        let level = levels[ i ];
        let dTheta = level.dTheta;
        let r = level.r;

        for( let j = 0; j < level.length; j++ ){
          let val = level[ j ];
          let theta = options.startAngle + (self.clockwise ? 1 : -1) * dTheta * j;

          var x=center.x + r * Math.cos( theta );
          var y=center.y + r * Math.sin( theta );

          var posData = self.newLayoutData();
          posData.finishx = x;
          posData.finishy = y;
          posData.xdistance = (1.0 / self.intSteps) * (x - val.node.x);
          posData.ydistance = (1.0 / self.intSteps) * (y - val.node.y);
          val.node.layoutData = posData;
        }
    }
    this.inited=true;
  };

  ConcentricLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  ConcentricLayout.prototype.goAlgo = function(){
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
  };

  var RotateLayout = function(nodes,links,angle){
    this.nodes = nodes;
    this.links = links;
    
    this.angle = angle || 10;
    this.direction='sn';
    this.boolTransition = true;
    this.intSteps = 30;
    this.inited=false;
  };
  RotateLayout.prototype.getConfig = function(){
    return [
      {'label':'旋转角度',"angle":10},             
      {'label':'旋转方向','direction':[{label:'顺时针',value:'sn'},{label:'逆时针',value:'ns'}]}
    ];
  };

  RotateLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
        this.angle = Number(layoutConfig['angle']) || 10;
        this.direction = layoutConfig['direction'] || 'sn';
    }
    
    if(this.direction == 'ns'){
      this.angle = Math.abs(this.angle);
    }else{
      this.angle = -Math.abs(this.angle);
    }
    this.initAlgo();
  };
  
  RotateLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  RotateLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  RotateLayout.prototype.initAlgo = function(){
    var self = this;
    this.inited=true;
    var sin = Math.sin(-self.angle * Math.PI / 180);
        var cos = Math.cos(-self.angle * Math.PI / 180);
        var px = 0;
        var py = 0;

    self.nodes.forEach(function(n){
      var dx = n.x - px;
            var dy = n.y - py;

            var tempX = (px + dx * cos - dy * sin);
            var tempY = (py + dy * cos + dx * sin);

            var posData = self.newLayoutData();
      posData.finishx = tempX;
      posData.finishy = tempY;
      posData.xdistance = (1.0 / self.intSteps) * (tempX - n.x);
      posData.ydistance = (1.0 / self.intSteps) * (tempY - n.y);
      n.layoutData = posData;
    });
  };
  
  RotateLayout.prototype.goAlgo = function(){
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
  };

  var ScaleLayout = function(nodes,links,scale){
    this.nodes = nodes;
    this.links = links;
    this.scale = scale || 1;
    this.boolTransition = true;
    this.intSteps = 30;
    this.inited=false;
  };

  ScaleLayout.prototype.getConfig = function(){
    return [
      {'label':'缩放比例','scale':1.1}
    ];
  };

  ScaleLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.scale = Number(layoutConfig['scale'])||1.1;
    }
    this.initAlgo();
  };
  
  ScaleLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  ScaleLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  ScaleLayout.prototype.initAlgo = function(){
    var self = this;
    var nodeCount = self.nodes.length;
    var xMean = 0, yMean = 0;

    this.inited=true;
    self.nodes.forEach(function(n){
      xMean += n.x;
      yMean += n.y;
    });
    
        xMean /= nodeCount;
        yMean /= nodeCount;

        self.nodes.forEach(function(n){
      var dx = (n.x - xMean) * self.scale;
            var dy = (n.y - yMean) * self.scale;

            var tempX = xMean + dx;
            var tempY = yMean + dy;

            var posData = self.newLayoutData();
      posData.finishx = tempX;
      posData.finishy = tempY;
      posData.xdistance = (1.0 / self.intSteps) * (tempX - n.x);
      posData.ydistance = (1.0 / self.intSteps) * (tempY - n.y);
      n.layoutData = posData;
    });
  };
  
  ScaleLayout.prototype.goAlgo = function(){
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
  };
  
  var SpringLayout2 = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    this.stretch = 0.5;
    this.repulsion_range_sq = 2000;
    this.force_multiplier = 0.02;
    this.inited = false;
  };
  
  SpringLayout2.prototype.newLayoutData = function(){
    var layoutData = {
      edgedx : 0.0,
      edgedy: 0.0,
      repulsiondx: 0.0,
      repulsiondy: 0.0,
      dx: 0.0,
      dy: 0.0
    };
    return layoutData;
  };

  SpringLayout2.prototype.getConfig = function(){
    return [
      {'label':'区域大小','repulsion':1000000},
      {'label':'边长度','stretch':0.015},
      {'label':'收敛系数','force':10.0}
    ];
  };

  SpringLayout2.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.stretch = Number(layoutConfig['stretch']) || 0.015;
      this.repulsion_range_sq = Number(layoutConfig['repulsion']) || 1000000;
      this.force_multiplier = Number(layoutConfig['force']) || 10;
    }
    this.initAlgo();
  };
  
  SpringLayout2.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  SpringLayout2.prototype.initAlgo = function(){
    var _self = this;
    _self.nodes.forEach(function(n){
      n.layoutData = _self.newLayoutData();
    });
    this.inited = true;
  };
  
  SpringLayout2.prototype.goAlgo = function(){
    var _self = this;
    
    _self.nodes.forEach(function(n){
      var svd = n.layoutData;
      svd.dx /= 4;
      svd.dy /= 4;
      svd.edgedx = svd.edgedy = 0;
      svd.repulsiondx = svd.repulsiondy = 0;
    });

      _self.relaxEdges();
      _self.calculateRepulsion();
      _self.moveNodes();
  };

  SpringLayout2.prototype.relaxEdges = function(){
    var _self = this;
    _self.links.forEach(function(link){
      
      var node1 = link.source;
      var node2 = link.target;
      
      var vx = node1.x - node2.x;
      var vy = node1.y - node2.y;
      
      var len = Math.sqrt(vx * vx + vy * vy);
      len = (len == 0) ? 0.0001 : len;
      
      var f = _self.force_multiplier * (1 - len) / len;
      f = f * Math.pow(_self.stretch, 2);
      
      var dx = f * vx;
      var dy = f * vy;
        
      var v1D = node1.layoutData;
      var v2D = node2.layoutData;
      v1D.edgedx += dx;
      v1D.edgedy += dy;
      v2D.edgedx += -dx;
      v2D.edgedy += -dy;
    });
  };
  
  SpringLayout2.prototype.calculateRepulsion = function(){
        var _self = this;
        _self.nodes.forEach(function(node){
          var dx = 0, dy = 0;
          _self.nodes.forEach(function(n){
            if(node.id != n.id){
              var vx = node.x - n.x;
              var vy = node.y - n.y;
              
              var distanceSq = vx * vx + vy * vy;
              if (distanceSq == 0) {
                      dx += Math.random();
                      dy += Math.random();
                  } else if (distanceSq < _self.repulsion_range_sq) {
                      var factor = 1;
                      dx += factor * vx / distanceSq;
                      dy += factor * vy / distanceSq;
                  }
            }
          });
          
          var dlen = dx * dx + dy * dy;
            if (dlen > 0) {
                dlen = Math.sqrt(dlen) / 2;
                var layoutData = node.layoutData;
                layoutData.repulsiondx += dx / dlen;
                layoutData.repulsiondy += dy / dlen;
            }
        });
  };
  
  SpringLayout2.prototype.moveNodes = function(){   
    var _self = this;
    _self.nodes.forEach(function(node){
      var vd = node.layoutData;
      
      vd.dx += vd.repulsiondx + vd.edgedx;
            vd.dy += vd.repulsiondy + vd.edgedy;
      
      node.x += Math.max(-5, Math.min(5, vd.dx));
      node.y += Math.max(-5, Math.min(5, vd.dy));
    });
  };

  var SphereLayout = function(nodes,links,radius){
    this.nodes = nodes;
    this.links = links;
    this.radius = radius || 800;
    this.boolTransition = true;
    this.intSteps = 30;
    this.inited = false;
  };
  
  SphereLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };

  SphereLayout.prototype.getConfig = function(){
    return [
      {'label':'半径','radius':500}
    ];
  };

  SphereLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
       this.radius =  Number(layoutConfig['radius'])||500;
    }
    this.initAlgo();
  };
  
  SphereLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };
  
  SphereLayout.prototype.initAlgo = function(){
    var self = this;
    var nodeCount = self.nodes.length;
    this.inited = true;
    var area = 0;
    self.nodes.forEach(function(n,i){
      var phi = Math.acos( -1 + ( 2 * i ) / nodeCount );
      var theta = Math.sqrt( nodeCount * Math.PI ) * phi;

      var sinPhiRadius = Math.sin( phi ) * self.radius;

      var tempX = sinPhiRadius * Math.sin( theta );
      var tempY = Math.cos( phi ) * self.radius;

      var posData = self.newLayoutData();
      posData.finishx = tempX;
      posData.finishy = tempY;
      posData.xdistance = (1.0 / self.intSteps) * (tempX - n.x);
      posData.ydistance = (1.0 / self.intSteps) * (tempY - n.y);
      n.layoutData = posData;
    });
  };
  
  SphereLayout.prototype.goAlgo = function(){
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
  };

  var TreeLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.nodeIds = [];
    this.nodeNeighbers = [];
    
    this.distX = 80;
    this.distY = 80;
    this.currentX = 0;
    this.currentY = 0;
    this.direction='UD';
    
    this.boolTransition = true;
    this.intSteps = 50;

    this.hasCycle = false;
    this.inited = false;
  };

  TreeLayout.prototype.getConfig = function(){
    return [
      {'label':'点间距','distX':80},
      {'label':'层间距','distY':120},
      {'label':'排列方向','direction':[{label:'上下',value:'UD'},
          {label:'下上',value:'DU'},
          {label:'左右',value:'LR'},
          {label:'右左',value:'RL'}]
      }
    ];
  };

  TreeLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.distX = Number(layoutConfig['distX']) || 100;
      this.distY = Number(layoutConfig['distY']) || 120;
      this.direction = layoutConfig['direction'] || 'UD';
    }
    this.nodeIds = [];
    this.nodeNeighbers = [];
    this.initAlgo();
  };
  
  TreeLayout.prototype.initAlgo = function(){
    var _self = this;
    _self.nodes.forEach(function(node){

      _self.checkHasCycle(node,[]);

      _self.nodeIds.push(node.id);
      var neighbers = _self.initNodeNeighbers(node);
      _self.nodeNeighbers.push(neighbers);
    });
    _self.buildTree();
    this.inited = true;
  };
  
  TreeLayout.prototype.initNodeNeighbers = function(node){
    var _self = this;
    var nodeNeighbers = [];
    var outLinks = node.outLinks || [];
    
    outLinks.forEach(function(link){
      var target = link.target;
      var source = link.source;
      
      if(source.id != target.id){
        
        var index = _self.nodeIds.indexOf(target.id);
        var childNodes = _self.nodeNeighbers[index] || [];
        
        var childNodeIds = [];
        childNodes.forEach(function(n){
          childNodeIds.push(n.id);
        });
        
        if(childNodeIds.indexOf(node.id) == -1){
          nodeNeighbers.push(target);
        }
      }
    });
    return nodeNeighbers;
  };
  
  TreeLayout.prototype.runLayout = function(){
    if(!this.hasCycle && this.inited){
        this.goAlgo();
    }
  };
  
  TreeLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  TreeLayout.prototype.buildTree = function(){
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
  };
  
  TreeLayout.prototype.getRoots = function(){
    var _self = this;
    var roots = [];
    _self.nodes.forEach(function(node){
      if((node.inLinks || []).length == 0){
        roots.push(node);
      }
    });
    return roots;
  };
  
  TreeLayout.prototype.calculateRootsX = function(roots){
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
  };
  
  TreeLayout.prototype.calculateNodeX = function(node){
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
  };
  
  TreeLayout.prototype.buildNodeTree = function(node,x) {
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
  };
  
  TreeLayout.prototype.setCurrentPositionFor = function(node) {
      var _self = this;
    var x = _self.currentX;
      var y = _self.currentY;
      var tempx = x;
      if(_self.direction=='DU'){
        y=-y;
      }else if(_self.direction=='LR'){
        x=y;
        y=tempx;
      }else if(_self.direction=='RL'){
        x=-y;
        y=tempx;
      }
      
      var posData = _self.newLayoutData();
    posData.finishx = x;
    posData.finishy = y;
    posData.xdistance = (1.0 / _self.intSteps) * (x - node.x);
    posData.ydistance = (1.0 / _self.intSteps) * (y - node.y);
    node.layoutData = posData;
  };
  
  TreeLayout.prototype.getSuccessors = function(node){
    var _self = this;
    var index = _self.nodeIds.indexOf(node.id);
    var childNodes = _self.nodeNeighbers[index];
    return childNodes;
  };

  TreeLayout.prototype.goAlgo = function(){
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
  };

  TreeLayout.prototype.checkHasCycle = function(node,pathNodes){
    var _self = this;
    (node.outLinks||[]).forEach(function(_link){
      var target = _link.target;
      if(node.id == target.id || pathNodes.indexOf(target.id) != -1){
        _self.hasCycle = true;
        return;
      }
      pathNodes.push(target.id);
      _self.checkHasCycle(target,pathNodes);
    });
  };

  var BalloonLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.nodeIds = [];
    this.nodeNeighbers = [];
    
    this.distX = 50;
    this.distY = 50;
    this.currentX = 0;
    this.currentY = 0;

    this.radius=1000;
    
    this.boolTransition = true;
    this.intSteps = 50;

    this.hasCycle = false;
    this.inited = false;
  };

  BalloonLayout.prototype.getConfig = function(){
    return [
      {'label':'区域大小','radius':1000}
    ];
  };

  BalloonLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.radius = Number(layoutConfig['radius'])||1000;
    }
    this.initAlgo();
  };
  
  BalloonLayout.prototype.runLayout = function(){
    if(!this.hasCycle && this.inited){
        this.goAlgo();
    }
  };
  
  BalloonLayout.prototype.initAlgo = function(){
    var _self = this;
    this.inited = true;
    _self.nodeIds = [];
    _self.nodeNeighbers = []; 
    _self.nodes.forEach(function(node){
      _self.nodeIds.push(node.id);
      var neighbers = _self.initNodeNeighbers(node);
      _self.nodeNeighbers.push(neighbers);
      _self.checkHasCycle(node,[]);
    });
    
    _self.buildTree();
    _self.setRootPolars();
  };
  
  BalloonLayout.prototype.initNodeNeighbers = function(node){
    var _self = this;
    var nodeNeighbers = [];
    var outLinks = node.outLinks || [];
    
    outLinks.forEach(function(link){
      var target = link.target;
      var source = link.source;
      
      if(source.id != target.id){
        
        var index = _self.nodeIds.indexOf(target.id);
        var childNodes = _self.nodeNeighbers[index] || [];
        
        var childNodeIds = [];
        childNodes.forEach(function(n){
          childNodeIds.push(n.id);
        });
        
        if(childNodeIds.indexOf(node.id) == -1){
          nodeNeighbers.push(target);
        }
      }
    });
    return nodeNeighbers;
  };
  
  BalloonLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  BalloonLayout.prototype.setRootPolars = function() {
    var _self = this;
    var roots = _self.getRoots();
      var center = _self.getCenter();
      _self.setPolars(roots, center, _self.radius);
    };
  
  BalloonLayout.prototype.setRootPolar = function(root){
    root.x = 10;
    root.y = 10;
  };
  
  BalloonLayout.prototype.setPolars = function(kids, parentLocation, parentRadius) {
    var _self = this;
      var childCount = kids.length;
      if(childCount == 0) {
        return;
      }
      var angle = Math.max(0, Math.PI / 2 * (1 - 2.0/childCount));
      var childRadius = parentRadius * Math.cos(angle) / (1 + Math.cos(angle));
      var radius = parentRadius - childRadius;

      var rand = Math.random();

      for(var i=0; i< childCount; i++) {
        var node = kids[i];

        var theta = i* 2*Math.PI/childCount + rand;

        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);
        
        x = x + parentLocation.x;
        y = y + parentLocation.y;
        
        var posData = _self.newLayoutData();
        posData.finishx = x;
        posData.finishy = y;
        posData.xdistance = (1.0 / _self.intSteps) * (x - node.x);
        posData.ydistance = (1.0 / _self.intSteps) * (y - node.y);
        node.layoutData = posData;
        
        var p = {x:x,y:y};
        
        var childNodes = _self.getSuccessors(node);
        _self.setPolars(childNodes, p, childRadius);
      }
    };
  
  BalloonLayout.prototype.getCenter = function(node){
    var _self = this;
    var parent = _self.getParent(node);
    if(parent == null) {
      return _self.getCenter();
    }
    return {x : parent.x, y:parent.y};
  };
  
  BalloonLayout.prototype.getCenter = function(){
    var _self = this;
    return {x : 0, y:0};
  };
  
  BalloonLayout.prototype.getParent = function(node){
    var inLinks = node.inLinks || [];
    if(inLinks.length > 0){
      return inLinks[0].source;
    }
    return null;
  };
  
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
  };
  
  BalloonLayout.prototype.getRoots = function(){
    var _self = this;
    var roots = [];
    _self.nodes.forEach(function(node){
      if((node.inLinks || []).length == 0){
        roots.push(node);
      }
    });
    return roots;
  };
  
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
  };
  
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
  };
  
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
  };
  
  BalloonLayout.prototype.setCurrentPositionFor = function(node) {
      var _self = this;
    var x = _self.currentX;
      var y = _self.currentY;
      node.tempx = x;
      node.tempy = y;
  };
  
  BalloonLayout.prototype.getSuccessors = function(node){
    var _self = this;
    var index = _self.nodeIds.indexOf(node.id);
    var childNodes = _self.nodeNeighbers[index];
    return childNodes;
  };

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
  };

  BalloonLayout.prototype.checkHasCycle = function(node,pathNodes){
    var _self = this;
    (node.outLinks||[]).forEach(function(_link){
      var target = _link.target;
      if(node.id == target.id || pathNodes.indexOf(target.id) != -1){
        _self.hasCycle = true;
        return;
      }
      pathNodes.push(target.id);
      _self.checkHasCycle(target,pathNodes);
    });
  };

  var RadiaTreeLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    
    this.nodeIds = [];
    this.nodeNeighbers = [];
    
    this.distX = 50;
    this.distY = 50;
    this.currentX = 0;
    this.currentY = 0;
    
    this.boolTransition = true;
    this.intSteps = 50;

    this.hasCycle = false;
    this.inited = false;
  };

  RadiaTreeLayout.prototype.getConfig = function(){
    return [
      {'label':'水平间距','distX':50},
      {'label':'垂直间距','distY':50}
    ];
  };

  RadiaTreeLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
        this.distX = Number(layoutConfig['distX']) || 50;
        this.distY = Number(layoutConfig['distY']) || 50;
    }
    this.initAlgo();
  };
  
  RadiaTreeLayout.prototype.runLayout = function(){
    if(!this.hasCycle && this.inited){
      this.goAlgo();
    }
  };
  
  RadiaTreeLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  RadiaTreeLayout.prototype.initAlgo = function(){
    var _self = this;
    this.inited = true;
    _self.nodeIds = [];
    _self.nodeNeighbers = [];
    _self.nodes.forEach(function(node){
      _self.nodeIds.push(node.id);
      var neighbers = _self.initNodeNeighbers(node);
      _self.nodeNeighbers.push(neighbers);
      _self.checkHasCycle(node,[]);
    });
    
    _self.buildTree();
    _self.setRadialLocations();
  };

  RadiaTreeLayout.prototype.checkHasCycle = function(node,pathNodes){
    var _self = this;
    (node.outLinks||[]).forEach(function(_link){
      var target = _link.target;
      if(node.id == target.id || pathNodes.indexOf(target.id) != -1){
        _self.hasCycle = true;
        return;
      }
      pathNodes.push(target.id);
      _self.checkHasCycle(target,pathNodes);
    });
  };
  
  RadiaTreeLayout.prototype.initNodeNeighbers = function(node){
    var _self = this;
    var nodeNeighbers = [];
    var outLinks = node.outLinks || [];
    
    outLinks.forEach(function(link){
      var target = link.target;
      
      if(node.id != target.id){
        
        var index = _self.nodeIds.indexOf(target.id);
        var childNodes = _self.nodeNeighbers[index] || [];
        
        var childNodeIds = [];
        childNodes.forEach(function(n){
          childNodeIds.push(n.id);
        });
        
        if(childNodeIds.indexOf(node.id) == -1){
          nodeNeighbers.push(target);
        }
      }
    });
    return nodeNeighbers;
  };
  
  RadiaTreeLayout.prototype.buildTree = function(){
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
  };
  
  RadiaTreeLayout.prototype.getRoots = function(){
    var _self = this;
    var roots = [];
    _self.nodes.forEach(function(node){
      if((node.inLinks || []).length == 0){
        roots.push(node);
      }
    });
    return roots;
  };
  
  RadiaTreeLayout.prototype.calculateRootsX = function(roots){
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
  };
  
  RadiaTreeLayout.prototype.calculateNodeX = function(node){
    var _self = this;
    var size = 0;
    var childNodes =  _self.getSuccessors(node);

        if (childNodes.length != 0) {
            childNodes.forEach(function(_node){
        size += _self.calculateNodeX(_node) + _self.distX;
      });
        }
        size = Math.max(0, size - _self.distX);
        node.sizeT = size;

        return size;
  };
  
  RadiaTreeLayout.prototype.buildNodeTree = function(node,x) {
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
  };
  
  RadiaTreeLayout.prototype.setCurrentPositionFor = function(node) {
      var _self = this;
    var x = _self.currentX;
      var y = _self.currentY; 
      node.tempx = x;
      node.tempy = y;
  };
  
  RadiaTreeLayout.prototype.getSuccessors = function(node){
    var _self = this;
    var index = _self.nodeIds.indexOf(node.id);
    var childNodes = _self.nodeNeighbers[index];
    return childNodes;
  };
  
  RadiaTreeLayout.prototype.setRadialLocations = function(){
    var _self = this;
    var maxPoint = _self.getMaxXY();
    var maxx = maxPoint.x;
    var maxy = maxPoint.y;
    var theta = 2*Math.PI/maxx;
    var deltaRadius = maxx/2/maxy;
    
    _self.nodes.forEach(function(node){
      var _theta = node.tempx * theta;
      var _raduis = (node.tempy-_self.distY)*deltaRadius;
      
      var x = _raduis * Math.cos(_theta);
      var y = _raduis * Math.sin(_theta);
      
      var posData = _self.newLayoutData();
      posData.finishx = x;
      posData.finishy = y;

      posData.xdistance = (1.0 / _self.intSteps) * (x - node.x);
      posData.ydistance = (1.0 / _self.intSteps) * (y - node.y);
      node.layoutData = posData;
    });
    
  };
  
  RadiaTreeLayout.prototype.getMaxXY = function(){
    var _self = this;
    var maxx = 0, maxy = 0;
    _self.nodes.forEach(function(node){
      if(!node.tempx){
      node.tempx =  _self.currentX;
      }
      if(!node.tempy){
        node.tempy =  _self.currentY;
      }
      maxx = Math.max(maxx, node.tempx);
      maxy = Math.max(maxy, node.tempy);
    });
    return {x : maxx,y : maxy};
  };
  
  RadiaTreeLayout.prototype.goAlgo = function(){
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
  };

  var TopoTreeLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;
    this.raduis=50;
    this.boolTransition = true;
    this.intSteps = 50;

    this.hasCycle = false;
    this.inited = false;
  };

  TopoTreeLayout.prototype.getConfig = function(){
    return [
      {'label':'节点大小','raduis':50}
    ];
  };

  TopoTreeLayout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.raduis = Number(layoutConfig['raduis']) || 50;
    }
    this.initAlgo();
  };
  
  TopoTreeLayout.prototype.initAlgo = function(){
    var _self = this;   
    var roots = _self.getRoots();
    roots[0].tempX = roots[0].x = 1000;
    roots[0].tempY = roots[0].y = 500;
    _self.countRadius(roots[0],_self.raduis);

    _self.layout(roots[0],_self.raduis * 3);
    this.inited = true;
  };

  TopoTreeLayout.prototype.countRadius = function(root, minR) {
    var self = this;
      minR = (minR == null ? self.raduis : minR);
      var children = self.getSuccessors(root);
      var size = children.length;
      if (size <= 1) {
          root.rdegree = 0;
          root.mradius = minR;
          root.totalRadius = minR;
      }

      children.forEach(function(child) {
          self.countRadius(child, minR);
      });
    
    if(size > 1){
        var child0 = children[0];
        var totalRadius = child0.totalRadius;
      if(size == 2){
        size=3;
      }
        var degree = Math.PI / size;
        var pRadius = totalRadius / Math.sin(degree);
        root.mradius = pRadius;
        root.totalRadius = pRadius + totalRadius;
        root.rdegree = degree * 2;
    }
  };

  TopoTreeLayout.prototype.layout = function(root,minR) {
    var self = this;
      var children = self.getSuccessors(root);
      var len = children.length;
      var degree = root.rdegree;
      var r = root.mradius;
      var rootPosition = {x:root.tempX,y:root.tempY};
   
      children.forEach(function(node, index) {
          var s = Math.sin(degree * index),
              c = Math.cos(degree * index),
              x = s * r,
              y = c * r;

          x = Math.round(x + rootPosition.x);
          y =  Math.round(y + rootPosition.y);

          node.tempX = x;
          node.tempY = y;

          var posData = self.newLayoutData();
          posData.finishx = x;
          posData.finishy = y;
          posData.xdistance = (1.0 / self.intSteps) * (x - node.x);
          posData.ydistance = (1.0 / self.intSteps) * (y - node.y);
          node.layoutData = posData;
   
          self.layout(node,minR);
      });
  };
  
  TopoTreeLayout.prototype.runLayout = function(){
    if(!this.hasCycle && this.inited){
      this.goAlgo();
    }
  };
  
  TopoTreeLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
  
  TopoTreeLayout.prototype.getRoots = function(){
    var _self = this;
    var roots = [];
    _self.nodes.forEach(function(node){
      if((node.inLinks || []).length == 0){
        roots.push(node);
      }
      _self.checkHasCycle(node,[]);
    });
    return roots;
  };

  TopoTreeLayout.prototype.checkHasCycle = function(node,pathNodes){
    var _self = this;
    (node.outLinks||[]).forEach(function(_link){
      var target = _link.target;
      if(node.id == target.id || pathNodes.indexOf(target.id) != -1){
        _self.hasCycle = true;
        return;
      }
      pathNodes.push(target.id);
      _self.checkHasCycle(target,pathNodes);
    });
  };
  
  TopoTreeLayout.prototype.getSuccessors = function(node){
    var _self = this;
    var children = [];
    if(!node){
      return children;
    }
    (node.outLinks||[]).forEach(function(l){
      children.push(l.target);
    });
    return children;
  };

  TopoTreeLayout.prototype.goAlgo = function(){
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
  };

  TopoTreeLayout.prototype.checkHasCycle = function(node,pathNodes){
    var _self = this;
    (node.outLinks||[]).forEach(function(_link){
      var target = _link.target;
      if(node.id == target.id || pathNodes.indexOf(target.id) != -1){
        _self.hasCycle = true;
        return;
      }
      pathNodes.push(target.id);
      _self.checkHasCycle(target,pathNodes);
    });
  };

  var ForceD3Layout = function(nodes,links){  
    this.nodes = nodes;
    this.links = links;
    
    this.size = [1500, 700];
    this.alpha = 0.1;
    this.friction = 0.9;
    this.linkDistance = 120;
    this.linkStrength = 0.09;
    this.charge = -200;
    this.gravity = 0.015;
    this.theta = 0.8;
    this.distances = [];
    this.strengths = [];
    this.charges = [];

    this.inited=false;
  };

  ForceD3Layout.prototype.getConfig = function(){
    return [
      {'label':'斥力','froce':0.95},
      {'label':'边长度','linkDistance':150},
      {'label':'边强度','linkStrength':0.09},
      {'label':'引力','charge':-300},
      {'label':'重力','gravity':0.015}
    ];
  };

  ForceD3Layout.prototype.resetConfig = function(layoutConfig){
    if(layoutConfig){
      this.friction = Number(layoutConfig['froce']) || 0.95;
      this.linkDistance = Number(layoutConfig['linkDistance']) || 150;
      this.linkStrength = Number(layoutConfig['linkStrength']) || 0.09;
      this.charge = Number(layoutConfig['charge']) || -300;
      this.gravity = Number(layoutConfig['gravity']) || 0.015;

      this.initAlgo();
    }
  };
  
  ForceD3Layout.prototype.runLayout = function(){
    if(this.inited){
        this.goAlgo();
    }
  };
  
  ForceD3Layout.prototype.initAlgo = function(){
    var _self = this; 
    var i,j,
          n = _self.nodes.length,
          m = _self.links.length,
          w = _self.size[0],
          h = _self.size[1],
          neighbors = [],
          o;

      _self.charges = [];
      for (i = 0; i < n; ++i) {
         (o = _self.nodes[i]).index = i;
         o.weight = 0;
         o.px = o.x;
         o.py = o.y;
         _self.charges[i] = _self.charge;
      }

      for (i = 0; i < m; ++i) {
        o = _self.links[i];
        var source = o.source;
        var target = o.target;

        _self.distances[i] = _self.linkDistance;
        _self.strengths[i] = _self.linkStrength;

        ++source.weight;
        ++target.weight;
      }

      this.inited=true;
      
      function position(dimension, size) {
          var neighbors = neighbor(i),
            j = -1,
            m = neighbors.length,
            x;
          while (++j < m){
            if (!isNaN(x = neighbors[j][dimension])){
            return x;
            }
          }
          return Math.random() * size;
      };

      function neighbor() {
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = _self.links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
          return neighbors[i];
      };
      return this.resume();
  };
  
  ForceD3Layout.prototype.goAlgo = function(){
    this.tick();
  };
  
  ForceD3Layout.prototype.alpha1 = function(x) {
    var _self = this;
      if (!arguments.length) {
        return _self.alpha;
      }
      if (_self.alpha) { 
        if (x > 0){
          _self.alpha = x;
        }else{
          _self.alpha = 0; 
        } 
      } else if (x > 0) {
        _self.tick();
      }
      return this;
  };
  
  ForceD3Layout.prototype.resume = function() {
      return this.alpha1(.1);
  };

  ForceD3Layout.prototype.stop = function() {
      return this.alpha1(0);
  };
  
  ForceD3Layout.prototype.tick = function() {
    var _self = this;
      var n = _self.nodes.length,
          m = _self.links.length,
          q,i,o, s,t, l,  k,x, y; 

      for (i = 0; i < m; ++i) {
        o = _self.links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = (x * x + y * y)) {
          l = _self.alpha * _self.strengths[i] * ((l = Math.sqrt(l)) - _self.distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }

      if (k = _self.alpha * _self.gravity) {
        x = _self.size[0] / 2;
        y = _self.size[1] / 2;
        i = -1; 
        if (k){
          while (++i < n) {
            o = _self.nodes[i];
            o.x += (x - o.x) * k;
            o.y += (y - o.y) * k;
        }
        }
      }

      if (_self.charge) {
        _self.forceAccumulate(q = _self.quadtree(_self.nodes), _self.alpha, _self.charges);
        i = -1;
        while (++i < n) {
          if (!(o = _self.nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }

      i = -1; 
      while (++i < n) {
        o = _self.nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * _self.friction;
          o.y -= (o.py - (o.py = o.y)) * _self.friction;
        }
      }

      function repulse(node) {
        return function(quad, x1, y1, x2, y2) {
          if (quad.point !== node) {
            var dx = quad.cx - node.x,
                dy = quad.cy - node.y,
                dn = 1 / Math.sqrt(dx * dx + dy * dy);

            if ((x2 - x1) * dn < _self.theta) {
              var k = quad.charge * dn * dn;
              node.px -= dx * k;
              node.py -= dy * k;
              return true;
            }

            if (quad.point && isFinite(dn)) {
              var k = quad.pointCharge * dn * dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
          }
          return !quad.charge;
        };
    }
  };

  ForceD3Layout.prototype.forceAccumulate = function(quad, alpha, charges) {
    var _self = this;
      var cx = 0,cy = 0;
      quad.charge = 0;
    if (!quad.leaf) {
        var nodes = quad.nodes,
            n = nodes.length,
            i = -1,
            c;
        while (++i < n) {
          c = nodes[i];
          if (c == null){
            continue;
          } 
          _self.forceAccumulate(c, alpha, charges);
          quad.charge += c.charge;
          cx += c.charge * c.cx;
          cy += c.charge * c.cy;
        }
    }
      
    if (quad.point) {
        if (!quad.leaf) {
          quad.point.x += Math.random() - .5;
          quad.point.y += Math.random() - .5;
        }
        var k = _self.alpha * _self.charges[quad.point.index];
        quad.charge += quad.pointCharge = k;
        cx += k * quad.point.x;
        cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  };

  ForceD3Layout.prototype.quadtree = function(points, x1, y1, x2, y2) {
    var _self = this;
      var p,i = -1,n = points.length;
    if(n && isNaN(points[0].x)){
        points = points.map(function(p){
          return {
            x: p[0],
            y: p[1]
        };
        });
    }

    if (arguments.length < 5) {
        if (arguments.length === 3) {
          y2 = x2 = y1;
          y1 = x1;
        } else {
          x1 = y1 = Infinity;
          x2 = y2 = -Infinity;
          while (++i < n) {
            p = points[i];
            if (p.x < x1) {x1 = p.x;}
            if (p.y < y1) {y1 = p.y;}
            if (p.x > x2) {x2 = p.x;}
            if (p.y > y2) {y2 = p.y;}
          }
          var dx = x2 - x1, dy = y2 - y1;
          if (dx > dy) {
            y2 = y1 + dx;
          }else{
            x2 = x1 + dy;
          } 
        }
    };

      function insert(n, p, x1, y1, x2, y2) {
        if (isNaN(p.x) || isNaN(p.y)){
          return; 
        } 
        if (n.leaf) {
          var v = n.point;
          if (v) {
            if ((Math.abs(v.x - p.x) + Math.abs(v.y - p.y)) < .01) {
              insertChild(n, p, x1, y1, x2, y2);
            } else {
              n.point = null;
              insertChild(n, v, x1, y1, x2, y2);
              insertChild(n, p, x1, y1, x2, y2);
            }
          } else {
            n.point = p;
          }
        } else {
          insertChild(n, p, x1, y1, x2, y2);
        }
      };

      function insertChild(n, p, x1, y1, x2, y2) {
        var sx = (x1 + x2) * .5,
            sy = (y1 + y2) * .5,
            right = p.x >= sx,
            bottom = p.y >= sy,
            i = (bottom << 1) + right;
        n.leaf = false;
        n = n.nodes[i] || (n.nodes[i] = {leaf: true,nodes: [],point: null});
        if (right) {x1 = sx;} else{ x2 = sx;}
        if (bottom){y1 = sy;} else{y2 = sy;}
        insert(n, p, x1, y1, x2, y2);
      };

      function quadtreeVisit(f, node, x1, y1, x2, y2) {
      if (!f(node, x1, y1, x2, y2)) {
        var sx = (x1 + x2) * .5,
            sy = (y1 + y2) * .5,
            children = node.nodes;
        if (children[0]){quadtreeVisit(f, children[0], x1, y1, sx, sy); }
        if (children[1]){quadtreeVisit(f, children[1], sx, y1, x2, sy); }
        if (children[2]){quadtreeVisit(f, children[2], x1, sy, sx, y2); }
        if (children[3]){quadtreeVisit(f, children[3], sx, sy, x2, y2); }
      }
    };

    var root = {leaf: true,nodes: [],point: null};
    root.add = function(p) {
        insert(root, p, x1, y1, x2, y2);
    };

    root.visit = function(f) {
        quadtreeVisit(f, root, x1, y1, x2, y2);
    };
    points.forEach(root.add);
    return root;
  };

  var ForceDirected = function(_nodes,_links) {
      this.nodes = _nodes;
      this.links = _links;

      this.attraction_multiplier = 5;
      this.repulsion_multiplier = 0.5;
      this.width = 1200;
      this.height = 800;
      this.inited=false;

      var EPSILON = 1/100000;
      var attraction_constant;
      var repulsion_constant;
      var forceConstant;
      var layout_iterations = 0;
      var max_iterations = 100000;
      var temperature = 0;
      var scalar = 10;

      var that = this;
      var nodes_length=_nodes.length;
      var links_length=_links.length;

      this.getConfig = function(){
        return [
          {'label':'吸引力','attraction':2},
          {'label':'斥力','force':100}
        ];
      };

      this.resetConfig = function(layoutConfig){
        if(layoutConfig){
          attraction_multiplier = Number(layoutConfig['attraction'])||2;
          forceConstant = Number(layoutConfig['force']) || 100;
          that.initAlgo();
        }
      };

      this.initAlgo = function() {
        temperature = 10.0;
        layout_iterations=0;
        attraction_constant = that.attraction_multiplier * forceConstant;
        repulsion_constant = that.repulsion_multiplier * forceConstant;
        that.inited = true;
      };

      this.runLayout = function() {
         if(that.inited){
            that.goAlgo();
         }
      };

      this.goAlgo = function(){
        if(temperature > (1/100000)) {
          var i, j, delta, delta_length, force, change;

          for(i=0; i < nodes_length; i++) {
            var node_v = that.nodes[i];
            node_v.layout = node_v.layout || {};
            if(i === 0) {
              node_v.layout.offset = new Vector2();
            }

            node_v.layout.force = 0;
            node_v.layout.tmp_pos = node_v.layout.tmp_pos || new Vector2().setVector(node_v);

            for(j=i+1; j < nodes_length; j++) {
              var node_u = that.nodes[j];
              if(i != j) {
                node_u.layout = node_u.layout || {};

                node_u.layout.tmp_pos = node_u.layout.tmp_pos || new Vector2().setVector(node_u);

                delta = node_v.layout.tmp_pos.clone().sub(node_u.layout.tmp_pos);
                delta_length = Math.max(EPSILON, Math.sqrt(delta.clone().multiply(delta).sum()));

                force = (repulsion_constant * repulsion_constant) / delta_length;

                node_v.layout.force += force;
                node_u.layout.force += force;

                if(i === 0) {
                  node_u.layout.offset = new Vector2();
                }

                change = delta.clone().multiply(new Vector2().setScalar(force/delta_length));
                node_v.layout.offset.add(change);
                node_u.layout.offset.sub(change);
              }
            }
          }

          for(i=0; i < links_length; i++) {
            var link = that.links[i];
            delta = link.source.layout.tmp_pos.clone().sub(link.target.layout.tmp_pos);
            delta_length = Math.max(EPSILON, Math.sqrt(delta.clone().multiply(delta).sum()));

            force = (delta_length * delta_length) / attraction_constant;

            link.source.layout.force -= force;
            link.target.layout.force += force;

            change = delta.clone().multiply(new Vector2().setScalar(force/delta_length));
            link.target.layout.offset.add(change);
            link.source.layout.offset.sub(change);
          }

          for(i=0; i < nodes_length; i++) {
            var node = that.nodes[i];

            delta_length = Math.max(EPSILON, Math.sqrt(node.layout.offset.clone().multiply(node.layout.offset).sum()));
            node.layout.tmp_pos.add(node.layout.offset.clone().multiply(new Vector2().setScalar(Math.min(delta_length, temperature) / delta_length)));

            var tmpPosition = new Vector2(node.x,node.y,0);
            tmpPosition.sub(node.layout.tmp_pos).divide(new Vector2().setScalar(scalar));

            node.x -= tmpPosition.x;
            node.y -= tmpPosition.y;
          }
          temperature *= (1 - (layout_iterations / max_iterations));
          layout_iterations++;
        }
      };
  };

  function Vector2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };

  Object.assign(Vector2.prototype, {
    set: function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    },

    setScalar: function(scalar) {
      this.x = scalar;
      this.y = scalar;
      return this;
    },

    setVector: function(v) {
      this.x = v.x || 0;
      this.y = v.y || 0;
      return this;
    },

    clone: function() {
      return new this.constructor(this.x, this.y, this.z);
    },

    add: function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },

    addScalar: function(s) {
      this.x += s;
      this.y += s;
      return this;
    },

    sub: function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },

    multiply: function(v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    },

    divide: function(v) {
      this.x /= v.x;
      this.y /= v.y;
      return this;
    },

    sum: function() {
      return this.x + this.y;
    },

    equals: function(v) {
      return ((v.x === this.x) && (v.y === this.y));
    }
  });

  var HierarchicalLayout = function(nodes,links){
        this.nodes = nodes;
        this.links = links;
    
        this.layerDistance = 100;
        this.nodeDistance = 60;
        this.treeSpacing = 0;
        this.direction = "UD";
        this.sortMethod = "directed";
        this.treeIndex = -1;
        this.continueOrBreak = 0;

        this.boolTransition=true;
        this.inited=false;
  };
  
  HierarchicalLayout.prototype.getConfig = function(){
    return [
      {'label':'层间距','layerDistance':100},
      {'label':'点间距','nodeDistance':100},
      {'label':'排列方式','sortMethod':[{label:'连线方向',value:'directed'},
              {label:'度大小',value:'hubsize'},
              {label:'指定点',value:'selected'}]
      },
      {'label':'排列方向','direction':[{label:'上下',value:'UD'},{label:'下上',value:'DU'},
              {label:'左右',value:'LR'},{label:'右左',value:'RL'}]
      }
    ];
  };

  HierarchicalLayout.prototype.resetConfig = function(layoutConfig){
    var self = this;
    if(layoutConfig){
          self.layerDistance = Number(layoutConfig['layerDistance']) || 100;
          self.nodeDistance = Number(layoutConfig['nodeDistance']) || 80;
          self.sortMethod = layoutConfig['sortMethod'] || 'hubsize';
          self.direction = layoutConfig['direction'] || 'UD';
    }
    self.initAlgo();
  };

  HierarchicalLayout.prototype.newLayoutData = function(){
        var layoutData = {
            finishx:0.0,
            finishy:0.0,
            xdistance:0.0,
            ydistance:0.0
        };
        return layoutData;
  };
  
  HierarchicalLayout.prototype.initAlgo = function(){ 
        var  self = this;
        self.treeIndex = -1;
        self.continueOrBreak = 0;
        self.nodeIdList = [];
        self.selectedNodeIds=null;
        self.positionedNodes = {};
        self.hierarchicalLevels = {};
        self.hierarchicalTrees={};
        self.lastNodeOnLevel = {};
        self.hierarchicalChildrenReference = {};
        self.hierarchicalParentReference = {};
        self.distributionIndex = {};
        self.distributionOrdering ={};
        self.distributionOrderingPresence = {};
        self.nodesIdMap={};
        self.edges={};

        self.setData();
        self.setupHierarchicalLayout();

        self.nodes.forEach(function(node){
            var nodeId = String(node.id);
            var nodeLocal = self.nodesIdMap[nodeId];
            var x=0,y=0;
            if(self.direction == 'DU'){
                x = nodeLocal.x;
                y = -nodeLocal.y;
            }else if(self.direction == 'RL'){
                x = -nodeLocal.x;
                y = nodeLocal.y;
            }else{
                x = nodeLocal.x;
                y = nodeLocal.y;
            }

            var posData = self.newLayoutData();
            posData.finishx = x;
            posData.finishy = y;
            posData.xdistance = (1.0 / 50) * (x - node.x);
            posData.ydistance = (1.0 / 50) * (y - node.y);
            node.layoutData=posData;
        });
        self.inited=true;
    };

    HierarchicalLayout.prototype.setData = function(selectedNodeId){
        var self = this;
        self.nodes.forEach(function(node){
            var nodeId = String(node.id);
            var nodeTemp = self.NodeLocal(nodeId);

            self.nodesIdMap[nodeId]=nodeTemp;
            self.nodeIdList.push(nodeId);
        });

        self.links.forEach(function(edge,i){
            var id = String(i+1);
            var edgeLocal = self.Edge(edge.source.id,edge.target.id,id);
            self.edges[id] = edgeLocal;
            var fromId = edgeLocal.fromId;
            var toId = edgeLocal.toId;

            var fromNode = self.nodesIdMap[fromId];
            if (fromNode.edgesIds.indexOf(id) == -1) {
                fromNode.edgesIds.push(id);
            }
            var toNode = self.nodesIdMap[toId];
            if (toNode.edgesIds.indexOf(id) == -1) {
                toNode.edgesIds.push(id);
            }
        });

        if(self.sortMethod == 'selected'){
            var selectedNodes = self.nodes.filter(function(n){
                return n.selected == true;
            });
            var _selectedNodeIds = [];
            selectedNodes.forEach(function(n){
                _selectedNodeIds.push(String(n.id));
            });
            self.selectedNodeIds = _selectedNodeIds;
        }
    };

    HierarchicalLayout.prototype.setupHierarchicalLayout = function(){
        var self = this;
        if (self.sortMethod == 'hubsize') {
            self.determineLevelsByHubsize();
        } else if (self.sortMethod == 'directed') {
          self.determineLevelsByDirected();
        } else if (self.sortMethod == 'selected') {
          self.determineLevelsBySelected();
        }

        self.nodeIdList.forEach(function(nodeId){
            if(self.hierarchicalLevels[nodeId] == null){
                self.hierarchicalLevels[nodeId]=0;
            }
        });

        var distribution = self.getDistribution();
        self.crawlNetwork("generateMap", -1);
        self.placeNodesByHierarchy(distribution);
        self.condenseHierarchy();
    };

    HierarchicalLayout.prototype.determineLevelsByDirected = function(){
        var self = this;
        self.crawlNetwork("determineLevelsByDirected", -1);
        var minLevel = 1000000000;
        self.nodeIdList.forEach(function(nodeId){
            if (self.hierarchicalLevels[nodeId] != null) {
                minLevel = Math.min(self.hierarchicalLevels[nodeId], minLevel);
            }
        });

        self.nodeIdList.forEach(function(nodeId){
            if (self.hierarchicalLevels[nodeId] != null) {
                self.hierarchicalLevels[nodeId]= self.hierarchicalLevels[nodeId] - minLevel;
            }
        });
    };

    HierarchicalLayout.prototype.determineLevelsBySelected = function(){
        var self = this;
        if (self.selectedNodeIds == null){
          self.determineLevelsByHubsize();
        }else{
          self.selectedNodeIds.forEach(function(nodeId){
                self.hierarchicalLevels[nodeId]=0;
          });

          self.selectedNodeIds.forEach(function(nodeId){
                if (self.nodesIdMap[nodeId] != null) {
                  self.crawlNetwork("determineLevelsByHubsize", nodeId);
                }
          });
          self.determineLevelsByHubsize();
        }
    };

    HierarchicalLayout.prototype.NodeLocal = function(nodeId){
        return {
            id:String(nodeId),
            edgesIds:[],
            x:0,
            y:0
        };
    };

    HierarchicalLayout.prototype.Edge = function(fromId,toId,id){
        return {
            id:String(id),
            fromId:String(fromId),
            toId:String(toId)
        };
    };

    HierarchicalLayout.prototype.determineLevelsByHubsize = function(){
        var self = this;
        var hubSize = 1;
        while (hubSize > 0){
            var _hubSize = 0;
            self.nodeIdList.forEach(function(nodeId){
                var node = self.nodesIdMap[nodeId];
                if (self.hierarchicalLevels[node.id] == null) {
                    _hubSize = node.edgesIds.length < _hubSize ? _hubSize : node.edgesIds.length;
                }
            });

            hubSize = _hubSize;
            if (hubSize == 0) {
                return;
            }

            self.nodeIdList.forEach(function(nodeId){
                var node = self.nodesIdMap[nodeId];
                if (node.edgesIds.length == hubSize) {
                  self.crawlNetwork("determineLevelsByHubsize", node.id);
                }
            });
        }
    };

    HierarchicalLayout.prototype.condenseHierarchy = function(){
        var self = this;
        var minPre = 1000000000,maxPre = -1000000000;
        var minAfter = 1000000000, maxAfter = -1000000000;
        for (var i = 0; i < self.treeIndex; i++){
            for(var nodeId in self.hierarchicalTrees){
                if (i == 0 && self.hierarchicalTrees[nodeId] == i){
                  var pos = self.getPositionForHierarchy(self.nodesIdMap[nodeId]);
                  minPre = Math.min(pos, minPre);
                  maxPre = Math.max(pos, maxPre);
                }
                if (self.hierarchicalTrees[nodeId] == i + 1)
                {
                  var pos = self.getPositionForHierarchy(self.nodesIdMap[nodeId]);
                  minAfter = Math.min(pos, minAfter);
                  maxAfter = Math.max(pos, maxAfter);
                }
            }
            var diff = 0;
            for(var nodeId in self.hierarchicalTrees){
                if (self.hierarchicalTrees[nodeId] == i + 1)
                {
                  var node = self.nodesIdMap[nodeId];
                  var pos = self.getPositionForHierarchy(node);
                  self.setPositionForHierarchy(node, pos + diff + self.treeSpacing, -1);
                }
            }
            minPre = minAfter + diff + self.treeSpacing;
            maxPre = maxAfter + diff + self.treeSpacing;
        }
    };
  
    HierarchicalLayout.prototype.shiftToCenter = function(){
        var self = this;
        var minY = 1000000000,maxY = -1000000000;
        var minX = 1000000000,maxX = -1000000000;

        self.nodeIdList.forEach(function(nodeId){
            var node = self.nodesIdMap[nodeId];
            minX=Math.min(minX,node.x);
            maxX=Math.max(maxX,node.x);

            minY=Math.min(minY,node.y);
            maxY=Math.max(maxY,node.y);
        });
        var width = maxX - minX;
        var height = maxY - minY;
        var ratioW = 1,ratioH = 1;
        var standardW = 5000,standardH = 3000;
        if (width > standardW) {
          ratioW = standardW / width;
        }
        if (height > standardH) {
          ratioH = standardH / height;
        }

        self.nodeIdList.forEach(function(nodeId){
            var node = self.nodesIdMap[nodeId];
            var nodeX = node.x;
            node.x = Math.round((nodeX - minX) * ratioW);
            var nodeY = node.y;
            node.y = Math.round((nodeY - minY) * ratioH);
        });
    };

    HierarchicalLayout.prototype.getDistribution = function(){
        var self = this;
        var distribution = {};
        self.nodeIdList.forEach(function(nodeId){
            var node  = self.nodesIdMap[nodeId];
            var level = self.hierarchicalLevels[nodeId] == null ? 0:self.hierarchicalLevels[nodeId];
            if (self.direction== 'UD' ||self.direction == 'DU'){
                node.y = self.layerDistance * level;
            }else {
                node.x = self.layerDistance * level;
            }
            var temp = distribution[String(level)];
            if (temp == null) {
                temp = [];
            }
            temp.push(node);
            distribution[String(level)] =temp;
        });
        return distribution;
    };

    HierarchicalLayout.prototype.crawlNetwork = function(callbackFlag, nodeId){
        var self = this;
        var startingNodeId = nodeId;
        var progress = {};
        var _treeIndex = 0;
        if (startingNodeId == -1){
          self.nodeIdList.forEach(function(id){
                var node = self.nodesIdMap[id];
                if (progress[id] == null){
                  progress = self.crawler(progress, node, callbackFlag, _treeIndex);
                  _treeIndex++;
                }
          });
        }else{
          var node = self.nodesIdMap[startingNodeId];
          progress = self.crawler(progress, node, callbackFlag, -111);
        }
    };

    HierarchicalLayout.prototype.crawler = function(progress,node,callbackFlag,_treeIndex) {
      var self = this;
        if (progress[node.id] == null){
          if (_treeIndex != -111) {
            if (self.hierarchicalTrees[node.id] == null){
              self.hierarchicalTrees[node.id]=_treeIndex;
              self.treeIndex = Math.max(_treeIndex,self.treeIndex);
            }
          }
          progress[node.id]=true;
          var edgesIdsLength = node.edgesIds.length;
          for (var i = 0; i < edgesIdsLength; i++){
            var edgeId = node.edgesIds[i];
            var edge = self.edges[edgeId];
            var childNode = self.NodeLocal();
            if (edge.toId == node.id) {
              childNode = self.nodesIdMap[edge.fromId];
            } else {
              childNode = self.nodesIdMap[edge.toId];
            }

            if (node.id != childNode.id){
              if (callbackFlag == 'determineLevelsByHubsize') {
                self.levelDownstream(node, childNode);
              } else if (callbackFlag == 'determineLevelsByDirected') {
                self.levelByDirection(node, childNode, edge);
              } else if (callbackFlag == 'generateMap') {
                self.fillInRelations(node, childNode);
              }
              self.crawler(progress, childNode, callbackFlag, _treeIndex);
            }
          }
        }
        return progress;
    };

    HierarchicalLayout.prototype.levelDownstream = function(source,nodeB){
        var self = this;
        if (self.hierarchicalLevels[nodeB.id] == null){
          if (self.hierarchicalLevels[source.id] == null) {
            self.hierarchicalLevels[source.id]=0;
          }
          self.hierarchicalLevels[nodeB.id]=self.hierarchicalLevels[source.id] + 1;
        }
    };
  
    HierarchicalLayout.prototype.levelByDirection = function(source,nodeB,edge){
        var self = this;
        var minLevel = 10000;
        if (self.hierarchicalLevels[source.id] == null) {
          self.hierarchicalLevels[source.id]=minLevel;
        }
        if (edge.toId == nodeB.id) {
          self.hierarchicalLevels[nodeB.id]=self.hierarchicalLevels[source.id] + 1;
        } else {
          self.hierarchicalLevels[nodeB.id]=self.hierarchicalLevels[source.id] - 1;
        }
    };
  
    HierarchicalLayout.prototype.fillInRelations = function(parentNode,childNode){
        var self = this;
        if (self.hierarchicalLevels[childNode.id] > self.hierarchicalLevels[parentNode.id]){
          if (self.hierarchicalChildrenReference[parentNode.id] == null) {
            self.hierarchicalChildrenReference[parentNode.id]=[];
          }
          self.hierarchicalChildrenReference[parentNode.id].push(childNode.id);
          if (self.hierarchicalParentReference[childNode.id] == null) {
            self.hierarchicalParentReference[childNode.id]=[];
          }
          self.hierarchicalParentReference[childNode.id].push(parentNode.id);
        }
    };

    HierarchicalLayout.prototype.placeNodesByHierarchy = function(distribution){
        var self = this;
        for(var nodeId in distribution){
            var nodesList = distribution[nodeId];
            var handledNodeCount = 0;
            var nodesListLength = nodesList.length;
            for (var i = 0; i < nodesListLength; i++){
                var node = nodesList[i];
                if (self.positionedNodes[node.id] == null){
                  var pos = self.nodeDistance * handledNodeCount;
                  if (handledNodeCount > 0){
                    pos = self.getPositionForHierarchy(nodesList[i-1]) + self.nodeDistance;
                  }
                  self.setPositionForHierarchy(node, pos, nodeId);
                  self.validataPositionAndContinue(node, nodeId, pos);
                  handledNodeCount++;
                }
            }
        }
    };

    HierarchicalLayout.prototype.getPositionForHierarchy = function(node){
        var self = this;
        if (self.direction == 'UD' ||self.direction == 'DU') {
           return node.x;
        }
        return node.y;
    };

    HierarchicalLayout.prototype.setPositionForHierarchy = function(node,position,level){
        var self = this;
        if (level != -1){
          level = String(level);
          if (self.distributionOrdering[level] == null){
            self.distributionOrdering[level]=[];
            self.distributionOrderingPresence[level]={};
          }
          if (self.distributionOrderingPresence[level][node.id] == null){
            self.distributionOrdering[level].push(node);
            self.distributionIndex[node.id] = self.distributionOrdering[level].length - 1;
          }
          self.distributionOrderingPresence[level][node.id]=true;
        }

        if (self.direction == 'UD' ||self.direction == 'DU') {
            node.x = position;
        }else{
            node.y = position;
        }
    };

    HierarchicalLayout.prototype.validataPositionAndContinue = function(node,level,pos){
        var self = this;
        level = String(level);
        if (self.lastNodeOnLevel[level] != null){
          var previousPos = self.getPositionForHierarchy(self.nodesIdMap[self.lastNodeOnLevel[level]]);
          if (pos - previousPos < self.nodeDistance){
            var diff = previousPos + self.nodeDistance - pos;
            self.shiftBlock(node.id, diff);
          }
        }
        self.lastNodeOnLevel[level]=node.id;
        self.positionedNodes[node.id]=true;
        self.placeBranchNodes(node, level);
    };

    HierarchicalLayout.prototype.shiftBlock = function(parentId,diff){
        var self = this;
        if (self.direction == 'UD' ||self.direction == 'DU') {
          var _x = self.nodesIdMap[parentId].x;
          self.nodesIdMap[parentId].x = _x + diff;
        }else{
          var _y = self.nodesIdMap[parentId].y;
          self.nodesIdMap[parentId].y = _y + diff;
        }
    };

    HierarchicalLayout.prototype.placeBranchNodes = function(parentNode,parentLevel){
        var self = this;
        if (self.hierarchicalChildrenReference[parentNode.id] == null) {
          return;
        }
        var childNodes = [];
        var length = self.hierarchicalChildrenReference[parentNode.id].length;
        for (var i = 0; i < length; i++) {
          childNodes.push(self.nodesIdMap[self.hierarchicalChildrenReference[parentNode.id][i]]);
        }
        var childNodesLength = childNodes.length;
        for (var i = 0; i < childNodesLength; i++){
          var childNode = childNodes[i];
          var childNodeLevel = self.hierarchicalLevels[childNode.id];
          if ((childNodeLevel > parentLevel) && (self.positionedNodes[childNode.id] == null)){
            var pos = 0;
            if (i == 0){
              pos = self.getPositionForHierarchy(self.nodesIdMap[parentNode.id]);
            }else{
              pos = self.getPositionForHierarchy(childNodes[i-1]) + self.nodeDistance;
            }
            self.setPositionForHierarchy(childNode, pos, childNodeLevel);
            self.validataPositionAndContinue(childNode, childNodeLevel, pos);
          }
          else if (self.continueOrBreak != 0){
            return;
          }
        }
        var minPos = 1000000000,maxPos = -1000000000;
        for (var i = 0; i < childNodesLength; i++) {
          var childNode = childNodes[i];
          minPos = Math.min(minPos, self.getPositionForHierarchy(childNode));
          maxPos = Math.max(maxPos, self.getPositionForHierarchy(childNode));
        }
        var _pos = (minPos + maxPos)/2;
        self.setPositionForHierarchy(parentNode, _pos, parentLevel);
  };
  
  HierarchicalLayout.prototype.runLayout = function(){
    if(this.inited){
      this.goAlgo();
    }
  };

  HierarchicalLayout.prototype.goAlgo = function(){
        var self = this;
        var position = null;
        var nodes = self.nodes;
        var length = nodes.length;
        
        for(var i=0;i<length;i++){
            var n = nodes[i];
            position = n.layoutData;
            if(position == null){
                continue;
            }
            
            if(self.boolTransition){
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
  };

  var HiveLayout = function(nodes,links){
        this.nodes = nodes;
        this.links = links;  
        this.margin = 0; 
        this.radius = 50;
        this.nlines = 5;

        this.boolTransition = true;
        this.intSteps = 50;
        this.inited=false;
  };
  
  HiveLayout.prototype.getConfig = function(){
    return [
        {'label':'分支数','nlines':5}
    ];
  };

  HiveLayout.prototype.resetConfig = function(layoutConfig){
      if(layoutConfig){
        this.nlines = Number(layoutConfig['nlines'])||5;
      }
      this.initAlgo();
  };

  HiveLayout.prototype.newLayoutData = function(){
    var layoutData = {
      finishx:0.0,
      finishy:0.0,
      xdistance:0.0,
      ydistance:0.0
    };
    return layoutData;
  };
    
  HiveLayout.prototype.initAlgo = function(){ 
      var self = this;
      var nodeCount=Math.max(this.nodes.length*6,1200);
      const nodes_segment = this.nodes.length / this.nlines;
      const segment = nodeCount - (this.margin + this.radius);
      const step = segment / nodes_segment;
      const angle = 2*Math.PI/this.nlines;
      let j = 0;

      for(let i=0; i<this.nodes.length; ++i){
          var node = this.nodes[i];

          var x = nodeCount+(this.radius + step*(i-j*nodes_segment))*Math.cos(angle*j+Math.PI/2);
          var y = nodeCount+(this.radius + step*(i-j*nodes_segment))*Math.sin(angle*j+Math.PI/2);
          j = Math.floor(i/nodes_segment);

          var posData = self.newLayoutData();
          posData.finishx = x;
          posData.finishy = y;
          posData.xdistance = (1.0 / self.intSteps) * (x - node.x);
          posData.ydistance = (1.0 / self.intSteps) * (y - node.y);
          node.layoutData = posData;
      }
      this.inited=true;
  };

  HiveLayout.prototype.runLayout = function(){
      if(this.inited){
        this.goAlgo();
      }
  };

  HiveLayout.prototype.goAlgo = function(){
      var self = this;
      var position = null;
      var nodes = self.nodes;
      var length = nodes.length;
      
      for(var i=0;i<length;i++){
        var n = nodes[i];
        position = n.layoutData;
        if(position == null){
          continue;
        }
        
        if(self.boolTransition){
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
  };

  var AvoidOverlapLayout = function(nodes,links){
      this.nodes = nodes;
      this.maxMove = 10;
      this.maxIterations=10;
      this.runFlag=false;
      this.inited=false;
  };

    AvoidOverlapLayout.prototype.runLayout = function(){
      if(this.inited){
        this.goAlgo();
      }
    };

    AvoidOverlapLayout.prototype.getConfig = function(){
      var self = this;
      return [
        {'label':'间距','maxMove':self.maxMove}
      ];
    };

    AvoidOverlapLayout.prototype.resetConfig = function(layoutConfig){
      this.initAlgo();
      if(layoutConfig){
        this.maxMove = Number(layoutConfig['maxMove'])||10;
      }
    };
    
    AvoidOverlapLayout.prototype.initAlgo = function(){
        this.maxMove = 5;
        this.maxIterations=1;
        this.runFlag=true;
        this.inited=true;
    };
    
    AvoidOverlapLayout.prototype.goAlgo = function(){
      if(this.runFlag){
          var totalMove=this.removeOverlaps();
          if(totalMove < 1){
              this.runFlag=false;
          }
      }
    };

    AvoidOverlapLayout.prototype.removeOverlaps = function() {
        var self = this;
        var positions = self.nodes;
        var tree  = self.createTree();
        tree.init(positions.reduce(toFlatArray, []));
        var currentNode,totalMovement = 0;
        for (var i=0; i<self.maxIterations;++i) {
          totalMovement=0;
          for (var index=0; index<positions.length;index++) {
            currentNode = positions[index];
            tree.visit(visitTreeNode);
          }
          if (totalMovement < self.maxMove) break;
        }
        return totalMovement;

        function visitTreeNode(node) {
          var bounds = node.bounds;
          var nodePoints = node.items;
          if (nodePoints) {
            nodePoints.forEach(moveIfNeeded);
          } else {
            var closestX = clamp(currentNode.x, bounds.left(), bounds.x + bounds.half);
            var closestY = clamp(currentNode.y, bounds.top(), bounds.y + bounds.half);
            var distanceX = currentNode.x - closestX;
            var distanceY = currentNode.y - closestY;
            var distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
            return distanceSquared < (currentNode.radius * currentNode.radius * currentNode.scaleX);
          }
        };

        function clamp(v, min, max) {
          if (v < min) return min;
          if (v > max) return max;
          return v;
        };

        function moveIfNeeded(nodeIndex) {
          var otherNode = positions[nodeIndex/2];
          if (otherNode == currentNode) return;

          var dx = currentNode.x - otherNode.x;
          var dy = currentNode.y - otherNode.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          var totalRadius = (otherNode.radius* otherNode.scaleX) + (currentNode.radius* currentNode.scaleX);

          if (totalRadius <= distance) return;
          if(distance<=0){return;}
          
          var offset = (distance - totalRadius)/distance * 0.1;
          var mx = dx * offset;
          var my = dy * offset;

          currentNode.x -= mx;
          currentNode.y -= my;

          otherNode.x += mx;
          otherNode.y += my;

          totalMovement += Math.abs(mx) + Math.abs(my);
        };

        function toFlatArray(prevValue, currentValue) {
          prevValue.push(currentValue.x, currentValue.y);
          return prevValue;
        };
    };

    AvoidOverlapLayout.prototype.createTree = function() {
      var queryBounds = new Bounds();
      var root;
      var originalArray;
      var api = {
        init: init,
        bounds: getBounds,
        pointsAround: getPointsAround,
        visit: visit
      };
      return api;

      function visit(cb) {
        return root.visit(cb);
      };

      function getPointsAround(x, y, half, intersectCheck) {
        if (typeof intersectCheck !== 'function') {
          intersectCheck = rectangularCheck;
        }
        var indices = [];
        queryBounds.x = x;
        queryBounds.y = y;
        queryBounds.half = half;
        root.query(queryBounds, indices, originalArray, intersectCheck);
        return indices;
      };

      function init(points) {
        if (!points) throw new Error('Points array is required for quadtree to work');
        if (typeof points.length !== 'number') throw new Error('Points should be array-like object');
        if (points.length % 2 !== 0) throw new Error('Points array should consist of series of x,y coordinates and be multiple of 2');
        originalArray = points;
        root = createRootNode(points);
        for (var i = 0; i < points.length; i += 2) {
          root.insert(i, originalArray);
        }
      };

      function getBounds() {
        if (!root) return EmptyRegion;
        return root.bounds;
      };

      function createRootNode(points) {
        if (points.length === 0) {
          var empty = new Bounds();
          return new TreeNode(empty);
        }
        var minX = Number.POSITIVE_INFINITY;
        var minY = Number.POSITIVE_INFINITY;
        var maxX = Number.NEGATIVE_INFINITY;
        var maxY = Number.NEGATIVE_INFINITY;
        for (var i = 0; i < points.length; i += 2) {
          var x = points[i], y = points[i + 1];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
        var side = Math.max(maxX - minX, maxY - minY);
        side += 2;
        minX -= 1;
        minY -= 1;
        var half = side/2;

        var bounds = new Bounds(minX + half, minY + half, half);
        return new TreeNode(bounds);
      };

      function Bounds(x, y, half) {
          this.x = typeof x === 'number' ? x : 0;
          this.y = typeof y === 'number' ? y : 0;
          this.half = typeof half === 'number' ? half : 0;
          this.left = function() {
            return this.x - this.half;
          };
          this.top = function() {
            return this.y - this.half;
          };
          this.width = function() {
            return this.half * 2;
          };
          this.height = function() {
            return this.half * 2;
          };
          this.centerX = function() {
            return this.x;
          };
          this.centerY = function() {
            return this.y;
          };
          this.contains = function(x, y) {
            var half = this.half;
            return this.x - half <= x && x < this.x + half &&
                   this.y - half <= y && y < this.y + half;
          };
      };

      function TreeNode(bounds) {
        this.bounds = bounds;
        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;
        this.items = null;

        this.subdivide = function(){
          var bounds = this.bounds;
          var quarter = bounds.half/2;
          this.nw = new TreeNode(new Bounds(bounds.x - quarter, bounds.y - quarter, quarter));
          this.ne = new TreeNode(new Bounds(bounds.x + quarter, bounds.y - quarter, quarter));
          this.sw = new TreeNode(new Bounds(bounds.x - quarter, bounds.y + quarter, quarter));
          this.se = new TreeNode(new Bounds(bounds.x + quarter, bounds.y + quarter, quarter));
        };

        this.insert = function(idx, array) {
          var isLeaf = this.nw === null;
          if (isLeaf) {
            if (this.items === null) {
              this.items = [idx];
            } else {
              this.items.push(idx);
            }
            if (this.items.length >= 4) {
              this.subdivide();
              for (var i = 0; i < this.items.length; ++i) {
                this.insert(this.items[i], array);
              }
              this.items = null;
            }
          } else {
            var x = array[idx], y = array[idx + 1];
            var bounds = this.bounds;
            var quadIdx = 0; 
            if (x > bounds.x) {
              quadIdx += 1; 
            }
            if (y > bounds.y) {
              quadIdx += 2; 
            }
            var child = getChild(this, quadIdx);
            child.insert(idx, array);
          }
        };

        this.visit = function(cb) {
          if (cb(this) && this.nw) {
            this.nw.visit(cb);
            this.ne.visit(cb);
            this.sw.visit(cb);
            this.se.visit(cb);
          }
        };

        this.query = function(bounds, results, sourceArray, intersects) {
          if (!intersects(this.bounds, bounds)) return;
          var items = this.items;
          if (items) {
            for (var i = 0; i < items.length; ++i) {
              var idx = items[i];
              var x = sourceArray[idx];
              var y = sourceArray[idx + 1];
              if (bounds.contains(x, y)) {
                results.push(idx);
              }
            }
          }
          if (!this.nw) return;
          this.nw.query(bounds, results, sourceArray, intersects);
          this.ne.query(bounds, results, sourceArray, intersects);
          this.sw.query(bounds, results, sourceArray, intersects);
          this.se.query(bounds, results, sourceArray, intersects);
        };

        function getChild(node, idx) {
          if (idx === 0) return node.nw;
          if (idx === 1) return node.ne;
          if (idx === 2) return node.sw;
          if (idx === 3) return node.se;
        };

        function intersects(a, b) {
          return a.x - a.half < b.x + b.half &&
              a.x + a.half > b.x - b.half &&
              a.y - a.half < b.y + b.half &&
              a.y + a.half > b.y - b.half;
        };
      };
  };

  var TypeGatherLayout = function(nodes,links){
    this.nodes = nodes;
    this.links = links;

    this.SPEED_DIVISOR = 800;
    this.AREA_MULTIPLICATOR = 100000;
    this.area = 2;
    this.speed = 5;
    this.inited=false;
  };

  TypeGatherLayout.prototype.getConfig = function(){
    var self = this;
    return [
      {'label':'间距','area':self.area},
      {'label':'移动速度','speed':self.speed}
    ];
  };

  TypeGatherLayout.prototype.resetConfig = function(layoutConfig){
    this.initAlgo();
    if(layoutConfig){
      this.area = Number(layoutConfig['area']) || 2;
      this.speed = Number(layoutConfig['speed']) || 5;
    }
  };
  
  TypeGatherLayout.prototype.initAlgo = function(){
      var self = this;
      this.area = 10000;
      this.speed = 5;
       
      this.nodes.forEach(function(n){
        n.layoutData = self.newLayoutData();
      });

      this.maxDisplace = (Math.sqrt(self.AREA_MULTIPLICATOR * self.area) / 10);                   
      this.k = Math.sqrt((self.AREA_MULTIPLICATOR * self.area) / (1 + self.nodes.length));
      this.inited=true;
  };

  TypeGatherLayout.prototype.runLayout = function(){
      if(this.inited){
        this.goAlgo();
      }
  };
  
  TypeGatherLayout.prototype.goAlgo = function(){
      var self = this;

      self.repulsiveForce();
      self.attractiveForce();
      self.sameTypeAttractive();
      self.resetNodePosition();
  };

  TypeGatherLayout.prototype.repulsiveForce = function(){
      var self = this;
      self.nodes.forEach(function(N1,i){          
          self.nodes.forEach(function(N2,j){
            if(i != j){
              var xDist = N1.x - N2.x;
              var yDist = N1.y - N2.y;
              var dist = Math.sqrt(xDist * xDist + yDist * yDist);
              
              if(dist > 0){
                var repulsiveF = self.k * self.k /dist;
                var layoutData = N1.layoutData;
                
                layoutData.dx += (xDist /dist * repulsiveF *0.01);
                layoutData.dy += (yDist /dist * repulsiveF *0.01);
              }
            }
          });
      });
  };

  TypeGatherLayout.prototype.attractiveForce = function(){
      var self = this;
      self.links.forEach(function(E){
        var Nf = E.source;
        var Nt = E.target;
        
        var xDist = Nf.x - Nt.x;
        var yDist = Nf.y - Nt.y;
        
        var dist = Math.sqrt(xDist * xDist + yDist * yDist);
        var attractiveF = dist * dist / self.k;
        
        if(dist > 0){
          var sourceLayoutData = Nf.layoutData;
          var targetLayoutData = Nt.layoutData;
          
          sourceLayoutData.dx -= (xDist / dist * attractiveF);
          sourceLayoutData.dy -= (yDist / dist * attractiveF);
          targetLayoutData.dx += (xDist / dist * attractiveF);
          targetLayoutData.dy += (yDist / dist * attractiveF);
        }
      });
  };

  TypeGatherLayout.prototype.sameTypeAttractive = function(){
      var self = this;
      self.nodes.forEach(function(N1,i){          
          self.nodes.forEach(function(N2,j){
            if(i != j && N1.cluster == N2.cluster){
                
              var xDist = N1.x - N2.x;
              var yDist = N1.y - N2.y;
              var dist = Math.sqrt(xDist * xDist + yDist * yDist);

              if(dist > 0){
                var attractiveF = dist * dist / self.k;
                var sourceLayoutData = N1.layoutData;
                var targetLayoutData = N2.layoutData;
                
                sourceLayoutData.dx -= xDist / dist * attractiveF;
                sourceLayoutData.dy -= yDist / dist * attractiveF;
                targetLayoutData.dx += xDist / dist * attractiveF;
                targetLayoutData.dy += yDist / dist * attractiveF;
              }
            }
          });
      });
  };

  TypeGatherLayout.prototype.resetNodePosition = function(){
      var self = this;

      self.nodes.forEach(function(node){
          node.layoutData.dx *= self.speed / self.SPEED_DIVISOR;
          node.layoutData.dy *= self.speed / self.SPEED_DIVISOR;

          var layoutData = node.layoutData;
          var xDist = layoutData.dx;
          var yDist = layoutData.dy;
          var dist = Math.sqrt(layoutData.dx * layoutData.dx + layoutData.dy * layoutData.dy);
          if (dist > 0 && !node.fixed) {
              var limitedDist = Math.min(self.maxDisplace * (self.speed / self.SPEED_DIVISOR), dist);
              node.x = (node.x + xDist / dist * limitedDist);
              node.y = (node.y + yDist / dist * limitedDist);
          }
      });
  };

  TypeGatherLayout.prototype.newLayoutData = function(){
    var layoutData = {
      dx:0.0,
      dy:0.0
    };
    return layoutData;
  };

  var layoutFac = function(_graph,config){
    if(!_graph || _graph == null){
      return;
    }
    this.config=config||{};
    this.graph = {
      nodes :_graph.nodes || [],
      links :_graph.links || []
    };
  };
  
  layoutFac.prototype.createLayout = function(layoutType){
    if(layoutType == null){
      return null;
    }
    return this.getLayout(layoutType);
  };

  layoutFac.prototype.getLayout = function(layoutType,configs){
    var _self = this;
    var nodes = _self.graph.nodes || [];
    var links = _self.graph.links || [];
    var layout;
    switch(layoutType){
      case "concentric": layout = new ConcentricLayout(nodes,links);break;
      case "singleCirlce": layout = new CircleLayout(nodes,links);break;
      case "dualCirlce":layout = new DualCircleLayout(nodes,links);break;
      case "layerCircle": layout = new LayerLayout(nodes,links);break;
      case "fr": layout = new FRlayout(nodes,links);break;
      case "fastFR": layout = new ForceD3Layout(nodes,links);break;
      case "frDirect": layout = new ForceDirected(nodes,links);break;
      case "fruchtermanReingold": layout = new FruchtermanReingoldLayout(nodes,links);break;
      case "spring2": layout = new SpringLayout2(nodes,links);break;
      case "kk": layout = new KKLayout(nodes,links);break;
      case "arf": layout = new ARFLayout(nodes,links);break;
      case "tree": layout = new TreeLayout(nodes,links);break;
      case "radiatree": layout = new RadiaTreeLayout(nodes,links);break;
      case "balloon": layout = new BalloonLayout(nodes,links);break;
      case "noverlap": layout = new AvoidOverlapLayout(nodes,links);break;
      case "sphere": layout = new  SphereLayout(nodes,links);break;
      case "layered": layout = new LayeredLayout(nodes,links);break;
      case "topoCircle": layout = new TopoTreeLayout(nodes,links);break;
      case "hubsize": layout = new HierarchicalLayout(nodes,links);break;
      case "hive": layout = new HiveLayout(nodes,links);break;
      case "scale": layout = new ScaleLayout(nodes,links,1);break;
      case "rotate": layout = new RotateLayout(nodes,links,0);break;
      case "grid": layout = new GirdLayout(nodes,links);break;
      case "gather": layout = new TypeGatherLayout(nodes,links);break;
      default:break;
    }
    if(!layout){
      return null;
    }
    return layout;
  };
    
  var LayoutFactory = layoutFac;
  if (typeof module !== 'undefined' && typeof exports === 'object') {
      module.exports = LayoutFactory;
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
      define(function() { return LayoutFactory; });
  } else {
      this.LayoutFactory = LayoutFactory;
  }
}).call(this || (typeof window !== 'undefined' ? window : global));
