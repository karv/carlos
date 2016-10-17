const BANDO_JUGADOR='blue';
const CARTAS_POR_COLUMNA=13;
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
const TIPOS_DE_CARTAS=new Set().
	add({
		nombre:'Move',
		funcion:mover,
		tipo:'accion',
		title:'Moves a unit a number of cells equal to the unit\'s movement stat, in a vertical or horizontal line.',
		backgroundImage:'url(https://www.educima.com/imagen-caminar-dm14822.jpg)',
		numeroEnMazo:parseInt(window.localStorage.carlosMoveEnMazo)||4,
		funcionAgregar:function(){return true;},
		funcionSacar:funcionSacar
	}).
	add({
		nombre:'Attack',
		funcion:atacar,
		tipo:'accion',
		title:'Attacks an enemy with one of your units. The damage done is equal to your unit\'s attack stat. The enemy must be in your unit\'s range.',
		backgroundImage:'url(http://misdibujos.de/wp-content/uploads/2015/12/dibujos-de-espadas-4.jpg)',
		numeroEnMazo:parseInt(window.localStorage.carlosAttackEnMazo)||4,
		funcionAgregar:function(){return true;},
		funcionSacar:funcionSacar
	});
const TIPOS_DE_UNIDADES=[
	{nombre:'vacio'},
	{nombre:'test', ataque:3, movimiento:5, vida:10, lealtad:10, rango:1, curar:1, image:'http://vignette2.wikia.nocookie.net/about-stick-war-game/images/a/a9/Stick_Swordwrath.jpg/revision/latest/scale-to-width-down/440?cb=20130402214823'}
];
const WIDTH=320;
const WIDTH_MANO=54;
const WIDTH_TABLERO=WIDTH-WIDTH_MANO;

const MAX_WIDTH=Math.floor(WIDTH_TABLERO/(TAMAÑO_MINIMO_CELL));
const MAX_HEIGHT=Math.floor(HEIGHT_TABLERO/(TAMAÑO_MINIMO_CELL));
const PROPIEDADES_CARTAS={
	BACKSIDE:'https://rfclipart.com/image/big/ce-7c-03/pattern-on-backside-of-playing-card-Download-Royalty-free-Vector-File-EPS-89501.jpg',
	HEIGHT:(WIDTH_MANO-PADDING*2)*1.5,
	VISIBILIDAD:HEIGHT_MANO/24,
	WIDTH:WIDTH_MANO-PADDING*2
}

const CARTAS_POR_FILA=Math.floor((WIDTH-PADDING)/(PROPIEDADES_CARTAS.WIDTH+PADDING));

var accion; //esto lo tengo que arreglar, pero por ahora sirve
var en;
var ladoCelda;
var manos;
var mazos;
var turno;
var unidades;
var unidadSeleccionada;

function onload(){
	const HEIGHT_MAZO=PROPIEDADES_CARTAS.VISIBILIDAD*CARTAS_POR_COLUMNA+PROPIEDADES_CARTAS.HEIGHT+PADDING*2;
	document.getElementById('mazo').style.height=HEIGHT_MAZO+'px';
	document.getElementById('cartas').style.height=HEIGHT-HEIGHT_MAZO+'px';
	for(var tipo of TIPOS_DE_CARTAS){
		var div=document.createElement('div');
		div.objeto=tipo;
		div.className='cartaEnEditor';
		var descripcion=document.createElement('div');
		descripcion.innerHTML='<h3>'+tipo.nombre+'</h3>'+tipo.title;
		div.appendChild(descripcion);
		var botones=document.createElement('div');
		var agregar=document.createElement('div');
		agregar.className='btn btn_action botonEditor';
		agregar.innerText='Add';
		tipo.botonAgregar=agregar;
		agregar.onclick=function(){
			if(this.enabled){
				var tipo=arguments.callee.tipo;
				tipo.numeroEnMazo++;
				window.localStorage['carlos'+tipo.nombre+'EnMazo']=tipo.numeroEnMazo;
				actualizarBotonesEditor();
			}
		}
		agregar.onclick.tipo=tipo;
		var sacar=document.createElement('div');
		sacar.className='btn btn_action botonEditor';
		sacar.innerText='Take out';
		tipo.botonSacar=sacar;
		sacar.onclick=function(){
			if(this.enabled){
				var tipo=arguments.callee.tipo;
				tipo.numeroEnMazo--;
				window.localStorage['carlos'+tipo.nombre+'EnMazo']=tipo.numeroEnMazo;
				actualizarBotonesEditor();
			}
		}
		sacar.onclick.tipo=tipo;
		botones.appendChild(agregar);
		botones.appendChild(sacar);
		div.appendChild(botones);
		document.getElementById('bodyCartas').appendChild(div);
	}
	mazos={[BANDO_JUGADOR]:[]};
	for(i=0; i<CARTAS_POR_FILA; i++){
		for(j=0; j<CARTAS_POR_COLUMNA; j++){
			var div=document.createElement('div');
			div.className='cartaDelMazo';
			div.style.left=PADDING+i*(PADDING+PROPIEDADES_CARTAS.WIDTH)+'px'
			div.style.top=PADDING+j*(PROPIEDADES_CARTAS.VISIBILIDAD)+'px'
			document.getElementById('mazo').appendChild(div);
		}
	}
	actualizarMazo(true);
	actualizarBotonesEditor();
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
	document.getElementById('botonJugar').addEventListener('click', function(){mostrar('opcionesPreviasAlJuego')});
	document.getElementById('botonEditarMazo').addEventListener('click', function(){mostrar('feature')});
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
	for(i=0; i<=1; i++){
		var mazo=document.createElement('div');
		mazo.className='mazo';
		mazo.style.top=HEIGHT_MANO/2+(i?-PROPIEDADES_CARTAS.HEIGHT-PADDING:PADDING)+'px';
		document.getElementById('mano').appendChild(mazo);
	}
	for(i=0; i<TAMAÑO_MANO; i++){
		var divEnemigo=document.createElement('div');
		var divJugador=document.createElement('div');
		divEnemigo.className='red absolute';
		divEnemigo.style.top=PADDING+i*PROPIEDADES_CARTAS.VISIBILIDAD+'px';
		divEnemigo.style.zIndex=divEnemigo.baseZIndex=i;
		divJugador.className=BANDO_JUGADOR+' absolute';
		divJugador.onmouseout=onmouseoutCarta;
		divJugador.onmouseover=onmouseoverCarta;
		divJugador.style.bottom=PROPIEDADES_CARTAS.HEIGHT+PADDING+i*20+'px';
		divJugador.style.zIndex=divJugador.baseZIndex=8-i;
		document.getElementById('mano').appendChild(divEnemigo);
		document.getElementById('mano').appendChild(divJugador);
	}
}

function onkeydown(event){
	key=event.keyCode?event.keyCode:event.charCode;
	console.log('Se presionó la tecla con keyCode: '+key);
	//si presionás la D mientras estás jugando...
	if(key===68&&en==='juego') descartarMano(BANDO_JUGADOR);
	//si presionás ESC...
	if(key===27) mostrar('menuPrincipal');
}

function descartarMano(bando){
	manos[bando]=[];
	for(i=0; i<5; i++) levantarCarta(bando);
}

function actualizarBotonesEditor(){
	for(var tipo of TIPOS_DE_CARTAS){
		if(tipo.funcionAgregar()) enable(tipo.botonAgregar);
		else disable(tipo.botonAgregar);
		if(tipo.funcionSacar()) enable(tipo.botonSacar);
		else disable(tipo.botonSacar);
	}
	actualizarMazo(true);
}

function enable(elemento){
	elemento.enabled=true;
	elemento.style.opacity=1;
}

function disable(elemento){
	elemento.enabled=false;
	elemento.style.opacity=0.5;
}

function funcionSacar(){
	return this.numeroEnMazo&&mazos[BANDO_JUGADOR].length;
}

function actualizarMazo(enEditor){
	for(var i=mazos[BANDO_JUGADOR].length-1; i>=0; i--){
		mazos[BANDO_JUGADOR][i].div.remove();
	}
	mazos[BANDO_JUGADOR]=[];
	var mazo=mazos[BANDO_JUGADOR];
	for(var tipo of TIPOS_DE_CARTAS) for(var i=0; i<tipo.numeroEnMazo; i++) mazo.push(new Carta(tipo, BANDO_JUGADOR, enEditor));
	for(i=0; i<mazo.length; i++) document.getElementsByClassName('cartaDelMazo')[i].appendChild(mazo[i].div);
}

function onmouseoverCarta(){
	this.style.zIndex=9;
}

function onmouseoutCarta(){
	this.style.zIndex=this.baseZIndex;
}

function mostrar(id){
	for(var i=document.body.children.length-1; i>=0; i--) document.body.children[i].style.display='none';
	document.getElementById(id).style.display=null;
	en=id;
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
	window.localStorage.carlosWidth=width;
	window.localStorage.carlosHeight=height;
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
	mostrar('juego');
	//test
	mazos.red=shuffle([]);
	shuffle(mazos[BANDO_JUGADOR]);
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

function atacar(){
	activarSeleccionDeUnidades(function(unidad){return unidad.ataque>0&&unidad.bando===BANDO_JUGADOR;});
}

function Carta(tipo, bando, enEditor){
	var onclick=tipo.funcion;
	this.div=document.createElement('div');
	this.div.onclick=function(){
		if(turno===BANDO_JUGADOR&&en==='juego'){
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
	this.div.style.backgroundImage=tipo.backgroundImage;
	this.div.title=tipo.title;
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

function filtrarCartas(funcion){
	const cartas=document.getElementsByClassName('cartaEnEditor');
	for(var i=cartas.length-1; i>=0; i--){
		var carta=cartas[i];
		if(funcion(carta.objeto)) carta.style.display='';
		else carta.style.display='none';
	}
}

window.addEventListener('load', onload);
window.addEventListener('keydown', onkeydown);