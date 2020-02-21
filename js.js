li=require('http')
prl=require("url")
file=require("fs")
pres=JSON.parse(file.readFileSync("pres.json"))
trps=JSON.parse(file.readFileSync("troops.json"))
wh=[1500,1500];
buildings=[]
entities=[]
players=[]
setInterval(f,50/3)
dtps=Math.pow(2,1/60)
kv=0
class building{
	constructor(x,y,w,h,ro,ty,r,fr,pla,up,sho,nam,hp,nlevs,cosa,cosb,troops,uptrp){//18 parameters
		this.id="B"+buildings.length
		this.pos=[x,y]
		this.size=[w,h]
		this.rot=ro
		this.radius=r//Attack radius
		this.fra=fr//Fire rate in seconds
		this.tmr=0
		this.player=pla
		this.upd=up||(()=>{})
		this.ty=ty
		this.type=ty
		this.name=nam
		this.shoot=sho||(()=>{})
		this.hp=hp||1000
		this.maxhp=this.hp
		this.level=1
		this.numlevels=nlevs
		this.cost=[cosa,cosb]
		this.troops=troops
		this.uptrp=uptrp
		buildings.push(this)
	}
	inrange(x,y){
		var f=[x-this.pos[0]-this.size[0]/2,y-this.pos[1]-this.size[1]/2]
		return (f[0]*f[0]+f[1]*f[1])<(this.radius*this.radius)
	}
	
	update(){
		this.upd()
		var sents=entities.filter((a)=>this.inrange(a.pos[0],a.pos[1])&&a.constructor.name!="bullet"&&a.hasOwnProperty("player")&&a.player!=this.player)
		sents.sort((ena,enb)=>{
			var f=[ena.pos[0]-this.pos[0]-this.size[0]/2,ena.pos[1]-this.pos[1]-this.size[1]/2]
			var g=[enb.pos[0]-this.pos[0]-this.size[0]/2,enb.pos[1]-this.pos[1]-this.size[1]/2]
			return (g[0]*g[0]+g[1]*g[1])-(f[0]*f[0]+f[1]*f[1])
		})
		if(sents.length>0&&this.tmr>=this.fra){
			var ent=sents[sents.length-1]
			eval("("+this.shoot+")").bind(this)(ent)
			this.tmr=0
		}
		this.tmr+=1/60
		if(this.hp<=0){
			console.log("to remove")
			this.remove()
		}
	}
	
	upgrade(){
		console.log("upgrade")
		var allc=pres.find((el)=>(el[0].type===this.ty))[this.level]
		console.log(JSON.stringify(allc))
		try{
			for(i in allc){
				console.log(i,allc[i])
				if(["shoot","update"].includes(i)){
					this[i]=Function.apply(null,allc[i])
				}else{
					this[i]=allc[i]
				}
			}
		}catch(err){
			console.log("err")
		}
		this.level+=1
	}
	remove(){
		console.log("remove",this)
		buildings.splice(this.id.slice(1),1)
		for(i=0;i<buildings.length;i++){
			buildings[i].id="B"+i
		}
	}
	upd(){}
	shoot(en){}
}
class entity{
	constructor(x,y,velx,vely,rot){
		this.id="E"+entities.length
		this.pos=[x,y]
		this.vel=[velx,vely]
		this.rot=rot||0
	}
    update(){
		this.vel[0]/=dtps
		this.vel[1]/=dtps
		this.pos[0]+=this.vel[0]/60
		this.pos[1]+=this.vel[1]/60
	}
	remove(){
		console.log("remove",this)
		entities.splice(this.id.slice(1),1)
		for(i=0;i<entities.length;i++){
			entities[i].id="E"+i
		}
	}
}
class troop extends entity{
	constructor(x,y,ro,ty,r,fr,pla,ai,nam,hp,levs,size){
		super(x,y,0,0,ro)
		this.atr=r//Attack range
		this.fir=fr//Fire rate (number of frames before shooting)
		this.frt=fr
		this.player=pla
		this.nlevs=levs
		this.level=1
		this.type=ty
		this.ty=ty
		this.size=[size,size]
		this.hp=hp
		this.maxhp=hp
		this.ai=ai
	}
	update(){
		super.update()
		this.frt=this.frt?(this.frt-1):0
		eval("("+this.ai+")").bind(this)(buildings,entities)
		if(this.hp<=0){
			this.remove()
		}
	}
}
class collectible extends entity{
	constructor(x,y,tor){
		super(x,y,0,0)
		this.type="coll"+tor
	}
}
class bullet extends entity{
	constructor(x,y,vx,vy,type,plr,dmg){
		super(x,y,vx,vy)
		this.type=type
		this.player=plr
		this.size=[1,1]
		this.tmr=5
		this.damage=dmg||50
	}
	update(){
		this.pos[0]+=this.vel[0]/60
		this.pos[1]+=this.vel[1]/60
		var es=buildings.concat(entities).filter((n)=>{
			if(n.constructor.name=="bullet"||n.type.slice(0,4)=="coll"){
				return false
			}
			let thx=this.pos[0]+this.size[0]/2
			let thy=this.pos[1]+this.size[1]/2/*
			let tthx=thx-n.pos[0]-n.size[0]/2
			let tthy=thy-n.pos[1]-n.size[1]/2
			tthx=Math.cos(-n.rot)*tthx+Math.sin(-n.rot)*tthy
			tthy=-Math.sin(-n.rot)*tthx+Math.cos(-n.rot)*tthy
			tthx+=n.pos[0]+n.size[0]/2
			tthy+=n.pos[0]+n.size[0]/2*/
			let eb=[n.pos[0],n.pos[1],n.pos[0]+n.size[0],n.pos[1]+n.size[1]]
			return thx>eb[0]&&thy>eb[1]&&thx<eb[2]&&thy<eb[3]&&n.player.id!=this.player.id
		})
		for(var el of es){
			console.log("bullet touch",el)
			if(el.constructor.name=="troop"){
				console.log("troop tested")
			}
			let k=el.id.slice(1)
			if(el.id[0]=="E"){
				entities[k].hp-=this.damage
			}else{
				buildings[k].hp-=this.damage
			}
		}
		if(es.length){
			this.remove()
		}
		this.tmr-=1/60
		if(this.tmr<=0){
			this.remove()
		}
		
	}
}
function f(){
	for(i of buildings){
		i.update()
	}
	for(i of entities){
		i.update()
	}
	if(Math.random()<1/10&&entities.length<100){//Every 1/6 seconds
		entities.push(new collectible(Math.random()*wh[0],Math.random()*wh[1],Math.floor(Math.random()*2)))
	}
}
function rp(n,m){
	 g={}
	 for(i in m){
	 	g[i]=n
	 }
	 return g
}
randcol=()=>"#"+Math.floor(Math.random()*16777216).toString(16).padStart(6,"0")
randhsl=(s,l,ht)=>"hsl("+Math.random()*(ht||360)+","+(s||100)+"%,"+(l||50)+"%)"
li.createServer(function(r, e){
	datawr={}
	ur=r.url
	e.writeHead(200,{'Content-Type':'application/json',"Access-Control-Allow-Origin":"*"})
	parurl=prl.parse(ur,true)
	pardat=JSON.parse(parurl.query.data)
	spla=players.slice()
	spla.sort((a,b)=>(b.score-a.score))
	switch(parurl.pathname){
		case "/join":
			kv+=1
			console.log(kv)
			id=players.push({"name":pardat.name||"Anonymous",
			"id":players.length,
			"fill":randhsl(80,45,240),
			"stroke":randhsl(80,35,240),
			"score":0,
			"resources":[0,0],
			"placed":false,
			"trlev":rp(1,trps),
			"left":false
			})-1
			datawr=Object.assign({"id":id},datawr)
			break
		case "/getdata":
			g=pardat.collect
			if(g){
				gid=parseInt(g.slice(1))
				ty=entities[gid].type
				players[pardat.id].resources[ty[ty.length-1]]+=10
				entities.splice(gid,1)
				for(i=0;i<entities.length;i++){
					entities[i].id="E"+i
				}
				players[pardat.id].score+=1
			}
			bui=pardat.build
			if(bui){
				if((players[pardat.id].resources[0]>=bui.cost[0])&&(players[pardat.id].resources[1]>=bui.cost[1])){
					val=true
					for(i of buildings){
						xdf=bui.pos[0]-i.pos[0]
						ydf=bui.pos[1]-i.pos[1]
						if(xdf>-bui.size[0]&&xdf<i.size[0]&&ydf>-bui.size[1]&&ydf<i.size[1])val=false
					}
					if(val){
						new building(bui.pos[0],bui.pos[1],bui.size[0],bui.size[1],bui.rot,bui.type,bui.radius,bui.fra,players[pardat.id],Function.apply(undefined,bui.upd),Function.apply(undefined,bui.shoot),bui.name,bui.hp,bui.levs,bui.cost[0],bui.cost[1],bui.troops,bui.uptrp)
						players[pardat.id].resources[0]-=bui.cost[0]
						players[pardat.id].resources[1]-=bui.cost[1]
						players[pardat.id].placed=true
					}
				}
			}
			upgr=pardat.upgrade
			if(upgr){
				bui=buildings[upgr.slice(1)]
				if(bui.player.id==pardat.id){
					console.log(bui)
					ttm=pres.find((x)=>(x[0].type==bui.ty))[bui.level]
					if((players[pardat.id].resources[0]>=ttm.cost[0])&&(players[pardat.id].resources[1]>=ttm.cost[1])){
						bui.upgrade()
						players[pardat.id].resources[0]-=ttm.cost[0]
						players[pardat.id].resources[1]-=ttm.cost[1]
					}
				}
			}
			sell=pardat.sell
			if(sell){
				bui=buildings[sell.slice(1)]
				console.log(sell)
				bui.remove()
				players[pardat.id].resources[0]+=3*bui.cost[0]/4
				players[pardat.id].resources[1]+=3*bui.cost[1]/4
			}
			trp=pardat.troop
			if(trp){
				if(players[pardat.id].resources[0]>=trp.cost[0]&&players[pardat.id].resources[1]>=trp.cost[1]){
					entities.push(new troop(trp.pos[0],trp.pos[1],Math.random()*360,trp.type,trp.radius,trp.fr,players[pardat.id],Function.apply(null,trp.ai),trp.name,trp.hp,trp.levs,trp.size))
					players[pardat.id].resources[0]-=trp.cost[0]
					players[pardat.id].resources[1]-=trp.cost[1]
				}
				console.log(entities[entities.length-1])
			}
			uptp=pardat.uptrp
			if(uptp){
				ttp=trps[uptp][players[pardat.id].trlev[uptp]]
				cst=ttp.cost
				if(players[pardat.id].resources[0]>=cst[0]&&players[pardat.id].resources[1]>=cst[1]){
					players[pardat.id].trlev[uptp]++
					players[pardat.id].resources[0]-=cst[0]
					players[pardat.id].resources[1]-=cst[1]
				}
			}	
			break
		case "/leave":
			console.log("/leave")
			players[pardat.id].left=true
	}
	datawr=Object.assign(
	{"buildings":buildings,
	"entities":entities.map(a=>{a.type=a.type?a.type:a.__proto__.constructor.name;return a}),
	"players":players,
	"bounds":wh,
	"presets":pres,
	"trps":trps,
	"playerss":spla
	},datawr)
	e.write(JSON.stringify(datawr))
	e.end()
}).listen(8080); //Listen on port 8080

