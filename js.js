li=require('http')
prl=require("url")
resa=0
resb=1
wh=[25000,25000];
buildings=[]
entities=[]
players=[]
setInterval(f,50/3)
dtps=Math.pow(2,1/60)
console.log(dtps)
function building(x,y,w,h,ro,ty,r,fr,pla,up,sho,nam){//12 parameters
	this.id="B"+buildings.length
	this.pos=[x,y]
	this.size=[w,h]
	this.rot=ro
	this.radius=r//Attack radius
	this.fra=fr*60//Fire rate in seconds, converted to frames
	this.tmr=0
	this.player=pla
	this.upd=up||(()=>{})
	this.type=ty
	this.name=nam
	this.shoot=sho||(()=>{})
}
building.prototype.inrange=function(x,y){
	f=[x-this.pos[0],y-this.pos[1]]
	return (f[0]*f[0]+f[1]*f[1])<(this.radius*this.radius)
}
building.prototype.update=function(){
	this.upd()
	sents=entities.filter((a)=>this.inrange(a.pos[0],this.pos[1]))
	sents.sort((en)=>{
		f=[en.pos[0]-this.pos[0],en.pos[1]-this.pos[1]]
		return (f[0]*f[0]+f[1]*f[1])
	})
	if(sents.length>0&&this.tmr>=this.fra){
		ent=sents[sents.length-1]
		if(sents.hasOwnProperty("player")||true){
			eval("("+this.shoot+")(ent)")
		}
		this.tmr=0
	}
	this.tmr+=1
}
building.prototype.upd=function(){}
building.prototype.shoot=function(en){}
function entity(x,y,velx,vely){
	this.id="E"+entities.length
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
		this.type="coll"+tor
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
	if(Math.random()<1/10&&entities.length<2500){//Every 1/6 seconds
		entities.push(new collectible(Math.random()*wh[0],Math.random()*wh[1],Math.floor(Math.random()*2)))
	}
}
randcol=()=>"#"+Math.floor(Math.random()*16777216).toString(16).padStart(6,"0")
randhsl=(s,l,ht)=>"hsl("+Math.random()*(ht||360)+","+(s||100)+"%,"+(l||50)+"%)"
getj=(n,from)=>JSON.parse(decodeURIComponent(ur.slice(from+6)))
li.createServer(function(r, e){
	datawr={}
	ur=r.url
	li=["null","http://webgame-isaachew.c9users.io","https://webgame-isaachew.c9users.io"]
	heo=r.headers.origin
	e.writeHead(200,{'Content-Type':'application/json',"Access-Control-Allow-Origin":li.includes(heo)?heo:""})
	parurl=prl.parse(ur,true)
	pardat=JSON.parse(parurl.query.data)
	switch(parurl.pathname){
		case "/join":
			da=pardat
			id=players.push({"name":da.name||"Anonymous",
			"id":players.length,
			"fill":randhsl(100,45,240),
			"stroke":randhsl(100,35,240),
			"score":0
			})-1
			datawr=Object.assign({"id":id},datawr)
			break
		case "/getdata":
			g=pardat.collect
			if(g){
				gid=parseInt(g.slice(1))
				entities=entities.slice(0,gid).concat(entities.slice(gid+1))
				for(i=0;i<entities.length;i++){
					entities[i].id="E"+i
				}
			}
			bui=pardat.build
			if(bui){
				buic=new building(bui.pos[0],bui.pos[1],bui.size[0],bui.size[1],bui.rot,bui.type,bui.radius,bui.fra,players[pardat.id],Function.apply(undefined,bui.update),Function.apply(undefined,bui.shoot),bui.name)
				buildings.push(buic)
			}
			break
		case "/leave":
			
	}
	datawr=Object.assign(
	{"buildings":buildings,
	"entities":entities.map(a=>{a.type=a.type?a.type:a.__proto__.constructor.name;return a}),
	"players":players,
	"bounds":wh},datawr)
	e.write(JSON.stringify(datawr))
	e.end()
}).listen(8080); //Listen on port 8080