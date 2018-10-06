li=require('http');
prl=require("url")
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
	if(Math.random()<1/10&&ents.length<1000){//Every 1/6 seconds
		ents.push(new collectible(Math.random()*wh[0]*1/25,Math.random()*wh[1]*1/25,Math.floor(Math.random()*2)))
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
			console.log("Join",da,parurl.pathname)
			datawr=Object.assign({"id":id},datawr)
			break
		case "/getdata":
			g=pardat.collect
			if(g){
				gid=parseInt(g.slice(1))
				ents=ents.slice(0,gid).concat(ents.slice(gid+1))
				for(i=0;i<ents.length;i++){
					ents[i].id="E"+i
				}
			}
			break
		case "/leave":
			
	}
	datawr=Object.assign(
	{"buildings":buildings,
	"entities":ents.map(a=>{a.type=a.type?a.type:a.__proto__.constructor.name;return a}),
	"players":players,
	"bounds":wh},datawr)
	e.write(JSON.stringify(datawr))
	e.end()
}).listen(8080); //Listen on port 8080