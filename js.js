li=require('http');
resa=0
resb=1
wh=[25000,25000];
buildings=[]
ents=[]
players=[]
setInterval(f,16.6666666666)
dtps=Math.pow(2,1/60)
console.log(dtps)
function building(x,y,w,h,r,fr,dps,pla){
  this.id="B"+buildings.length
  this.pos=[x,y]
  this.size=[w,h]
  this.radius=r//Attack radius
  this.fra=fr//Fire rate in seconds
  this.dps=dps//Damage per second
  this.tmr=0
  this.player=pla
}
building.prototype.inrange=function(x,y){
  f=[x-this.pos[0],y-this.pos[1]]
  return (f[0]*f[0]+f[1]*f[1])<(this.radius*this.radius)
}
building.prototype.update=function(){
  for(i in ents){
    if(this.prototype.inrange(i.pos[0],i.pos[1])&&this.tmr>=fra*60){
      this.shoot(i.pos[0],i.pos[1])
      
    }
  }
  this.tmr+=1
}
building.prototype.shoot=function(x,y){}
function entity(x,y,velx,vely){
  this.id="E"+ents.length
  this.pos=[x,y]
  this.vel=[velx,vely]
}
entity.prototype.update=function(){
  this.vel[0]/=dtps
  this.vel[1]/=dtps
  this.pos[0]+=this.vel[0]
  this.pos[1]+=this.vel[1]
}
class troop extends entity{
  constructor(x,y,fr,dps,ar){
    super(x,y,0,0)
    this.atr=ar//Attack range
    this.fir=fr//Fire rate (seconds)
    this.dps=dps//Damage per second
    this.rot=0
    this.player=pla
  }
}
class collectible extends entity{
  constructor(x,y,tor){
    super(x,y,0,0)
    this.tor=tor
    this.rot=0
  }
}
class bullet extends entity{
  constructor(x,y,vx,vy){
    super(x,y,vx,vy)
  }
}
function f(){
  for(i of buildings){
    i.update()
  }
  if(Math.random()<1/10&&ents.length<10000){//Every 1/6 seconds
    ents.push(new collectible(Math.random()*wh[0],Math.random()*wh[1]))
  }
}
li.createServer(function(r, e){
  ur=r.url
  if(ur.slice(0,5)==="/join"){
    console.log("Join")
  }
  e.writeHead(200,{'Content-Type':'application/json',"Access-Control-Allow-Origin":(r.headers.origin||"").slice(0,-30)+"://webgame-isaachew.c9users.io"})
  e.write(JSON.stringify({"buildings":buildings,"entities":ents.map(a=>{a.type=a.type?a.type:a.__proto__.constructor.name;return a}),"players":players,"bounds":wh}))
  e.end()
}).listen(8080); //Listen on port 8080