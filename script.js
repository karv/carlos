const BANDO_JUGADOR='blue';
const CELL_BORDER_COLOR='black';
const CELL_BORDER_WIDTH=1;
const DIAMETRO_MINIMO_UNIDAD=18;
const HEIGHT=480;
const HEIGHT_MANO=480;
const HEIGHT_TABLERO=480;
const PADDING=2;
const STYLESHEET=document.createElement('style');
const TAMAÑO_MANO=5;
const TAMAÑO_MINIMO_CELL=DIAMETRO_MINIMO_UNIDAD+(PADDING+CELL_BORDER_WIDTH)*2
const TIPOS_DE_UNIDADES=[
	{nombre:'vacio'},
	{nombre:'test', ataque:3, movimiento:5, vida:10, lealtad:10, rango:1, curar:1, image:'http://vignette2.wikia.nocookie.net/about-stick-war-game/images/a/a9/Stick_Swordwrath.jpg/revision/latest/scale-to-width-down/440?cb=20130402214823'}
];
const WIDTH=320;
const WIDTH_MANO=54;
const WIDTH_TABLERO=WIDTH-WIDTH_MANO;

const PROPIEDADES_CARTAS={
	BACKSIDE:'https://rfclipart.com/image/big/ce-7c-03/pattern-on-backside-of-playing-card-Download-Royalty-free-Vector-File-EPS-89501.jpg',
	HEIGHT:(WIDTH_MANO-PADDING*2)*1.5,
	WIDTH:WIDTH_MANO-PADDING*2
}
const MAX_WIDTH=Math.floor(WIDTH_TABLERO/(TAMAÑO_MINIMO_CELL));
const MAX_HEIGHT=Math.floor(HEIGHT_TABLERO/(TAMAÑO_MINIMO_CELL));

var accion; //esto lo tengo que arreglar, pero por ahora sirve
var ladoCelda;
var manos;
var mazos;
var turno;
var unidades;
var unidadSeleccionada;

function onload(){
	document.body.style.width=WIDTH+'px';
	document.body.style.height=HEIGHT+'px';
	document.head.appendChild(STYLESHEET);
	for(var i=1; i<=MAX_WIDTH; i+=2){
		var option=document.createElement('option');
		option.innerText=i;
		document.getElementById('selectColumnas').appendChild(option);
	}
	for(i=2; i<=MAX_HEIGHT; i++){
		option=document.createElement('option');
		option.innerText=i;
		document.getElementById('selectFilas').appendChild(option);
	}
	document.getElementById('botonJugar').addEventListener('click', function(){mostrar(document.getElementById('opcionesPreviasAlJuego'))});
	document.getElementById('botonComenzarPartida').addEventListener('click', comenzarPartida);
	STYLESHEET.innerHTML=
		'#mano{'+
		'	height:'+HEIGHT_MANO+'px;'+
		'	width:'+WIDTH_MANO+'px;'+
		'}'+
		'.mazo, .carta{'+
		'	background-image: url('+PROPIEDADES_CARTAS.BACKSIDE+');'+
		'	height:'+PROPIEDADES_CARTAS.HEIGHT+'px;'+
		'	left:'+PADDING+'px;'+
		'	line-height:'+PROPIEDADES_CARTAS.HEIGHT+'px;'+
		'	width:'+PROPIEDADES_CARTAS.WIDTH+'px;'+
		'}'+
		'@keyframes red{'+
		'	0%   {border: '+PADDING+'px solid #ff0000;}'+
		'	50%  {border: '+PADDING+'px solid #ff7f7f;}'+
		'	100% {border: '+PADDING+'px solid #ff0000;}'+
		'}'+
		'@keyframes blue{'+
		'	0%   {border: '+PADDING+'px solid #0000ff;}'+
		'	50%  {border: '+PADDING+'px solid #7f7fff;}'+
		'	100% {border: '+PADDING+'px solid #0000ff;}'+
		'}';
	for(var i=0; i<=1; i++){
		var mazo=document.createElement('div');
		mazo.className='mazo';
		mazo.style.top=HEIGHT_MANO/2+(i?-PROPIEDADES_CARTAS.HEIGHT-PADDING:PADDING)+'px';
		document.getElementById('mano').appendChild(mazo);
	}
	for(var i=0; i<TAMAÑO_MANO; i++){
		var divEnemigo=document.createElement('div');
		var divJugador=document.createElement('div');
		divEnemigo.className='red';
		divEnemigo.style.position=divJugador.style.position='absolute';
		divEnemigo.style.top=PADDING+i*20+'px';
		divEnemigo.style.zIndex=divEnemigo.baseZIndex=i;
		divJugador.className=BANDO_JUGADOR;
		divJugador.onmouseout=onmouseoutCarta;
		divJugador.onmouseover=onmouseoverCarta;
		divJugador.style.bottom=PROPIEDADES_CARTAS.HEIGHT+PADDING+i*20+'px';
		divJugador.style.zIndex=divJugador.baseZIndex=8-i;
		document.getElementById('mano').appendChild(divEnemigo);
		document.getElementById('mano').appendChild(divJugador);
	}
}

function onmouseoverCarta(){
	this.style.zIndex=9;
}

function onmouseoutCarta(){
	this.style.zIndex=this.baseZIndex;
}

function mostrar(elementoDelBody){
	for(var i=document.body.children.length-1; i>=0; i--) document.body.children[i].style.display='none';
	elementoDelBody.style.display=null;
}

function Unidad(tipo, x, y, bando){
	this.ataque=tipo.ataque;
	this.bando=bando;
	this.image=tipo.image;
	this.lealtad=tipo.lealtad;
	this.movimiento=tipo.movimiento;
	this.nombre=tipo.nombre;
	this.rango=tipo.rango
	this.vida=tipo.vida;
	this.vidaMax=tipo.vida;
	this.x=x;
	this.y=y;
}

function redimensionarTablero(width, height){
	const TABLERO=document.getElementById('tablero');
	const CTX=TABLERO.getContext('2d');
	CTX.strokeStyle=CELL_BORDER_COLOR;
	ladoCelda=Math.min(Math.floor(WIDTH_TABLERO/width), Math.floor(HEIGHT_TABLERO/height));
	TABLERO.width=ladoCelda*width;
	TABLERO.height=ladoCelda*height;
	unidades=[]
	for(var i=0; i<height; i++){
		unidades.push([])
		for(var j=0; j<width; j++){
			if(i===0) unidades[i].push(new Unidad(TIPOS_DE_UNIDADES[1], j, i, 'red'));
			else if(i===height-1) unidades[i].push(new Unidad(TIPOS_DE_UNIDADES[1], j, i, BANDO_JUGADOR));
			else unidades[i].push(new Unidad(TIPOS_DE_UNIDADES[0], j, i));
			CTX.strokeRect(j*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
		}
	}
}

function shuffle(array) {
	let counter=array.length;
	//while there are elements in the array
	while(counter>0){
		//pick a random index...
		let index=Math.floor(Math.random()*counter);
		//decrease counter by 1
		counter--;
		//and swap the last element with it
		let temp=array[counter];
		array[counter]=array[index];
		array[index]=temp;
	}
	return array;
}

function comenzarPartida(){
	const DIVS_MAZOS=document.getElementsByClassName('mazo');
	redimensionarTablero(document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
	mostrar(document.getElementById('juego'));
	for(var i=unidades.length-1; i>=0; i--){
		for(var j=unidades[i].length-1; j>=0; j--){
			var unidad=unidades[i][j];
			if(unidad.nombre!=='vacio'){
				var div=document.createElement('div');
				unidad.div=div;
				div.unidad=unidad;
				div.className='unidad';
				div.style.left=j*ladoCelda+CELL_BORDER_WIDTH+'px';
				div.style.top=i*ladoCelda+CELL_BORDER_WIDTH-document.getElementById('tablero').height/2+'px';
				div.style.width=ladoCelda-(PADDING+CELL_BORDER_WIDTH)*2+'px';
				div.style.height=ladoCelda-(PADDING+CELL_BORDER_WIDTH)*2+'px';
				div.style.border=PADDING+'px solid '+unidad.bando;
				div.style.backgroundImage='url('+unidad.image+')';
				actualizarTitle(unidad);
				document.getElementById('container').appendChild(div);
			}
		}
	}
	mazos={
		[BANDO_JUGADOR]:shuffle([
			new Carta(mover, BANDO_JUGADOR),
			new Carta(mover, BANDO_JUGADOR),
			new Carta(mover, BANDO_JUGADOR),
			new Carta(mover, BANDO_JUGADOR),
			new Carta(atacar, BANDO_JUGADOR),
			new Carta(atacar, BANDO_JUGADOR),
			new Carta(atacar, BANDO_JUGADOR),
			new Carta(atacar, BANDO_JUGADOR),
			new Carta(atacar, BANDO_JUGADOR)
		]),
		red:shuffle([
			new Carta(mover, 'red'),
			new Carta(mover, 'red'),
			new Carta(mover, 'red'),
			new Carta(atacar, 'red'),
			new Carta(atacar, 'red'),
			new Carta(atacar, 'red'),
			new Carta(atacar, 'red'),
			new Carta(atacar, 'red')
		])
	};
	manos={[BANDO_JUGADOR]:[], red:[]};
	DIVS_MAZOS[0].innerHTML='<span class="cantidadDeCartas">'+mazos[BANDO_JUGADOR].length+'</span>';
	DIVS_MAZOS[1].innerHTML='<span class="cantidadDeCartas">'+mazos.red.length+'</span>';
	for(i=0; i<TAMAÑO_MANO; i++){
		levantarCarta(BANDO_JUGADOR);
		levantarCarta('red');
	}
	turno=BANDO_JUGADOR;
}

function activarSeleccionDeTerreno(){
	const TABLERO=document.getElementById('tablero');
	const CTX=TABLERO.getContext('2d');
	var row;
	var unidad;
	if(accion===mover){
		var celdas=new Set();
		CTX.fillStyle='rgba(255, 255, 255, 0.5)';
		for(var i=unidadSeleccionada.x+1; i<=unidadSeleccionada.x+unidadSeleccionada.movimiento; i++){
			unidad=unidades[unidadSeleccionada.y][i];
			if(!unidad||unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(i*ladoCelda, unidadSeleccionada.y*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		for(i=unidadSeleccionada.x-1; unidadSeleccionada.x-unidadSeleccionada.movimiento<=i; i--){
			unidad=unidades[unidadSeleccionada.y][i];
			if(!unidad||unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(i*ladoCelda, unidadSeleccionada.y*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		for(i=unidadSeleccionada.y+1; i<=unidadSeleccionada.y+unidadSeleccionada.movimiento; i++){
			if(row=unidades[i]) unidad=row[unidadSeleccionada.x];
			else break;
			if(unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(unidadSeleccionada.x*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		for(var i=unidadSeleccionada.y-1; unidadSeleccionada.y-unidadSeleccionada.movimiento<=i; i--){
			if(row=unidades[i]) unidad=row[unidadSeleccionada.x];
			else break;
			if(unidad.nombre==='vacio'){
				celdas.add(unidad);
				CTX.fillRect(unidadSeleccionada.x*ladoCelda, i*ladoCelda, ladoCelda, ladoCelda);
			}
			else break;
		}
		TABLERO.onclick=function(event){
			const x=Math.floor((event.clientX-this.offsetLeft)/ladoCelda);
			const y=Math.floor((event.clientY-this.offsetTop)/ladoCelda);
			if(celdas.has(unidades[y][x])) moverA(x, y);
		}
	}
}

function activarSeleccionDeUnidades(funcion){
	for(var i=unidades.length-1; i>=0; i--){
		for(var j=unidades[i].length-1; j>=0; j--){
			var unidad=unidades[i][j];
			if(funcion(unidad)&&unidad.nombre!=='vacio'){
				unidad.div.style.animation=unidad.bando+' 2s infinite linear';
				unidad.div.onclick=function(){
					for(var i=unidades.length-1; i>=0; i--){
						for(var j=unidades[i].length-1; j>=0; j--){
							var unidad=unidades[i][j];
							if(unidad.nombre!=='vacio'){
								unidad.div.style.animation=null;
								unidad.div.onclick=null;
							}
						}
					}
					document.getElementById('tablero').onclick=null;
					if(unidadSeleccionada===null){
						unidadSeleccionada=this.unidad; //esto lo tengo que arreglar, pero por ahora sirve
						if(accion===mover) activarSeleccionDeTerreno();
						else if(accion===atacar) activarSeleccionDeUnidades(function(unidad){return unidad.bando!==BANDO_JUGADOR&&Math.pow(unidad.x-unidadSeleccionada.x, 2)+Math.pow(unidad.y-unidadSeleccionada.y, 2)<=Math.pow(unidadSeleccionada.rango, 2);});
					}
					else{
						unidad=this.unidad;
						if(accion===atacar){
							remove(cartaSeleccionada);
							unidad.vida-=unidadSeleccionada.ataque;
							if(unidad.vida<=0){
								unidad.div.remove();
								unidades[unidad.y][unidad.x]=new Unidad(TIPOS_DE_UNIDADES[0], unidad.x, unidad.y);
							}
							else actualizarTitle(unidad);
						}
					}
				}
			}
		}
	}
}

function mover(){
	activarSeleccionDeUnidades(function(unidad){return unidad.movimiento>0&&unidad.bando===BANDO_JUGADOR;});
}

function moverA(x, y){
	//borro los cosos blancos que marcan a donde te podés mover
	var temp=unidades;
	redimensionarTablero(document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
	unidades=temp;
	//muevo el elemento
	unidadSeleccionada.div.style.left=x*ladoCelda+CELL_BORDER_WIDTH+'px';
	unidadSeleccionada.div.style.top=y*ladoCelda+CELL_BORDER_WIDTH-document.getElementById('tablero').height/2+'px';
	//actualizo el array unidades
	unidades[unidadSeleccionada.y][unidadSeleccionada.x]=new Unidad(TIPOS_DE_UNIDADES[0], unidadSeleccionada.x, unidadSeleccionada.y);
	unidades[y][x]=unidadSeleccionada;
	//actualizo a la unidadSeleccionada
	unidadSeleccionada.x=x;
	unidadSeleccionada.y=y;
	remove(cartaSeleccionada);
}

function remove(carta){
	manos[BANDO_JUGADOR].splice(manos[BANDO_JUGADOR].indexOf(carta), 1);
	manos['red'].splice(manos['red'].indexOf(carta), 1);
	carta.remove();
	levantarCarta(turno);
}

function pocionDeVida(){
	
}

function atacar(){
	activarSeleccionDeUnidades(function(unidad){return unidad.ataque>0&&unidad.bando===BANDO_JUGADOR;});
}

function Carta(funcion, bando){
	var onclick=funcion;
	this.div=document.createElement('div');
	this.div.onclick=function(){
		if(turno===BANDO_JUGADOR){
			accion=onclick;
			cartaSeleccionada=this;
			unidadSeleccionada=null; //esto lo tengo que arreglar, pero por ahora sirve
			for(var i=unidades.length-1; i>=0; i--){
				for(var j=unidades[i].length-1; j>=0; j--){
					var unidad=unidades[i][j];
					if(unidad.nombre!=='vacio'){
						unidad.div.style.animation=null;
						unidad.div.onclick=null;
					}
				}
			}
			document.getElementById('tablero').onclick=null;
			var temp=unidades;
			redimensionarTablero(document.getElementById('selectColumnas').value, document.getElementById('selectFilas').value);
			unidades=temp;
			onclick()
		}
	};
	this.div.className='carta';
	this.div.objeto=this;
	switch(funcion){
		case mover:
			this.div.style.backgroundImage='url(https://www.educima.com/imagen-caminar-dm14822.jpg)';
			this.div.title='Moves a unit a number of cells equal to the unit\'s movement stat, in a vertical or horizontal line.'
			break;
		case atacar:
			this.div.style.backgroundImage='url(http://misdibujos.de/wp-content/uploads/2015/12/dibujos-de-espadas-4.jpg)';
			this.div.title='Attacks an enemy with one of your units. The damage done is equal to your unit\'s attack stat. The enemy must be in your unit\'s range.'
			break;
		default:
			this.div.style.backgroundImage='url(http://identifyla.lsu.edu/peopleimages/noimage.jpg)';
			this.div.title='Unknown card.'
			break;
	}
	if(bando!==BANDO_JUGADOR){
		this.div.style.backgroundImage='url('+PROPIEDADES_CARTAS.BACKSIDE+')';
		this.div.title='';
		this.div.onclick=null;
	}
	this.bando=bando;
}

function actualizarTitle(unidad){
	unidad.div.title=
		unidad.nombre+'\n'+
		'Life: '+unidad.vida+'/'+unidad.vidaMax+'\n'+
		'Loyalty: '+unidad.lealtad+'\n'+
		'Attack: '+unidad.ataque+'\n'+
		'Range: '+unidad.rango+'\n'+
		'Movement: '+unidad.movimiento+'\n';
}

function levantarCarta(bando){
	const DIV_MAZO=document.getElementsByClassName('mazo')[bando===BANDO_JUGADOR?0:1];
	if(DIV_MAZO.innerText>0){
		const mazo=mazos[bando];
		if(mazo.length){
			const carta=mazo.pop().div;
			document.getElementById('mano').appendChild(carta);
			manos[bando].push(carta);
		}
		DIV_MAZO.innerHTML='<span class="cantidadDeCartas">'+mazos[bando].length+'</span>';
	}
	//una función poco obvia de la siguiente línea es ordenar las cartas
	for(var i=0; i<manos[bando].length; i++) document.getElementsByClassName(bando)[i].appendChild(manos[bando][i]);
	//turno=turno===BANDO_JUGADOR?'red':BANDO_JUGADOR;
}

window.addEventListener('load', onload);